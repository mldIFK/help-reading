/**
 * Nettoyage du texte extrait d'un fichier importe.
 *
 * Un texte venu d'un PDF, d'un document Word ou d'un export Excel arrive
 * rarement propre : marque d'ordre des octets, fins de ligne Windows, espaces
 * insecables, mots coupes en fin de ligne. Ces scories sont invisibles a l'oeil
 * mais faussent tout le reste — un mot suivi d'une espace insecable n'est plus
 * le meme mot pour la comparaison, et un mot coupe en deux serait prononce en
 * deux morceaux.
 */

import { splitIntoWords } from '../../text/textSegmentation.js'

const BYTE_ORDER_MARK = /^\uFEFF/
const WINDOWS_OR_MAC_LINE_ENDING = /\r\n?/g
const NON_BREAKING_SPACE = /[\u00A0\u202F]/g
const TRAILING_SPACES_ON_A_LINE = /[ \t]+$/gm
const WORD_SPLIT_ACROSS_LINES = /(\p{Letter})-\n(\p{Letter})/gu
const THREE_OR_MORE_LINE_BREAKS = /\n{3,}/g

export function cleanImportedText(rawText) {
  return String(rawText ?? '')
    .replace(BYTE_ORDER_MARK, '')
    .replace(WINDOWS_OR_MAC_LINE_ENDING, '\n')
    .replace(NON_BREAKING_SPACE, ' ')
    .replace(WORD_SPLIT_ACROSS_LINES, '$1$2')
    .replace(TRAILING_SPACES_ON_A_LINE, '')
    .replace(THREE_OR_MORE_LINE_BREAKS, '\n\n')
    .trim()
}

export function countWords(text) {
  return splitIntoWords(text).length
}
