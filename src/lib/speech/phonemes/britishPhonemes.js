/**
 * Les 45 sons de l'anglais britannique a enregistrer.
 *
 * Cette liste n'est pas choisie : elle est celle qu'emploie reellement le
 * dictionnaire de prononciation (public/pronunciation/en-GB.txt). Enregistrer
 * exactement ces sons, ni plus ni moins, garantit que tout mot du dictionnaire
 * pourra etre prononce.
 *
 * Chaque son porte un mot anglais qui le contient — verifie par les tests
 * contre le dictionnaire — et une indication en francais, car la personne qui
 * enregistre lit le tableau, pas l'alphabet phonetique.
 */

export const PHONEME_GROUPS = {
  consonants: 'Consonnes',
  shortVowels: 'Voyelles courtes',
  longVowels: 'Voyelles longues',
  diphthongs: 'Diphtongues (deux sons enchaînés)',
}

export const BRITISH_PHONEMES = [
  // --- Consonnes ---------------------------------------------------------
  { symbol: 'p', example: 'pen', hint: 'comme « p » de papa', group: PHONEME_GROUPS.consonants },
  { symbol: 'b', example: 'bed', hint: 'comme « b » de bébé', group: PHONEME_GROUPS.consonants },
  { symbol: 't', example: 'ten', hint: 'comme « t » de tasse', group: PHONEME_GROUPS.consonants },
  { symbol: 'd', example: 'dog', hint: 'comme « d » de dame', group: PHONEME_GROUPS.consonants },
  { symbol: 'k', example: 'cat', hint: 'comme « c » de café', group: PHONEME_GROUPS.consonants },
  { symbol: 'ɡ', example: 'go', hint: 'comme « g » de gare', group: PHONEME_GROUPS.consonants },
  { symbol: 'tʃ', example: 'chair', hint: 'comme « tch » de tchèque', group: PHONEME_GROUPS.consonants },
  { symbol: 'dʒ', example: 'jump', hint: 'comme « dj » de djinn', group: PHONEME_GROUPS.consonants },
  { symbol: 'f', example: 'fish', hint: 'comme « f » de fée', group: PHONEME_GROUPS.consonants },
  { symbol: 'v', example: 'van', hint: 'comme « v » de vase', group: PHONEME_GROUPS.consonants },
  { symbol: 'θ', example: 'think', hint: 'langue entre les dents, souffle sans voix', group: PHONEME_GROUPS.consonants },
  { symbol: 'ð', example: 'this', hint: 'langue entre les dents, avec la voix', group: PHONEME_GROUPS.consonants },
  { symbol: 's', example: 'sun', hint: 'comme « s » de sac', group: PHONEME_GROUPS.consonants },
  { symbol: 'z', example: 'zoo', hint: 'comme « z » de zéro', group: PHONEME_GROUPS.consonants },
  { symbol: 'ʃ', example: 'shoe', hint: 'comme « ch » de chat', group: PHONEME_GROUPS.consonants },
  { symbol: 'ʒ', example: 'measure', hint: 'comme « j » de jour', group: PHONEME_GROUPS.consonants },
  { symbol: 'h', example: 'hat', hint: 'un souffle, comme sur une vitre', group: PHONEME_GROUPS.consonants },
  { symbol: 'm', example: 'man', hint: 'comme « m » de maman', group: PHONEME_GROUPS.consonants },
  { symbol: 'n', example: 'no', hint: 'comme « n » de nous', group: PHONEME_GROUPS.consonants },
  { symbol: 'ŋ', example: 'sing', hint: 'comme « ng » de parking', group: PHONEME_GROUPS.consonants },
  { symbol: 'l', example: 'leg', hint: 'comme « l » de lune', group: PHONEME_GROUPS.consonants },
  { symbol: 'ɹ', example: 'red', hint: 'r anglais : langue en arrière, sans racler la gorge', group: PHONEME_GROUPS.consonants },
  { symbol: 'w', example: 'wet', hint: 'comme « ou » de oui', group: PHONEME_GROUPS.consonants },
  { symbol: 'j', example: 'yes', hint: 'comme « y » de yaourt', group: PHONEME_GROUPS.consonants },

  // --- Voyelles courtes --------------------------------------------------
  { symbol: 'ɪ', example: 'sit', hint: 'i bref et relâché, entre « i » et « é »', group: PHONEME_GROUPS.shortVowels },
  { symbol: 'ɛ', example: 'bed', hint: 'comme « è » de mère', group: PHONEME_GROUPS.shortVowels },
  { symbol: 'æ', example: 'cat', hint: 'entre « a » et « è », bouche bien ouverte', group: PHONEME_GROUPS.shortVowels },
  { symbol: 'ʌ', example: 'cup', hint: 'a bref et sourd, vers « eu »', group: PHONEME_GROUPS.shortVowels },
  { symbol: 'ɒ', example: 'dog', hint: 'o bref et ouvert, comme « o » de sotte', group: PHONEME_GROUPS.shortVowels },
  { symbol: 'ʊ', example: 'book', hint: 'ou bref et relâché', group: PHONEME_GROUPS.shortVowels },
  { symbol: 'ə', example: 'above', hint: 'voyelle neutre, le « e » de petit', group: PHONEME_GROUPS.shortVowels },
  { symbol: 'ɐ', example: 'about', hint: 'voyelle neutre, à peine plus ouverte que la précédente', group: PHONEME_GROUPS.shortVowels },
  { symbol: 'i', example: 'happy', hint: 'i bref en fin de mot', group: PHONEME_GROUPS.shortVowels },

  // --- Voyelles longues --------------------------------------------------
  { symbol: 'iː', example: 'see', hint: 'i long et tendu', group: PHONEME_GROUPS.longVowels },
  { symbol: 'ɑː', example: 'car', hint: 'a long, arrière, sans prononcer le r', group: PHONEME_GROUPS.longVowels },
  { symbol: 'ɔː', example: 'door', hint: 'o long et fermé, sans prononcer le r', group: PHONEME_GROUPS.longVowels },
  { symbol: 'uː', example: 'blue', hint: 'ou long', group: PHONEME_GROUPS.longVowels },
  { symbol: 'ɜː', example: 'bird', hint: 'eu long, comme « heure » allongé, sans le r', group: PHONEME_GROUPS.longVowels },

  // --- Diphtongues -------------------------------------------------------
  { symbol: 'eɪ', example: 'day', hint: '« é » qui glisse vers « i »', group: PHONEME_GROUPS.diphthongs },
  { symbol: 'aɪ', example: 'my', hint: '« a » qui glisse vers « i »', group: PHONEME_GROUPS.diphthongs },
  { symbol: 'ɔɪ', example: 'boy', hint: '« o » qui glisse vers « i »', group: PHONEME_GROUPS.diphthongs },
  { symbol: 'əʊ', example: 'go', hint: '« eu » qui glisse vers « ou »', group: PHONEME_GROUPS.diphthongs },
  { symbol: 'aʊ', example: 'now', hint: '« a » qui glisse vers « ou »', group: PHONEME_GROUPS.diphthongs },
  { symbol: 'iə', example: 'here', hint: '« i » qui glisse vers « e » neutre', group: PHONEME_GROUPS.diphthongs },
  { symbol: 'eə', example: 'hair', hint: '« è » qui glisse vers « e » neutre', group: PHONEME_GROUPS.diphthongs },
]

export const PHONEME_COUNT = BRITISH_PHONEMES.length

const PHONEMES_BY_SYMBOL = new Map(
  BRITISH_PHONEMES.map((phoneme) => [phoneme.symbol, phoneme])
)

export function findPhoneme(symbol) {
  return PHONEMES_BY_SYMBOL.get(symbol) ?? null
}

export function listPhonemeGroups() {
  return Object.values(PHONEME_GROUPS).map((group) => ({
    name: group,
    phonemes: BRITISH_PHONEMES.filter((phoneme) => phoneme.group === group),
  }))
}
