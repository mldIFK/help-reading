/**
 * Correction d'une dictee, lettre par lettre.
 *
 * On compare position par position plutot que par alignement souple : en dictee,
 * l'enfant doit voir exactement ou sa main s'est trompee, et un decalage est
 * lui-meme l'information a montrer.
 */

export const LETTER_RESULT = {
  correct: 'correct',
  incorrect: 'incorrect',
  missing: 'missing',
}

export function compareTypedSpelling(expectedWord, typedAnswer) {
  const expected = String(expectedWord ?? '')
  const typed = String(typedAnswer ?? '').trim()

  const letters = Array.from(expected, (expectedLetter, position) =>
    judgeLetterAt(expected, typed, position)
  )

  const extraLetters = typed.length > expected.length ? typed.slice(expected.length) : ''
  const isExact = expected.toLowerCase() === typed.toLowerCase()

  return { letters, extraLetters, isExact }
}

/**
 * La comparaison ignore la casse : a ce niveau, une majuscule oubliee n'est pas
 * l'erreur que la dictee cherche a corriger.
 */
function judgeLetterAt(expected, typed, position) {
  const expectedLetter = expected[position]
  const typedLetter = typed[position]

  if (typedLetter === undefined) {
    return { expectedLetter, typedLetter: '', status: LETTER_RESULT.missing }
  }

  const lettersMatch = typedLetter.toLowerCase() === expectedLetter.toLowerCase()

  return {
    expectedLetter,
    typedLetter,
    status: lettersMatch ? LETTER_RESULT.correct : LETTER_RESULT.incorrect,
  }
}
