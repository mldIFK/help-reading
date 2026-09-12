/**
 * Lecons saisies par le parent (les devoirs de la semaine).
 *
 * Elles vivent sur l'appareil, a cote des lecons livrees avec l'application, et
 * ont exactement la meme forme.
 */

import { readStoredValue, writeStoredValue } from './localStorageAdapter.js'

const PARENT_LESSONS_STORAGE_KEY = 'helpReading.parentLessons.v1'

export function loadParentLessons() {
  const storedLessons = readStoredValue(PARENT_LESSONS_STORAGE_KEY, [])

  return Array.isArray(storedLessons) ? storedLessons : []
}

/**
 * Enregistre une lecon et renvoie la liste mise a jour.
 *
 * Une lecon corrigee reprend sa place dans la liste ; une nouvelle lecon passe
 * en tete, car c'est celle sur laquelle l'enfant va travailler.
 */
export function saveParentLesson(lesson) {
  const existingLessons = loadParentLessons()
  const positionOfLesson = existingLessons.findIndex((candidate) => candidate.id === lesson.id)

  const updatedLessons =
    positionOfLesson >= 0
      ? existingLessons.map((candidate, position) =>
          position === positionOfLesson ? lesson : candidate
        )
      : [lesson, ...existingLessons]

  writeStoredValue(PARENT_LESSONS_STORAGE_KEY, updatedLessons)
  return updatedLessons
}

export function deleteParentLesson(lessonId) {
  const remainingLessons = loadParentLessons().filter((lesson) => lesson.id !== lessonId)

  writeStoredValue(PARENT_LESSONS_STORAGE_KEY, remainingLessons)
  return remainingLessons
}

let lessonsCreatedThisSession = 0

/** Identifiant unique, sans dependre d'une horloge ni d'un serveur. */
export function createLessonIdentifier() {
  lessonsCreatedThisSession += 1

  const randomSuffix = Math.random().toString(36).slice(2, 8)

  return `lesson-${Date.now().toString(36)}-${lessonsCreatedThisSession}-${randomSuffix}`
}
