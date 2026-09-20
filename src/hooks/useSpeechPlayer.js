/**
 * Le lecteur vocal partage par toute l'application.
 *
 * Il rassemble en un seul objet les voix de l'appareil et les reglages du
 * parent, pour que les ecrans n'aient plus qu'a demander « prononce ce texte ».
 */

import { useEffect, useMemo, useState } from 'react'
import {
  isSpeechSynthesisAvailable,
  loadAvailableVoices,
  speakText,
  stopSpeaking,
} from '../lib/speech/speechSynthesisService.js'
import {
  playRecordedAudio,
  stopRecordedAudioPlayback,
} from '../lib/speech/recordedAudioPlaybackService.js'
import { loadWordRecording } from '../lib/speech/wordRecordingStore.js'
import { SPOKEN_SEGMENT_KIND, buildSpokenSegments } from '../lib/speech/spokenTextSegmentation.js'
import { findVoiceToUse, selectEnglishVoices } from '../lib/speech/voiceSelection.js'
import { splitIntoWords } from '../lib/text/textSegmentation.js'

/** Ralentissement applique quand l'enfant demande a reentendre « lentement ». */
const SLOW_READING_SPEED_REDUCTION = 0.3
const SLOWEST_READING_SPEED = 0.4

export function useSpeechPlayer(settings) {
  const [voicesInstalledOnDevice, setVoicesInstalledOnDevice] = useState([])

  useEffect(() => {
    loadAvailableVoices().then(setVoicesInstalledOnDevice)
  }, [])

  const englishVoices = useMemo(
    () => selectEnglishVoices(voicesInstalledOnDevice, settings.accent),
    [voicesInstalledOnDevice, settings.accent]
  )

  const voice = useMemo(
    () => findVoiceToUse(englishVoices, settings.chosenVoiceIdentifier),
    [englishVoices, settings.chosenVoiceIdentifier]
  )

  const speechPlayer = useMemo(
    () => ({
      voice,
      isAvailable: isSpeechSynthesisAvailable(),

      /**
       * Chaque mot enregistre par un humain remplace la synthese pour ce mot
       * precis, y compris au milieu d'une phrase : le reste continue avec la
       * voix de synthese, regroupe en une seule suite pour garder un ton
       * naturel plutot qu'un appel de synthese par mot.
       *
       * `useRecordedVoice: false` desactive cette substitution pour cet appel :
       * c'est ce qui permet a un ecran de proposer le choix entre les deux.
       */
      async speak(text, { slowly = false, onWordBoundary = null, useRecordedVoice = true } = {}) {
        const speed = slowly ? slowReadingSpeed(settings.readingSpeed) : settings.readingSpeed

        if (!useRecordedVoice) {
          return speakText(text, { voice, language: settings.accent, speed, onWordBoundary })
        }

        const recordingByWord = await loadRecordingsForWordsIn(text)
        const segments = buildSpokenSegments(text, (word) => recordingByWord.has(word))

        for (const segment of segments) {
          if (segment.kind === SPOKEN_SEGMENT_KIND.recordedWord) {
            onWordBoundary?.(segment.startOffset)
            await playRecordedAudio(recordingByWord.get(segment.text), { speed })
            continue
          }

          await speakText(segment.text, {
            voice,
            language: settings.accent,
            speed,
            onWordBoundary:
              onWordBoundary && ((charIndex) => onWordBoundary(segment.startOffset + charIndex)),
          })
        }
      },

      stop() {
        stopSpeaking()
        stopRecordedAudioPlayback()
      },
    }),
    [voice, settings.accent, settings.readingSpeed]
  )

  return { speechPlayer, englishVoices }
}

function slowReadingSpeed(normalSpeed) {
  return Math.max(SLOWEST_READING_SPEED, normalSpeed - SLOW_READING_SPEED_REDUCTION)
}

/** Extraits enregistres des mots distincts du texte, sous leur casse d'origine. */
async function loadRecordingsForWordsIn(text) {
  const recordingByWord = new Map()

  await Promise.all(
    [...new Set(splitIntoWords(text))].map(async (word) => {
      const audioBlob = await loadWordRecording(word)
      if (audioBlob) recordingByWord.set(word, audioBlob)
    })
  )

  return recordingByWord
}
