/**
 * Rangement des sons enregistres.
 *
 * IndexedDB plutot que le stockage local : on conserve des extraits audio, que
 * `localStorage` ne sait pas garder et dont le volume depasserait sa limite.
 * Tout reste sur l'appareil.
 */

import { RECORDING_STORE, withRecordingStore } from '../voiceRecordingDatabase.js'

const withStore = (mode, useStore) => withRecordingStore(RECORDING_STORE.phonemes, mode, useStore)

export function saveRecording(phonemeSymbol, audioBlob) {
  return withStore('readwrite', (store) => store.put(audioBlob, phonemeSymbol))
}

export function loadRecording(phonemeSymbol) {
  return withStore('readonly', (store) => store.get(phonemeSymbol))
}

export function deleteRecording(phonemeSymbol) {
  return withStore('readwrite', (store) => store.delete(phonemeSymbol))
}

/** Symboles des sons deja enregistres. */
export async function listRecordedPhonemes() {
  const keys = await withStore('readonly', (store) => store.getAllKeys())

  return new Set(keys)
}

/** Tous les extraits, pour les charger d'un coup avant de lire. */
export async function loadAllRecordings() {
  const [keys, blobs] = await Promise.all([
    withStore('readonly', (store) => store.getAllKeys()),
    withStore('readonly', (store) => store.getAll()),
  ])

  return new Map(keys.map((key, position) => [key, blobs[position]]))
}

export async function deleteAllRecordings() {
  await withStore('readwrite', (store) => store.clear())
}
