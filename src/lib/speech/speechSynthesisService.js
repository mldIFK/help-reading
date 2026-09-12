/**
 * Lecture a voix haute, via la synthese vocale du navigateur.
 *
 * Aucune connexion ni cle d'API : les voix sont celles installees sur l'appareil.
 * Ce module isole les particularites de l'API Web Speech, pour que les ecrans
 * n'aient a connaitre que « prononce ce texte » et « arrete-toi ».
 */

const speechSynthesisApi = typeof window !== 'undefined' ? window.speechSynthesis : null

/** Chrome interrompt la synthese au bout d'une quinzaine de secondes. */
const KEEP_ALIVE_INTERVAL_MS = 10000

/**
 * Sur mobile, enchainer l'arret et le demarrage sans respirer fait sauter
 * l'enonce suivant.
 */
const DELAY_BEFORE_SPEAKING_MS = 30

/** Erreurs signalees quand on coupe volontairement la lecture. */
const DELIBERATE_INTERRUPTIONS = ['interrupted', 'canceled']

export function isSpeechSynthesisAvailable() {
  return speechSynthesisApi !== null && speechSynthesisApi !== undefined
}

/**
 * Charge la liste des voix. Chrome la publie de maniere asynchrone : si elle est
 * encore vide, on attend l'evenement qui l'annonce, sans bloquer indefiniment.
 */
export function loadAvailableVoices(timeoutMs = 3000) {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisAvailable()) return resolve([])

    const voicesAlreadyKnown = speechSynthesisApi.getVoices()
    if (voicesAlreadyKnown.length > 0) return resolve(voicesAlreadyKnown)

    let hasResolved = false
    const resolveWithCurrentVoices = () => {
      if (hasResolved) return
      hasResolved = true
      speechSynthesisApi.removeEventListener('voiceschanged', resolveWithCurrentVoices)
      resolve(speechSynthesisApi.getVoices())
    }

    speechSynthesisApi.addEventListener('voiceschanged', resolveWithCurrentVoices)
    setTimeout(resolveWithCurrentVoices, timeoutMs)
  })
}

let keepAliveTimer = null

function startKeepAlive() {
  stopKeepAlive()
  keepAliveTimer = setInterval(() => {
    if (speechSynthesisApi.speaking && !speechSynthesisApi.paused) {
      speechSynthesisApi.pause()
      speechSynthesisApi.resume()
    }
  }, KEEP_ALIVE_INTERVAL_MS)
}

function stopKeepAlive() {
  if (keepAliveTimer !== null) clearInterval(keepAliveTimer)
  keepAliveTimer = null
}

export function stopSpeaking() {
  stopKeepAlive()
  if (isSpeechSynthesisAvailable()) speechSynthesisApi.cancel()
}

/**
 * Prononce un texte et rend la main quand la lecture est terminee.
 *
 * `onWordBoundary` est appele avec la position du mot en cours, quand la voix
 * choisie sait la signaler. Les voix distantes ne le font pas : l'appelant doit
 * prevoir de fonctionner sans.
 */
export function speakText(text, { voice = null, language = 'en-GB', speed = 1, onWordBoundary = null } = {}) {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisAvailable()) return reject(new Error('speech-synthesis-unavailable'))
    if (!String(text ?? '').trim()) return resolve()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.lang = voice?.lang ?? language
    utterance.rate = speed

    if (onWordBoundary) {
      utterance.onboundary = (event) => {
        const isWordBoundary = event.name === 'word' || event.name === undefined
        if (isWordBoundary) onWordBoundary(event.charIndex ?? 0)
      }
    }

    utterance.onend = () => {
      stopKeepAlive()
      resolve()
    }

    utterance.onerror = (event) => {
      stopKeepAlive()
      if (DELIBERATE_INTERRUPTIONS.includes(event.error)) resolve()
      else reject(new Error(event.error ?? 'speech-synthesis-failed'))
    }

    speechSynthesisApi.cancel()
    startKeepAlive()
    setTimeout(() => speechSynthesisApi.speak(utterance), DELAY_BEFORE_SPEAKING_MS)
  })
}
