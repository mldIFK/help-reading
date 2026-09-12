import { describe, expect, it } from 'vitest'
import {
  hasReadingText,
  hasVocabulary,
  listDictationWords,
  listSentencesToReadAloud,
} from './lessonContent.js'

const lessonWithEverything = {
  id: 'demo',
  title: 'Demo',
  vocabulary: [{ english: 'cat', french: 'chat' }],
  readingText: 'I have a cat. The cat is black.',
}

describe('hasVocabulary', () => {
  it('is true when the lesson carries at least one word', () => {
    expect(hasVocabulary(lessonWithEverything)).toBe(true)
  })

  it('is false for a lesson made only of a reading text', () => {
    expect(hasVocabulary({ readingText: 'Hello' })).toBe(false)
  })

  it('is false for a missing lesson', () => {
    expect(hasVocabulary(null)).toBe(false)
  })
})

describe('hasReadingText', () => {
  it('is true when the lesson carries a text', () => {
    expect(hasReadingText(lessonWithEverything)).toBe(true)
  })

  it('is false when the text is only spaces', () => {
    expect(hasReadingText({ readingText: '   ' })).toBe(false)
  })

  it('is false for a missing lesson', () => {
    expect(hasReadingText(undefined)).toBe(false)
  })
})

describe('listSentencesToReadAloud', () => {
  it('returns the sentences of the reading text', () => {
    expect(listSentencesToReadAloud(lessonWithEverything)).toEqual([
      'I have a cat.',
      'The cat is black.',
    ])
  })

  it('returns nothing when the lesson has no text', () => {
    expect(listSentencesToReadAloud({ vocabulary: [] })).toEqual([])
  })
})

describe('listDictationWords', () => {
  it('dictates the vocabulary when the lesson has one', () => {
    expect(listDictationWords(lessonWithEverything)).toEqual([{ english: 'cat', french: 'chat' }])
  })

  it('falls back to the words of the reading text when there is no vocabulary', () => {
    const lesson = { readingText: 'The cat sleeps.' }

    expect(listDictationWords(lesson)).toEqual([
      { english: 'The', french: '' },
      { english: 'cat', french: '' },
      { english: 'sleeps', french: '' },
    ])
  })

  it('never dictates the same word twice', () => {
    const lesson = { readingText: 'The cat and the cat.' }
    const dictatedWords = listDictationWords(lesson).map((word) => word.english.toLowerCase())

    expect(new Set(dictatedWords).size).toBe(dictatedWords.length)
  })

  it('skips the very short words, too easy and too numerous to be worth dictating', () => {
    const lesson = { readingText: 'I go to the garden.' }

    expect(listDictationWords(lesson).map((word) => word.english)).toEqual(['the', 'garden'])
  })

  it('returns nothing for an empty lesson', () => {
    expect(listDictationWords({})).toEqual([])
  })
})
