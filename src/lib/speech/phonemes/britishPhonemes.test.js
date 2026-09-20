import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BRITISH_PHONEMES, findPhoneme, listPhonemeGroups } from './britishPhonemes.js'
import { createPronunciationDictionary } from './pronunciationDictionary.js'

/**
 * Ces tests confrontent l'inventaire au dictionnaire reellement livre.
 * C'est la seule facon de garantir qu'aucun mot ne restera muet faute d'un son
 * absent de la liste a enregistrer — et qu'inversement, on ne fait pas
 * enregistrer un son qui ne sert jamais.
 */
const dictionary = createPronunciationDictionary(
  readFileSync('public/pronunciation/en-GB.txt', 'utf8')
)

describe('BRITISH_PHONEMES', () => {
  it('donne à chaque son un symbole unique', () => {
    const symbols = BRITISH_PHONEMES.map((phoneme) => phoneme.symbol)

    expect(new Set(symbols).size).toBe(symbols.length)
  })

  it('donne à chaque son un mot d’exemple et une explication en français', () => {
    BRITISH_PHONEMES.forEach((phoneme) => {
      expect(phoneme.example, `son ${phoneme.symbol}`).toBeTruthy()
      expect(phoneme.hint, `son ${phoneme.symbol}`).toBeTruthy()
    })
  })

  it('choisit des mots d’exemple qui contiennent vraiment le son', () => {
    BRITISH_PHONEMES.forEach((phoneme) => {
      const phonemesOfExample = dictionary.findPhonemes(phoneme.example)

      expect(phonemesOfExample, `mot « ${phoneme.example} »`).not.toBeNull()
      expect(phonemesOfExample, `son ${phoneme.symbol} dans « ${phoneme.example} »`).toContain(
        phoneme.symbol
      )
    })
  })

  it('range chaque son dans un groupe présenté à l’écran', () => {
    const groupedPhonemes = listPhonemeGroups().flatMap((group) => group.phonemes)

    expect(groupedPhonemes).toHaveLength(BRITISH_PHONEMES.length)
  })
})

describe('couverture du dictionnaire', () => {
  it('n’emploie aucun son absent de la liste à enregistrer', () => {
    const knownSymbols = new Set(BRITISH_PHONEMES.map((phoneme) => phoneme.symbol))
    const unknownSymbols = new Set()

    readFileSync('public/pronunciation/en-GB.txt', 'utf8')
      .split('\n')
      .forEach((line) => {
        const phonemes = line.split('\t')[1]
        if (!phonemes) return

        phonemes.split(' ').forEach((symbol) => {
          if (!knownSymbols.has(symbol)) unknownSymbols.add(symbol)
        })
      })

    expect([...unknownSymbols]).toEqual([])
  })

  it('sait prononcer les mots de la première leçon', () => {
    ;['hello', 'please', 'yes', 'no', 'sorry'].forEach((word) => {
      expect(dictionary.findPhonemes(word), word).not.toBeNull()
    })
  })
})

describe('findPhoneme', () => {
  it('retrouve un son par son symbole', () => {
    expect(findPhoneme('θ')?.example).toBe('think')
  })

  it('renvoie null pour un symbole inconnu', () => {
    expect(findPhoneme('zzz')).toBeNull()
  })
})
