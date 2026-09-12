import { describe, expect, it } from 'vitest'
import {
  formatVocabularyAsText,
  parseVocabularyFromText,
  summariseVocabulary,
} from './lessonParsing.js'

describe('parseVocabularyFromText', () => {
  it('reads one entry per line, English first then French', () => {
    expect(parseVocabularyFromText('cat = chat\ndog = chien')).toEqual([
      { english: 'cat', french: 'chat' },
      { english: 'dog', french: 'chien' },
    ])
  })

  it('accepts a colon as separator, as parents often type it', () => {
    expect(parseVocabularyFromText('cat : chat')).toEqual([{ english: 'cat', french: 'chat' }])
  })

  it('accepts a spaced dash as separator', () => {
    expect(parseVocabularyFromText('cat - chat')).toEqual([{ english: 'cat', french: 'chat' }])
  })

  it('keeps the hyphen of a compound word instead of reading it as a separator', () => {
    expect(parseVocabularyFromText('grand-mother = grand-mère')).toEqual([
      { english: 'grand-mother', french: 'grand-mère' },
    ])
  })

  it('accepts an entry without translation', () => {
    expect(parseVocabularyFromText('cat')).toEqual([{ english: 'cat', french: '' }])
  })

  it('accepts an English expression of several words', () => {
    expect(parseVocabularyFromText('thank you = merci')).toEqual([
      { english: 'thank you', french: 'merci' },
    ])
  })

  it('ignores blank lines and surrounding spaces', () => {
    expect(parseVocabularyFromText('\n  cat = chat  \n\n')).toEqual([
      { english: 'cat', french: 'chat' },
    ])
  })

  it('ignores a line that has no English word', () => {
    expect(parseVocabularyFromText('= chat')).toEqual([])
  })

  it('returns an empty list for an empty text', () => {
    expect(parseVocabularyFromText('')).toEqual([])
  })
})

describe('formatVocabularyAsText', () => {
  it('writes back what the parent typed, so a lesson can be edited again', () => {
    const typedText = 'cat = chat\ndog = chien'

    expect(formatVocabularyAsText(parseVocabularyFromText(typedText))).toBe(typedText)
  })

  it('omits the separator for an entry without translation', () => {
    expect(formatVocabularyAsText([{ english: 'cat', french: '' }])).toBe('cat')
  })

  it('returns an empty text for an empty list', () => {
    expect(formatVocabularyAsText([])).toBe('')
  })
})

describe('summariseVocabulary', () => {
  it('uses the singular for a single word', () => {
    expect(summariseVocabulary([{ english: 'cat', french: 'chat' }])).toBe('1 mot')
  })

  it('uses the plural beyond one word', () => {
    expect(summariseVocabulary([{ english: 'cat' }, { english: 'dog' }])).toBe('2 mots')
  })

  it('describes an empty list as a reading text', () => {
    expect(summariseVocabulary([])).toBe('Texte à lire')
  })
})
