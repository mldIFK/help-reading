import { describe, expect, it } from 'vitest'
import { looksLikeCsv, parseVocabularyCsv } from './vocabularyCsv.js'

describe('parseVocabularyCsv', () => {
  it('lit deux colonnes séparées par une virgule', () => {
    expect(parseVocabularyCsv('cat,chat\ndog,chien')).toEqual([
      { english: 'cat', french: 'chat' },
      { english: 'dog', french: 'chien' },
    ])
  })

  it('accepte le point-virgule, séparateur des Excel français', () => {
    expect(parseVocabularyCsv('cat;chat\ndog;chien')).toEqual([
      { english: 'cat', french: 'chat' },
      { english: 'dog', french: 'chien' },
    ])
  })

  it('accepte la tabulation, obtenue en copiant un tableau', () => {
    expect(parseVocabularyCsv('cat\tchat')).toEqual([{ english: 'cat', french: 'chat' }])
  })

  it('ignore une ligne d’en-têtes', () => {
    expect(parseVocabularyCsv('anglais,français\ncat,chat')).toEqual([
      { english: 'cat', french: 'chat' },
    ])
  })

  it('reconnaît aussi des en-têtes en anglais', () => {
    expect(parseVocabularyCsv('english,french\ncat,chat')).toEqual([
      { english: 'cat', french: 'chat' },
    ])
  })

  it('ne prend pas une vraie première ligne pour des en-têtes', () => {
    expect(parseVocabularyCsv('cat,chat\ndog,chien')).toHaveLength(2)
  })

  it('respecte les guillemets autour d’une valeur contenant le séparateur', () => {
    expect(parseVocabularyCsv('"thank you, Lucy",merci')).toEqual([
      { english: 'thank you, Lucy', french: 'merci' },
    ])
  })

  it('restitue un guillemet double échappé', () => {
    expect(parseVocabularyCsv('"say ""hello""",dire bonjour')).toEqual([
      { english: 'say "hello"', french: 'dire bonjour' },
    ])
  })

  it('ignore les colonnes en trop au-delà des deux premières', () => {
    expect(parseVocabularyCsv('cat,chat,nom commun')).toEqual([
      { english: 'cat', french: 'chat' },
    ])
  })

  it('accepte une ligne sans traduction', () => {
    expect(parseVocabularyCsv('cat')).toEqual([{ english: 'cat', french: '' }])
  })

  it('ignore les lignes vides', () => {
    expect(parseVocabularyCsv('cat,chat\n\n\ndog,chien')).toHaveLength(2)
  })

  it('ignore une ligne dont le mot anglais est absent', () => {
    expect(parseVocabularyCsv(',chat')).toEqual([])
  })

  it('renvoie une liste vide pour un contenu vide', () => {
    expect(parseVocabularyCsv('')).toEqual([])
  })
})

describe('looksLikeCsv', () => {
  it('reconnaît un contenu dont la plupart des lignes ont un séparateur', () => {
    expect(looksLikeCsv('cat,chat\ndog,chien\nbird,oiseau')).toBe(true)
  })

  it('ne prend pas un texte de lecture ponctué de virgules pour un tableau', () => {
    expect(looksLikeCsv('Hello, my name is Lucy. I have a cat, a dog and a bird.')).toBe(false)
  })

  it('renvoie faux pour un contenu vide', () => {
    expect(looksLikeCsv('')).toBe(false)
  })
})
