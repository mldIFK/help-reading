import { useEffect, useState } from 'react'
import { hasReadingText, hasVocabulary } from '../lib/lessons/lessonContent.js'
import VocabularyFlashcards from './VocabularyFlashcards.jsx'
import ReadingTextPlayer from './ReadingTextPlayer.jsx'

/**
 * Ecoute : entendre la lecon, sans rien avoir a produire.
 *
 * Une lecon peut contenir du vocabulaire, un texte, ou les deux ; l'ecran ne
 * propose le choix que lorsqu'il y a reellement deux choses a ecouter.
 */

const CONTENT = { vocabulary: 'vocabulary', readingText: 'readingText' }

export default function ListeningScreen({ lesson, speechPlayer, settings }) {
  const lessonHasVocabulary = hasVocabulary(lesson)
  const lessonHasReadingText = hasReadingText(lesson)

  const [chosenContent, setChosenContent] = useState(defaultContentFor(lesson))

  useEffect(() => setChosenContent(defaultContentFor(lesson)), [lesson])

  if (!lessonHasVocabulary && !lessonHasReadingText) {
    return <p className="notice">Cette leçon est vide. Ajoute des mots ou un texte.</p>
  }

  const showsVocabulary = chosenContent === CONTENT.vocabulary && lessonHasVocabulary

  return (
    <>
      {lessonHasVocabulary && lessonHasReadingText && (
        <div className="seg">
          <button
            className={showsVocabulary ? 'on' : ''}
            onClick={() => setChosenContent(CONTENT.vocabulary)}
          >
            🃏 Les mots
          </button>
          <button
            className={showsVocabulary ? '' : 'on'}
            onClick={() => setChosenContent(CONTENT.readingText)}
          >
            📖 Le texte
          </button>
        </div>
      )}

      {showsVocabulary ? (
        <VocabularyFlashcards lesson={lesson} speechPlayer={speechPlayer} settings={settings} />
      ) : (
        <ReadingTextPlayer lesson={lesson} speechPlayer={speechPlayer} settings={settings} />
      )}
    </>
  )
}

function defaultContentFor(lesson) {
  return hasVocabulary(lesson) ? CONTENT.vocabulary : CONTENT.readingText
}
