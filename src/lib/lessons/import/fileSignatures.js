/**
 * Reconnaissance d'un fichier par ses premiers octets.
 *
 * Le nom d'un fichier ment souvent : Windows enregistre des JPEG en « .jfif »
 * sans leur attribuer de type, un fichier telecharge perd parfois toute
 * extension, et un fichier renomme a la main garde l'ancienne. Refuser un
 * devoir parfaitement lisible pour cette seule raison n'a aucun sens — les
 * premiers octets, eux, disent ce que le fichier est reellement.
 */

import { FILE_KIND } from './importedFiles.js'

/** Nombre d'octets a lire : toutes les marques connues tiennent dedans. */
export const SIGNATURE_LENGTH = 64

const SIGNATURES = [
  { kind: FILE_KIND.pdf, offset: 0, marker: '%PDF' },
  { kind: FILE_KIND.wordDocument, offset: 0, marker: [0x50, 0x4b, 0x03, 0x04] }, // archive ZIP
]

/**
 * Marques des formats d'image les plus courants.
 *
 * L'import de photos a ete retire, mais leurs premiers octets doivent rester
 * reconnus pour une seule raison : les exclure du repli « ressemble a du
 * texte ». Une image encodee ne contient jamais d'octet nul, et ses octets
 * eleves passeraient sinon pour un texte en UTF-8.
 */
const IMAGE_SIGNATURE_MARKERS = [
  { offset: 0, marker: [0xff, 0xd8, 0xff] }, // JPEG
  { offset: 0, marker: [0x89, 0x50, 0x4e, 0x47] }, // PNG
  { offset: 0, marker: 'GIF8' },
  { offset: 0, marker: 'BM' },
  { offset: 8, marker: 'WEBP' },
]

function markerBytes(marker) {
  return typeof marker === 'string'
    ? [...marker].map((character) => character.charCodeAt(0))
    : marker
}

function startsWithMarker(fileStart, { offset, marker }) {
  const expected = markerBytes(marker)

  return expected.every((byte, position) => fileStart[offset + position] === byte)
}

/**
 * Le contenu ressemble-t-il a du texte ? Un octet nul ne se rencontre jamais
 * dans un fichier texte, et trahit un format binaire non reconnu.
 */
function looksLikeText(fileStart) {
  return !fileStart.includes(0x00) && fileStart.every(isPlausibleTextByte)
}

function isPlausibleTextByte(byte) {
  const isPrintableAscii = byte >= 0x20 && byte <= 0x7e
  const isLineBreakOrTab = byte === 0x09 || byte === 0x0a || byte === 0x0d
  const belongsToAMultiByteCharacter = byte >= 0x80

  return isPrintableAscii || isLineBreakOrTab || belongsToAMultiByteCharacter
}

function isKnownImage(fileStart) {
  return IMAGE_SIGNATURE_MARKERS.some((marker) => startsWithMarker(fileStart, marker))
}

export function recogniseFileKindFromSignature(fileStart) {
  if (!fileStart || fileStart.length === 0) return null

  const matched = SIGNATURES.find((signature) => startsWithMarker(fileStart, signature))
  if (matched) return matched.kind

  if (isKnownImage(fileStart)) return null

  return looksLikeText(fileStart) ? FILE_KIND.plainText : null
}
