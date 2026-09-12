/**
 * Recompenses et encouragements.
 *
 * Les seuils sont volontairement bas : l'enjeu est qu'une enfant de six ans ait
 * envie de recommencer, pas de mesurer precisement son niveau. Le bareme est
 * isole ici pour pouvoir etre ajuste sans toucher aux ecrans.
 */

export const MAXIMUM_STARS_PER_EXERCISE = 3

const PRONUNCIATION_STAR_THRESHOLDS = [
  { minimumPercentage: 90, stars: MAXIMUM_STARS_PER_EXERCISE },
  { minimumPercentage: 70, stars: 2 },
  { minimumPercentage: 50, stars: 1 },
]

const PRONUNCIATION_ENCOURAGEMENTS = [
  { minimumPercentage: 95, message: '🎉 Parfait ! Bravo !' },
  { minimumPercentage: 80, message: '😀 Très bien !' },
  { minimumPercentage: 50, message: '🙂 Pas mal, on réessaie ?' },
  { minimumPercentage: 0, message: '💪 Écoute encore, puis réessaie !' },
]

const STARS_FOR_SPELLING_RIGHT_AWAY = 2
const STARS_FOR_SPELLING_AFTER_A_MISTAKE = 1
const NO_STAR = 0

export function starsForPronunciation(percentage) {
  const reachedThreshold = PRONUNCIATION_STAR_THRESHOLDS.find(
    (threshold) => percentage >= threshold.minimumPercentage
  )

  return reachedThreshold ? reachedThreshold.stars : NO_STAR
}

/**
 * La dictee ne recompense que ce que l'enfant a reellement ecrit : un mot
 * revele avant d'etre recopie ne rapporte rien.
 */
export function starsForDictation({ isExact, attemptNumber, wasRevealed }) {
  if (!isExact || wasRevealed) return NO_STAR

  return attemptNumber === 1 ? STARS_FOR_SPELLING_RIGHT_AWAY : STARS_FOR_SPELLING_AFTER_A_MISTAKE
}

export function encouragementForPronunciation(percentage) {
  const encouragement = PRONUNCIATION_ENCOURAGEMENTS.find(
    (candidate) => percentage >= candidate.minimumPercentage
  )

  return encouragement.message
}
