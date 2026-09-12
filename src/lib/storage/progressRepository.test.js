import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAXIMUM_REMEMBERED_EXERCISES,
  clearProgress,
  loadProgress,
  recordCompletedExercise,
} from './progressRepository.js'

const aCompletedExercise = (overrides = {}) => ({
  exerciseType: 'readAloud',
  lessonTitle: 'Colours',
  subject: 'red',
  earnedStars: 2,
  ...overrides,
})

describe('loadProgress', () => {
  beforeEach(() => localStorage.clear())

  it('starts with no star and no history', () => {
    expect(loadProgress()).toEqual({ totalStars: 0, recentExercises: [] })
  })

  it('falls back to an empty progress when the storage is unreadable', () => {
    localStorage.setItem('helpReading.progress.v1', 'broken')

    expect(loadProgress().totalStars).toBe(0)
  })
})

describe('recordCompletedExercise', () => {
  beforeEach(() => localStorage.clear())

  it('adds the earned stars to the total', () => {
    recordCompletedExercise(aCompletedExercise({ earnedStars: 2 }))
    const progress = recordCompletedExercise(aCompletedExercise({ earnedStars: 3 }))

    expect(progress.totalStars).toBe(5)
  })

  it('shows the latest exercise first in the history', () => {
    recordCompletedExercise(aCompletedExercise({ subject: 'red' }))
    const progress = recordCompletedExercise(aCompletedExercise({ subject: 'blue' }))

    expect(progress.recentExercises[0].subject).toBe('blue')
  })

  it('dates each exercise so the parent can follow the work', () => {
    const progress = recordCompletedExercise(aCompletedExercise())

    expect(Date.parse(progress.recentExercises[0].completedAt)).not.toBeNaN()
  })

  it('keeps the history short instead of growing without limit', () => {
    for (let exerciseNumber = 0; exerciseNumber < MAXIMUM_REMEMBERED_EXERCISES + 10; exerciseNumber += 1) {
      recordCompletedExercise(aCompletedExercise({ subject: `word-${exerciseNumber}` }))
    }

    expect(loadProgress().recentExercises).toHaveLength(MAXIMUM_REMEMBERED_EXERCISES)
  })

  it('keeps counting the stars of the exercises dropped from the history', () => {
    for (let exerciseNumber = 0; exerciseNumber < MAXIMUM_REMEMBERED_EXERCISES + 5; exerciseNumber += 1) {
      recordCompletedExercise(aCompletedExercise({ earnedStars: 1 }))
    }

    expect(loadProgress().totalStars).toBe(MAXIMUM_REMEMBERED_EXERCISES + 5)
  })
})

describe('clearProgress', () => {
  beforeEach(() => localStorage.clear())

  it('brings the stars back to zero', () => {
    recordCompletedExercise(aCompletedExercise())

    expect(clearProgress()).toEqual({ totalStars: 0, recentExercises: [] })
    expect(loadProgress().totalStars).toBe(0)
  })
})
