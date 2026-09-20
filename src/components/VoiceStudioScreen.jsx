import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BRITISH_PHONEMES,
  PHONEME_COUNT,
  listPhonemeGroups,
} from '../lib/speech/phonemes/britishPhonemes.js'
import {
  deleteAllRecordings,
  deleteRecording,
  listRecordedPhonemes,
  loadAllRecordings,
  loadRecording,
  saveRecording,
} from '../lib/speech/phonemes/phonemeRecordingStore.js'
import { isRecordingSupported, startRecording } from '../lib/speech/microphoneRecorder.js'
import { createRecordedVoice } from '../lib/speech/phonemes/recordedVoice.js'
import { loadPronunciationDictionary } from '../lib/speech/phonemes/pronunciationDictionaryLoader.js'
import { buildSpokenPlan } from '../lib/speech/phonemes/spokenPlan.js'

/**
 * Studio d'enregistrement de la voix humaine.
 *
 * Ecran destine a l'adulte qui enregistre : les 45 sons de l'anglais
 * britannique, un par un, avec un mot d'exemple et une indication en francais.
 * Un banc d'essai permet d'entendre immediatement le rendu d'un mot entier —
 * c'est ce qui doit etre juge avant de faire enregistrer quelqu'un d'autre.
 */

const TEST_WORDS = ['cat', 'dog', 'the dog runs', 'hello', 'my name is Lucy']

export default function VoiceStudioScreen() {
  const [recordedPhonemes, setRecordedPhonemes] = useState(new Set())
  const [recordingSymbol, setRecordingSymbol] = useState(null)
  const [problem, setProblem] = useState('')
  const recorderRef = useRef(null)

  useEffect(() => {
    listRecordedPhonemes().then(setRecordedPhonemes).catch(() => setRecordedPhonemes(new Set()))
  }, [])

  const beginRecording = async (symbol) => {
    setProblem('')
    try {
      recorderRef.current = await startRecording()
      setRecordingSymbol(symbol)
    } catch {
      setProblem(
        'Le micro n’est pas accessible. Autorise-le pour ce site, et vérifie que la page est ' +
          'bien en https:// (ou sur localhost).'
      )
    }
  }

  const finishRecording = async (symbol) => {
    const recorder = recorderRef.current
    recorderRef.current = null
    setRecordingSymbol(null)
    if (!recorder) return

    const audioBlob = await recorder.stop()
    await saveRecording(symbol, audioBlob)
    setRecordedPhonemes(await listRecordedPhonemes())
  }

  const playRecording = async (symbol) => {
    const audioBlob = await loadRecording(symbol)
    if (!audioBlob) return

    const audio = new Audio(URL.createObjectURL(audioBlob))
    audio.play().catch(() => {})
  }

  const removeRecording = async (symbol) => {
    await deleteRecording(symbol)
    setRecordedPhonemes(await listRecordedPhonemes())
  }

  const removeEverything = async () => {
    if (!window.confirm('Effacer tous les sons enregistrés ?')) return
    await deleteAllRecordings()
    setRecordedPhonemes(new Set())
  }

  if (!isRecordingSupported()) {
    return (
      <p className="notice error">
        🎙️ Ce navigateur ne sait pas enregistrer au micro. Utilise Chrome ou Edge, et ouvre la page
        en <strong>https://</strong> ou sur <strong>localhost</strong>.
      </p>
    )
  }

  return (
    <>
      <div className="notice">
        🎙️ <strong>Pour l’adulte qui enregistre.</strong> Prononce chaque son <em>seul</em>, pas le
        mot entier : le mot n’est là que pour rappeler de quel son il s’agit. Reste bref et
        régulier, sans traîner — les sons seront enchaînés pour former les mots.
      </div>

      <RecordingProgress recordedCount={recordedPhonemes.size} />

      <PronunciationBench recordedPhonemes={recordedPhonemes} />

      {problem && <p className="notice error">{problem}</p>}

      {listPhonemeGroups().map((group) => (
        <section className="card" key={group.name}>
          <h2 className="section">{group.name}</h2>
          <ul className="recording-list">
            {group.phonemes.map((phoneme) => (
              <PhonemeRow
                key={phoneme.symbol}
                phoneme={phoneme}
                isRecorded={recordedPhonemes.has(phoneme.symbol)}
                isBeingRecorded={recordingSymbol === phoneme.symbol}
                isAnotherBeingRecorded={
                  recordingSymbol !== null && recordingSymbol !== phoneme.symbol
                }
                onStart={beginRecording}
                onFinish={finishRecording}
                onPlay={playRecording}
                onDelete={removeRecording}
              />
            ))}
          </ul>
        </section>
      ))}

      <div className="row center">
        <button className="btn ghost" onClick={removeEverything}>
          🗑️ Tout effacer
        </button>
      </div>
    </>
  )
}

