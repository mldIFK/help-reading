/**
 * Decoupage d'un texte a prononcer en segments, pour meler une voix enregistree
 * par un humain a la synthese vocale au fil d'une phrase.
 *
 * Un appel de synthese par mot casserait le ton naturel de la phrase : les
 * mots sans enregistrement sont donc regroupes en une seule suite, et seul un
 * mot enregistre forme son propre segment.
 */

import { TOKEN_KIND, splitIntoTokens } from '../text/textSegmentation.js'

export const SPOKEN_SEGMENT_KIND = {
  recordedWord: 'recordedWord',
  synthesisRun: 'synthesisRun',
}

export function buildSpokenSegments(text, hasRecordingForWord) {
  const segments = []
  let synthesisRunBeingBuilt = null

  const closeSynthesisRun = () => {
    if (synthesisRunBeingBuilt) segments.push(synthesisRunBeingBuilt)
    synthesisRunBeingBuilt = null
  }

  for (const token of splitIntoTokens(text)) {
    if (token.kind === TOKEN_KIND.word && hasRecordingForWord(token.text)) {
      closeSynthesisRun()
      segments.push({
        kind: SPOKEN_SEGMENT_KIND.recordedWord,
        text: token.text,
        startOffset: token.startOffset,
      })
      continue
    }

    if (synthesisRunBeingBuilt) {
      synthesisRunBeingBuilt.text += token.text
    } else {
      synthesisRunBeingBuilt = {
        kind: SPOKEN_SEGMENT_KIND.synthesisRun,
        text: token.text,
        startOffset: token.startOffset,
      }
    }
  }

  closeSynthesisRun()
  return segments
}
