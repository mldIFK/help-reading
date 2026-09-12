import { describe, expect, it } from 'vitest'
import { buildReadingScript, findWordIndexAtCharacter } from './readingScript.js'

const SAMPLE_TEXT = 'Hello! My name is Lucy.'

describe('buildReadingScript', () => {
  it('groups the text into sentences that can be spoken one at a time', () => {
    const script = buildReadingScript(SAMPLE_TEXT)

    expect(script.sentences.map((sentence) => sentence.text)).toEqual([
      'Hello!',
      'My name is Lucy.',
    ])
  })

  it('lists every spoken word in reading order', () => {
    const script = buildReadingScript(SAMPLE_TEXT)

    expect(script.spokenWords).toEqual(['Hello', 'My', 'name', 'is', 'Lucy'])
  })

  it('numbers the words continuously across sentences, so one highlight index is enough', () => {
    const script = buildReadingScript(SAMPLE_TEXT)
    const wordIndexesOfSecondSentence = script.sentences[1].tokens
      .filter((token) => token.kind === 'word')
      .map((token) => token.wordIndex)

    expect(wordIndexesOfSecondSentence).toEqual([1, 2, 3, 4])
  })

  it('returns an empty script for a blank text instead of throwing', () => {
    expect(buildReadingScript('  ')).toEqual({ sentences: [], spokenWords: [] })
  })
})

describe('findWordIndexAtCharacter', () => {
  const sentence = buildReadingScript('My name is Lucy.').sentences[0]

  it('finds the word that starts at the given character position', () => {
    expect(findWordIndexAtCharacter(sentence, 3)).toBe(1)
  })

  it('finds the word that surrounds the given character position', () => {
    expect(findWordIndexAtCharacter(sentence, 5)).toBe(1)
  })

  it('returns the first word for a position before any word', () => {
    expect(findWordIndexAtCharacter(sentence, 0)).toBe(0)
  })

  it('returns null when the sentence holds no word at all', () => {
    const punctuationOnly = buildReadingScript('...').sentences[0]

    expect(findWordIndexAtCharacter(punctuationOnly, 1)).toBeNull()
  })
})
