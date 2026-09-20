/**
 * Reconnaissance de ce que contient un fichier importe.
 *
 * Le parent depose un fichier sans dire de quoi il s'agit. Une liste de
 * vocabulaire et un texte de lecture ne se travaillent pas de la meme facon :
 * il faut donc trancher, ligne par ligne, et accepter qu'un meme fichier
 * contienne les deux — c'est le cas le plus frequent d'une page de cahier.
 *
 * La reconnaissance n'a pas besoin d'etre infaillible : le resultat est
 * pre-rempli dans l'editeur de lecon, ou le parent le corrige d'un coup d'oeil.
 */

import { parseVocabularyFromText } from '../lessonParsing.js'
import { looksLikeCsv, parseVocabularyCsv } from './vocabularyCsv.js'

export const IMPORTED_CONTENT = {
  vocabulary: 'vocabulary',
  readingText: 'readingText',
  both: 'both',
  empty: 'empty',
}

/** Separateurs que le parent ecrit explicitement entre un mot et sa traduction. */
const EXPLICIT_TRANSLATION_SEPARATOR = /\s*[=:\t]\s*|\s+-\s+/

/** Au-dela, une ligne est une phrase, non une entree de vocabulaire. */
const LONGEST_VOCABULARY_LINE_WORDS = 3

const ENDS_A_SENTENCE = /[.!?]$/

function countWordsInLine(line) {
  return line.split(/\s+/).filter(Boolean).length
}

/**
 * Une ligne isolee ressemble-t-elle a une entree de vocabulaire ?
 *
 * Trois formes l'attestent : un separateur explicite (« cat = chat »), une
 * forme de tableau (« cat,chat »), ou un mot seul assez court pour ne pas etre
 * une phrase (« red »).
 */
function looksLikeVocabularyLine(line, isPartOfTable) {
  if (EXPLICIT_TRANSLATION_SEPARATOR.test(line)) return true
  if (isPartOfTable) return true

  return !ENDS_A_SENTENCE.test(line) && countWordsInLine(line) <= LONGEST_VOCABULARY_LINE_WORDS
}

function parseVocabularyLines(vocabularyLines) {
  const vocabularyBlock = vocabularyLines.join('\n')

  return looksLikeCsv(vocabularyBlock)
    ? parseVocabularyCsv(vocabularyBlock)
    : parseVocabularyFromText(vocabularyBlock)
}

export function detectImportedContent(text) {
  const lines = String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { kind: IMPORTED_CONTENT.empty, vocabulary: [], readingText: '' }
  }

  const isTable = looksLikeCsv(text)
  const vocabularyLines = lines.filter((line) => looksLikeVocabularyLine(line, isTable))
  const readingLines = lines.filter((line) => !looksLikeVocabularyLine(line, isTable))

  const vocabulary = vocabularyLines.length > 0 ? parseVocabularyLines(vocabularyLines) : []
  const readingText = readingLines.join('\n')

  return { kind: contentKindOf(vocabulary, readingText), vocabulary, readingText }
}

function contentKindOf(vocabulary, readingText) {
  const hasVocabulary = vocabulary.length > 0
  const hasReadingText = readingText.length > 0

  if (hasVocabulary && hasReadingText) return IMPORTED_CONTENT.both
  if (hasVocabulary) return IMPORTED_CONTENT.vocabulary
  if (hasReadingText) return IMPORTED_CONTENT.readingText
  return IMPORTED_CONTENT.empty
}
