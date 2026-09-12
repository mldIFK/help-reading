/**
 * Decoupage d'un texte anglais en phrases, en mots et en jetons affichables.
 *
 * Le decoupage en jetons conserve la ponctuation et les espaces : l'ecran de
 * lecture doit pouvoir reafficher le texte a l'identique tout en rendant chaque
 * mot cliquable et surlignable.
 */

export const TOKEN_KIND = {
  word: 'word',
  separator: 'separator',
  punctuation: 'punctuation',
}

const LETTERS_AND_MARKS_OF_A_WORD = "A-Za-z0-9\\u00C0-\\u024F'\\u2019-"
const TOKEN_PATTERN = new RegExp(
  `([${LETTERS_AND_MARKS_OF_A_WORD}]+)|(\\s+)|([^\\s${LETTERS_AND_MARKS_OF_A_WORD}]+)`,
  'g'
)
const END_OF_SENTENCE = /(?<=[.!?])\s+|\n+/

/**
 * Decoupe un texte en jetons successifs. Chaque jeton porte :
 *  - `text`        le texte exact, ponctuation et espaces compris
 *  - `kind`        mot, separateur ou ponctuation
 *  - `wordIndex`   le rang du mot dans le texte, ou null pour les autres jetons
 *  - `startOffset` la position du jeton dans le texte d'origine
 */
export function splitIntoTokens(text) {
  const tokens = []
  let nextWordIndex = 0
  let match

  TOKEN_PATTERN.lastIndex = 0
  while ((match = TOKEN_PATTERN.exec(String(text ?? ''))) !== null) {
    const [matchedText, wordText, separatorText] = match

    let kind = TOKEN_KIND.punctuation
    if (wordText) kind = TOKEN_KIND.word
    else if (separatorText) kind = TOKEN_KIND.separator

    tokens.push({
      text: matchedText,
      kind,
      wordIndex: kind === TOKEN_KIND.word ? nextWordIndex : null,
      startOffset: match.index,
    })

    if (kind === TOKEN_KIND.word) nextWordIndex += 1
  }

  return tokens
}

/** Liste des mots du texte, sans ponctuation ni espaces. */
export function splitIntoWords(text) {
  return splitIntoTokens(text)
    .filter((token) => token.kind === TOKEN_KIND.word)
    .map((token) => token.text)
}

/**
 * Decoupe le texte en phrases lisibles d'un seul souffle. Un retour a la ligne
 * termine une phrase, car les listes de vocabulaire recopiees par le parent en
 * comptent un par mot.
 */
export function splitIntoSentences(text) {
  return String(text ?? '')
    .split(END_OF_SENTENCE)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
}
