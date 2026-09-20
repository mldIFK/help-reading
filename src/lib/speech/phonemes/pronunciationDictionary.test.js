import { describe, expect, it } from 'vitest'
import { createPronunciationDictionary } from './pronunciationDictionary.js'

const SAMPLE = ['cat\tk æ t', 'dog\td ɒ ɡ', "don't\td əʊ n t", 'the\tð ə'].join('\n')

describe('createPronunciationDictionary', () => {
  const dictionary = createPronunciationDictionary(SAMPLE)

  it('trouve la prononciation d’un mot', () => {
    expect(dictionary.findPhonemes('cat')).toEqual(['k', 'æ', 't'])
  })

  it('ignore la casse, car un texte commence par une majuscule', () => {
    expect(dictionary.findPhonemes('Cat')).toEqual(['k', 'æ', 't'])
  })

  it('ignore la ponctuation collée au mot', () => {
    expect(dictionary.findPhonemes('cat,')).toEqual(['k', 'æ', 't'])
    expect(dictionary.findPhonemes('«dog»')).toEqual(['d', 'ɒ', 'ɡ'])
  })

  it('conserve l’apostrophe, qui fait partie du mot', () => {
    expect(dictionary.findPhonemes("don't")).toEqual(['d', 'əʊ', 'n', 't'])
  })

  it('ramène l’apostrophe typographique à l’apostrophe simple', () => {
    expect(dictionary.findPhonemes('don’t')).toEqual(['d', 'əʊ', 'n', 't'])
  })

  it('renvoie null pour un mot inconnu, plutôt que d’inventer', () => {
    expect(dictionary.findPhonemes('xyzzy')).toBeNull()
  })

  it('renvoie null pour un mot vide', () => {
    expect(dictionary.findPhonemes('')).toBeNull()
    expect(dictionary.findPhonemes('...')).toBeNull()
  })

  it('annonce le nombre de mots connus', () => {
    expect(dictionary.wordCount).toBe(4)
  })

  it('supporte un dictionnaire vide sans échouer', () => {
    const empty = createPronunciationDictionary('')

    expect(empty.wordCount).toBe(0)
    expect(empty.findPhonemes('cat')).toBeNull()
  })

  it('ignore les lignes mal formées au lieu de les charger', () => {
    const withRubbish = createPronunciationDictionary('cat\tk æ t\nligne cassée\n\ndog\td ɒ ɡ')

    expect(withRubbish.wordCount).toBe(2)
  })
})
