import { describe, expect, it } from 'vitest'
import { createPronunciationDictionary } from './pronunciationDictionary.js'
import { PLAN_STEP, buildSpokenPlan } from './spokenPlan.js'

const dictionary = createPronunciationDictionary(
  ['cat\tk æ t', 'dog\td ɒ ɡ', 'the\tð ə', 'is\tɪ z'].join('\n')
)

const allPhonemes = ['k', 'æ', 't', 'd', 'ɒ', 'ɡ', 'ð', 'ə', 'ɪ', 'z']

const planFor = (text, recorded = allPhonemes) =>
  buildSpokenPlan(text, { dictionary, recordedPhonemes: new Set(recorded) })

describe('buildSpokenPlan', () => {
  it('transforme un mot en suite de sons', () => {
    const plan = planFor('cat')

    expect(plan.steps).toEqual([
      { type: PLAN_STEP.phoneme, symbol: 'k' },
      { type: PLAN_STEP.phoneme, symbol: 'æ' },
      { type: PLAN_STEP.phoneme, symbol: 't' },
    ])
    expect(plan.canBeSpoken).toBe(true)
  })

  it('sépare deux mots par un silence', () => {
    const plan = planFor('the cat')
    const silences = plan.steps.filter((step) => step.type === PLAN_STEP.pause)

    expect(silences).toHaveLength(1)
  })

  it('ne met pas de silence avant le premier mot ni après le dernier', () => {
    const plan = planFor('the cat')

    expect(plan.steps[0].type).toBe(PLAN_STEP.phoneme)
    expect(plan.steps.at(-1).type).toBe(PLAN_STEP.phoneme)
  })

  it('marque un silence plus long à la fin d’une phrase', () => {
    const plan = planFor('the cat. the dog')
    const longestPause = Math.max(
      ...plan.steps.filter((step) => step.type === PLAN_STEP.pause).map((step) => step.durationMs)
    )
    const shortestPause = Math.min(
      ...plan.steps.filter((step) => step.type === PLAN_STEP.pause).map((step) => step.durationMs)
    )

    expect(longestPause).toBeGreaterThan(shortestPause)
  })

  it('refuse de lire un texte dont un mot est inconnu du dictionnaire', () => {
    const plan = planFor('the elephant')

    expect(plan.canBeSpoken).toBe(false)
    expect(plan.unknownWords).toEqual(['elephant'])
  })

  it('refuse de lire quand un son n’a pas été enregistré', () => {
    const plan = planFor('cat', ['k', 'æ'])

    expect(plan.canBeSpoken).toBe(false)
    expect(plan.missingPhonemes).toEqual(['t'])
  })

  it('ne signale qu’une fois un son manquant qui revient plusieurs fois', () => {
    const plan = planFor('the cat', ['k', 'æ', 'ð'])

    expect(plan.missingPhonemes.sort()).toEqual(['t', 'ə'].sort())
  })

  it('signale tous les mots inconnus, pour que le parent sache quoi corriger', () => {
    const plan = planFor('a giraffe and an elephant')

    expect(plan.unknownWords).toEqual(['a', 'giraffe', 'and', 'an', 'elephant'])
  })

  it('ignore la ponctuation isolée', () => {
    const plan = planFor('cat !')

    expect(plan.canBeSpoken).toBe(true)
  })

  it('renvoie un plan vide, non lisible, pour un texte vide', () => {
    const plan = planFor('   ')

    expect(plan.steps).toEqual([])
    expect(plan.canBeSpoken).toBe(false)
  })
})
