/**
 * Enregistrement d'un son au micro.
 *
 * Le micro exige une page servie en HTTPS ou sur localhost : la meme contrainte
 * que l'exercice « Lire tout haut ».
 */

export function isRecordingSupported() {
  return (
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined'
  )
}

/** Formats tentes dans l'ordre ; les navigateurs ne acceptent pas les memes. */
const PREFERRED_FORMATS = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']

function chooseFormat() {
  return PREFERRED_FORMATS.find((format) => MediaRecorder.isTypeSupported?.(format)) ?? ''
}

/**
 * Ouvre le micro et rend un enregistreur. `stop()` rend l'extrait audio et
 * libere le micro — le temoin d'enregistrement du navigateur doit s'eteindre
 * des qu'on a fini.
 */
export async function startRecording() {
  const microphone = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  })

  const format = chooseFormat()
  const recorder = new MediaRecorder(microphone, format ? { mimeType: format } : undefined)
  const chunks = []

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  }

  recorder.start()

  return {
    stop() {
      return new Promise((resolve) => {
        recorder.onstop = () => {
          microphone.getTracks().forEach((track) => track.stop())
          resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }))
        }
        recorder.stop()
      })
    },

    cancel() {
      recorder.stop()
      microphone.getTracks().forEach((track) => track.stop())
    },
  }
}
