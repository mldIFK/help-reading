/** Reglages de lecture, choisis par le parent et conserves sur l'appareil. */

import { readStoredValue, writeStoredValue } from './localStorageAdapter.js'

const SETTINGS_STORAGE_KEY = 'helpReading.settings.v1'

export const DEFAULT_SETTINGS = {
  /** Accent enseigne a l'ecole en France. */
  accent: 'en-GB',
  /** Voix choisie parmi celles de l'appareil ; vide = la meilleure disponible. */
  chosenVoiceIdentifier: '',
  /** Plus lent qu'un anglophone, le temps que l'oreille se fasse aux sons. */
  readingSpeed: 0.8,
  /** Silence entre deux mots, en mode mot a mot. */
  pauseBetweenWordsMs: 350,
  showFrenchTranslation: true,
}

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...readStoredValue(SETTINGS_STORAGE_KEY, {}) }
}

export function saveSettings(settings) {
  writeStoredValue(SETTINGS_STORAGE_KEY, settings)
}
