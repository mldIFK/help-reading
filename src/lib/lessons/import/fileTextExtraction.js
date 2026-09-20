/**
 * Extraction du texte d'un fichier depose par le parent.
 *
 * Ce module est la seule frontiere avec les bibliotheques de lecture de
 * documents et avec l'API Fichier du navigateur ; tout ce qui suit — nettoyage,
 * reconnaissance, construction de la lecon — travaille sur du texte et se teste
 * sans navigateur.
 *
 * Les bibliotheques PDF et Word sont chargees a la demande : elles pesent plus
 * lourd que toute l'application, et la plupart des seances ne les utiliseront
 * jamais.
 */

import {
  FILE_KIND,
  LARGEST_ACCEPTED_FILE_BYTES,
  describeTooLargeFile,
  describeUnsupportedFile,
  recogniseFileKind,
} from './importedFiles.js'
import { SIGNATURE_LENGTH, recogniseFileKindFromSignature } from './fileSignatures.js'
import { FileImportError } from './fileImportError.js'

export { FileImportError } from './fileImportError.js'

/**
 * Identifie le fichier : d'abord par son nom, puis, si cela ne donne rien, par
 * ses premiers octets.
 *
 * Ce dernier recours n'est pas un luxe : c'est le seul moyen d'accepter un
 * fichier telecharge sans extension, ou un document renomme — tous
 * parfaitement lisibles, tous refuses par un controle fonde sur le seul nom.
 */
async function recogniseFile(file) {
  const kindFromName = recogniseFileKind(file.name)
  if (kindFromName) return kindFromName

  const fileStart = new Uint8Array(await file.slice(0, SIGNATURE_LENGTH).arrayBuffer())
  return recogniseFileKindFromSignature(fileStart)
}

export async function extractTextFromFile(file) {
  if (file.size > LARGEST_ACCEPTED_FILE_BYTES) {
    throw new FileImportError(describeTooLargeFile(file.size))
  }

  const fileKind = (await recogniseFile(file)) ?? null
  if (fileKind === null) {
    throw new FileImportError(describeUnsupportedFile(file.name))
  }

  switch (fileKind) {
    case FILE_KIND.plainText:
    case FILE_KIND.spreadsheet:
      return file.text()
    case FILE_KIND.pdf:
      return extractTextFromPdf(file)
    case FILE_KIND.wordDocument:
      return extractTextFromWordDocument(file)
    default:
      throw new FileImportError(describeUnsupportedFile(file.name))
  }
}

async function extractTextFromPdf(file) {
  // Version « legacy » et non version courante : depuis la 5.x, la build
  // standard appelle `Uint8Array.prototype.toHex`, disponible seulement a
  // partir de Chrome 140. La build legacy embarque les memes fonctions avec
  // les equivalents compatibles, ce qui evite de dependre de la fraicheur du
  // navigateur — sur une tablette, il n'est pas toujours a jour.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // Le worker est resolu par Vite et empaquete avec l'application : aucune
  // requete vers un CDN, l'import fonctionne hors connexion.
  pdfjs.GlobalWorkerOptions.workerSrc = (
    await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
  ).default

  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise

  try {
    const pageTexts = []
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const textContent = await page.getTextContent()
      pageTexts.push(joinPdfTextItems(textContent.items))
    }
    return pageTexts.join('\n\n')
  } finally {
    await document.destroy()
  }
}

/**
 * Un PDF ne stocke pas de lignes mais des fragments positionnes. pdf.js signale
 * les fins de ligne par `hasEOL` : sans cela, tout le texte reviendrait colle
 * en un seul bloc.
 */
function joinPdfTextItems(items) {
  return items
    .map((item) => (item.hasEOL ? `${item.str}\n` : item.str))
    .join('')
}

async function extractTextFromWordDocument(file) {
  // On importe le paquet, et non le bundle autonome `mammoth.browser.js` :
  // mammoth declare un champ `browser` qui remplace ses modules de
  // decompression par leurs equivalents navigateur, et seule la resolution
  // normale du paquet applique cette substitution. Passer par le bundle
  // autonome laisse la lecture du document en suspens, sans jamais echouer.
  const mammoth = await import('mammoth')
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })

  return value
}
