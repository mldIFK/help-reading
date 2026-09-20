import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LessonEditorScreen from './LessonEditorScreen.jsx'

const wordRecordingsThatCannotRecordAnything = {
  isSupported: false,
  problem: '',
  hasRecording: () => false,
  isRecording: () => false,
  isAnotherWordBeingRecorded: () => false,
  startRecordingWord: vi.fn(),
  finishRecordingWord: vi.fn(),
  playRecordingFor: vi.fn(),
  deleteRecordingFor: vi.fn(),
}

function renderEditor(lessonBeingEdited = null, wordRecordings = wordRecordingsThatCannotRecordAnything) {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  render(
    <LessonEditorScreen
      lesson={lessonBeingEdited}
      onSave={onSave}
      onCancel={onCancel}
      wordRecordings={wordRecordings}
    />
  )

  return { onSave, onCancel, user: userEvent.setup() }
}

const titleField = () => screen.getByLabelText(/nom de la leçon/i)
const vocabularyField = () => screen.getByLabelText(/liste de mots/i)
const readingTextField = () => screen.getByLabelText(/texte à lire/i)
const saveButton = () => screen.getByRole('button', { name: '💾 Enregistrer' })

describe('LessonEditorScreen', () => {
  it('refuses to save a lesson without a title', async () => {
    const { user } = renderEditor()

    await user.type(readingTextField(), 'I have a cat.')

    expect(saveButton()).toBeDisabled()
  })

  it('refuses to save a lesson with a title but no reading text', async () => {
    const { user } = renderEditor()

    await user.type(titleField(), 'Semaine 1')

    expect(saveButton()).toBeDisabled()
  })

  // Le texte est desormais la seule saisie obligatoire : une liste de mots
  // seule, sans texte a lire, ne suffit plus a enregistrer une lecon.
  it('refuses to save a lesson with only a vocabulary, without a reading text', async () => {
    const { user } = renderEditor()

    await user.type(titleField(), 'Semaine 1')
    await user.type(vocabularyField(), 'cat = chat')

    expect(saveButton()).toBeDisabled()
  })

  it('saves a lesson made of a title and a reading text', async () => {
    const { user, onSave } = renderEditor()

    await user.type(titleField(), 'Mon histoire')
    await user.type(readingTextField(), 'I have a cat.')
    await user.click(saveButton())

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Mon histoire', readingText: 'I have a cat.' })
    )
  })

  // Le parent recopie le texte du cahier ; l'appli en tire elle-meme les mots
  // a pratiquer, pour lui eviter de les ressaisir a la main.
  it('fills the vocabulary from the words of the reading text', async () => {
    const { user } = renderEditor()

    await user.type(readingTextField(), 'I have a cat.')

    expect(vocabularyField()).toHaveValue('have\ncat')
  })

  it('does not override a vocabulary the parent already corrected by hand', async () => {
    const { user } = renderEditor()

    await user.type(readingTextField(), 'I have a cat.')
    await user.clear(vocabularyField())
    await user.type(vocabularyField(), 'cat = chat')
    await user.type(readingTextField(), ' My dog is happy.')

    expect(vocabularyField()).toHaveValue('cat = chat')
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
      readingText: 'I have a cat.',
    })

    await user.click(saveButton())

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'existing' }))
  })

  it('gives a new lesson its own identifier', async () => {
    const { user, onSave } = renderEditor()

    await user.type(titleField(), 'Semaine 2')
    await user.type(readingTextField(), 'I have a dog.')
    await user.click(saveButton())

    expect(onSave.mock.calls[0][0].id).toBeTruthy()
  })
})

describe('LessonEditorScreen — voix humaine par mot', () => {
  const fakeWordRecordings = (overrides = {}) => ({
    isSupported: true,
    problem: '',
    hasRecording: () => false,
    isRecording: () => false,
    isAnotherWordBeingRecorded: () => false,
    startRecordingWord: vi.fn(),
    finishRecordingWord: vi.fn(),
    playRecordingFor: vi.fn(),
    deleteRecordingFor: vi.fn(),
    ...overrides,
  })

  it('ne propose rien tant que la leçon n’a aucun mot', () => {
    renderEditor(null, fakeWordRecordings())

    expect(screen.queryByLabelText(/enregistrer le mot/i)).not.toBeInTheDocument()
  })

  it('propose d’enregistrer chaque mot du vocabulaire', async () => {
    const { user } = renderEditor(null, fakeWordRecordings())

    await user.type(vocabularyField(), 'cat = chat\ndog = chien')

    expect(screen.getByLabelText('Enregistrer le mot cat')).toBeInTheDocument()
    expect(screen.getByLabelText('Enregistrer le mot dog')).toBeInTheDocument()
  })

  it('démarre l’enregistrement du mot sur lequel le parent a cliqué', async () => {
    const wordRecordings = fakeWordRecordings()
    const { user } = renderEditor(null, wordRecordings)

    await user.type(vocabularyField(), 'cat = chat')
    await user.click(screen.getByLabelText('Enregistrer le mot cat'))

    expect(wordRecordings.startRecordingWord).toHaveBeenCalledWith('cat')
  })

  it('propose d’écouter et d’effacer un mot déjà enregistré', async () => {
    const wordRecordings = fakeWordRecordings({ hasRecording: (word) => word === 'cat' })
    const { user } = renderEditor(null, wordRecordings)

    await user.type(vocabularyField(), 'cat = chat')

    expect(screen.getByLabelText('Écouter l’enregistrement de cat')).toBeInTheDocument()
    expect(screen.getByLabelText('Effacer l’enregistrement de cat')).toBeInTheDocument()
  })
})

