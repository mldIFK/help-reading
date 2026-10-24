import { useEffect, useRef, useState } from 'react'
import { LETTER_RESULT, compareTypedSpelling } from '../lib/scoring/spellingComparison.js'
import { starsForDictation } from '../lib/scoring/rewards.js'
import { listDictationWords } from '../lib/lessons/lessonContent.js'
import { EXERCISE_TYPE } from '../lib/exerciseTypes.js'

/**
 * Dictee : l'application prononce un mot, l'enfant l'ecrit, et la correction
 * montre lettre par lettre ou sa main s'est trompee.
 */

/** Laisse l'ecran s'afficher avant de dicter, pour que l'enfant ne rate pas le debut. */
const DELAY_BEFORE_DICTATING_MS = 250

export default function DictationScreen({ lesson, speechPlayer, settings, onExerciseCompleted }) {
  const dictationWords = listDictationWords(lesson)

  const [currentWordPosition, setCurrentWordPosition] = useState(0)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [correction, setCorrection] = useState(null)
  const [attemptNumber, setAttemptNumber] = useState(0)
  const [wasRevealed, setWasRevealed] = useState(false)
  const [revealedLetterCount, setRevealedLetterCount] = useState(0)
  const [starsPendingForCurrentWord, setStarsPendingForCurrentWord] = useState(0)
  const answerFieldRef = useRef(null)

  const currentWord = dictationWords[Math.min(currentWordPosition, dictationWords.length - 1)]
  const isSolved = wasRevealed || correction?.isExact === true

  // Un nouveau mot : on repart d'une page blanche et on le dicte.
  useEffect(() => {
    setTypedAnswer('')
    setCorrection(null)
    setAttemptNumber(0)
    setWasRevealed(false)
    setRevealedLetterCount(0)
    setStarsPendingForCurrentWord(0)

    if (!currentWord) return undefined

    answerFieldRef.current?.focus()
    const dictationTimer = setTimeout(
      () => speechPlayer.speak(currentWord.english, {}).catch(ignoreSpeechFailure),
      DELAY_BEFORE_DICTATING_MS
    )

    return () => clearTimeout(dictationTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordPosition, lesson.id])

  useEffect(() => setCurrentWordPosition(0), [lesson.id])
  useEffect(() => () => speechPlayer.stop(), [speechPlayer])

  if (dictationWords.length === 0) {
    return <div className="notice">Cette leçon n’a pas de mots à écrire.</div>
  }

  const dictateCurrentWord = (slowly) =>
    speechPlayer.speak(currentWord.english, { slowly }).catch(ignoreSpeechFailure)

  const checkAnswer = () => {
    if (!typedAnswer.trim()) return

    const spellingCorrection = compareTypedSpelling(currentWord.english, typedAnswer)
    const currentAttemptNumber = attemptNumber + 1

    setCorrection(spellingCorrection)
    setAttemptNumber(currentAttemptNumber)

    setStarsPendingForCurrentWord(
      starsForDictation({
        isExact: spellingCorrection.isExact,
        attemptNumber: currentAttemptNumber,
        wasRevealed,
      })
    )
  }

  const revealOneMoreLetter = () => {
    setRevealedLetterCount((count) => Math.min(count + 1, currentWord.english.length))
    dictateCurrentWord(true)
  }

  const revealWholeWord = () => {
    setWasRevealed(true)
    setTypedAnswer(currentWord.english)
    setCorrection(null)
    setStarsPendingForCurrentWord(0)
  }

  const goToNextWord = () => {
    speechPlayer.stop()

    if (starsPendingForCurrentWord > 0) {
      onExerciseCompleted({
        exerciseType: EXERCISE_TYPE.dictation,
        lessonTitle: lesson.title,
        subject: currentWord.english,
        earnedStars: starsPendingForCurrentWord,
      })
    }

    setCurrentWordPosition((position) => (position + 1) % dictationWords.length)
  }

  return (
    <>
      <div className="card word-card">
        <div className="emoji">{isSolved ? (currentWord.emoji ?? '✅') : '❓'}</div>

        {isSolved ? (
          <div className="en">{currentWord.english}</div>
        ) : (
          <WordOutline word={currentWord.english} revealedLetterCount={revealedLetterCount} />
        )}

        {settings.showFrenchTranslation && currentWord.french && (
          <div className="fr">{currentWord.french}</div>
        )}
      </div>

      <div className="row center">
        <button className="btn big" onClick={() => dictateCurrentWord(false)}>
          🔊 Réécouter
        </button>
        <button className="btn amber big" onClick={() => dictateCurrentWord(true)}>
          🐢 Lentement
        </button>
      </div>

      <input
        ref={answerFieldRef}
        className="spell-input"
        type="text"
        value={typedAnswer}
        onChange={(event) => {
          setTypedAnswer(event.target.value)
          setCorrection(null)
        }}
        onKeyDown={(event) => event.key === 'Enter' && checkAnswer()}
        placeholder="écris le mot ici"
        aria-label="Écris le mot que tu entends"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      <div className="row center">
        <button className="btn green" onClick={checkAnswer} disabled={!typedAnswer.trim()}>
          ✅ Vérifier
        </button>
        <button className="btn ghost" onClick={revealOneMoreLetter}>
          💡 Indice
        </button>
        <button className="btn ghost" onClick={revealWholeWord}>
          👀 Montrer
        </button>
      </div>

      {correction && <SpellingCorrection correction={correction} />}

      <div className="row center">
        <button className="btn" onClick={goToNextWord}>
          ⏭️ Mot suivant
        </button>
      </div>

      <div className="counter">
        {currentWordPosition + 1} / {dictationWords.length}
      </div>
    </>
  )
}

/** Le mot a trouver, remplace par des tirets, avec les indices deja demandes. */
function WordOutline({ word, revealedLetterCount }) {
  const revealedPart = word.slice(0, revealedLetterCount)
  const hiddenLetterCount = Math.max(0, word.replace(/\s/g, '').length - revealedLetterCount)

  return (
    <div className="en word-outline">
      {revealedPart}
      {'_'.repeat(hiddenLetterCount)}
    </div>
  )
}

function SpellingCorrection({ correction }) {
  return (
    <div className="card">
      <div className="letters">
        {correction.letters.map((letter, position) => (
          <span
            key={position}
            className={`letter ${letter.status}`}
            data-testid={`letter-${position}`}
            data-status={letter.status}
          >
            {letter.status === LETTER_RESULT.missing ? '_' : letter.expectedLetter}
          </span>
        ))}
        {correction.extraLetters && (
          <span className="letter incorrect" data-status={LETTER_RESULT.incorrect}>
            {correction.extraLetters}
          </span>
        )}
      </div>

      <div
        className={`score-banner ${correction.isExact ? 'good' : 'low'}`}
        style={{ marginTop: 14 }}
      >
        {correction.isExact ? '🎉 Bravo, c’est exact !' : '✏️ Regarde les lettres en rouge'}
      </div>
    </div>
  )
}

/** Une lecture qui echoue ne doit jamais interrompre l'exercice. */
function ignoreSpeechFailure() {}
