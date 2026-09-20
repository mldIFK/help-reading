import { describe, expect, it } from 'vitest'
import { SPOKEN_SEGMENT_KIND, buildSpokenSegments } from './spokenTextSegmentation.js'

const noWordIsRecorded = () => false

describe('buildSpokenSegments', () => {
  it('keeps a text whole when no word has a recording', () => {
    expect(buildSpokenSegments('I have a cat.', noWordIsRecorded)).toEqual([
      { kind: SPOKEN_SEGMENT_KIND.synthesisRun, text: 'I have a cat.', startOffset: 0 },
    ])
  })

  it('turns a single recorded word into its own segment', () => {
    const isRecorded = (word) => word === 'cat'

    expect(buildSpokenSegments('cat', isRecorded)).toEqual([
      { kind: SPOKEN_SEGMENT_KIND.recordedWord, text: 'cat', startOffset: 0 },
    ])
  })

  it('splits a sentence around the recorded word it contains', () => {
    const isRecorded = (word) => word === 'cat'

    expect(buildSpokenSegments('I have a cat.', isRecorded)).toEqual([
      { kind: SPOKEN_SEGMENT_KIND.synthesisRun, text: 'I have a ', startOffset: 0 },
      { kind: SPOKEN_SEGMENT_KIND.recordedWord, text: 'cat', startOffset: 9 },
      { kind: SPOKEN_SEGMENT_KIND.synthesisRun, text: '.', startOffset: 12 },
    ])
  })

  it('gives each of two recorded words its own segment', () => {
    const isRecorded = (word) => word === 'Hello' || word === 'Lucy'

    expect(buildSpokenSegments('Hello Lucy', isRecorded)).toEqual([
      { kind: SPOKEN_SEGMENT_KIND.recordedWord, text: 'Hello', startOffset: 0 },
      { kind: SPOKEN_SEGMENT_KIND.synthesisRun, text: ' ', startOffset: 5 },
      { kind: SPOKEN_SEGMENT_KIND.recordedWord, text: 'Lucy', startOffset: 6 },
    ])
  })

  it('returns nothing for an empty text', () => {
    expect(buildSpokenSegments('', noWordIsRecorded)).toEqual([])
  })
})
