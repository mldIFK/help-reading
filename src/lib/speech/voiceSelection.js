/**
 * Choix de la voix anglaise a utiliser.
 *
 * Les voix disponibles dependent entierement de l'appareil : un PC Windows, une
 * tablette Android et un iPad n'offrent ni les memes noms, ni les memes accents.
 * On classe donc ce qui existe plutot que d'exiger une voix precise.
 */

import { isNaturalSoundingVoice } from './voiceQuality.js'

const ENGLISH_LANGUAGE_PREFIX = 'en'

const ACCENT_PRIORITY = {
  exactAccent: 0,
  british: 1,
  american: 2,
  otherEnglishAccent: 3,
}

function normalizeLanguageTag(languageTag) {
  return String(languageTag ?? '')
    .replace('_', '-')
    .toLowerCase()
}

function speaksEnglish(voice) {
  return normalizeLanguageTag(voice.lang).startsWith(ENGLISH_LANGUAGE_PREFIX)
}

function accentPriorityOf(voice, preferredAccent) {
  const language = normalizeLanguageTag(voice.lang)

  if (language === normalizeLanguageTag(preferredAccent)) return ACCENT_PRIORITY.exactAccent
  if (language.startsWith('en-gb')) return ACCENT_PRIORITY.british
  if (language.startsWith('en-us')) return ACCENT_PRIORITY.american
  return ACCENT_PRIORITY.otherEnglishAccent
}

/**
 * Ne garde que les voix anglaises et les classe de la plus adaptee a la moins
 * adaptee.
 *
 * L'accent prime sur la qualite : une voix neuronale americaine reste un moins
 * bon modele qu'une voix britannique ordinaire pour une enfant a qui l'ecole
 * enseigne l'accent britannique. A accent egal, en revanche, la voix naturelle
 * l'emporte — c'est elle que l'enfant imitera.
 */
export function selectEnglishVoices(availableVoices, preferredAccent) {
  return (availableVoices ?? [])
    .filter(speaksEnglish)
    .sort(
      (firstVoice, secondVoice) =>
        accentPriorityOf(firstVoice, preferredAccent) -
          accentPriorityOf(secondVoice, preferredAccent) ||
        qualityPriorityOf(firstVoice) - qualityPriorityOf(secondVoice) ||
        firstVoice.name.localeCompare(secondVoice.name)
    )
}

function qualityPriorityOf(voice) {
  return isNaturalSoundingVoice(voice) ? 0 : 1
}

/**
 * La voix choisie dans les reglages si elle est toujours installee, sinon la
 * meilleure voix disponible, sinon rien.
 */
export function findVoiceToUse(englishVoices, chosenVoiceIdentifier) {
  const chosenVoice = englishVoices.find((voice) => voice.voiceURI === chosenVoiceIdentifier)

  return chosenVoice ?? englishVoices[0] ?? null
}
