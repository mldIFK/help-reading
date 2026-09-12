import { useEffect, useMemo, useRef, useState } from 'react'
import { TOKEN_KIND, splitIntoTokens } from '../lib/text/textSegmentation.js'
import { scorePronunciation } from '../lib/scoring/pronunciationScoring.js'
import { encouragementForPronunciation, starsForPronunciation } from '../lib/scoring/rewards.js'
import {
  hasReadingText,
  hasVocabulary,
  listSentencesToReadAloud,
  listWordsToReadAloud,
} from '../lib/lessons/lessonContent.js'
import {
  createMicrophoneListener,
  isSpeechRecognitionAvailable,
} from '../lib/speech/speechRecognitionService.js'
import { EXERCISE_TYPE } from '../lib/exerciseTypes.js'

/**
 * Lecture a voix haute : l'enfant lit dans le micro, l'application colorie
 * chaque mot selon ce qu'elle a entendu.
 */

const PASSAGE = { words: 'words', sentences: 'sentences' }

const GOOD_SCORE_PERCENTAGE = 80
const FAIR_SCORE_PERCENTAGE = 50

export default function ReadAloudScreen({ lesson, speechPlayer, settings, onExerciseCompleted }) {
  const [chosenPassage, setChosenPassage] = useState(defaultPassageFor(lesson))
  const [currentPassagePosition, setCurrentPassagePosition] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [heardSoFar, setHeardSoFar] = useState('')
  const [score, setScore] = useState(null)
  const [microphoneProblem, setMicrophoneProblem] = useState('')
  const microphoneRef = useRef(null)

  const passages = useMemo(() => listPassages(lesson, chosenPassage), [lesson, chosenPassage])
  const currentPassage = passages[Math.min(currentPassagePosition, passages.length - 1)] ?? ''

  useEffect(() => setChosenPassage(defaultPassageFor(lesson)), [lesson])

  useEffect(() => {
    setCurrentPassagePosition(0)
    setScore(null)
    setHeardSoFar('')
    setMicrophoneProblem('')
  }, [lesson.id, chosenPassage])

  useEffect(
    () => () => {
      microphoneRef.current?.cancelListening()
      speechPlayer.stop()
    },
    [speechPlayer]
  )

  if (!isSpeechRecognitionAvailable()) return <MicrophoneUnavailableNotice />
  if (passages.length === 0) {
    return <p className="notice">Cette leçon n’a rien à lire. Ajoute des mots ou un texte.</p>
  }

  const startListening = () => {
    speechPlayer.stop()
    setMicrophoneProblem('')
    setScore(null)
    setHeardSoFar('')

    microphoneRef.current = createMicrophoneListener({
      language: speechPlayer.voice?.lang ?? settings.accent,
      onPartialTranscript: setHeardSoFar,
      onFinalTranscript: (heardSentence) => {
        if (!heardSentence) return
        setHeardSoFar(heardSentence)
        gradeReading(heardSentence)
      },
      onListeningEnded: () => setIsListening(false),
      onProblem: (problemDescription) => {
        setMicrophoneProblem(problemDescription)
        setIsListening(false)
      },
    })

    setIsListening(true)
    microphoneRef.current.startListening()
  }

  const gradeReading = (heardSentence) => {
    const readingScore = scorePronunciation(currentPassage, heardSentence)
    setScore(readingScore)

    const earnedStars = starsForPronunciation(readingScore.percentage)
    if (earnedStars > 0) {
      onExerciseCompleted({
        exerciseType: EXERCISE_TYPE.readAloud,
        lessonTitle: lesson.title,
        subject: currentPassage,
        earnedStars,
        scorePercentage: readingScore.percentage,
      })
    }
  }

  const goToNextPassage = () => {
    microphoneRef.current?.cancelListening()
    speechPlayer.stop()
    setScore(null)
    setHeardSoFar('')
    setMicrophoneProblem('')
    setCurrentPassagePosition((position) => (position + 1) % passages.length)
  }

  const speakModel = (slowly) =>
    speechPlayer.speak(currentPassage, { slowly }).catch(ignoreSpeechFailure)

  return (
    <>
      {hasVocabulary(lesson) && hasReadingText(lesson) && (
        <div className="seg">
          <button
            className={chosenPassage === PASSAGE.words ? 'on' : ''}
            onClick={() => setChosenPassage(PASSAGE.words)}
          >
            🔤 Les mots
          </button>
          <button
            className={chosenPassage === PASSAGE.sentences ? 'on' : ''}
            onClick={() => setChosenPassage(PASSAGE.sentences)}
          >
            📖 Les phrases
          </button>
        </div>
      )}

      <div className="card">
        <div className="reader centered">
          <GradedPassage passage={currentPassage} score={score} speechPlayer={speechPlayer} />
        </div>
      </div>

      <div className="row center">
        <button className="btn" onClick={() => speakModel(false)} disabled={isListening}>
          🔊 Écoute d’abord
        </button>
        <button className="btn amber" onClick={() => speakModel(true)} disabled={isListening}>
          🐢 Lentement
        </button>
      </div>

      <button
        className={`mic-btn ${isListening ? 'listening' : ''}`}
        onClick={isListening ? () => microphoneRef.current?.stopListening() : startListening}
        aria-label={isListening ? 'Arrêter le micro' : 'Parler dans le micro'}
      >
        🎤
      </button>

      <p className="counter">
        {isListening ? '🔴 Je t’écoute… parle !' : '👆 Appuie sur le micro et lis la phrase'}
      </p>

      {heardSoFar && <p className="heard">J’ai entendu : « {heardSoFar} »</p>}

      {microphoneProblem && <p className="notice error">{microphoneProblem}</p>}

      {score && <ScoreBanner score={score} />}

      <div className="row center">
        <button className="btn ghost" onClick={startListening} disabled={isListening}>
          🔁 Réessayer
        </button>
        <button className="btn green" onClick={goToNextPassage} disabled={isListening}>
          ⏭️ Suivant
        </button>
      </div>

      <p className="counter">
        {currentPassagePosition + 1} / {passages.length}
      </p>
    </>
  )
}

