import { describe, expect, it } from 'vitest'
import {
  hasNaturalSoundingVoice,
  isNaturalSoundingVoice,
  shouldSuggestAnotherBrowser,
} from './voiceQuality.js'

const voice = (name) => ({ name, lang: 'en-GB', voiceURI: name })

const NATURAL_VOICE = voice('Microsoft Sonia Online (Natural) - English (United Kingdom)')
const OLD_VOICE = voice('Google UK English Female')

describe('isNaturalSoundingVoice', () => {
  it('reconnaît une voix neuronale Microsoft', () => {
    expect(isNaturalSoundingVoice(NATURAL_VOICE)).toBe(true)
  })

  it('reconnaît une voix annoncée comme « Neural »', () => {
    expect(isNaturalSoundingVoice(voice('en-GB-LibbyNeural'))).toBe(true)
  })

  it('ne se laisse pas prendre par la casse', () => {
    expect(isNaturalSoundingVoice(voice('Some NATURAL voice'))).toBe(true)
  })

  it('classe les anciennes voix comme non naturelles', () => {
    expect(isNaturalSoundingVoice(OLD_VOICE)).toBe(false)
    expect(isNaturalSoundingVoice(voice('Microsoft Zira Desktop'))).toBe(false)
  })

  it('ne plante pas sur une voix absente', () => {
    expect(isNaturalSoundingVoice(null)).toBe(false)
    expect(isNaturalSoundingVoice({})).toBe(false)
  })
})

describe('hasNaturalSoundingVoice', () => {
  it('est vrai dès qu’une seule voix naturelle est disponible', () => {
    expect(hasNaturalSoundingVoice([OLD_VOICE, NATURAL_VOICE])).toBe(true)
  })

  it('est faux quand toutes les voix sont d’ancienne génération', () => {
    expect(hasNaturalSoundingVoice([OLD_VOICE])).toBe(false)
  })

  it('est faux sans aucune voix', () => {
    expect(hasNaturalSoundingVoice([])).toBe(false)
    expect(hasNaturalSoundingVoice(undefined)).toBe(false)
  })
})

describe('shouldSuggestAnotherBrowser', () => {
  it('conseille de changer de navigateur quand seules de vieilles voix existent', () => {
    expect(shouldSuggestAnotherBrowser({ voices: [OLD_VOICE], isAlreadyOnEdge: false })).toBe(true)
  })

  it('ne conseille rien quand une voix naturelle est déjà là', () => {
    expect(shouldSuggestAnotherBrowser({ voices: [NATURAL_VOICE], isAlreadyOnEdge: false })).toBe(
      false
    )
  })

  it('ne conseille pas Edge à quelqu’un qui y est déjà', () => {
    expect(shouldSuggestAnotherBrowser({ voices: [OLD_VOICE], isAlreadyOnEdge: true })).toBe(false)
  })

  it('ne conseille rien quand aucune voix n’est installée, autre problème à traiter', () => {
    expect(shouldSuggestAnotherBrowser({ voices: [], isAlreadyOnEdge: false })).toBe(false)
  })
})
