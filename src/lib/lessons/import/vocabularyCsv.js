/**
 * Lecture d'un tableau de vocabulaire (CSV, TSV, copie d'un tableur).
 *
 * On ne depend pas d'une bibliotheque : le besoin se limite a deux colonnes, et
 * un analyseur maison reste lisible tout en couvrant ce que produisent
 * reellement Excel et Google Sheets — point-virgule comme separateur en France,
 * guillemets autour d'une valeur qui contient le separateur, et un doublement
 * du guillemet pour l'echapper.
 */

const CANDIDATE_SEPARATORS = [';', '\t', ',']

/** En-tetes rencontres dans les exports de tableur, en francais comme en anglais. */
const HEADER_WORDS = ['anglais', 'english', 'francais', 'français', 'french', 'mot', 'word', 'traduction']

/**
 * Seuils de reconnaissance d'un tableau. Ils existent parce qu'un texte de
 * lecture contient lui aussi des virgules : c'est la forme des lignes, et non
 * la simple presence d'un separateur, qui distingue une liste d'une phrase.
 */
const FEWEST_LINES_TO_CALL_IT_A_TABLE = 2
const MOST_COLUMNS_IN_A_VOCABULARY_TABLE = 4
const LONGEST_VOCABULARY_CELL_WORDS = 5
const MINIMUM_PROPORTION_OF_TABULAR_LINES = 0.7

const ENDS_A_SENTENCE = /[.!?]$/

/** Le separateur retenu est celui qui apparait sur le plus de lignes. */
function findSeparator(lines) {
  const countLinesContaining = (separator) =>
    lines.filter((line) => line.includes(separator)).length

  return CANDIDATE_SEPARATORS.reduce((bestSeparator, candidate) =>
    countLinesContaining(candidate) > countLinesContaining(bestSeparator) ? candidate : bestSeparator
  )
}

/** Decoupe une ligne en cellules, en respectant les guillemets. */
function splitLineIntoCells(line, separator) {
  const cells = []
  let currentCell = ''
  let isInsideQuotes = false

  for (let position = 0; position < line.length; position += 1) {
    const character = line[position]

    if (character === '"') {
      const isEscapedQuote = isInsideQuotes && line[position + 1] === '"'
      if (isEscapedQuote) {
        currentCell += '"'
        position += 1
      } else {
        isInsideQuotes = !isInsideQuotes
      }
      continue
    }

    if (character === separator && !isInsideQuotes) {
      cells.push(currentCell)
      currentCell = ''
      continue
    }

    currentCell += character
  }

  cells.push(currentCell)
  return cells.map((cell) => cell.trim())
}

function isHeaderLine(cells) {
  return cells.some((cell) => HEADER_WORDS.includes(cell.toLowerCase()))
}

function listNonEmptyLines(csvContent) {
  return String(csvContent ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function countWordsInCell(cell) {
  return cell.split(/\s+/).filter(Boolean).length
}

/**
 * Une ligne a-t-elle la forme d'une entree de tableau ? Elle doit porter le
 * separateur, tenir en quelques colonnes courtes, et ne pas se terminer comme
 * une phrase — « In the garden, Mia runs. » n'est pas une entree de vocabulaire.
 */
function isTabularLine(line, separator) {
  if (!line.includes(separator)) return false
  if (ENDS_A_SENTENCE.test(line)) return false

  const cells = splitLineIntoCells(line, separator)
  if (cells.length < 2 || cells.length > MOST_COLUMNS_IN_A_VOCABULARY_TABLE) return false

  return cells.every((cell) => countWordsInCell(cell) <= LONGEST_VOCABULARY_CELL_WORDS)
}

export function parseVocabularyCsv(csvContent) {
  const lines = listNonEmptyLines(csvContent)
  if (lines.length === 0) return []

  const separator = findSeparator(lines)
  const rows = lines.map((line) => splitLineIntoCells(line, separator))
  const rowsWithoutHeader = isHeaderLine(rows[0]) ? rows.slice(1) : rows

  return rowsWithoutHeader
    .map(([englishCell = '', frenchCell = '']) => ({ english: englishCell, french: frenchCell }))
    .filter((entry) => entry.english.length > 0)
}

/** Le contenu ressemble-t-il a un tableau plutot qu'a un texte suivi ? */
export function looksLikeCsv(content) {
  const lines = listNonEmptyLines(content)
  if (lines.length < FEWEST_LINES_TO_CALL_IT_A_TABLE) return false

  const separator = findSeparator(lines)
  const tabularLineCount = lines.filter((line) => isTabularLine(line, separator)).length

  return tabularLineCount / lines.length >= MINIMUM_PROPORTION_OF_TABULAR_LINES
}