/** Le passage a lire, chaque mot colorie une fois la lecture notee. */
function GradedPassage({ passage, score, speechPlayer }) {
  const tokens = splitIntoTokens(passage)

  return tokens.map((token, tokenIndex) => {
    if (token.kind !== TOKEN_KIND.word) return <span key={tokenIndex}>{token.text}</span>

    const wordStatus = score?.wordResults[token.wordIndex]?.status ?? ''

    return (
      <button
        key={tokenIndex}
        type="button"
        className={`word ${wordStatus}`}
        onClick={() => speechPlayer.speak(token.text, { slowly: true }).catch(ignoreSpeechFailure)}
      >
        {token.text}
      </button>
    )
  })
}

function ScoreBanner({ score }) {
  const earnedStars = starsForPronunciation(score.percentage)

  return (
    <>
      <div className={`score-banner ${scoreToneOf(score.percentage)}`}>
        {encouragementForPronunciation(score.percentage)}
        <span className="score-detail">
          {score.correctWordCount} / {score.totalWordCount} mots bien prononcés ·{' '}
          {score.percentage}%
        </span>
        {earnedStars > 0 && <span className="confetti">{'⭐'.repeat(earnedStars)}</span>}
      </div>

      <p className="muted centered">
        Vert = bien · Orange = presque · Rouge = à retravailler (appuie sur un mot pour l’entendre).
      </p>
    </>
  )
}

function MicrophoneUnavailableNotice() {
  return (
    <p className="notice error">
      🎤 Ce navigateur ne sait pas écouter le micro.
      <br />
      Utilise <strong>Chrome</strong> ou <strong>Edge</strong> (PC ou tablette Android). Sur
      iPad/iPhone, ce mode n’est pas disponible — mais « Écouter » et « Dictée » marchent.
    </p>
  )
}

function listPassages(lesson, chosenPassage) {
  if (chosenPassage === PASSAGE.words && hasVocabulary(lesson)) return listWordsToReadAloud(lesson)
  return listSentencesToReadAloud(lesson)
}

function defaultPassageFor(lesson) {
  return hasVocabulary(lesson) ? PASSAGE.words : PASSAGE.sentences
}

function scoreToneOf(percentage) {
  if (percentage >= GOOD_SCORE_PERCENTAGE) return 'good'
  if (percentage >= FAIR_SCORE_PERCENTAGE) return 'medium'
  return 'low'
}

function ignoreSpeechFailure() {}
