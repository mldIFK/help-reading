import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DictationScreen from './DictationScreen.jsx'
import { DEFAULT_SETTINGS } from '../lib/storage/settingsRepository.js'

const lessonWithOneWord = {
  id: 'demo',
  title: 'Animals',
  emoji: '🐶',
  vocabulary: [{ english: 'cat', french: 'chat' }],
  readingText: '',
}

function renderDictationScreen(lesson = lessonWithOneWord) {
  const speechPlayer = { voice: null, speak: vi.fn().mockResolvedValue(), stop: vi.fn() }
  const onExerciseCompleted = vi.fn()

  render(
    <DictationScreen
      lesson={lesson}
      speechPlayer={speechPlayer}
      settings={DEFAULT_SETTINGS}
      onExerciseCompleted={onExerciseCompleted}
    />
  )

  return { speechPlayer, onExerciseCompleted, user: userEvent.setup() }
}

const typeAnswer = async (user, answer) => {
  const answerField = screen.getByLabelText(/écris le mot/i)
  await user.clear(answerField)
  await user.type(answerField, answer)
}

describe('DictationScreen', () => {
  it('hides the word so the child has to write what she hears', () => {
    renderDictationScreen()

    expect(screen.queryByText('cat')).not.toBeInTheDocument()
  })

  it('dictates the word out loud as soon as the exercise opens', async () => {
    const { speechPlayer } = renderDictationScreen()

    await waitFor(() => expect(speechPlayer.speak).toHaveBeenCalledWith('cat', expect.anything()))
  })

  it('dictates the word again on request', async () => {
    const { speechPlayer, user } = renderDictationScreen()
    speechPlayer.speak.mockClear()

    await user.click(screen.getByRole('button', { name: /réécouter/i }))

    expect(speechPlayer.speak).toHaveBeenCalledWith('cat', expect.anything())
  })

  it('congratulates a word written correctly', async () => {
    const { user } = renderDictationScreen()

    await typeAnswer(user, 'cat')
    await user.click(screen.getByRole('button', { name: /vérifier/i }))

    expect(screen.getByText(/bravo/i)).toBeInTheDocument()
  })

  it('does not reward a correctly written word until the child moves to the next word', async () => {
    const { user, onExerciseCompleted } = renderDictationScreen()

    await typeAnswer(user, 'cat')
    await user.click(screen.getByRole('button', { name: /vérifier/i }))

    expect(onExerciseCompleted).not.toHaveBeenCalled()
  })

  it('rewards a word written correctly on the first attempt once the child moves to the next word', async () => {
    const { user, onExerciseCompleted } = renderDictationScreen()

    await typeAnswer(user, 'cat')
    await user.click(screen.getByRole('button', { name: /vérifier/i }))
    await user.click(screen.getByRole('button', { name: /mot suivant/i }))

    expect(onExerciseCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ exerciseType: 'dictation', subject: 'cat', earnedStars: 2 })
    )
  })

  it('counts only the last attempt when the same word is checked several times', async () => {
    const { user, onExerciseCompleted } = renderDictationScreen()

    await typeAnswer(user, 'cap')
    await user.click(screen.getByRole('button', { name: /vérifier/i }))

    await typeAnswer(user, 'cat')
    await user.click(screen.getByRole('button', { name: /vérifier/i }))

    await typeAnswer(user, 'cat')
    await user.click(screen.getByRole('button', { name: /vérifier/i }))

    await user.click(screen.getByRole('button', { name: /mot suivant/i }))

    expect(onExerciseCompleted).toHaveBeenCalledTimes(1)
    expect(onExerciseCompleted).toHaveBeenCalledWith(expect.objectContaining({ earnedStars: 1 }))
  })

  it('points at the wrong letter instead of only saying it is wrong', async () => {
    const { user } = renderDictationScreen()

    await typeAnswer(user, 'cap')
    await user.click(screen.getByRole('button', { name: /vérifier/i }))

    expect(screen.getByTestId('letter-2')).toHaveAttribute('data-status', 'incorrect')
    expect(screen.getByTestId('letter-0')).toHaveAttribute('data-status', 'correct')
  })

  it('gives no star for a misspelled word, even after moving to the next word', async () => {
    const { user, onExerciseCompleted } = renderDictationScreen()

    await typeAnswer(user, 'cap')
    await user.click(screen.getByRole('button', { name: /vérifier/i }))
    await user.click(screen.getByRole('button', { name: /mot suivant/i }))

    expect(onExerciseCompleted).not.toHaveBeenCalled()
  })

  it('gives no star when the answer was revealed first, even after moving to the next word', async () => {
    const { user, onExerciseCompleted } = renderDictationScreen()

    await user.click(screen.getByRole('button', { name: /montrer/i }))
    await user.click(screen.getByRole('button', { name: /vérifier/i }))
    await user.click(screen.getByRole('button', { name: /mot suivant/i }))

    expect(onExerciseCompleted).not.toHaveBeenCalled()
  })

  it('reveals the word when the child is stuck', async () => {
    const { user } = renderDictationScreen()

    await user.click(screen.getByRole('button', { name: /montrer/i }))

    expect(screen.getByText('cat')).toBeInTheDocument()
  })

  it('explains what to do when the lesson has nothing to dictate', () => {
    renderDictationScreen({ id: 'empty', title: 'Empty', vocabulary: [], readingText: '' })

    expect(screen.getByText(/pas de mots à écrire/i)).toBeInTheDocument()
  })
})
