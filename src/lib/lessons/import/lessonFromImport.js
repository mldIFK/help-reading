/**
 * Construction d'une lecon a partir d'un fichier importe.
 *
 * Le resultat n'est jamais enregistre directement : il pre-remplit l'editeur de
 * lecon, ou le parent verifie et corrige avant d'enregistrer. C'est ce qui
 * permet a la reconnaissance automatique de rester simple — elle propose, elle
 * ne decide pas.
 */

import { createLessonIdentifier } from '../../storage/lessonRepository.js'
import { summariseVocabulary } from '../lessonParsing.js'
import { IMPORTED_CONTENT, detectImportedContent } from './importedContentDetection.js'
import { cleanImportedText, countWords } from './importedTextCleaning.js'

const DEFAULT_LESSON_PICTURE = '📝'
const FALLBACK_LESSON_TITLE = 'Devoirs importés'

/**
 * Au-dela, le texte depasse ce qu'une enfant de six ans lit d'une traite : on
 * le signale au parent pour qu'il n'en garde que le passage a travailler.
 */
export const LONGEST_COMFORTABLE_READING_TEXT_WORDS = 250

const FILE_EXTENSION = /\.[^.]*$/
const WORD_SEPARATORS_IN_FILE_NAMES = /[_-]+/g
const REPEATED_SPACES = / {2,}/g

export function lessonTitleFromFileName(fileName) {
  const titleFromName = String(fileName ?? '')
    .replace(FILE_EXTENSION, '')
    .replace(WORD_SEPARATORS_IN_FILE_NAMES, ' ')
    .replace(REPEATED_SPACES, ' ')
    .trim()

  if (titleFromName.length === 0) return FALLBACK_LESSON_TITLE

  return titleFromName.charAt(0).toUpperCase() + titleFromName.slice(1)
}

/**
 * Renvoie la lecon proposee, un resume de ce qui a ete trouve, et les points
 * sur lesquels attirer l'oeil du parent.
 */
export function buildLessonFromImport({ fileName, text }) {
  const cleanedText = cleanImportedText(text)
  const detection = detectImportedContent(cleanedText)

  const lesson = {
    id: createLessonIdentifier(),
    emoji: DEFAULT_LESSON_PICTURE,
    title: lessonTitleFromFileName(fileName),
    subtitle: summariseVocabulary(detection.vocabulary),
    vocabulary: detection.vocabulary,
    readingText: detection.readingText,
  }

  const summary = {
    kind: detection.kind,
    wordCount: detection.vocabulary.length,
    readingWordCount: countWords(detection.readingText),
    isEmpty: detection.kind === IMPORTED_CONTENT.empty,
  }

  return { lesson, summary, warnings: listWarnings(summary) }
}

function listWarnings({ isEmpty, readingWordCount }) {
  const warnings = []

  if (isEmpty) {
    warnings.push(
      'Ce fichier ne contient aucun texte lisible. S’il s’agit d’un PDF scanné, le ' +
        'texte est une image : il faut le saisir à la main.'
    )
  }

  if (readingWordCount > LONGEST_COMFORTABLE_READING_TEXT_WORDS) {
    warnings.push(
      `Le texte est long (${readingWordCount} mots). Ne garde que le passage à ` +
        'travailler : une séance de lecture tient en quelques phrases.'
    )
  }

  return warnings
}
