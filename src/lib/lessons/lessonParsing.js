/**
 * Lecture et ecriture de la liste de vocabulaire saisie par le parent.
 *
 * Le parent recopie les devoirs a la main, sous la forme « anglais = français »,
 * une ligne par mot. On accepte les separateurs qu'il est naturel de taper, sans
 * exiger qu'il en retienne un en particulier.
 */

const ENTRY_SEPARATOR = /\s*[=:\t]\s*|\s+-\s+/
const PREFERRED_SEPARATOR = ' = '

export function parseVocabularyFromText(typedText) {
  return String(typedText ?? '')
    .split('\n')
    .map(parseVocabularyLine)
    .filter((entry) => entry.english.length > 0)
}

function parseVocabularyLine(line) {
  const [englishPart = '', frenchPart = ''] = line.trim().split(ENTRY_SEPARATOR)

  return { english: englishPart.trim(), french: frenchPart.trim() }
}

/** Reconstruit le texte de saisie, pour rouvrir une lecon et la corriger. */
export function formatVocabularyAsText(vocabulary) {
  return vocabulary
    .map((entry) => (entry.french ? `${entry.english}${PREFERRED_SEPARATOR}${entry.french}` : entry.english))
    .join('\n')
}

/** Courte description affichee sous le titre de la lecon. */
export function summariseVocabulary(vocabulary) {
  if (vocabulary.length === 0) return 'Texte à lire'

  return vocabulary.length === 1 ? '1 mot' : `${vocabulary.length} mots`
}
