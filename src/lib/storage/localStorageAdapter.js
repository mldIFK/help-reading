/**
 * Acces au stockage local du navigateur.
 *
 * Rien ne quitte l'appareil. Le stockage peut echouer (navigation privee, quota
 * plein, contenu corrompu par une ancienne version) : dans tous ces cas l'appli
 * doit continuer a fonctionner, quitte a repartir des valeurs par defaut.
 */

export function readStoredValue(storageKey, valueIfUnavailable) {
  try {
    const storedText = localStorage.getItem(storageKey)
    return storedText === null ? valueIfUnavailable : JSON.parse(storedText)
  } catch {
    return valueIfUnavailable
  }
}

export function writeStoredValue(storageKey, value) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value))
  } catch {
    // Sans stockage, l'application reste utilisable : seule la memoire d'une
    // session a l'autre est perdue.
  }
}