describe('LessonEditorScreen — import d’un fichier', () => {
  const fileField = () => screen.getByLabelText(/choisir le fichier/i)

  const importTextFile = async (user, fileName, content) =>
    user.upload(fileField(), new File([content], fileName, { type: 'text/plain' }))

  it('remplit le vocabulaire à partir d’un fichier importé', async () => {
    const { user } = renderEditor()

    await importTextFile(user, 'semaine-3.txt', 'cat = chat\ndog = chien')

    await waitFor(() => expect(vocabularyField()).toHaveValue('cat = chat\ndog = chien'))
  })

  it('remplit le texte de lecture à partir d’un fichier importé', async () => {
    const { user } = renderEditor()

    await importTextFile(user, 'histoire.txt', 'I have a cat. My cat is black.')

    await waitFor(() =>
      expect(readingTextField()).toHaveValue('I have a cat. My cat is black.')
    )
  })

  it('tire le titre de la leçon du nom du fichier', async () => {
    const { user } = renderEditor()

    await importTextFile(user, 'anglais_semaine-3.txt', 'cat = chat')

    await waitFor(() => expect(titleField()).toHaveValue('Anglais semaine 3'))
  })

  // Le texte etant obligatoire, un fichier qui n'apporte que du vocabulaire
  // (sans phrase a lire) pre-remplit l'editeur mais ne le rend pas
  // enregistrable tant que le parent n'a pas ajoute un texte.
  it('ne rend pas la leçon enregistrable tant que le fichier n’apporte pas de texte', async () => {
    const { user } = renderEditor()

    await importTextFile(user, 'semaine-3.txt', 'cat = chat')
    await waitFor(() => expect(vocabularyField()).toHaveValue('cat = chat'))

    expect(saveButton()).toBeDisabled()
  })

  it('rend la leçon importée enregistrable sans autre saisie quand le fichier contient aussi un texte', async () => {
    const { user, onSave } = renderEditor()

    await importTextFile(user, 'semaine-3.txt', 'cat = chat\n\nI have a cat.')
    await waitFor(() => expect(saveButton()).toBeEnabled())
    await user.click(saveButton())

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Semaine 3',
        vocabulary: [{ english: 'cat', french: 'chat' }],
        readingText: 'I have a cat.',
      })
    )
  })

  // Le selecteur de fichier filtre deja sur l'attribut `accept`, mais le
  // glisser-deposer ne filtre rien : c'est par la qu'un format non pris en
  // charge arrive reellement, et c'est donc ce chemin qu'il faut couvrir.
  const dropFile = (file) =>
    fireEvent.drop(screen.getByTestId('import-drop-zone'), { dataTransfer: { files: [file] } })

  it('accepte un fichier glissé-déposé', async () => {
    renderEditor()

    dropFile(new File(['cat = chat'], 'semaine-3.txt', { type: 'text/plain' }))

    await waitFor(() => expect(vocabularyField()).toHaveValue('cat = chat'))
  })

  // L'import de photos a ete retire (la reconnaissance de texte n'etait pas
  // fiable) : une image reste donc un format non pris en charge, quel qu'il soit.
  it('refuse une photo comme un format non pris en charge', async () => {
    renderEditor()

    const jpegSignature = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0])
    dropFile(new File([jpegSignature], 'cahier.jpg', { type: 'image/jpeg' }))

    await waitFor(() => expect(screen.getByText(/format non pris en charge/i)).toBeInTheDocument())
  })

  it('oriente vers le bon format pour un ancien document Word', async () => {
    renderEditor()

    dropFile(new File(['vieux'], 'devoirs.doc', { type: 'application/msword' }))

    await waitFor(() => expect(screen.getByText(/\.docx/i)).toBeInTheDocument())
  })

  it('prévient quand le fichier ne contient aucun texte lisible', async () => {
    const { user } = renderEditor()

    await importTextFile(user, 'vide.txt', '   \n\n  ')

    await waitFor(() => expect(screen.getByText(/aucun texte lisible/i)).toBeInTheDocument())
  })

  it('n’enregistre rien tant que le parent n’a pas validé', async () => {
    const { user, onSave } = renderEditor()

    await importTextFile(user, 'semaine-3.txt', 'cat = chat')
    await waitFor(() => expect(vocabularyField()).toHaveValue('cat = chat'))

    expect(onSave).not.toHaveBeenCalled()
  })
})
