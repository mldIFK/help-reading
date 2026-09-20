/**
 * Lecture d'un extrait enregistre par un humain, avec la meme forme que la
 * synthese vocale (`speechSynthesisService.js`) : l'appelant sait seulement
 * « joue cet extrait » et « arrete-toi », sans connaitre la balise `<audio>`
 * sous-jacente. C'est ce qui permet a `useSpeechPlayer` de substituer l'un a
 * l'autre sans que les ecrans le sachent.
 */

let activePlayback = null

export function playRecordedAudio(audioBlob, { speed = 1 } = {}) {
  stopRecordedAudioPlayback()

  return new Promise((resolve, reject) => {
    const audio = new Audio(URL.createObjectURL(audioBlob))
    audio.playbackRate = speed

    const release = () => {
      URL.revokeObjectURL(audio.src)
      if (activePlayback?.audio === audio) activePlayback = null
    }

    audio.onended = () => {
      release()
      resolve()
    }

    audio.onerror = () => {
      release()
      reject(new Error('recorded-audio-playback-failed'))
    }

    activePlayback = {
      audio,
      stopAsInterruption: () => {
        release()
        resolve()
      },
    }

    audio.play().catch((error) => {
      release()
      reject(error)
    })
  })
}

/** Interrompt la lecture en cours, s'il y en a une : la promesse se resout, elle n'echoue pas. */
export function stopRecordedAudioPlayback() {
  const playback = activePlayback
  if (!playback) return

  playback.audio.pause()
  playback.stopAsInterruption()
}
