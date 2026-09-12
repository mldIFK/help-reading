import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './settingsRepository.js'

describe('loadSettings', () => {
  beforeEach(() => localStorage.clear())

  it('starts on the British accent taught in French schools', () => {
    expect(loadSettings().accent).toBe('en-GB')
  })

  it('starts slower than a native speaker, which a beginner needs', () => {
    expect(loadSettings().readingSpeed).toBeLessThan(1)
  })

  it('returns the saved settings after a reload', () => {
    saveSettings({ ...DEFAULT_SETTINGS, accent: 'en-US' })

    expect(loadSettings().accent).toBe('en-US')
  })

  it('completes a partially saved configuration with the defaults', () => {
    localStorage.setItem('helpReading.settings.v1', JSON.stringify({ accent: 'en-US' }))

    const settings = loadSettings()

    expect(settings.accent).toBe('en-US')
    expect(settings.readingSpeed).toBe(DEFAULT_SETTINGS.readingSpeed)
  })

  it('falls back to the defaults when the storage is unreadable', () => {
    localStorage.setItem('helpReading.settings.v1', '{{{')

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })
})
