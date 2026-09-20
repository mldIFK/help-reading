/**
 * Enregistrement de la voix d'un parent (ou de tout adulte anglophone) pour
 * chaque mot du vocabulaire de la lecon en cours de saisie.
 *
 * Une fois un mot enregistre, il est prononce par cet extrait partout dans
 * l'application — voir `useSpeechPlayer`. Cet ecran ne fait qu'enregistrer et
 * relire ; la substitution elle-meme est invisible ici.
 */

export default function VocabularyWordRecordings({ vocabulary, wordRecordings }) {
  if (vocabulary.length === 0) return null

  if (!wordRecordings.isSupported) {
    return (
      <p className="notice">
        🎙️ Ce navigateur ne sait pas enregistrer au micro : les mots seront prononcés par la voix
        de synthèse.
      </p>
    )
  }

  return (
    <div className="field">
      <label>Voix humaine pour chaque mot (facultatif)</label>
      <p className="muted">
        Enregistre-toi en train de prononcer un mot : cette voix remplace la synthèse partout où
        le mot est prononcé.
      </p>

      {wordRecordings.problem && <p className="notice error">{wordRecordings.problem}</p>}

      <ul className="recording-list">
        {vocabulary.map((entry, position) => (
          <WordRecordingRow
            key={`${entry.english}-${position}`}
            word={entry.english}
            wordRecordings={wordRecordings}
          />
        ))}
      </ul>
    </div>
  )
}

function WordRecordingRow({ word, wordRecordings }) {
  const isRecorded = wordRecordings.hasRecording(word)
  const isBeingRecorded = wordRecordings.isRecording(word)
  const isAnotherWordBeingRecorded = wordRecordings.isAnotherWordBeingRecorded(word)

  return (
    <li className={`recording-row ${isRecorded ? 'recorded' : ''}`}>
      <span className="recording-text">
        {word} {isRecorded && <span aria-label="enregistré">✅</span>}
      </span>

      <span className="recording-actions">
        {isBeingRecorded ? (
          <button className="btn red" onClick={() => wordRecordings.finishRecordingWord(word)}>
            ⏹️ Arrêter
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => wordRecordings.startRecordingWord(word)}
            disabled={isAnotherWordBeingRecorded}
            aria-label={`Enregistrer le mot ${word}`}
          >
            🎙️ {isRecorded ? 'Refaire' : 'Enregistrer'}
          </button>
        )}

        {isRecorded && !isBeingRecorded && (
          <>
            <button
              className="btn ghost icon"
              onClick={() => wordRecordings.playRecordingFor(word)}
              aria-label={`Écouter l’enregistrement de ${word}`}
            >
              ▶️
            </button>
            <button
              className="btn ghost icon"
              onClick={() => wordRecordings.deleteRecordingFor(word)}
              aria-label={`Effacer l’enregistrement de ${word}`}
            >
              🗑️
            </button>
          </>
        )}
      </span>
    </li>
  )
}
