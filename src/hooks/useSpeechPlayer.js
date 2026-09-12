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
import { findVoiceToUse, selectEnglishVoices } from '../lib/speech/voiceSelection.js'

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

      speak(text, { slowly = false, onWordBoundary = null } = {}) {
        return speakText(text, {
          voice,
          language: settings.accent,
          speed: slowly ? slowReadingSpeed(settings.readingSpeed) : settings.readingSpeed,
          onWordBoundary,
        })
      },

      stop: stopSpeaking,
    }),
    [voice, settings.accent, settings.readingSpeed]
  )

  return { speechPlayer, englishVoices }
}

function slowReadingSpeed(normalSpeed) {
  return Math.max(SLOWEST_READING_SPEED, normalSpeed - SLOW_READING_SPEED_REDUCTION)
}
