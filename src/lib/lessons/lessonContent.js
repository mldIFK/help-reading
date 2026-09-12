/**
 * Ce qu'une lecon offre a travailler.
 *
 * Les trois exercices interrogent une lecon sans savoir d'ou elle vient, ni si
 * elle contient du vocabulaire, un texte, ou les deux. Ces fonctions sont le
 * seul endroit qui connait cette structure.
 */

import { splitIntoSentences, splitIntoWords } from '../text/textSegmentation.js'
import { normalizeWordForComparison } from '../text/wordNormalization.js'

/**
 * En dessous de trois lettres, un mot est un article ou un pronom : trop facile
 * a ecrire et trop frequent pour meriter une dictee.
 */
const SHORTEST_WORD_WORTH_DICTATING = 3

export function hasVocabulary(lesson) {
  return (lesson?.vocabulary?.length ?? 0) > 0
}

export function hasReadingText(lesson) {
  return Boolean(lesson?.readingText?.trim())
}

export function listVocabulary(lesson) {
  return lesson?.vocabulary ?? []
}

/** Les mots ou expressions a prononcer un par un. */
export function listWordsToReadAloud(lesson) {
  return listVocabulary(lesson).map((entry) => entry.english)
}

/** Les phrases du texte, a lire l'une apres l'autre. */
export function listSentencesToReadAloud(lesson) {
  return hasReadingText(lesson) ? splitIntoSentences(lesson.readingText) : []
}

/**
 * Les mots a dicter : le vocabulaire de la lecon si elle en a un, sinon les mots
 * du texte, dedoublonnes et debarrasses des plus courts.
 */
export function listDictationWords(lesson) {
  if (hasVocabulary(lesson)) return listVocabulary(lesson)
  if (!hasReadingText(lesson)) return []

  return collectDistinctWordsWorthDictating(lesson.readingText).map((word) => ({
    english: word,
    french: '',
  }))
}

function collectDistinctWordsWorthDictating(readingText) {
  const alreadyCollected = new Set()

  return splitIntoWords(readingText).filter((word) => {
    const comparableWord = normalizeWordForComparison(word)

    if (comparableWord.length < SHORTEST_WORD_WORTH_DICTATING) return false
    if (alreadyCollected.has(comparableWord)) return false

    alreadyCollected.add(comparableWord)
    return true
  })
}
