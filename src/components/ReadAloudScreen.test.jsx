import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReadAloudScreen from './ReadAloudScreen.jsx'
import { DEFAULT_SETTINGS } from '../lib/storage/settingsRepository.js'

const heardSentenceBox = vi.hoisted(() => ({ value: '' }))

vi.mock('../lib/speech/speechRecognitionService.js', () => ({
  isSpeechRecognitionAvailable: () => true,
  createMicrophoneListener: (options) => ({
    startListening: () => {
      options.onFinalTranscript(heardSentenceBox.value)
      options.onListeningEnded()
    },
    stopListening: vi.fn(),
    cancelListening: vi.fn(),
  }),
}))

const lessonWithOneWord = {
  id: 'demo',
  title: 'Animals',
  emoji: '🐶',
  vocabulary: [{ english: 'cat', french: 'chat' }],
  readingText: '',
}

function renderReadAloudScreen(lesson = lessonWithOneWord) {
  const speechPlayer = { voice: null, speak: vi.fn().mockResolvedValue(), stop: vi.fn() }
  const onExerciseCompleted = vi.fn()

  render(
    <ReadAloudScreen
      lesson={lesson}
      speechPlayer={speechPlayer}
      settings={DEFAULT_SETTINGS}
      onExerciseCompleted={onExerciseCompleted}
    />
  )

  return { speechPlayer, onExerciseCompleted, user: userEvent.setup() }
}

const readIntoMicrophone = async (user, heardSentence) => {
  heardSentenceBox.value = heardSentence
  await user.click(screen.getByRole('button', { name: /parler dans le micro/i }))
}

describe('ReadAloudScreen', () => {
  it('does not reward a well-read word until the child moves to the next word', async () => {
    const { user, onExerciseCompleted } = renderReadAloudScreen()

    await readIntoMicrophone(user, 'cat')

    expect(onExerciseCompleted).not.toHaveBeenCalled()
  })

  it('rewards a well-read word once the child moves to the next word', async () => {
    const { user, onExerciseCompleted } = renderReadAloudScreen()

    await readIntoMicrophone(user, 'cat')
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    expect(onExerciseCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ exerciseType: 'readAloud', subject: 'cat', earnedStars: 3 })
    )
  })

  it('counts only the last attempt when the same word is read several times', async () => {
    const { user, onExerciseCompleted } = renderReadAloudScreen()

    await readIntoMicrophone(user, 'dog')
    await readIntoMicrophone(user, 'cat')
    await readIntoMicrophone(user, 'cat')
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    expect(onExerciseCompleted).toHaveBeenCalledTimes(1)
    expect(onExerciseCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ earnedStars: 3 })
    )
  })

  it('gives no star for a badly read word, even after moving to the next word', async () => {
    const { user, onExerciseCompleted } = renderReadAloudScreen()

    await readIntoMicrophone(user, 'dog')
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    expect(onExerciseCompleted).not.toHaveBeenCalled()
  })
})
