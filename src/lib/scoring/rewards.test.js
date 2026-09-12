import { describe, expect, it } from 'vitest'
import {
  MAXIMUM_STARS_PER_EXERCISE,
  encouragementForPronunciation,
  starsForDictation,
  starsForPronunciation,
} from './rewards.js'

describe('starsForPronunciation', () => {
  it('gives every star for an almost perfect reading', () => {
    expect(starsForPronunciation(100)).toBe(MAXIMUM_STARS_PER_EXERCISE)
    expect(starsForPronunciation(90)).toBe(MAXIMUM_STARS_PER_EXERCISE)
  })

  it('gives two stars for a good reading', () => {
    expect(starsForPronunciation(75)).toBe(2)
  })

  it('gives one star for a half correct reading, so the child keeps trying', () => {
    expect(starsForPronunciation(55)).toBe(1)
  })

  it('gives no star below half the words', () => {
    expect(starsForPronunciation(30)).toBe(0)
  })
})

describe('starsForDictation', () => {
  it('rewards a word spelled right on the first attempt the most', () => {
    expect(starsForDictation({ isExact: true, attemptNumber: 1, wasRevealed: false })).toBe(2)
  })

  it('still rewards a word spelled right after a mistake', () => {
    expect(starsForDictation({ isExact: true, attemptNumber: 3, wasRevealed: false })).toBe(1)
  })

  it('gives nothing when the answer was shown before being typed', () => {
    expect(starsForDictation({ isExact: true, attemptNumber: 1, wasRevealed: true })).toBe(0)
  })

  it('gives nothing for a misspelled word', () => {
    expect(starsForDictation({ isExact: false, attemptNumber: 1, wasRevealed: false })).toBe(0)
  })
})

describe('encouragementForPronunciation', () => {
  it('congratulates a perfect reading', () => {
    expect(encouragementForPronunciation(100)).toMatch(/Bravo/i)
  })

  it('invites the child to try again after a weak reading', () => {
    expect(encouragementForPronunciation(20)).toMatch(/réessaie/i)
  })

  it('always returns a sentence, whatever the score', () => {
    for (let percentage = 0; percentage <= 100; percentage += 5) {
      expect(encouragementForPronunciation(percentage).length).toBeGreaterThan(0)
    }
  })
})
