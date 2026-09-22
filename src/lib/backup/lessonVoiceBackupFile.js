/**
 * Lecture et ecriture du fichier de sauvegarde sur l'appareil.
 *
 * Couche d'acces au navigateur (IndexedDB, Blob, telechargement) : comme les
 * autres `*Service.js` du projet, elle n'est pas couverte par des tests
 * automatiques et se verifie a la main dans un vrai navigateur.
 */

import { loadParentLessons, saveParentLesson } from '../storage/lessonRepository.js'
import {
  loadAllRecordings as loadAllPhonemeRecordings,
  saveRecording as savePhonemeRecording,
} from '../speech/phonemes/phonemeRecordingStore.js'
import {
  loadAllWordRecordings,
  saveWordRecording,
} from '../speech/wordRecordingStore.js'
import {
  buildLessonVoiceBackupDocument,
  readLessonVoiceBackupDocument,
} from './lessonVoiceBackupFormat.js'

const BACKUP_FILE_MIME_TYPE = 'application/json'

export async function exportLessonVoiceBackupFile() {
  const [phonemeRecordings, wordRecordings] = await Promise.all([
    loadAllPhonemeRecordings(),
    loadAllWordRecordings(),
  ])

  const backupDocument = buildLessonVoiceBackupDocument({
    lessons: loadParentLessons(),
    encodedPhonemeRecordings: await encodeRecordingsForExport(phonemeRecordings, 'symbol'),
    encodedWordRecordings: await encodeRecordingsForExport(wordRecordings, 'word'),
    exportedAt: new Date().toISOString(),
  })

  const backupBlob = new Blob([JSON.stringify(backupDocument, null, 2)], {
    type: BACKUP_FILE_MIME_TYPE,
  })

  downloadBlob(backupBlob, suggestedBackupFileName())
}

/**
 * Importe un fichier choisi par l'utilisateur. Un fichier etranger, corrompu
 * ou d'une autre version de l'application ne doit jamais faire planter
 * l'appli : la fonction renvoie alors `isReadable: false` avec une raison en
 * francais plutot que de lever une erreur.
 */
export async function importLessonVoiceBackupFile(backupFile) {
  let parsedDocument
  try {
    parsedDocument = JSON.parse(await backupFile.text())
  } catch {
    return { isReadable: false, problem: 'Ce fichier n’est pas un fichier de sauvegarde valide.' }
  }

  const backupContent = readLessonVoiceBackupDocument(parsedDocument)
  if (!backupContent.isReadable) return backupContent

  let updatedLessons = loadParentLessons()
  for (const lesson of backupContent.lessons) {
    updatedLessons = saveParentLesson(lesson)
  }

  await Promise.all([
    ...backupContent.encodedPhonemeRecordings.map((recording) =>
      savePhonemeRecording(recording.symbol, decodeRecordingToBlob(recording))
    ),
    ...backupContent.encodedWordRecordings.map((recording) =>
      saveWordRecording(recording.word, decodeRecordingToBlob(recording))
    ),
  ])

  return {
    isReadable: true,
    lessons: updatedLessons,
    importedLessonCount: backupContent.lessons.length,
    importedRecordingCount:
      backupContent.encodedPhonemeRecordings.length + backupContent.encodedWordRecordings.length,
  }
}

async function encodeRecordingsForExport(recordingsByKey, keyPropertyName) {
  const encodedRecordings = []

  for (const [key, audioBlob] of recordingsByKey) {
    const audioBytes = new Uint8Array(await audioBlob.arrayBuffer())
    encodedRecordings.push({
      [keyPropertyName]: key,
      mimeType: audioBlob.type,
      base64Audio: bytesToBase64(audioBytes),
    })
  }

  return encodedRecordings
}

function decodeRecordingToBlob(recording) {
  const binaryString = atob(recording.base64Audio)
  const audioBytes = new Uint8Array(binaryString.length)

  for (let position = 0; position < binaryString.length; position += 1) {
    audioBytes[position] = binaryString.charCodeAt(position)
  }

  return new Blob([audioBytes], { type: recording.mimeType })
}

function bytesToBase64(audioBytes) {
  let binaryString = ''
  for (const byte of audioBytes) binaryString += String.fromCharCode(byte)

  return btoa(binaryString)
}

function suggestedBackupFileName() {
  const today = new Date().toISOString().slice(0, 10)
  return `my-english-helper-sauvegarde-${today}.json`
}

function downloadBlob(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob)
  const downloadLink = document.createElement('a')
  downloadLink.href = objectUrl
  downloadLink.download = fileName
  downloadLink.click()
  URL.revokeObjectURL(objectUrl)
}
