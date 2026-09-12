/**
 * Etoiles gagnees et derniers exercices realises.
 *
 * L'historique sert au parent a voir sur quoi sa fille a travaille ; il est
 * volontairement court, le total des etoiles restant, lui, cumulatif.
 */

import { readStoredValue, writeStoredValue } from './localStorageAdapter.js'

const PROGRESS_STORAGE_KEY = 'helpReading.progress.v1'

export const MAXIMUM_REMEMBERED_EXERCISES = 50

const EMPTY_PROGRESS = { totalStars: 0, recentExercises: [] }

export function loadProgress() {
  const storedProgress = readStoredValue(PROGRESS_STORAGE_KEY, EMPTY_PROGRESS)

  return {
    totalStars: Number(storedProgress?.totalStars) || 0,
    recentExercises: Array.isArray(storedProgress?.recentExercises)
      ? storedProgress.recentExercises
      : [],
  }
}

/**
 * Enregistre un exercice termine et renvoie la progression mise a jour.
 * `completedExercise` decrit ce qui vient d'etre fait :
 * `{ exerciseType, lessonTitle, subject, earnedStars, scorePercentage? }`.
 */
export function recordCompletedExercise(completedExercise) {
  const previousProgress = loadProgress()

  const updatedProgress = {
    totalStars: previousProgress.totalStars + completedExercise.earnedStars,
    recentExercises: [
      { ...completedExercise, completedAt: new Date().toISOString() },
      ...previousProgress.recentExercises,
    ].slice(0, MAXIMUM_REMEMBERED_EXERCISES),
  }

  writeStoredValue(PROGRESS_STORAGE_KEY, updatedProgress)
  return updatedProgress
}

export function clearProgress() {
  writeStoredValue(PROGRESS_STORAGE_KEY, EMPTY_PROGRESS)
  return loadProgress()
}
