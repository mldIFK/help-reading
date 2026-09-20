/**
 * Dictionnaire de prononciation britannique.
 *
 * Le fichier source (public/pronunciation/en-GB.txt) contient un mot par ligne,
 * suivi de ses sons separes par des espaces. Il est deja decoupe en sons a la
 * fabrication : l'application n'a donc aucune analyse phonetique a faire, elle
 * consulte une table.
 */

const TYPOGRAPHIC_APOSTROPHE = /’/g
const CHARACTERS_AROUND_A_WORD = /^[^a-z']+|[^a-z']+$/g

/** Ramene un mot du texte a la forme sous laquelle le dictionnaire le range. */
function normaliseWord(word) {
  return String(word ?? '')
    .toLowerCase()
    .replace(TYPOGRAPHIC_APOSTROPHE, "'")
    .replace(CHARACTERS_AROUND_A_WORD, '')
}

export function createPronunciationDictionary(fileContent) {
  const phonemesByWord = new Map()

  for (const line of String(fileContent ?? '').split('\n')) {
    const [word, phonemes] = line.split('\t')
    if (!word || !phonemes) continue

    phonemesByWord.set(word, phonemes.split(' ').filter(Boolean))
  }

  return {
    wordCount: phonemesByWord.size,

    findPhonemes(word) {
      const normalisedWord = normaliseWord(word)
      if (normalisedWord.length === 0) return null

      return phonemesByWord.get(normalisedWord) ?? null
    },
  }
}
