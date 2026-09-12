import { describe, expect, it } from 'vitest'
import { WORD_PRONUNCIATION, scorePronunciation } from './pronunciationScoring.js'

const resultsFor = (expectedSentence, heardSentence) =>
  scorePronunciation(expectedSentence, heardSentence).wordResults.map((result) => result.status)

describe('scorePronunciation', () => {
  it('marks every word as correct when the child read the sentence exactly', () => {
    const score = scorePronunciation('My name is Lucy', 'my name is lucy')

    expect(score.wordResults.map((result) => result.status)).toEqual([
      WORD_PRONUNCIATION.correct,
      WORD_PRONUNCIATION.correct,
      WORD_PRONUNCIATION.correct,
      WORD_PRONUNCIATION.correct,
    ])
    expect(score.percentage).toBe(100)
  })

  it('ignores the punctuation the recognizer never returns', () => {
    const score = scorePronunciation('Hello, Lucy!', 'hello lucy')

    expect(score.percentage).toBe(100)
  })

  it('marks a skipped word as missing and keeps the other words correct', () => {
    expect(resultsFor('My name is Lucy', 'my name lucy')).toEqual([
      WORD_PRONUNCIATION.correct,
      WORD_PRONUNCIATION.correct,
      WORD_PRONUNCIATION.missing,
      WORD_PRONUNCIATION.correct,
    ])
  })

  it('marks a completely different word as incorrect', () => {
    expect(resultsFor('the black cat', 'the black dog')).toEqual([
      WORD_PRONUNCIATION.correct,
      WORD_PRONUNCIATION.correct,
      WORD_PRONUNCIATION.incorrect,
    ])
  })

  it('marks a near miss as almost correct, to encourage rather than punish', () => {
    expect(resultsFor('my grandmother', 'my granmotherr')).toEqual([
      WORD_PRONUNCIATION.correct,
      WORD_PRONUNCIATION.almost,
    ])
  })

  it('does not penalise extra words the recognizer added around the sentence', () => {
    const score = scorePronunciation('hello', 'er hello yes')

    expect(score.percentage).toBe(100)
  })

  it('counts a nearly correct word as half a point in the percentage', () => {
    const score = scorePronunciation('cat dog', 'cap dog')

    expect(score.percentage).toBe(75)
  })

  it('reports how many words were read correctly out of the total', () => {
    const score = scorePronunciation('the black cat', 'the black dog')

    expect(score.correctWordCount).toBe(2)
    expect(score.totalWordCount).toBe(3)
  })

  it('scores zero when the child said nothing', () => {
    const score = scorePronunciation('hello there', '')

    expect(score.percentage).toBe(0)
    expect(score.wordResults.every((result) => result.status === WORD_PRONUNCIATION.missing)).toBe(
      true
    )
  })

  it('scores zero for an empty sentence instead of dividing by zero', () => {
    expect(scorePronunciation('', 'hello').percentage).toBe(0)
  })

  it('keeps the original spelling of each word, so the screen can display it', () => {
    const score = scorePronunciation('My name', 'my name')

    expect(score.wordResults.map((result) => result.word)).toEqual(['My', 'name'])
  })
})
