import { useEffect, useState } from 'react'
import { listVocabulary } from '../lib/lessons/lessonContent.js'
import { useCancellableSpeechSequence } from '../hooks/useCancellableSpeechSequence.js'

/**
 * Fiches de vocabulaire : un mot a la fois, en grand, avec son image et sa
 * traduction. L'enfant avance a son rythme, ou laisse l'appli derouler la liste.
 */

/** Temps de lecture de la fiche avant de passer a la suivante. */
const EXTRA_PAUSE_BETWEEN_FLASHCARDS_MS = 350

export default function VocabularyFlashcards({ lesson, speechPlayer, settings }) {
  const vocabulary = listVocabulary(lesson)
  const [currentCardPosition, setCurrentCardPosition] = useState(0)
  const { isPlaying, play, stop } = useCancellableSpeechSequence(speechPlayer)

  useEffect(() => {
    setCurrentCardPosition(0)
    stop()
  }, [lesson.id, stop])

  const currentCard = vocabulary[Math.min(currentCardPosition, vocabulary.length - 1)]

  const speakCurrentCard = (slowly) =>
    speechPlayer.speak(currentCard.english, { slowly }).catch(ignoreSpeechFailure)

  const playWholeList = () =>
    play(async (sequence) => {
      for (let position = 0; position < vocabulary.length; position += 1) {
        sequence.throwIfCancelled()
        setCurrentCardPosition(position)

        await speechPlayer.speak(vocabulary[position].english, {})
        await sequence.pause(settings.pauseBetweenWordsMs + EXTRA_PAUSE_BETWEEN_FLASHCARDS_MS)
      }
    })

  const showCardAt = (position) =>
    setCurrentCardPosition((position + vocabulary.length) % vocabulary.length)

  return (
    <>
      <div className="card word-card">
        <div className="emoji">{currentCard.emoji ?? lesson.emoji ?? '🔤'}</div>
        <div className="en">{currentCard.english}</div>
        {settings.showFrenchTranslation && currentCard.french && (
          <div className="fr">{currentCard.french}</div>
        )}
      </div>

      <div className="row center">
        <button className="btn big" onClick={() => speakCurrentCard(false)}>
          🔊 Écouter
        </button>
        <button className="btn amber big" onClick={() => speakCurrentCard(true)}>
          🐢 Lentement
        </button>
      </div>

      <div className="row center">
        <button className="btn ghost" onClick={() => showCardAt(currentCardPosition - 1)}>
          ⬅️ Avant
        </button>
        <button className="btn ghost" onClick={() => showCardAt(currentCardPosition + 1)}>
          Après ➡️
        </button>

        {isPlaying ? (
          <button className="btn red" onClick={stop}>
            ⏹️ Stop
          </button>
        ) : (
          <button className="btn green" onClick={playWholeList}>
            ▶️ Tout écouter
          </button>
        )}
      </div>

      <p className="counter">
        {currentCardPosition + 1} / {vocabulary.length}
      </p>
    </>
  )
}

function ignoreSpeechFailure() {}
