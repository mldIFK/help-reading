import { describe, expect, it } from 'vitest'
import { SILENCE_THRESHOLD, applyEdgeFades, findSoundBounds } from './audioTrimming.js'

/** Construit un echantillon : `silence` zeros, puis `son` valeurs fortes, etc. */
const samplesOf = (...segments) => Float32Array.from(segments.flat())
const silence = (length) => new Array(length).fill(0)
const sound = (length, level = 0.5) => new Array(length).fill(level)

describe('findSoundBounds', () => {
  it('trouve le début et la fin du son, en écartant les silences', () => {
    const bounds = findSoundBounds(samplesOf(silence(100), sound(50), silence(100)))

    expect(bounds.start).toBeLessThanOrEqual(100)
    expect(bounds.end).toBeGreaterThanOrEqual(150)
  })

  it('laisse intact un extrait sans silence', () => {
    const bounds = findSoundBounds(samplesOf(sound(200)))

    expect(bounds.start).toBe(0)
    expect(bounds.end).toBe(200)
  })

  it('renvoie null pour un extrait entièrement silencieux', () => {
    expect(findSoundBounds(samplesOf(silence(500)))).toBeNull()
  })

  it('renvoie null pour un extrait vide', () => {
    expect(findSoundBounds(new Float32Array())).toBeNull()
  })

  // Les segments sont plus longs que la marge de securite conservee autour du
  // son : sans cela, la marge les recouvrirait et le test ne prouverait rien.
  it('ignore un souffle de fond sous le seuil', () => {
    const souffle = SILENCE_THRESHOLD / 4
    const bounds = findSoundBounds(samplesOf(sound(500, souffle), sound(50), sound(500, souffle)))

    expect(bounds.start).toBeGreaterThan(0)
    expect(bounds.end).toBeLessThan(1050)
  })

  it('garde une marge avant l’attaque, pour ne pas couper le début du son', () => {
    const bounds = findSoundBounds(samplesOf(silence(500), sound(50), silence(500)))

    expect(bounds.start).toBeGreaterThan(0)
    expect(bounds.start).toBeLessThan(500)
  })

  it('tient compte des valeurs négatives, une onde oscillant autour de zéro', () => {
    const bounds = findSoundBounds(samplesOf(silence(100), sound(50, -0.5), silence(100)))

    expect(bounds).not.toBeNull()
    expect(bounds.end).toBeGreaterThanOrEqual(150)
  })
})

describe('applyEdgeFades', () => {
  it('part du silence et y revient, pour éviter les claquements aux jointures', () => {
    const samples = samplesOf(sound(1000))

    applyEdgeFades(samples, 100)

    expect(samples[0]).toBeCloseTo(0, 5)
    expect(samples.at(-1)).toBeCloseTo(0, 5)
  })

  it('laisse le cœur du son inchangé', () => {
    const samples = samplesOf(sound(1000))

    applyEdgeFades(samples, 100)

    expect(samples[500]).toBeCloseTo(0.5, 5)
  })

  it('ne déborde pas sur un extrait plus court que le fondu demandé', () => {
    const samples = samplesOf(sound(10))

    expect(() => applyEdgeFades(samples, 100)).not.toThrow()
    expect(samples.every((value) => Number.isFinite(value))).toBe(true)
  })

  it('supporte un extrait vide', () => {
    expect(() => applyEdgeFades(new Float32Array(), 100)).not.toThrow()
  })
})