function RecordingProgress({ recordedCount }) {
  const percentage = Math.round((recordedCount / PHONEME_COUNT) * 100)

  return (
    <section className="card">
      <h2 className="section">
        {recordedCount} / {PHONEME_COUNT} sons enregistrés
      </h2>
      <div className="progress-track" role="progressbar" aria-valuenow={percentage}>
        <div className="progress-filled" style={{ width: `${percentage}%` }} />
      </div>
      {recordedCount < PHONEME_COUNT && (
        <p className="muted">
          Tant qu’il manque un son, les mots qui l’emploient seront lus par la voix de synthèse.
        </p>
      )}
    </section>
  )
}

/**
 * Banc d'essai : entendre un mot entier reconstitue a partir des sons
 * enregistres. C'est la reponse a la seule question qui compte — l'enchainement
 * est-il fluide ou hache ?
 */
function PronunciationBench({ recordedPhonemes }) {
  const [testWord, setTestWord] = useState(TEST_WORDS[0])
  const [verdict, setVerdict] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const speak = useCallback(async () => {
    setIsPlaying(true)
    setVerdict(null)

    try {
      const [dictionary, recordings] = await Promise.all([
        loadPronunciationDictionary(),
        loadAllRecordings(),
      ])
      const voice = await createRecordedVoice(recordings)
      const plan = buildSpokenPlan(testWord, {
        dictionary,
        recordedPhonemes: voice.usablePhonemes,
      })

      if (!plan.canBeSpoken) {
        setVerdict(describeWhyItCannotBeSpoken(plan))
        return
      }

      await voice.play(plan)
      setVerdict(null)
    } catch (error) {
      setVerdict(`La lecture a échoué (${error.message}).`)
    } finally {
      setIsPlaying(false)
    }
  }, [testWord])

  return (
    <section className="card">
      <h2 className="section">🔊 Écouter le rendu</h2>

      <div className="field">
        <label htmlFor="test-word">Mot ou phrase à reconstituer</label>
        <input
          id="test-word"
          type="text"
          value={testWord}
          onChange={(event) => setTestWord(event.target.value)}
          spellCheck="false"
        />
      </div>

      <div className="seg">
        {TEST_WORDS.map((word) => (
          <button
            key={word}
            className={testWord === word ? 'on' : ''}
            onClick={() => setTestWord(word)}
          >
            {word}
          </button>
        ))}
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn big" onClick={speak} disabled={isPlaying || !testWord.trim()}>
          {isPlaying ? '⏳ Lecture…' : '▶️ Écouter avec la voix enregistrée'}
        </button>
      </div>

      {verdict && <p className="notice">{verdict}</p>}
    </section>
  )
}

function describeWhyItCannotBeSpoken(plan) {
  if (plan.unknownWords.length > 0) {
    return `Ces mots sont absents du dictionnaire : ${plan.unknownWords.join(', ')}.`
  }

  if (plan.missingPhonemes.length > 0) {
    return `Il manque l’enregistrement de : ${plan.missingPhonemes.join('  ')}.`
  }

  return 'Rien à lire.'
}

function PhonemeRow({
  phoneme,
  isRecorded,
  isBeingRecorded,
  isAnotherBeingRecorded,
  onStart,
  onFinish,
  onPlay,
  onDelete,
}) {
  return (
    <li className={`recording-row ${isRecorded ? 'recorded' : ''}`}>
      <span className="phoneme-symbol">{phoneme.symbol}</span>

      <span className="recording-text">
        <span className="phoneme-example">
          {phoneme.example} {isRecorded && <span aria-label="enregistré">✅</span>}
        </span>
        <span className="phoneme-hint">{phoneme.hint}</span>
      </span>

      <span className="recording-actions">
        {isBeingRecorded ? (
          <button className="btn red" onClick={() => onFinish(phoneme.symbol)}>
            ⏹️ Arrêter
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => onStart(phoneme.symbol)}
            disabled={isAnotherBeingRecorded}
            aria-label={`Enregistrer le son ${phoneme.symbol}`}
          >
            🎙️ {isRecorded ? 'Refaire' : 'Enregistrer'}
          </button>
        )}

        {isRecorded && !isBeingRecorded && (
          <>
            <button
              className="btn ghost icon"
              onClick={() => onPlay(phoneme.symbol)}
              aria-label={`Écouter le son ${phoneme.symbol}`}
            >
              ▶️
            </button>
            <button
              className="btn ghost icon"
              onClick={() => onDelete(phoneme.symbol)}
              aria-label={`Effacer le son ${phoneme.symbol}`}
            >
              🗑️
            </button>
          </>
        )}
      </span>
    </li>
  )
}
