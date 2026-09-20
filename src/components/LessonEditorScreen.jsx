import { useState } from 'react'
import {
  formatVocabularyAsText,
  parseVocabularyFromText,
  summariseVocabulary,
} from '../lib/lessons/lessonParsing.js'
import { extractVocabularyFromReadingText } from '../lib/lessons/lessonContent.js'
import { createLessonIdentifier } from '../lib/storage/lessonRepository.js'
import LessonImportField from './LessonImportField.jsx'
import VocabularyWordRecordings from './VocabularyWordRecordings.jsx'

/**
 * Saisie des devoirs de la semaine par le parent.
 *
 * C'est le seul ecran qui ne s'adresse pas a l'enfant : il reste volontairement
 * proche d'un formulaire ordinaire, avec du texte libre plutot que des champs
 * un par mot, pour recopier vite un cahier.
 */

const LESSON_PICTURES = ['📝', '📖', '🐶', '🍎', '🎨', '🔢', '🎒', '🏠', '⭐', '🌈', '⚽', '🎵']

const VOCABULARY_PLACEHOLDER = ['cat = chat', 'dog = chien', 'house = maison'].join('\n')

export default function LessonEditorScreen({ lesson, onSave, onCancel, wordRecordings }) {
  const [title, setTitle] = useState(lesson?.title ?? '')
  const [picture, setPicture] = useState(lesson?.emoji ?? LESSON_PICTURES[0])
  const [vocabularyText, setVocabularyText] = useState(
    formatVocabularyAsText(lesson?.vocabulary ?? [])
  )
  const [readingText, setReadingText] = useState(lesson?.readingText ?? '')

  /**
   * Tant que cette liste n'a pas ete touchee a la main, elle suit le texte au
   * fil de la saisie : c'est ce qui evite au parent de ressaisir les mots. Des
   * qu'il ecrit lui-meme dans le champ, elle lui appartient et le texte ne la
   * remplace plus — y compris pour une lecon deja enregistree, rouverte avec sa
   * propre liste.
   */
  const [hasCustomVocabulary, setHasCustomVocabulary] = useState(Boolean(lesson))

  const vocabulary = parseVocabularyFromText(vocabularyText)
  const canBeSaved = title.trim().length > 0 && readingText.trim().length > 0

  const save = () => {
    if (!canBeSaved) return

    onSave({
      id: lesson?.id ?? createLessonIdentifier(),
      emoji: picture,
      title: title.trim(),
      subtitle: summariseVocabulary(vocabulary),
      vocabulary,
      readingText: readingText.trim(),
    })
  }

  const updateReadingText = (newReadingText) => {
    setReadingText(newReadingText)

    if (!hasCustomVocabulary) {
      setVocabularyText(formatVocabularyAsText(extractVocabularyFromReadingText(newReadingText)))
    }
  }

  const updateVocabularyText = (newVocabularyText) => {
    setHasCustomVocabulary(true)
    setVocabularyText(newVocabularyText)
  }

  /**
   * Un fichier importe remplit les champs sans rien enregistrer : le parent
   * garde la main pour corriger ce que la reconnaissance a mal decoupe.
   */
  const applyImportedLesson = (importedLesson) => {
    const hasImportedVocabulary = importedLesson.vocabulary.length > 0

    setTitle(importedLesson.title)
    setReadingText(importedLesson.readingText)
    setVocabularyText(
      formatVocabularyAsText(
        hasImportedVocabulary
          ? importedLesson.vocabulary
          : extractVocabularyFromReadingText(importedLesson.readingText)
      )
    )
    setHasCustomVocabulary(hasImportedVocabulary)
  }

  return (
    <>
      <div className="notice">
        👨‍👩‍👧 <strong>Pour le parent.</strong> Importe le fichier des devoirs, ou recopie le texte
        du cahier — l'appli en tire elle-même les mots à pratiquer. Tout reste sur cet appareil.
      </div>

      <LessonImportField onLessonImported={applyImportedLesson} />

      <div className="card">
        <div className="field">
          <label htmlFor="lesson-title">Nom de la leçon</label>
          <input
            id="lesson-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex : Anglais - semaine du 15 septembre"
          />
        </div>

        <fieldset className="field">
          <legend>Image</legend>
          <div className="seg">
            {LESSON_PICTURES.map((candidatePicture) => (
              <button
                key={candidatePicture}
                type="button"
                className={picture === candidatePicture ? 'on' : ''}
                style={{ fontSize: '1.4rem', minWidth: 56, flex: '0 0 auto' }}
                onClick={() => setPicture(candidatePicture)}
                aria-pressed={picture === candidatePicture}
                aria-label={`Image ${candidatePicture}`}
              >
                {candidatePicture}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="lesson-reading-text">Texte à lire</label>
          <textarea
            id="lesson-reading-text"
            value={readingText}
            onChange={(event) => updateReadingText(event.target.value)}
            placeholder="Hello! My name is Lucy. I have a cat."
            required
            lang="en"
            spellCheck="true"
          />
        </div>

        <div className="field">
          <label htmlFor="lesson-vocabulary">
            Liste de mots — un par ligne, format <code>anglais = français</code>
          </label>
          <p className="muted">
            Remplie automatiquement à partir du texte : corrige-la ou ajoute les traductions.
          </p>
          <textarea
            id="lesson-vocabulary"
            value={vocabularyText}
            onChange={(event) => updateVocabularyText(event.target.value)}
            placeholder={VOCABULARY_PLACEHOLDER}
            spellCheck="false"
          />
          {vocabulary.length > 0 && (
            <div className="muted">{summariseVocabulary(vocabulary)} reconnu(s)</div>
          )}
        </div>

        <VocabularyWordRecordings vocabulary={vocabulary} wordRecordings={wordRecordings} />

        <div className="row">
          <button className="btn green" onClick={save} disabled={!canBeSaved}>
            💾 Enregistrer
          </button>
          <button className="btn ghost" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </div>
    </>
  )
}
