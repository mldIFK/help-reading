import { describe, expect, it } from 'vitest'
import { LETTER_RESULT, compareTypedSpelling } from './spellingComparison.js'

const statusesOf = (expectedWord, typedWord) =>
  compareTypedSpelling(expectedWord, typedWord).letters.map((letter) => letter.status)

describe('compareTypedSpelling', () => {
  it('accepts a word typed exactly right', () => {
    const comparison = compareTypedSpelling('hello', 'hello')

    expect(comparison.isExact).toBe(true)
    expect(comparison.letters.every((letter) => letter.status === LETTER_RESULT.correct)).toBe(true)
  })

  it('accepts a word typed with the wrong capitalisation', () => {
    expect(compareTypedSpelling('Monday', 'monday').isExact).toBe(true)
  })

  it('ignores the spaces the child may have left around the word', () => {
    expect(compareTypedSpelling('hello', '  hello ').isExact).toBe(true)
  })

  it('points at the single letter that is wrong', () => {
    expect(statusesOf('cat', 'cap')).toEqual([
      LETTER_RESULT.correct,
      LETTER_RESULT.correct,
      LETTER_RESULT.incorrect,
    ])
  })

  it('shows the letters the child forgot at the end of the word', () => {
    expect(statusesOf('hello', 'hel')).toEqual([
      LETTER_RESULT.correct,
      LETTER_RESULT.correct,
      LETTER_RESULT.correct,
      LETTER_RESULT.missing,
      LETTER_RESULT.missing,
    ])
  })

  it('reports the letters typed beyond the end of the word', () => {
    const comparison = compareTypedSpelling('cat', 'cats')

    expect(comparison.extraLetters).toBe('s')
    expect(comparison.isExact).toBe(false)
  })

  it('keeps the expected letter of each position, so the correction can be displayed', () => {
    const comparison = compareTypedSpelling('cat', 'cap')

    expect(comparison.letters.map((letter) => letter.expectedLetter)).toEqual(['c', 'a', 't'])
  })

  it('reports the letter actually typed, so both can be shown side by side', () => {
    const comparison = compareTypedSpelling('cat', 'cap')

    expect(comparison.letters[2].typedLetter).toBe('p')
  })

  it('handles an empty answer without crashing', () => {
    const comparison = compareTypedSpelling('cat', '')

    expect(comparison.isExact).toBe(false)
    expect(comparison.letters.every((letter) => letter.status === LETTER_RESULT.missing)).toBe(true)
  })

  it('compares a two-word expression as well as a single word', () => {
    expect(compareTypedSpelling('thank you', 'thank you').isExact).toBe(true)
  })
})
