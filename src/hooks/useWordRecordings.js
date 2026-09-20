/**
 * Enregistrement, par un humain, de la voix de chaque mot de vocabulaire.
 *
 * Independant du studio de sons (`VoiceStudioScreen`) : ici, chaque mot porte
 * son propre extrait, sans reconstitution phonetique. Une fois enregistre, le
 * mot est prononce par cet extrait partout ou l'appli le dirait normalement —
 * voir `useSpeechPlayer`.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { isRecordingSupported, startRecording } from '../lib/speech/microphoneRecorder.js'
import { playRecordedAudio } from '../lib/speech/recordedAudioPlaybackService.js'
import {
  deleteWordRecording,
  listRecordedWords,
  loadWordRecording,
  saveWordRecording,
} from '../lib/speech/wordRecordingStore.js'
import { normalizeWordForComparison } from '../lib/text/wordNormalization.js'

const MICROPHONE_UNAVAILABLE_MESSAGE =
  'Le micro n’est pas accessible. Autorise-le pour ce site, et vérifie que la page est bien ' +
  'en https:// (ou sur localhost).'

export function useWordRecordings() {
  const [recordedWords, setRecordedWords] = useState(new Set())
  const [wordBeingRecorded, setWordBeingRecorded] = useState(null)
  const [problem, setProblem] = useState('')
  const recorderRef = useRef(null)

  useEffect(() => {
    listRecordedWords().then(setRecordedWords).catch(() => setRecordedWords(new Set()))
  }, [])

  const hasRecording = useCallback(
    (word) => recordedWords.has(normalizeWordForComparison(word)),
    [recordedWords]
  )

  const isRecording = useCallback(
    (word) =>
      wordBeingRecorded !== null &&
      normalizeWordForComparison(word) === normalizeWordForComparison(wordBeingRecorded),
    [wordBeingRecorded]
  )

  const startRecordingWord = async (word) => {
    setProblem('')
    try {
      recorderRef.current = await startRecording()
      setWordBeingRecorded(word)
    } catch {
      setProblem(MICROPHONE_UNAVAILABLE_MESSAGE)
    }
  }

  const finishRecordingWord = async (word) => {
    const recorder = recorderRef.current
    recorderRef.current = null
    setWordBeingRecorded(null)
    if (!recorder) return

    const audioBlob = await recorder.stop()
    await saveWordRecording(word, audioBlob)
    setRecordedWords(await listRecordedWords())
  }

  const playRecordingFor = async (word) => {
    const audioBlob = await loadWordRecording(word)
    if (audioBlob) await playRecordedAudio(audioBlob).catch(() => {})
  }

  const deleteRecordingFor = async (word) => {
    await deleteWordRecording(word)
    setRecordedWords(await listRecordedWords())
  }

  return {
    isSupported: isRecordingSupported(),
    problem,
    hasRecording,
    isRecording,
    isAnotherWordBeingRecorded: (word) => wordBeingRecorded !== null && !isRecording(word),
    startRecordingWord,
    finishRecordingWord,
    playRecordingFor,
    deleteRecordingFor,
  }
}
