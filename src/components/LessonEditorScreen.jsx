import { useState } from 'react'
import {
  formatVocabularyAsText,
  parseVocabularyFromText,
  summariseVocabulary,
} from '../lib/lessons/lessonParsing.js'
import { createLessonIdentifier } from '../lib/storage/lessonRepository.js'

/**
 * Saisie des devoirs de la semaine par le parent.
 *
 * C'est le seul ecran qui ne s'adresse pas a l'enfant : il reste volontairement
 * proche d'un formulaire ordinaire, avec du texte libre plutot que des champs
 * un par mot, pour recopier vite un cahier.
 */

const LESSON_PICTURES = ['📝', '📖', '🐶', '🍎', '🎨', '🔢', '🎒', '🏠', '⭐', '🌈', '⚽', '🎵']

const VOCABULARY_PLACEHOLDER = ['cat = chat', 'dog = chien', 'house = maison'].join('\n')

export default function LessonEditorScreen({ lesson, onSave, onCancel }) {
  const [title, setTitle] = useState(lesson?.title ?? '')
  const [picture, setPicture] = useState(lesson?.emoji ?? LESSON_PICTURES[0])
  const [vocabularyText, setVocabularyText] = useState(
    formatVocabularyAsText(lesson?.vocabulary ?? [])
  )
  const [readingText, setReadingText] = useState(lesson?.readingText ?? '')

  const vocabulary = parseVocabularyFromText(vocabularyText)
  const hasSomethingToWorkOn = vocabulary.length > 0 || readingText.trim().length > 0
  const canBeSaved = title.trim().length > 0 && hasSomethingToWorkOn

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

  return (
    <>
      <div className="notice">
        👨‍👩‍👧 <strong>Pour le parent.</strong> Recopie ici la liste de mots ou le texte du cahier.
        Tout reste sur cet appareil.
      </div>

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
          <label htmlFor="lesson-vocabulary">
            Liste de mots — un par ligne, format <code>anglais = français</code>
          </label>
          <textarea
            id="lesson-vocabulary"
            value={vocabularyText}
            onChange={(event) => setVocabularyText(event.target.value)}
            placeholder={VOCABULARY_PLACEHOLDER}
            spellCheck="false"
          />
          {vocabulary.length > 0 && (
            <div className="muted">{summariseVocabulary(vocabulary)} reconnu(s)</div>
          )}
        </div>

        <div className="field">
          <label htmlFor="lesson-reading-text">Texte à lire (facultatif)</label>
          <textarea
            id="lesson-reading-text"
            value={readingText}
            onChange={(event) => setReadingText(event.target.value)}
            placeholder="Hello! My name is Lucy. I have a cat."
            spellCheck="false"
          />
        </div>

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
