/**
 * Connexion partagee a la base des enregistrements vocaux (sons et mots).
 *
 * IndexedDB n'autorise qu'un seul gestionnaire de montee de version par base :
 * tout ce qui ouvre `helpReading.voice` doit donc passer par ce point unique,
 * sinon deux fichiers ouvrant la meme base avec des numeros de version
 * independants finiraient par se contredire.
 */

const DATABASE_NAME = 'helpReading.voice'
const DATABASE_VERSION = 2

export const RECORDING_STORE = {
  phonemes: 'phonemeRecordings',
  words: 'wordRecordings',
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      for (const storeName of Object.values(RECORDING_STORE)) {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName)
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function withRecordingStore(storeName, mode, useStore) {
  const database = await openDatabase()

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, mode)
      const request = useStore(transaction.objectStore(storeName))

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    database.close()
  }
}
