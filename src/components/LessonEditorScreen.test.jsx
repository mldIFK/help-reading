import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LessonEditorScreen from './LessonEditorScreen.jsx'

function renderEditor(lessonBeingEdited = null) {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  render(
    <LessonEditorScreen lesson={lessonBeingEdited} onSave={onSave} onCancel={onCancel} />
  )

  return { onSave, onCancel, user: userEvent.setup() }
}

const titleField = () => screen.getByLabelText(/nom de la leçon/i)
const vocabularyField = () => screen.getByLabelText(/liste de mots/i)
const readingTextField = () => screen.getByLabelText(/texte à lire/i)
const saveButton = () => screen.getByRole('button', { name: /enregistrer/i })

describe('LessonEditorScreen', () => {
  it('refuses to save a lesson without a title', async () => {
    const { user } = renderEditor()

    await user.type(vocabularyField(), 'cat = chat')

    expect(saveButton()).toBeDisabled()
  })

  it('refuses to save a lesson with a title but no content', async () => {
    const { user } = renderEditor()

    await user.type(titleField(), 'Semaine 1')

    expect(saveButton()).toBeDisabled()
  })

  it('saves the vocabulary typed by the parent', async () => {
    const { user, onSave } = renderEditor()

    await user.type(titleField(), 'Semaine 1')
    await user.type(vocabularyField(), 'cat = chat')
    await user.click(saveButton())

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Semaine 1',
        vocabulary: [{ english: 'cat', french: 'chat' }],
      })
    )
  })

  it('saves a lesson made only of a reading text', async () => {
    const { user, onSave } = renderEditor()

    await user.type(titleField(), 'Mon histoire')
    await user.type(readingTextField(), 'I have a cat.')
    await user.click(saveButton())

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ readingText: 'I have a cat.', vocabulary: [] })
    )
  })

  it('tells the parent how many words were understood', async () => {
    const { user } = renderEditor()

    await user.type(vocabularyField(), 'cat = chat\ndog = chien')

    expect(screen.getByText(/2 mots/i)).toBeInTheDocument()
  })

  it('reopens an existing lesson with its content, so it can be corrected', () => {
    renderEditor({
      id: 'existing',
      emoji: '📝',
      title: 'Semaine 1',
      vocabulary: [{ english: 'cat', french: 'chat' }],
      readingText: 'I have a cat.',
    })

    expect(titleField()).toHaveValue('Semaine 1')
    expect(vocabularyField()).toHaveValue('cat = chat')
    expect(readingTextField()).toHaveValue('I have a cat.')
  })

  it('keeps the identifier of an edited lesson, so it is replaced and not duplicated', async () => {
    const { user, onSave } = renderEditor({
      id: 'existing',
      emoji: '📝',
      title: 'Semaine 1',
      vocabulary: [{ english: 'cat', french: 'chat' }],
      readingText: '',
    })

    await user.click(saveButton())

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'existing' }))
  })

  it('gives a new lesson its own identifier', async () => {
    const { user, onSave } = renderEditor()

    await user.type(titleField(), 'Semaine 2')
    await user.type(vocabularyField(), 'dog = chien')
    await user.click(saveButton())

    expect(onSave.mock.calls[0][0].id).toBeTruthy()
  })
})
