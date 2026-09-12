import { beforeEach, describe, expect, it } from 'vitest'
import {
  createLessonIdentifier,
  deleteParentLesson,
  loadParentLessons,
  saveParentLesson,
} from './lessonRepository.js'

const aLesson = (overrides = {}) => ({
  id: 'lesson-1',
  emoji: '📝',
  title: 'Semaine 1',
  vocabulary: [{ english: 'cat', french: 'chat' }],
  readingText: '',
  ...overrides,
})

describe('loadParentLessons', () => {
  beforeEach(() => localStorage.clear())

  it('starts with no lesson at all', () => {
    expect(loadParentLessons()).toEqual([])
  })

  it('survives a corrupted storage instead of crashing the application', () => {
    localStorage.setItem('helpReading.parentLessons.v1', 'not json at all')

    expect(loadParentLessons()).toEqual([])
  })
})

describe('saveParentLesson', () => {
  beforeEach(() => localStorage.clear())

  it('keeps the lesson available after a reload', () => {
    saveParentLesson(aLesson())

    expect(loadParentLessons()).toEqual([aLesson()])
  })

  it('shows the most recent lesson first, since it is the homework of the week', () => {
    saveParentLesson(aLesson({ id: 'older', title: 'Older' }))
    saveParentLesson(aLesson({ id: 'newer', title: 'Newer' }))

    expect(loadParentLessons().map((lesson) => lesson.id)).toEqual(['newer', 'older'])
  })

  it('replaces a lesson edited again instead of duplicating it', () => {
    saveParentLesson(aLesson({ title: 'First version' }))
    const updatedLessons = saveParentLesson(aLesson({ title: 'Corrected version' }))

    expect(updatedLessons).toHaveLength(1)
    expect(updatedLessons[0].title).toBe('Corrected version')
  })

  it('keeps an edited lesson at its original place in the list', () => {
    saveParentLesson(aLesson({ id: 'first' }))
    saveParentLesson(aLesson({ id: 'second' }))
    const updatedLessons = saveParentLesson(aLesson({ id: 'second', title: 'Edited' }))

    expect(updatedLessons.map((lesson) => lesson.id)).toEqual(['second', 'first'])
  })
})

describe('deleteParentLesson', () => {
  beforeEach(() => localStorage.clear())

  it('removes only the requested lesson', () => {
    saveParentLesson(aLesson({ id: 'keep-me' }))
    saveParentLesson(aLesson({ id: 'remove-me' }))

    expect(deleteParentLesson('remove-me').map((lesson) => lesson.id)).toEqual(['keep-me'])
  })

  it('does nothing for an unknown lesson', () => {
    saveParentLesson(aLesson({ id: 'keep-me' }))

    expect(deleteParentLesson('never-existed')).toHaveLength(1)
  })
})

describe('createLessonIdentifier', () => {
  it('creates a different identifier on every call', () => {
    const identifiers = Array.from({ length: 50 }, createLessonIdentifier)

    expect(new Set(identifiers).size).toBe(identifiers.length)
  })
})
