/**
 * Format du fichier de sauvegarde des lecons et des voix enregistrees.
 *
 * Sert deux usages : recuperer ses propres donnees apres un nettoyage du
 * navigateur ou un changement d'appareil, et transmettre une lecon d'un
 * appareil a un autre (un parent a un autre, la maitresse aux parents) sans
 * aucun serveur.
 *
 * Volontairement limite aux lecons et aux enregistrements vocaux : les
 * reglages et les etoiles sont propres a chaque enfant et ne doivent jamais
 * ecraser ceux de la personne qui importe.
 *
 * Ce module est pur : aucune reference au navigateur, pour rester testable
 * sans jsdom. Le decodage/encodage des extraits audio et l'ecriture sur le
 * disque vivent dans `lessonVoiceBackupFile.js`.
 */

export const LESSON_VOICE_BACKUP_FORMAT_VERSION = 1

export function buildLessonVoiceBackupDocument({
  lessons,
  encodedPhonemeRecordings,
  encodedWordRecordings,
  exportedAt,
}) {
  return {
    formatVersion: LESSON_VOICE_BACKUP_FORMAT_VERSION,
    exportedAt,
    lessons,
    phonemeRecordings: encodedPhonemeRecordings,
    wordRecordings: encodedWordRecordings,
  }
}

/**
 * Valide un document deja decode par `JSON.parse` et le ramene a une forme
 * exploitable. Un fichier etranger ou corrompu ne doit jamais faire planter
 * l'import : les entrees illisibles sont simplement ecartees.
 */
export function readLessonVoiceBackupDocument(candidateDocument) {
  if (!isPlainObject(candidateDocument)) {
    return { isReadable: false, problem: 'Ce fichier n’est pas une sauvegarde reconnue.' }
  }

  if (candidateDocument.formatVersion !== LESSON_VOICE_BACKUP_FORMAT_VERSION) {
    return {
      isReadable: false,
      problem: 'Ce fichier vient d’une autre version de l’application et ne peut pas être importé.',
    }
  }

  if (!Array.isArray(candidateDocument.lessons)) {
    return { isReadable: false, problem: 'Ce fichier ne contient aucune leçon.' }
  }

  const validLessons = candidateDocument.lessons.filter(isValidLesson)

  return {
    isReadable: true,
    lessons: validLessons,
    encodedPhonemeRecordings: filterValidEncodedRecordings(candidateDocument.phonemeRecordings, 'symbol'),
    encodedWordRecordings: filterValidEncodedRecordings(candidateDocument.wordRecordings, 'word'),
    skippedLessonCount: candidateDocument.lessons.length - validLessons.length,
  }
}

function isPlainObject(candidateValue) {
  return typeof candidateValue === 'object' && candidateValue !== null && !Array.isArray(candidateValue)
}

function isValidLesson(candidateLesson) {
  return (
    isPlainObject(candidateLesson) &&
    typeof candidateLesson.id === 'string' &&
    candidateLesson.id.length > 0
  )
}

function filterValidEncodedRecordings(candidateRecordings, keyPropertyName) {
  if (!Array.isArray(candidateRecordings)) return []

  return candidateRecordings.filter(
    (candidateRecording) =>
      isPlainObject(candidateRecording) &&
      typeof candidateRecording[keyPropertyName] === 'string' &&
      candidateRecording[keyPropertyName].length > 0 &&
      typeof candidateRecording.mimeType === 'string' &&
      typeof candidateRecording.base64Audio === 'string' &&
      candidateRecording.base64Audio.length > 0
  )
}
