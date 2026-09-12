import { describe, expect, it } from 'vitest'
import { BUILT_IN_LESSONS, findBuiltInLesson } from './builtInLessons.js'
import { hasReadingText, hasVocabulary } from './lessonContent.js'

describe('BUILT_IN_LESSONS', () => {
  it('ships a set of ready-to-use lessons', () => {
    expect(BUILT_IN_LESSONS.length).toBeGreaterThanOrEqual(10)
  })

  it('gives every lesson a unique identifier', () => {
    const identifiers = BUILT_IN_LESSONS.map((lesson) => lesson.id)

    expect(new Set(identifiers).size).toBe(identifiers.length)
  })

  it('gives every lesson a title and a picture, both shown on the home screen', () => {
    BUILT_IN_LESSONS.forEach((lesson) => {
      expect(lesson.title, `lesson ${lesson.id}`).toBeTruthy()
      expect(lesson.emoji, `lesson ${lesson.id}`).toBeTruthy()
    })
  })

  it('gives every lesson something to work on', () => {
    BUILT_IN_LESSONS.forEach((lesson) => {
      expect(hasVocabulary(lesson) || hasReadingText(lesson), `lesson ${lesson.id}`).toBe(true)
    })
  })

  it('gives every vocabulary entry an English word and a French translation', () => {
    BUILT_IN_LESSONS.flatMap((lesson) =>
      (lesson.vocabulary ?? []).map((entry) => ({ ...entry, lessonId: lesson.id }))
    ).forEach((entry) => {
      expect(entry.english, `lesson ${entry.lessonId}`).toBeTruthy()
      expect(entry.french, `word "${entry.english}" of lesson ${entry.lessonId}`).toBeTruthy()
    })
  })
})

describe('findBuiltInLesson', () => {
  it('finds a lesson by its identifier', () => {
    expect(findBuiltInLesson('colours')?.title).toBe('Colours')
  })

  it('returns null for an unknown identifier', () => {
    expect(findBuiltInLesson('does-not-exist')).toBeNull()
  })
})
