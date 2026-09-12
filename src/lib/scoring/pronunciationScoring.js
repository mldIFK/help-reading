/**
 * Notation d'une lecture a voix haute.
 *
 * On compare ce que l'enfant devait lire a ce que la reconnaissance vocale a
 * entendu. Les deux listes ne se correspondent jamais mot pour mot : un mot peut
 * etre saute, remplace, ou la reconnaissance peut ajouter des hesitations. On
 * les aligne donc comme deux textes voisins, en cherchant la correspondance qui
 * explique les differences au moindre cout.
 */

import { splitIntoWords } from '../text/textSegmentation.js'
import {
  areWordsAlmostIdentical,
  normalizeWordForComparison,
} from '../text/wordNormalization.js'

/** Verdict porte sur chaque mot que l'enfant devait lire. */
export const WORD_PRONUNCIATION = {
  correct: 'correct',
  almost: 'almost',
  incorrect: 'incorrect',
  missing: 'missing',
}

/**
 * Cout de chaque hypothese d'alignement. Sauter un mot coute un peu moins cher
 * que le confondre avec un autre : face a une lecture incomplete, on prefere
 * conclure « mot oublie » plutot que « mot mal prononce ».
 */
const ALIGNMENT_COST = {
  identicalWords: 0,
  almostIdenticalWords: 0.35,
  differentWords: 1,
  skippedWord: 0.9,
}

/** Un mot approximatif vaut une demi-reussite dans le pourcentage final. */
const CREDIT_FOR_ALMOST_CORRECT_WORD = 0.5

const ALIGNMENT_MOVE = {
  pairWords: 'pairWords',
  skipExpectedWord: 'skipExpectedWord',
  skipHeardWord: 'skipHeardWord',
}

export function scorePronunciation(expectedSentence, heardSentence) {
  const expectedWords = splitIntoWords(expectedSentence)
  const heardWords = splitIntoWords(heardSentence)

  const statuses = alignAndJudgeWords(expectedWords, heardWords)

  const wordResults = expectedWords.map((word, position) => ({
    word,
    status: statuses[position],
  }))

  return {
    wordResults,
    ...summariseWordResults(wordResults),
  }
}

function summariseWordResults(wordResults) {
  const countWithStatus = (status) =>
    wordResults.filter((result) => result.status === status).length

  const correctWordCount = countWithStatus(WORD_PRONUNCIATION.correct)
  const almostCorrectWordCount = countWithStatus(WORD_PRONUNCIATION.almost)
  const totalWordCount = wordResults.length

  const earnedCredit = correctWordCount + almostCorrectWordCount * CREDIT_FOR_ALMOST_CORRECT_WORD
  const percentage = totalWordCount === 0 ? 0 : Math.round((earnedCredit / totalWordCount) * 100)

  return { correctWordCount, almostCorrectWordCount, totalWordCount, percentage }
}

function alignAndJudgeWords(expectedWords, heardWords) {
  const comparableExpectedWords = expectedWords.map(normalizeWordForComparison)
  const comparableHeardWords = heardWords.map(normalizeWordForComparison)

  const chosenMoves = findCheapestAlignment(comparableExpectedWords, comparableHeardWords)

  return readStatusesFromAlignment(chosenMoves, comparableExpectedWords, comparableHeardWords)
}

/** Cout de mettre face a face un mot attendu et un mot entendu. */
function costOfPairing(expectedWord, heardWord) {
  if (expectedWord === heardWord) return ALIGNMENT_COST.identicalWords
  if (areWordsAlmostIdentical(expectedWord, heardWord)) return ALIGNMENT_COST.almostIdenticalWords
  return ALIGNMENT_COST.differentWords
}

/**
 * Remplit une grille ou chaque case retient le cout minimal pour expliquer les
 * `expectedIndex` premiers mots attendus avec les `heardIndex` premiers mots
 * entendus, puis renvoie le mouvement retenu dans chaque case.
 */
