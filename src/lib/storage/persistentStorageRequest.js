/**
 * Demande au navigateur de ne pas effacer les donnees de l'appli quand
 * l'appareil manque de place : sans cet accord, `localStorage` et
 * `IndexedDB` restent exposes a une eviction automatique et silencieuse.
 *
 * Le navigateur peut refuser ou ignorer la demande (mode navigation privee,
 * ancien navigateur) : l'appli continue de fonctionner normalement dans tous
 * les cas.
 */
export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false

  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}
