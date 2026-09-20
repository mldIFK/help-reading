import { describe, expect, it } from 'vitest'
import { findVoiceToUse, selectEnglishVoices } from './voiceSelection.js'

const voice = (name, language, isInstalledOnDevice = true) => ({
  name,
  lang: language,
  voiceURI: `${name}-uri`,
  localService: isInstalledOnDevice,
})

const britishVoice = voice('Microsoft Hazel', 'en-GB')
const americanVoice = voice('Microsoft Zira', 'en-US')
const australianVoice = voice('Karen', 'en-AU')
const frenchVoice = voice('Microsoft Julie', 'fr-FR')

describe('selectEnglishVoices', () => {
  it('drops the voices that do not speak English', () => {
    expect(selectEnglishVoices([frenchVoice, britishVoice], 'en-GB')).toEqual([britishVoice])
  })

  it('puts the voices of the chosen accent first', () => {
    const ordered = selectEnglishVoices([americanVoice, britishVoice], 'en-GB')

    expect(ordered[0]).toBe(britishVoice)
  })

  it('prefers a natural-sounding voice over an older one of the same accent', () => {
    const oldBritishVoice = voice('Google UK English Female', 'en-GB')
    const naturalBritishVoice = voice('Microsoft Sonia Online (Natural)', 'en-GB')

    const ordered = selectEnglishVoices([oldBritishVoice, naturalBritishVoice], 'en-GB')

    expect(ordered[0]).toBe(naturalBritishVoice)
  })

  it('keeps the chosen accent ahead of a natural voice of another accent', () => {
    const britishVoice = voice('Google UK English Female', 'en-GB')
    const naturalAmericanVoice = voice('Microsoft Aria Online (Natural)', 'en-US')

    const ordered = selectEnglishVoices([naturalAmericanVoice, britishVoice], 'en-GB')

    expect(ordered[0]).toBe(britishVoice)
  })

  it('keeps the other English accents as a fallback', () => {
    const ordered = selectEnglishVoices([australianVoice, americanVoice], 'en-GB')

    expect(ordered).toHaveLength(2)
  })

  it('accepts the underscore form some systems report', () => {
    const underscoreVoice = voice('Google UK English', 'en_GB')

    expect(selectEnglishVoices([underscoreVoice], 'en-GB')).toEqual([underscoreVoice])
  })

  it('returns an empty list when the device has no English voice', () => {
    expect(selectEnglishVoices([frenchVoice], 'en-GB')).toEqual([])
  })

  it('returns an empty list when the voices are not loaded yet', () => {
    expect(selectEnglishVoices(undefined, 'en-GB')).toEqual([])
  })
})

describe('findVoiceToUse', () => {
  const englishVoices = [britishVoice, americanVoice]

  it('uses the voice the parent picked in the settings', () => {
    expect(findVoiceToUse(englishVoices, americanVoice.voiceURI)).toBe(americanVoice)
  })

  it('falls back to the best voice when none was picked', () => {
    expect(findVoiceToUse(englishVoices, '')).toBe(britishVoice)
  })

  it('falls back to the best voice when the picked one is no longer installed', () => {
    expect(findVoiceToUse(englishVoices, 'a-removed-voice-uri')).toBe(britishVoice)
  })

  it('returns null when no English voice is available, so the caller can warn the parent', () => {
    expect(findVoiceToUse([], 'anything')).toBeNull()
  })
})