function findCheapestAlignment(comparableExpectedWords, comparableHeardWords) {
  const expectedCount = comparableExpectedWords.length
  const heardCount = comparableHeardWords.length

  const cheapestCost = createGrid(expectedCount + 1, heardCount + 1, 0)
  const chosenMove = createGrid(expectedCount + 1, heardCount + 1, null)

  for (let expectedIndex = 1; expectedIndex <= expectedCount; expectedIndex += 1) {
    cheapestCost[expectedIndex][0] = expectedIndex * ALIGNMENT_COST.skippedWord
    chosenMove[expectedIndex][0] = ALIGNMENT_MOVE.skipExpectedWord
  }
  for (let heardIndex = 1; heardIndex <= heardCount; heardIndex += 1) {
    cheapestCost[0][heardIndex] = heardIndex * ALIGNMENT_COST.skippedWord
    chosenMove[0][heardIndex] = ALIGNMENT_MOVE.skipHeardWord
  }

  for (let expectedIndex = 1; expectedIndex <= expectedCount; expectedIndex += 1) {
    for (let heardIndex = 1; heardIndex <= heardCount; heardIndex += 1) {
      const candidates = [
        {
          move: ALIGNMENT_MOVE.pairWords,
          cost:
            cheapestCost[expectedIndex - 1][heardIndex - 1] +
            costOfPairing(
              comparableExpectedWords[expectedIndex - 1],
              comparableHeardWords[heardIndex - 1]
            ),
        },
        {
          move: ALIGNMENT_MOVE.skipExpectedWord,
          cost: cheapestCost[expectedIndex - 1][heardIndex] + ALIGNMENT_COST.skippedWord,
        },
        {
          move: ALIGNMENT_MOVE.skipHeardWord,
          cost: cheapestCost[expectedIndex][heardIndex - 1] + ALIGNMENT_COST.skippedWord,
        },
      ]

      const cheapestCandidate = candidates.reduce((best, candidate) =>
        candidate.cost < best.cost ? candidate : best
      )

      cheapestCost[expectedIndex][heardIndex] = cheapestCandidate.cost
      chosenMove[expectedIndex][heardIndex] = cheapestCandidate.move
    }
  }

  return chosenMove
}

/**
 * Remonte l'alignement retenu, de la fin vers le debut, pour attribuer un
 * verdict a chaque mot attendu.
 */
function readStatusesFromAlignment(chosenMove, comparableExpectedWords, comparableHeardWords) {
  const statuses = new Array(comparableExpectedWords.length).fill(WORD_PRONUNCIATION.missing)

  let expectedIndex = comparableExpectedWords.length
  let heardIndex = comparableHeardWords.length

  while (expectedIndex > 0 || heardIndex > 0) {
    const move = chosenMove[expectedIndex][heardIndex]

    if (move === ALIGNMENT_MOVE.pairWords) {
      statuses[expectedIndex - 1] = judgePairedWords(
        comparableExpectedWords[expectedIndex - 1],
        comparableHeardWords[heardIndex - 1]
      )
      expectedIndex -= 1
      heardIndex -= 1
    } else if (move === ALIGNMENT_MOVE.skipExpectedWord) {
      statuses[expectedIndex - 1] = WORD_PRONUNCIATION.missing
      expectedIndex -= 1
    } else {
      heardIndex -= 1
    }
  }

  return statuses
}

function judgePairedWords(expectedWord, heardWord) {
  if (expectedWord === heardWord) return WORD_PRONUNCIATION.correct
  if (areWordsAlmostIdentical(expectedWord, heardWord)) return WORD_PRONUNCIATION.almost
  return WORD_PRONUNCIATION.incorrect
}

function createGrid(rowCount, columnCount, initialValue) {
  return Array.from({ length: rowCount }, () => new Array(columnCount).fill(initialValue))
}
