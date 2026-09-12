/**
 * Enchainement de lectures interruptibles.
 *
 * Les trois exercices lisent des suites de mots ou de phrases que l'enfant doit
 * pouvoir arreter a tout moment, y compris en quittant l'ecran. Ce hook porte
 * cette mecanique une seule fois : l'ecran se contente de decrire la suite a
 * lire, sans se soucier de l'annulation.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

/** Levee pour remonter jusqu'au hook des qu'une lecture est interrompue. */
class SequenceCancelled extends Error {}

function createCancellableSequence() {
  let isCancelled = false
  let endPauseEarly = null
  let pauseTimer = null

  return {
    cancel() {
      isCancelled = true
      if (pauseTimer !== null) clearTimeout(pauseTimer)
      if (endPauseEarly !== null) endPauseEarly()
    },

    /** A appeler avant chaque etape, pour ne pas lire un mot de trop. */
    throwIfCancelled() {
      if (isCancelled) throw new SequenceCancelled()
    },

    /** Silence entre deux etapes, ecourte si la lecture est interrompue. */
    async pause(durationMs) {
      await new Promise((resolve) => {
        endPauseEarly = resolve
        pauseTimer = setTimeout(resolve, durationMs)
      })

      pauseTimer = null
      endPauseEarly = null
      this.throwIfCancelled()
    },
  }
}

export function useCancellableSpeechSequence(speechPlayer) {
  const activeSequenceRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const stop = useCallback(() => {
    activeSequenceRef.current?.cancel()
    activeSequenceRef.current = null
    speechPlayer.stop()
    setIsPlaying(false)
  }, [speechPlayer])

  // Quitter l'ecran, ou changer de lecon, coupe la lecture en cours.
  useEffect(() => stop, [stop])

  /**
   * `readSequence` recoit la sequence en cours et decrit ce qu'il faut lire :
   *
   *   play(async (sequence) => {
   *     for (const word of words) {
   *       sequence.throwIfCancelled()
   *       await speechPlayer.speak(word, { slowly: true })
   *       await sequence.pause(pauseBetweenWordsMs)
   *     }
   *   })
   */
  const play = useCallback(
    async (readSequence) => {
      stop()

      const sequence = createCancellableSequence()
      activeSequenceRef.current = sequence
      setIsPlaying(true)

      try {
        await readSequence(sequence)
      } catch (error) {
        if (!(error instanceof SequenceCancelled)) throw error
      } finally {
        if (activeSequenceRef.current === sequence) {
          activeSequenceRef.current = null
          setIsPlaying(false)
        }
      }
    },
    [stop]
  )

  return { isPlaying, play, stop }
}
