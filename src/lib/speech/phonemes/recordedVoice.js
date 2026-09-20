/**
 * Lecture d'un texte avec les sons enregistres par une personne.
 *
 * Les extraits sont programmes sur l'horloge audio du navigateur, bout a bout,
 * et non declenches les uns apres les autres : c'est ce qui evite les blancs
 * irreguliers qu'un enchainement par minuterie produirait.
 *
 * Chaque extrait est debarrasse de ses silences de bord, amorce depuis zero, et
 * legerement superpose au suivant — sans ce recouvrement, la jointure s'entend.
 */

import { applyEdgeFades, findSoundBounds } from './audioTrimming.js'
import { PLAN_STEP } from './spokenPlan.js'

/** Duree du fondu applique a chaque extremite, en secondes. */
const EDGE_FADE_SECONDS = 0.008

/** Recouvrement entre deux sons consecutifs : lisse la transition. */
const OVERLAP_SECONDS = 0.02

let sharedAudioContext = null

function audioContext() {
  if (sharedAudioContext === null) {
    sharedAudioContext = new (window.AudioContext ?? window.webkitAudioContext)()
  }
  return sharedAudioContext
}

/**
 * Decode un extrait et en retire les silences de bord.
 * Renvoie `null` si l'enregistrement ne contient aucun son.
 */
async function prepareClip(audioBlob) {
  const context = audioContext()
  const decoded = await context.decodeAudioData(await audioBlob.arrayBuffer())
  const samples = decoded.getChannelData(0)

  const bounds = findSoundBounds(samples)
  if (bounds === null) return null

  const trimmedLength = bounds.end - bounds.start
  const clip = context.createBuffer(1, trimmedLength, decoded.sampleRate)
  const clipSamples = clip.getChannelData(0)
  clipSamples.set(samples.subarray(bounds.start, bounds.end))

  applyEdgeFades(clipSamples, Math.round(EDGE_FADE_SECONDS * decoded.sampleRate))

  return clip
}

/**
 * Prepare une voix a partir des extraits enregistres. Le decodage a lieu une
 * seule fois, pour que la lecture d'un mot soit instantanee.
 */
export async function createRecordedVoice(recordingsBySymbol) {
  const clips = new Map()

  await Promise.all(
    [...recordingsBySymbol].map(async ([symbol, audioBlob]) => {
      try {
        const clip = await prepareClip(audioBlob)
        if (clip !== null) clips.set(symbol, clip)
      } catch {
        // Un extrait illisible est simplement ignore : le mot qui en a besoin
        // sera lu par la voix de synthese.
      }
    })
  )

  return {
    /** Sons reellement utilisables, silences et extraits rates ecartes. */
    usablePhonemes: new Set(clips.keys()),

    /** Joue un plan de lecture et rend la main a la fin. */
    play(plan) {
      const context = audioContext()
      if (context.state === 'suspended') context.resume()

      let startTime = context.currentTime + 0.05
      let lastSource = null

      for (const step of plan.steps) {
        if (step.type === PLAN_STEP.pause) {
          startTime += step.durationMs / 1000
          continue
        }

        const clip = clips.get(step.symbol)
        if (!clip) continue

        const source = context.createBufferSource()
        source.buffer = clip
        source.connect(context.destination)
        source.start(startTime)

        lastSource = source
        startTime += Math.max(0, clip.duration - OVERLAP_SECONDS)
      }

      if (lastSource === null) return Promise.resolve()

      return new Promise((resolve) => {
        lastSource.onended = resolve
      })
    },
  }
}
