/**
 * Mise en forme des mots avant comparaison.
 *
 * La reconnaissance vocale renvoie du texte brut, sans majuscule ni ponctuation.
 * Comparer directement « Hello! » et « hello » signalerait une faute inexistante :
 * on ramene donc les deux cotes a une forme commune avant de les confronter.
 */

const COMBINING_ACCENTS = /[\u0300-\u036f]/g
const TYPOGRAPHIC_APOSTROPHE = /\u2019/g
const CHARACTERS_THAT_ARE_NOT_PART_OF_A_WORD = /[^a-z0-9']/g

/** Nombre de fautes tolerees pour considerer que deux mots se ressemblent. */
const TOLERATED_EDITS_ON_SHORT_WORD = 1
const TOLERATED_EDITS_ON_LONG_WORD = 2
const LONGEST_SHORT_WORD = 4

/**
 * Ramene un mot a sa forme comparable : minuscules, sans accent ni ponctuation.
 * L'apostrophe est conservee car elle fait partie des contractions anglaises
 * (« don't », « I'm ») et la distinguer aurait un sens pedagogique.
 */
export function normalizeWordForComparison(word) {
  return String(word ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_ACCENTS, '')
    .replace(TYPOGRAPHIC_APOSTROPHE, "'")
    .replace(CHARACTERS_THAT_ARE_NOT_PART_OF_A_WORD, '')
}

/**
 * Nombre minimal de lettres a ajouter, supprimer ou remplacer pour passer d'un
 * mot a l'autre (distance de Levenshtein).
 */
export function countLetterEdits(firstWord, secondWord) {
  if (firstWord === secondWord) return 0
  if (!firstWord.length) return secondWord.length
  if (!secondWord.length) return firstWord.length

  let editsUpToPreviousLetter = Array.from({ length: secondWord.length + 1 }, (_, index) => index)

  for (let firstIndex = 1; firstIndex <= firstWord.length; firstIndex += 1) {
    const editsUpToCurrentLetter = [firstIndex]

    for (let secondIndex = 1; secondIndex <= secondWord.length; secondIndex += 1) {
      const lettersDiffer = firstWord[firstIndex - 1] !== secondWord[secondIndex - 1]

      editsUpToCurrentLetter[secondIndex] = Math.min(
        editsUpToCurrentLetter[secondIndex - 1] + 1,
        editsUpToPreviousLetter[secondIndex] + 1,
        editsUpToPreviousLetter[secondIndex - 1] + (lettersDiffer ? 1 : 0)
      )
    }

    editsUpToPreviousLetter = editsUpToCurrentLetter
  }

  return editsUpToPreviousLetter[secondWord.length]
}

/**
 * Deux mots sont-ils assez proches pour parler d'approximation plutot que
 * d'erreur ? La tolerance depend de la longueur : sur un mot court, une lettre
 * de difference change deja le mot (« cat » / « cap »), alors que sur un mot
 * long la reconnaissance vocale se trompe souvent sans que l'enfant y soit pour
 * quelque chose.
 */
export function areWordsAlmostIdentical(firstWord, secondWord) {
  if (!firstWord || !secondWord) return false

  const toleratedEdits =
    firstWord.length <= LONGEST_SHORT_WORD
      ? TOLERATED_EDITS_ON_SHORT_WORD
      : TOLERATED_EDITS_ON_LONG_WORD

  return countLetterEdits(firstWord, secondWord) <= toleratedEdits
}
