import { describe, expect, it } from 'vitest'
import {
  LESSON_VOICE_BACKUP_FORMAT_VERSION,
  buildLessonVoiceBackupDocument,
  readLessonVoiceBackupDocument,
} from './lessonVoiceBackupFormat.js'

const A_LESSON = { id: 'lesson-1', title: 'Les couleurs' }
const ANOTHER_LESSON = { id: 'lesson-2', title: 'Les animaux' }

const A_PHONEME_RECORDING = { symbol: 'æ', mimeType: 'audio/webm', base64Audio: 'AAAA' }
const A_WORD_RECORDING = { word: 'cat', mimeType: 'audio/webm', base64Audio: 'BBBB' }

function buildValidDocument(overrides = {}) {
  return buildLessonVoiceBackupDocument({
    lessons: [A_LESSON, ANOTHER_LESSON],
    encodedPhonemeRecordings: [A_PHONEME_RECORDING],
    encodedWordRecordings: [A_WORD_RECORDING],
    exportedAt: '2026-09-22T10:00:00.000Z',
    ...overrides,
  })
}

describe('buildLessonVoiceBackupDocument', () => {
  it('stamps the document with the current format version and the export date', () => {
    const document = buildValidDocument()

    expect(document.formatVersion).toBe(LESSON_VOICE_BACKUP_FORMAT_VERSION)
    expect(document.exportedAt).toBe('2026-09-22T10:00:00.000Z')
  })

  it('carries the lessons and the encoded recordings untouched', () => {
    const document = buildValidDocument()

    expect(document.lessons).toEqual([A_LESSON, ANOTHER_LESSON])
    expect(document.phonemeRecordings).toEqual([A_PHONEME_RECORDING])
    expect(document.wordRecordings).toEqual([A_WORD_RECORDING])
  })
})

describe('readLessonVoiceBackupDocument', () => {
  it('reads back a document produced by buildLessonVoiceBackupDocument', () => {
    const result = readLessonVoiceBackupDocument(buildValidDocument())

    expect(result).toEqual({
      isReadable: true,
      lessons: [A_LESSON, ANOTHER_LESSON],
      encodedPhonemeRecordings: [A_PHONEME_RECORDING],
      encodedWordRecordings: [A_WORD_RECORDING],
      skippedLessonCount: 0,
    })
  })

  it('rejects a value that is not an object', () => {
    expect(readLessonVoiceBackupDocument(null).isReadable).toBe(false)
    expect(readLessonVoiceBackupDocument('devoirs').isReadable).toBe(false)
    expect(readLessonVoiceBackupDocument(42).isReadable).toBe(false)
    expect(readLessonVoiceBackupDocument(undefined).isReadable).toBe(false)
  })

  it('rejects a document without a matching format version', () => {
    const result = readLessonVoiceBackupDocument({ ...buildValidDocument(), formatVersion: 999 })

    expect(result.isReadable).toBe(false)
    expect(result.problem).toMatch(/version/i)
  })

  it('rejects a document whose lessons field is missing or not a list', () => {
    const { lessons, ...documentWithoutLessons } = buildValidDocument()

    expect(readLessonVoiceBackupDocument(documentWithoutLessons).isReadable).toBe(false)
    expect(
      readLessonVoiceBackupDocument({ ...buildValidDocument(), lessons: 'oops' }).isReadable
    ).toBe(false)
  })

  it('accepts a document with zero lessons', () => {
    const result = readLessonVoiceBackupDocument(buildValidDocument({ lessons: [] }))

    expect(result.isReadable).toBe(true)
    expect(result.lessons).toEqual([])
  })

  it('drops lesson entries without a usable identifier and reports how many were skipped', () => {
    const result = readLessonVoiceBackupDocument(
      buildValidDocument({ lessons: [A_LESSON, { title: 'sans identifiant' }, 'oops', null] })
    )

    expect(result.isReadable).toBe(true)
    expect(result.lessons).toEqual([A_LESSON])
    expect(result.skippedLessonCount).toBe(3)
  })

  it('treats missing recording lists as empty instead of failing', () => {
    const { phonemeRecordings, wordRecordings, ...documentWithoutRecordings } = buildValidDocument()

    const result = readLessonVoiceBackupDocument(documentWithoutRecordings)

    expect(result.isReadable).toBe(true)
    expect(result.encodedPhonemeRecordings).toEqual([])
    expect(result.encodedWordRecordings).toEqual([])
  })

  it('drops malformed recording entries silently', () => {
    const result = readLessonVoiceBackupDocument(
      buildValidDocument({
        encodedPhonemeRecordings: [A_PHONEME_RECORDING, { symbol: 'p' }, { base64Audio: 'x' }],
        encodedWordRecordings: [{ word: '', mimeType: 'audio/webm', base64Audio: 'x' }],
      })
    )

    expect(result.encodedPhonemeRecordings).toEqual([A_PHONEME_RECORDING])
    expect(result.encodedWordRecordings).toEqual([])
  })
})
