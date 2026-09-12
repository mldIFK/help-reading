import { describe, expect, it } from 'vitest'
import { splitIntoSentences, splitIntoTokens, splitIntoWords } from './textSegmentation.js'

describe('splitIntoWords', () => {
  it('extracts the words and leaves the punctuation out', () => {
    expect(splitIntoWords('Hello, my name is Lucy!')).toEqual(['Hello', 'my', 'name', 'is', 'Lucy'])
  })

  it('keeps a contraction as a single word', () => {
    expect(splitIntoWords("I don't know")).toEqual(['I', "don't", 'know'])
  })

  it('keeps a hyphenated word as a single word', () => {
    expect(splitIntoWords('a grand-mother')).toEqual(['a', 'grand-mother'])
  })

  it('returns nothing for a blank text', () => {
    expect(splitIntoWords('   ')).toEqual([])
  })
})

describe('splitIntoSentences', () => {
  it('splits on full stops, question marks and exclamation marks', () => {
    expect(splitIntoSentences('Hello! My name is Lucy. How are you?')).toEqual([
      'Hello!',
      'My name is Lucy.',
      'How are you?',
    ])
  })

  it('splits on line breaks, because a homework list has one item per line', () => {
    expect(splitIntoSentences('red\nblue\ngreen')).toEqual(['red', 'blue', 'green'])
  })

  it('drops the empty fragments left by extra spacing', () => {
    expect(splitIntoSentences('Hi.   \n\n  Bye.')).toEqual(['Hi.', 'Bye.'])
  })

  it('keeps a text without final punctuation as one sentence', () => {
    expect(splitIntoSentences('a little cat')).toEqual(['a little cat'])
  })
})

describe('splitIntoTokens', () => {
  it('keeps every character so the text can be displayed unchanged', () => {
    const originalText = 'Hello, Lucy! How are you?'
    const rebuiltText = splitIntoTokens(originalText)
      .map((token) => token.text)
      .join('')

    expect(rebuiltText).toBe(originalText)
  })

  it('labels each token as a word, a separator or punctuation', () => {
    expect(splitIntoTokens('Hi!')).toEqual([
      { text: 'Hi', kind: 'word', wordIndex: 0, startOffset: 0 },
      { text: '!', kind: 'punctuation', wordIndex: null, startOffset: 2 },
    ])
  })

  it('numbers the words in reading order and ignores the separators', () => {
    const wordTokens = splitIntoTokens('one, two three').filter((token) => token.kind === 'word')

    expect(wordTokens.map((token) => token.wordIndex)).toEqual([0, 1, 2])
  })

  it('records where each token starts, so a spoken position can be mapped back', () => {
    const tokens = splitIntoTokens('one two')

    expect(tokens.map((token) => token.startOffset)).toEqual([0, 3, 4])
  })
})
