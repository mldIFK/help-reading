import { describe, expect, it } from 'vitest'
import { cleanImportedText, countWords } from './importedTextCleaning.js'

describe('cleanImportedText', () => {
  it('retire la marque d’ordre des octets que laissent Windows et Excel', () => {
    expect(cleanImportedText('\uFEFFHello')).toBe('Hello')
  })

  it('ramène les fins de ligne Windows et Mac au simple saut de ligne', () => {
    expect(cleanImportedText('one\r\ntwo\rthree')).toBe('one\ntwo\nthree')
  })

  it('supprime les espaces en fin de ligne, invisibles et source de faux mots', () => {
    expect(cleanImportedText('Hello   \nLucy  ')).toBe('Hello\nLucy')
  })

  it('réduit les lignes vides en rafale à une seule séparation', () => {
    expect(cleanImportedText('Hello\n\n\n\n\nLucy')).toBe('Hello\n\nLucy')
  })

  it('remplace les espaces insécables des PDF par de vraies espaces', () => {
    expect(cleanImportedText('Hello\u00A0Lucy')).toBe('Hello Lucy')
  })

  it('recolle un mot coupé par un tiret en fin de ligne, comme dans les PDF', () => {
    expect(cleanImportedText('grand-\nmother is here')).toBe('grandmother is here')
  })

  it('laisse un texte déjà propre inchangé', () => {
    expect(cleanImportedText('Hello! My name is Lucy.')).toBe('Hello! My name is Lucy.')
  })

  it('renvoie une chaîne vide pour un contenu absent', () => {
    expect(cleanImportedText(null)).toBe('')
    expect(cleanImportedText('   \n\n  ')).toBe('')
  })
})

describe('countWords', () => {
  it('compte les mots d’un texte', () => {
    expect(countWords('Hello my name is Lucy')).toBe(5)
  })

  it('ne compte pas la ponctuation comme un mot', () => {
    expect(countWords('Hello, Lucy!')).toBe(2)
  })

  it('renvoie zéro pour un texte vide', () => {
    expect(countWords('')).toBe(0)
  })
})
