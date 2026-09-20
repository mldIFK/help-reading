import { describe, expect, it } from 'vitest'
import {
  LONGEST_COMFORTABLE_READING_TEXT_WORDS,
  buildLessonFromImport,
  lessonTitleFromFileName,
} from './lessonFromImport.js'

describe('lessonTitleFromFileName', () => {
  it('retire l’extension', () => {
    expect(lessonTitleFromFileName('devoirs.txt')).toBe('Devoirs')
  })

  it('remplace les tirets et tirets bas par des espaces', () => {
    expect(lessonTitleFromFileName('anglais_semaine-3.txt')).toBe('Anglais semaine 3')
  })

  it('met une majuscule initiale, sans toucher au reste', () => {
    expect(lessonTitleFromFileName('my little cat.pdf')).toBe('My little cat')
  })

  it('réduit les espaces multiples', () => {
    expect(lessonTitleFromFileName('anglais   semaine.txt')).toBe('Anglais semaine')
  })

  it('propose un titre de repli quand le nom ne donne rien d’exploitable', () => {
    expect(lessonTitleFromFileName('.txt').length).toBeGreaterThan(0)
    expect(lessonTitleFromFileName('').length).toBeGreaterThan(0)
  })
})

describe('buildLessonFromImport', () => {
  const importVocabulary = () =>
    buildLessonFromImport({ fileName: 'vocabulaire.txt', text: 'cat = chat\ndog = chien' })

  it('donne à la leçon un titre tiré du nom du fichier', () => {
    expect(importVocabulary().lesson.title).toBe('Vocabulaire')
  })

  it('remplit le vocabulaire reconnu', () => {
    expect(importVocabulary().lesson.vocabulary).toEqual([
      { english: 'cat', french: 'chat' },
      { english: 'dog', french: 'chien' },
    ])
  })

  it('remplit le texte de lecture reconnu', () => {
    const { lesson } = buildLessonFromImport({
      fileName: 'histoire.txt',
      text: 'I have a cat. My cat is black.',
    })

    expect(lesson.readingText).toBe('I have a cat. My cat is black.')
    expect(lesson.vocabulary).toEqual([])
  })

  it('nettoie le texte avant de le retenir', () => {
    const { lesson } = buildLessonFromImport({
      fileName: 'histoire.txt',
      text: '\uFEFFI have a cat.\r\nShe is black.  ',
    })

    expect(lesson.readingText).toBe('I have a cat.\nShe is black.')
  })

  it('donne une image par défaut à la leçon', () => {
    expect(importVocabulary().lesson.emoji.length).toBeGreaterThan(0)
  })

  it('rend compte de ce qui a été trouvé, pour l’afficher au parent', () => {
    const { summary } = importVocabulary()

    expect(summary.wordCount).toBe(2)
    expect(summary.readingWordCount).toBe(0)
  })

  it('signale un texte trop long pour une seule séance de lecture', () => {
    const longText = Array.from({ length: LONGEST_COMFORTABLE_READING_TEXT_WORDS + 50 })
      .map(() => 'cat')
      .join(' ')

    const { warnings } = buildLessonFromImport({ fileName: 'long.txt', text: longText })

    expect(warnings.join(' ')).toMatch(/long/i)
  })

  it('ne signale rien pour un texte de longueur normale', () => {
    const { warnings } = buildLessonFromImport({
      fileName: 'histoire.txt',
      text: 'I have a cat. My cat is black.',
    })

    expect(warnings).toEqual([])
  })

  it('signale un fichier vide plutôt que de créer une leçon sans contenu', () => {
    const { warnings, summary } = buildLessonFromImport({ fileName: 'vide.txt', text: '   ' })

    expect(summary.isEmpty).toBe(true)
    expect(warnings.join(' ')).toMatch(/aucun|vide|rien/i)
  })
})
