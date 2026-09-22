/**
 * Rangement des enregistrements vocaux, un par mot de vocabulaire.
 *
 * La cle est le mot ramene a sa forme comparable (minuscules, sans accent) :
 * « Cat » et « cat » partagent ainsi le meme enregistrement, comme partout
 * ailleurs dans l'application ou l'on compare des mots.
 */

import {
  RECORDING_STORE,
  listAllRecordingsInStore,
  withRecordingStore,
} from './voiceRecordingDatabase.js'
import { normalizeWordForComparison } from '../text/wordNormalization.js'

const withStore = (mode, useStore) => withRecordingStore(RECORDING_STORE.words, mode, useStore)

export function saveWordRecording(word, audioBlob) {
  return withStore('readwrite', (store) => store.put(audioBlob, normalizeWordForComparison(word)))
}

/** Renvoie l'extrait audio du mot, ou `null` s'il n'a pas ete enregistre. */
export async function loadWordRecording(word) {
  const comparableWord = normalizeWordForComparison(word)
  if (comparableWord.length === 0) return null

  return (await withStore('readonly', (store) => store.get(comparableWord))) ?? null
}

export function deleteWordRecording(word) {
  return withStore('readwrite', (store) => store.delete(normalizeWordForComparison(word)))
}

/** Mots (sous leur forme comparable) deja enregistres. */
export async function listRecordedWords() {
  const keys = await withStore('readonly', (store) => store.getAllKeys())

  return new Set(keys)
}

/** Tous les extraits, pour la sauvegarde. */
export function loadAllWordRecordings() {
  return listAllRecordingsInStore(RECORDING_STORE.words)
}
