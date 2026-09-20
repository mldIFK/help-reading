import { describe, expect, it } from 'vitest'
import { IMPORTED_CONTENT, detectImportedContent } from './importedContentDetection.js'

describe('detectImportedContent', () => {
  it('reconnaît une liste de vocabulaire « anglais = français »', () => {
    const detection = detectImportedContent('cat = chat\ndog = chien\nbird = oiseau')

    expect(detection.kind).toBe(IMPORTED_CONTENT.vocabulary)
    expect(detection.vocabulary).toEqual([
      { english: 'cat', french: 'chat' },
      { english: 'dog', french: 'chien' },
      { english: 'bird', french: 'oiseau' },
    ])
    expect(detection.readingText).toBe('')
  })

  it('reconnaît une liste séparée par des virgules', () => {
    const detection = detectImportedContent('cat,chat\ndog,chien\nbird,oiseau')

    expect(detection.kind).toBe(IMPORTED_CONTENT.vocabulary)
    expect(detection.vocabulary).toHaveLength(3)
  })

  it('reconnaît un texte de lecture', () => {
    const readingText = 'Hello! My name is Lucy. I have a little cat called Mia.'
    const detection = detectImportedContent(readingText)

    expect(detection.kind).toBe(IMPORTED_CONTENT.readingText)
    expect(detection.readingText).toBe(readingText)
    expect(detection.vocabulary).toEqual([])
  })

  it('ne prend pas une phrase ponctuée de virgules pour une liste', () => {
    const detection = detectImportedContent(
      'In the garden, Mia runs, climbs the tree, and sleeps.'
    )

    expect(detection.kind).toBe(IMPORTED_CONTENT.readingText)
  })

  it('traite une liste de mots seuls, sans traduction, comme du vocabulaire', () => {
    const detection = detectImportedContent('red\nblue\ngreen\nyellow\nblack')

    expect(detection.kind).toBe(IMPORTED_CONTENT.vocabulary)
    expect(detection.vocabulary.map((entry) => entry.english)).toEqual([
      'red',
      'blue',
      'green',
      'yellow',
      'black',
    ])
  })

  it('traite des lignes longues sans séparateur comme un texte, pas comme des mots', () => {
    const detection = detectImportedContent(
      'My cat is black and white\nShe sleeps on my bed every night\nI love her very much'
    )

    expect(detection.kind).toBe(IMPORTED_CONTENT.readingText)
  })

  it('sépare le vocabulaire du texte quand le fichier contient les deux', () => {
    const detection = detectImportedContent(
      ['cat = chat', 'dog = chien', 'bird = oiseau', '', 'I have a cat. My cat is black.'].join('\n')
    )

    expect(detection.kind).toBe(IMPORTED_CONTENT.both)
    expect(detection.vocabulary).toHaveLength(3)
    expect(detection.readingText).toBe('I have a cat. My cat is black.')
  })

  it('renvoie un contenu vide, sans échouer, pour un fichier vide', () => {
    const detection = detectImportedContent('')

    expect(detection.kind).toBe(IMPORTED_CONTENT.empty)
    expect(detection.vocabulary).toEqual([])
    expect(detection.readingText).toBe('')
  })
})
