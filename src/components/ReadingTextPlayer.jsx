import { useEffect, useMemo, useState } from 'react'
import { TOKEN_KIND, splitIntoWords } from '../lib/text/textSegmentation.js'
import { buildReadingScript, findWordIndexAtCharacter } from '../lib/text/readingScript.js'
import { useCancellableSpeechSequence } from '../hooks/useCancellableSpeechSequence.js'

/**
 * Lecture du texte, avec le mot en cours surligne.
 *
 * Deux facons de lire, parce qu'aucune ne convient a tous les cas :
 *  - mot a mot, lent et parfaitement synchronise sur tous les navigateurs ;
 *  - phrase par phrase, plus naturel, le surlignage suivant la voix lorsque
 *    celle-ci sait signaler sa progression (les voix distantes ne le font pas,
 *    et seule la phrase est alors mise en avant).
 */

const PAUSE_BETWEEN_SENTENCES_MS = 500
const NO_WORD_HIGHLIGHTED = -1
const NO_SENTENCE_HIGHLIGHTED = -1

export default function ReadingTextPlayer({ lesson, speechPlayer, settings, wordRecordings }) {
  const readingScript = useMemo(() => buildReadingScript(lesson.readingText), [lesson.readingText])

  const hasAnyRecordedWord = useMemo(
    () => splitIntoWords(lesson.readingText).some((word) => wordRecordings.hasRecording(word)),
    [lesson.readingText, wordRecordings]
  )
  const [usesRecordedVoice, setUsesRecordedVoice] = useState(true)

  const [highlightedWordIndex, setHighlightedWordIndex] = useState(NO_WORD_HIGHLIGHTED)
  const [highlightedSentenceIndex, setHighlightedSentenceIndex] = useState(NO_SENTENCE_HIGHLIGHTED)
  const { isPlaying, play, stop } = useCancellableSpeechSequence(speechPlayer)

  const clearHighlights = () => {
    setHighlightedWordIndex(NO_WORD_HIGHLIGHTED)
    setHighlightedSentenceIndex(NO_SENTENCE_HIGHLIGHTED)
  }

  const stopReading = () => {
    stop()
    clearHighlights()
  }

  useEffect(() => {
    stopReading()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id])

  const readWordByWord = () =>
    play(async (sequence) => {
      try {
        for (let wordIndex = 0; wordIndex < readingScript.spokenWords.length; wordIndex += 1) {
          sequence.throwIfCancelled()
          setHighlightedWordIndex(wordIndex)

          await speechPlayer.speak(readingScript.spokenWords[wordIndex], {
            slowly: true,
            useRecordedVoice: usesRecordedVoice,
          })
          await sequence.pause(settings.pauseBetweenWordsMs)
        }
      } finally {
        clearHighlights()
      }
    })

  const readSentenceBySentence = () =>
    play(async (sequence) => {
      try {
        for (
          let sentenceIndex = 0;
          sentenceIndex < readingScript.sentences.length;
          sentenceIndex += 1
        ) {
          sequence.throwIfCancelled()

          const sentence = readingScript.sentences[sentenceIndex]
          setHighlightedSentenceIndex(sentenceIndex)
          setHighlightedWordIndex(NO_WORD_HIGHLIGHTED)

          await speechPlayer.speak(sentence.text, {
            useRecordedVoice: usesRecordedVoice,
            onWordBoundary: (characterPosition) =>
              setHighlightedWordIndex(
                findWordIndexAtCharacter(sentence, characterPosition) ?? NO_WORD_HIGHLIGHTED
              ),
          })
          await sequence.pause(PAUSE_BETWEEN_SENTENCES_MS)
        }
      } finally {
        clearHighlights()
      }
    })

  const speakSingleWord = (wordToken) => {
    if (isPlaying) return

    setHighlightedWordIndex(wordToken.wordIndex)
    speechPlayer
      .speak(wordToken.text, { slowly: true, useRecordedVoice: usesRecordedVoice })
      .catch(ignoreSpeechFailure)
      .finally(() =>
        setHighlightedWordIndex((highlighted) =>
          highlighted === wordToken.wordIndex ? NO_WORD_HIGHLIGHTED : highlighted
        )
      )
  }

  return (
    <>
      {hasAnyRecordedWord && (
        <div className="seg">
          <button
            type="button"
            className={usesRecordedVoice ? 'on' : ''}
            onClick={() => setUsesRecordedVoice(true)}
          >
            🎙️ Ma voix
          </button>
          <button
            type="button"
            className={usesRecordedVoice ? '' : 'on'}
            onClick={() => setUsesRecordedVoice(false)}
          >
            🔊 Voix automatique
          </button>
        </div>
      )}

      <div className="card">
        <div className="reader">
          {readingScript.sentences.map((sentence, sentenceIndex) => (
            <span
              key={sentenceIndex}
              className={`sentence-block ${
                highlightedSentenceIndex === sentenceIndex ? 'active' : ''
              }`}
            >
              {sentence.tokens.map((token, tokenIndex) =>
                token.kind === TOKEN_KIND.word ? (
                  <button
                    key={tokenIndex}
                    type="button"
                    className={`word ${highlightedWordIndex === token.wordIndex ? 'active' : ''}`}
                    onClick={() => speakSingleWord(token)}
                  >
                    {token.text}
                  </button>
                ) : (
                  <span key={tokenIndex}>{token.text}</span>
                )
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="row center">
        {isPlaying ? (
          <button className="btn red big" onClick={stopReading}>
            ⏹️ Stop
          </button>
        ) : (
          <>
            <button className="btn big" onClick={readSentenceBySentence}>
              📖 Lire l’histoire
            </button>
            <button className="btn amber big" onClick={readWordByWord}>
              🐢 Mot par mot
            </button>
          </>
        )}
      </div>

      <p className="muted centered">
        👆 Tu peux aussi appuyer sur un mot pour l’entendre tout seul.
      </p>
    </>
  )
}

function ignoreSpeechFailure() {}
