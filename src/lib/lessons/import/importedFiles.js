/**
 * Formats de fichiers acceptes a l'import.
 *
 * Un fichier refuse doit expliquer pourquoi, dans les mots du parent : « format
 * non pris en charge » n'aide personne, alors que « exporte le document en
 * .docx » indique quoi faire.
 */

export const FILE_KIND = {
  plainText: 'plainText',
  spreadsheet: 'spreadsheet',
  pdf: 'pdf',
  wordDocument: 'wordDocument',
}

const KIND_BY_EXTENSION = {
  '.txt': FILE_KIND.plainText,
  '.md': FILE_KIND.plainText,
  '.csv': FILE_KIND.spreadsheet,
  '.tsv': FILE_KIND.spreadsheet,
  '.pdf': FILE_KIND.pdf,
  '.docx': FILE_KIND.wordDocument,
}

export const ACCEPTED_FILE_EXTENSIONS = Object.keys(KIND_BY_EXTENSION).join(',')

/** Valeur de l'attribut `accept` du selecteur de fichier. */
export const FILE_PICKER_ACCEPT = ACCEPTED_FILE_EXTENSIONS

/**
 * Un devoir de primaire pese quelques dizaines de kilo-octets ; la borne sert a
 * ne pas figer le navigateur sur un fichier depose par erreur.
 */
export const LARGEST_ACCEPTED_FILE_BYTES = 10 * 1024 * 1024

export function fileExtensionOf(fileName) {
  const lastDotPosition = String(fileName ?? '').lastIndexOf('.')
  if (lastDotPosition <= 0) return ''

  return String(fileName).slice(lastDotPosition).toLowerCase()
}

/** Determine ce qu'est un fichier, d'apres son extension. */
export function recogniseFileKind(fileName) {
  return KIND_BY_EXTENSION[fileExtensionOf(fileName)] ?? null
}

export function describeUnsupportedFile(fileName) {
  const extension = fileExtensionOf(fileName)

  if (extension === '.doc') {
    return 'Les anciens fichiers .doc ne sont pas lisibles. Réenregistre le document en .docx.'
  }

  if (extension === '.pages' || extension === '.odt') {
    return `Le format ${extension} n’est pas pris en charge. Exporte le document en .docx ou en .txt.`
  }

  return `Format non pris en charge. Formats acceptés : ${ACCEPTED_FILE_EXTENSIONS}.`
}

export function describeTooLargeFile(fileSizeBytes) {
  const megabytes = (fileSizeBytes / (1024 * 1024)).toFixed(1)
  const limitInMegabytes = LARGEST_ACCEPTED_FILE_BYTES / (1024 * 1024)

  return `Fichier trop volumineux (${megabytes} Mo, maximum ${limitInMegabytes} Mo).`
}
