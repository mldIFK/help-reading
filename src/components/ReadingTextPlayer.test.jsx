import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReadingTextPlayer from './ReadingTextPlayer.jsx'
import { DEFAULT_SETTINGS } from '../lib/storage/settingsRepository.js'

const lessonWithText = {
  id: 'demo',
  title: 'Mon histoire',
  emoji: '📖',
  readingText: 'I have a cat.',
}

const wordRecordingsThatFindNothing = { hasRecording: () => false }

function renderReadingTextPlayer(wordRecordings = wordRecordingsThatFindNothing) {
  const speechPlayer = { voice: null, speak: vi.fn().mockResolvedValue(), stop: vi.fn() }

  render(
    <ReadingTextPlayer
      lesson={lessonWithText}
      speechPlayer={speechPlayer}
      settings={DEFAULT_SETTINGS}
      wordRecordings={wordRecordings}
    />
  )

  return { speechPlayer, user: userEvent.setup() }
}

const voiceToggleQuery = { name: /ma voix|voix automatique/i }

describe('ReadingTextPlayer — choix de la voix', () => {
  it('ne propose aucun choix quand aucun mot n’est enregistré', () => {
    renderReadingTextPlayer()

    expect(screen.queryAllByRole('button', voiceToggleQuery)).toHaveLength(0)
  })

  it('utilise la voix enregistrée par défaut quand un mot en a une', async () => {
    const { speechPlayer, user } = renderReadingTextPlayer({
      hasRecording: (word) => word === 'cat',
    })

    await user.click(screen.getByRole('button', { name: 'cat' }))

    expect(speechPlayer.speak).toHaveBeenCalledWith(
      'cat',
      expect.objectContaining({ useRecordedVoice: true })
    )
  })

  it('passe en voix automatique quand le parent le demande', async () => {
    const { speechPlayer, user } = renderReadingTextPlayer({
      hasRecording: (word) => word === 'cat',
    })

    await user.click(screen.getByRole('button', { name: /voix automatique/i }))
    await user.click(screen.getByRole('button', { name: 'cat' }))

    expect(speechPlayer.speak).toHaveBeenCalledWith(
      'cat',
      expect.objectContaining({ useRecordedVoice: false })
    )
  })
})
