import { describe, expect, it } from 'vitest'
import {
  areWordsAlmostIdentical,
  countLetterEdits,
  normalizeWordForComparison,
} from './wordNormalization.js'

describe('normalizeWordForComparison', () => {
  it('lowercases the word so that capitals never count as a mistake', () => {
    expect(normalizeWordForComparison('Hello')).toBe('hello')
  })

  it('removes the punctuation glued to a word', () => {
    expect(normalizeWordForComparison('Hello!')).toBe('hello')
    expect(normalizeWordForComparison('"cat",')).toBe('cat')
  })

  it('keeps the apostrophe of English contractions', () => {
    expect(normalizeWordForComparison("don't")).toBe("don't")
  })

  it('treats the typographic apostrophe like the typewriter one', () => {
    expect(normalizeWordForComparison('don’t')).toBe("don't")
  })

  it('removes accents so that a French keyboard cannot fail the comparison', () => {
    expect(normalizeWordForComparison('crème')).toBe('creme')
  })

  it('returns an empty string for a token made only of punctuation', () => {
    expect(normalizeWordForComparison('...')).toBe('')
  })
})

describe('countLetterEdits', () => {
  it('returns zero for identical words', () => {
    expect(countLetterEdits('cat', 'cat')).toBe(0)
  })

  it('counts one edit for a single replaced letter', () => {
    expect(countLetterEdits('cat', 'cap')).toBe(1)
  })

  it('counts one edit for a single missing letter', () => {
    expect(countLetterEdits('hello', 'helo')).toBe(1)
  })

  it('falls back to the length of the other word when one is empty', () => {
    expect(countLetterEdits('', 'four')).toBe(4)
    expect(countLetterEdits('four', '')).toBe(4)
  })
})

describe('areWordsAlmostIdentical', () => {
  it('accepts one mistake on a short word', () => {
    expect(areWordsAlmostIdentical('cat', 'cap')).toBe(true)
  })

  it('rejects two mistakes on a short word, because it becomes another word', () => {
    expect(areWordsAlmostIdentical('cat', 'dog')).toBe(false)
  })

  it('accepts two mistakes on a long word, where the recognizer often slips', () => {
    expect(areWordsAlmostIdentical('grandmother', 'granmotherr')).toBe(true)
  })

  it('rejects a comparison with an empty word', () => {
    expect(areWordsAlmostIdentical('cat', '')).toBe(false)
  })
})
