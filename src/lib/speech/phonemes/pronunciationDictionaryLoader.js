/**
 * Chargement du dictionnaire de prononciation.
 *
 * Le fichier pese pres de deux mega-octets : il est demande une seule fois, a
 * la premiere lecture par la voix enregistree, puis conserve en memoire. Tant
 * que personne n'a enregistre de son, il n'est jamais telecharge.
 */

import { createPronunciationDictionary } from './pronunciationDictionary.js'

const DICTIONARY_PATH = '/pronunciation/en-GB.txt'

let loadingDictionary = null

export function loadPronunciationDictionary() {
  loadingDictionary ??= fetchDictionary()

  return loadingDictionary
}

async function fetchDictionary() {
  const response = await fetch(DICTIONARY_PATH)
  const contentType = response.headers.get('content-type') ?? ''

  // Un code 200 ne suffit pas : devant une adresse inconnue, le serveur de
  // developpement renvoie la page de l'application, en 200.
  if (!response.ok || contentType.includes('text/html')) {
    loadingDictionary = null
    throw new Error(
      'dictionnaire de prononciation absent — lance « npm run pronunciation-dictionary »'
    )
  }

  return createPronunciationDictionary(await response.text())
}
