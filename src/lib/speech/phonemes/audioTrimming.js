/**
 * Nettoyage des extraits sonores avant de les enchainer.
 *
 * Quand on enregistre un son isole, l'extrait commence et finit par du silence :
 * le temps d'appuyer sur le bouton, de respirer, de relacher. Colles tels quels,
 * ces silences s'additionnent et donnent une lecture hachee — c'est la
 * principale cause du rendu « robot des annees 80 ».
 *
 * Deux traitements y repondent : retirer les silences de bord, et amorcer
 * chaque extrait depuis zero pour supprimer le claquement de la jointure.
 */

/** En dessous, on considere qu'il n'y a pas de son. */
export const SILENCE_THRESHOLD = 0.02

/**
 * Marge conservee avant l'attaque et apres la chute. Couper au ras du seuil
 * amputerait le debut des consonnes, dont l'energie monte progressivement.
 */
const EDGE_MARGIN_SAMPLES = 240

/**
 * Trouve la portion sonore de l'extrait. Renvoie `null` si l'extrait ne
 * contient que du silence — un enregistrement rate, qu'il vaut mieux signaler
 * que jouer.
 */
export function findSoundBounds(samples, { silenceThreshold = SILENCE_THRESHOLD } = {}) {
  let firstLoudSample = -1
  let lastLoudSample = -1

  for (let position = 0; position < samples.length; position += 1) {
    if (Math.abs(samples[position]) < silenceThreshold) continue

    if (firstLoudSample === -1) firstLoudSample = position
    lastLoudSample = position
  }

  if (firstLoudSample === -1) return null

  return {
    start: Math.max(0, firstLoudSample - EDGE_MARGIN_SAMPLES),
    end: Math.min(samples.length, lastLoudSample + 1 + EDGE_MARGIN_SAMPLES),
  }
}

/**
 * Amorce et eteint l'extrait sur quelques millisecondes. Sans cela, passer
 * brutalement de zero au plein niveau produit un « clic » a chaque jointure.
 */
export function applyEdgeFades(samples, fadeSamples) {
  const fadeLength = Math.min(fadeSamples, Math.floor(samples.length / 2))
  if (fadeLength <= 0) return samples

  for (let position = 0; position < fadeLength; position += 1) {
    const gain = position / fadeLength

    samples[position] *= gain
    samples[samples.length - 1 - position] *= gain
  }

  return samples
}
