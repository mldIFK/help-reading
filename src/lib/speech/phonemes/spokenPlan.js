/**
 * Partition de lecture pour la voix enregistree.
 *
 * Transforme un texte en suite de sons a jouer, entrecoupee de silences. Le
 * plan dit aussi s'il est jouable : il suffit qu'un mot manque au dictionnaire
 * ou qu'un son n'ait pas ete enregistre pour qu'il ne le soit pas, auquel cas
 * l'appelant se rabat sur la voix de synthese.
 *
 * Mieux vaut basculer franchement de voix que d'alterner l'humain et la machine
 * au milieu d'une phrase.
 */

import { splitIntoSentences, splitIntoWords } from '../../text/textSegmentation.js'

export const PLAN_STEP = { phoneme: 'phoneme', pause: 'pause' }

/** Respirations : entre deux mots, puis entre deux phrases. */
const PAUSE_BETWEEN_WORDS_MS = 120
const PAUSE_BETWEEN_SENTENCES_MS = 350

export function buildSpokenPlan(text, { dictionary, recordedPhonemes }) {
  const sentences = splitIntoSentences(text)
  const steps = []
  const unknownWords = []
  const missingPhonemes = new Set()

  sentences.forEach((sentence, sentencePosition) => {
    if (sentencePosition > 0) addPause(steps, PAUSE_BETWEEN_SENTENCES_MS)

    splitIntoWords(sentence).forEach((word, wordPosition) => {
      if (wordPosition > 0) addPause(steps, PAUSE_BETWEEN_WORDS_MS)

      const phonemes = dictionary.findPhonemes(word)
      if (phonemes === null) {
        unknownWords.push(word)
        return
      }

      phonemes.forEach((symbol) => {
        if (!recordedPhonemes.has(symbol)) missingPhonemes.add(symbol)
        steps.push({ type: PLAN_STEP.phoneme, symbol })
      })
    })
  })

  const hasSomethingToSay = steps.some((step) => step.type === PLAN_STEP.phoneme)

  return {
    steps: trimPauses(steps),
    unknownWords,
    missingPhonemes: [...missingPhonemes],
    canBeSpoken: hasSomethingToSay && unknownWords.length === 0 && missingPhonemes.size === 0,
  }
}

function addPause(steps, durationMs) {
  steps.push({ type: PLAN_STEP.pause, durationMs })
}

/** Un silence en tete ou en fin ne sert a rien : un mot saute en laisse. */
function trimPauses(steps) {
  const isPause = (step) => step?.type === PLAN_STEP.pause

  let start = 0
  let end = steps.length
  while (isPause(steps[start])) start += 1
  while (end > start && isPause(steps[end - 1])) end -= 1

  return steps.slice(start, end)
}
