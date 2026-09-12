/**
 * Ecoute du micro, via la reconnaissance vocale du navigateur.
 *
 * Disponible sur Chrome et Edge, absente de Safari : l'appelant doit toujours
 * verifier `isSpeechRecognitionAvailable()` avant de proposer l'exercice.
 */

const SpeechRecognitionApi =
  typeof window !== 'undefined'
    ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
    : null

/** Causes d'echec du micro, telles que l'enfant ou le parent peut les comprendre. */
export const MICROPHONE_PROBLEM_MESSAGES = {
  'not-allowed':
    'Le micro est bloqué. Autorise le micro pour ce site dans le navigateur, puis réessaie.',
  'service-not-allowed':
    'Le micro est bloqué. Autorise le micro pour ce site dans le navigateur, puis réessaie.',
  'no-speech': "Je n'ai rien entendu. Parle bien fort dans le micro !",
  'audio-capture': 'Aucun micro trouvé sur cet appareil.',
  network: 'La reconnaissance vocale a besoin d’internet sur ce navigateur.',
}

/** Un arret demande par l'utilisateur n'est pas un probleme a signaler. */
const DELIBERATE_INTERRUPTION = 'aborted'

export function isSpeechRecognitionAvailable() {
  return SpeechRecognitionApi !== null && SpeechRecognitionApi !== undefined
}

export function describeMicrophoneProblem(problemCode) {
  if (problemCode === DELIBERATE_INTERRUPTION) return ''

  return MICROPHONE_PROBLEM_MESSAGES[problemCode] ?? `Problème de micro (${problemCode}).`
}

/**
 * Prepare une session d'ecoute.
 *
 * - `onPartialTranscript` : ce que le navigateur croit entendre, pendant que
 *   l'enfant parle, pour lui montrer que le micro fonctionne.
 * - `onFinalTranscript`   : la phrase retenue, une fois l'enfant silencieux.
 * - `onListeningEnded`    : l'ecoute est terminee, quelle qu'en soit la raison.
 * - `onProblem`           : message pret a afficher.
 */
export function createMicrophoneListener({
  language = 'en-GB',
  onPartialTranscript,
  onFinalTranscript,
  onListeningEnded,
  onProblem,
}) {
  if (!isSpeechRecognitionAvailable()) return null

  const recognition = new SpeechRecognitionApi()
  recognition.lang = language
  recognition.continuous = false
  recognition.interimResults = true

  let confirmedTranscript = ''

  recognition.onresult = (event) => {
    let pendingTranscript = ''

    for (let resultIndex = event.resultIndex; resultIndex < event.results.length; resultIndex += 1) {
      const result = event.results[resultIndex]
      const bestAlternative = result[0].transcript

      if (result.isFinal) confirmedTranscript += `${bestAlternative} `
      else pendingTranscript += bestAlternative
    }

    if (pendingTranscript && onPartialTranscript) onPartialTranscript(pendingTranscript.trim())
  }

  recognition.onerror = (event) => {
    const problemDescription = describeMicrophoneProblem(event.error)
    if (problemDescription && onProblem) onProblem(problemDescription)
  }

  recognition.onend = () => {
    if (onFinalTranscript) onFinalTranscript(confirmedTranscript.trim())
    if (onListeningEnded) onListeningEnded()
    confirmedTranscript = ''
  }

  const ignoreAlreadyStoppedError = (action) => {
    try {
      action()
    } catch {
      // Le navigateur proteste si l'ecoute est deja dans l'etat demande.
    }
  }

  return {
    startListening() {
      confirmedTranscript = ''
      ignoreAlreadyStoppedError(() => recognition.start())
    },
    stopListening() {
      ignoreAlreadyStoppedError(() => recognition.stop())
    },
    cancelListening() {
      ignoreAlreadyStoppedError(() => recognition.abort())
    },
  }
}
