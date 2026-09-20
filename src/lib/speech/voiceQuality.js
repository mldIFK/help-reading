/**
 * Qualite des voix disponibles sur l'appareil.
 *
 * L'application ne fabrique pas de voix : elle utilise celles du navigateur.
 * Or leur qualite varie du tout au tout. Les anciennes assemblent des fragments
 * enregistres et sonnent mecaniques ; les voix dites naturelles synthetisent
 * l'onde avec un reseau de neurones, avec des intonations et des liaisons.
 *
 * Pour une enfant qui apprend a prononcer, cette difference n'est pas un
 * confort : c'est le modele qu'elle imite.
 */

/**
 * Les fabricants signalent leurs voix neuronales dans leur nom
 * (« Microsoft Sonia Online (Natural) », « en-GB-LibbyNeural »). C'est le seul
 * indice que l'API du navigateur expose.
 */
const NATURAL_VOICE_MARKERS = /natural|neural/i

export function isNaturalSoundingVoice(voice) {
  return NATURAL_VOICE_MARKERS.test(voice?.name ?? '')
}

export function hasNaturalSoundingVoice(voices) {
  return (voices ?? []).some(isNaturalSoundingVoice)
}

/** Le navigateur en cours est-il Edge ? */
export function isRunningOnEdge(userAgent = '') {
  return / Edg\//.test(userAgent)
}

/**
 * Faut-il conseiller un autre navigateur ?
 *
 * Uniquement lorsque le conseil est utile : il existe des voix, mais aucune
 * naturelle, et l'utilisateur n'est pas deja sur celui qu'on recommanderait.
 * L'absence totale de voix releve d'un autre probleme, traite ailleurs.
 */
export function shouldSuggestAnotherBrowser({ voices, isAlreadyOnEdge }) {
  const availableVoices = voices ?? []

  if (availableVoices.length === 0) return false
  if (isAlreadyOnEdge) return false

  return !hasNaturalSoundingVoice(availableVoices)
}
