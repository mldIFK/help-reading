import { EXERCISE_TYPE } from '../lib/exerciseTypes.js'
import { isSpeechRecognitionAvailable } from '../lib/speech/speechRecognitionService.js'
import { isSpeechSynthesisAvailable } from '../lib/speech/speechSynthesisService.js'
import { clearProgress } from '../lib/storage/progressRepository.js'

/**
 * Reglages, destines au parent : accent, voix, vitesse, suivi des etoiles et
 * diagnostic de l'appareil.
 */

const VOICE_TEST_SENTENCE = 'Hello! My name is Lucy. I have a little cat.'
const SLOWEST_SPEED_OFFERED = 0.4
const FASTEST_SPEED_OFFERED = 1.2
const LONGEST_PAUSE_OFFERED_MS = 1200
const EXERCISES_SHOWN_IN_HISTORY = 8

const ACCENTS = [
  { languageTag: 'en-GB', label: '🇬🇧 Anglais britannique' },
  { languageTag: 'en-US', label: '🇺🇸 Anglais américain' },
]

export default function SettingsScreen({
  settings,
  englishVoices,
  activeVoice,
  speechPlayer,
  progress,
  onChangeSettings,
  onProgressCleared,
}) {
  return (
    <>
      <section className="card">
        <h2 className="section">🇬🇧 Accent</h2>
        <div className="seg">
          {ACCENTS.map((accent) => (
            <button
              key={accent.languageTag}
              className={settings.accent === accent.languageTag ? 'on' : ''}
              onClick={() =>
                onChangeSettings({ accent: accent.languageTag, chosenVoiceIdentifier: '' })
              }
              aria-pressed={settings.accent === accent.languageTag}
            >
              {accent.label}
            </button>
          ))}
        </div>
        <p className="muted">À l’école en France, on enseigne surtout l’accent britannique.</p>
      </section>

      <section className="card">
        <div className="field">
          <label htmlFor="voice">Voix ({englishVoices.length} disponible(s))</label>
          <select
            id="voice"
            value={activeVoice?.voiceURI ?? ''}
            onChange={(event) => onChangeSettings({ chosenVoiceIdentifier: event.target.value })}
          >
            {englishVoices.length === 0 && <option value="">Aucune voix anglaise installée</option>}
            {englishVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang}) {voice.localService ? '— hors-ligne' : '— en ligne'}
              </option>
            ))}
          </select>
          <p className="muted">
            Les voix « en ligne » (Google) sonnent mieux mais ont besoin d’internet. Les voix
            « hors-ligne » (Microsoft) marchent partout et permettent le surlignage du mot lu.
          </p>
        </div>

        <div className="field">
          <label htmlFor="reading-speed">
            Vitesse de lecture : {settings.readingSpeed.toFixed(2)}×
          </label>
          <input
            id="reading-speed"
            type="range"
            min={SLOWEST_SPEED_OFFERED}
            max={FASTEST_SPEED_OFFERED}
            step="0.05"
            value={settings.readingSpeed}
            onChange={(event) => onChangeSettings({ readingSpeed: Number(event.target.value) })}
          />
          <p className="muted">Pour débuter, 0,7 à 0,9 est idéal.</p>
        </div>

        <div className="field">
          <label htmlFor="pause-between-words">
            Pause entre les mots : {settings.pauseBetweenWordsMs} ms
          </label>
          <input
            id="pause-between-words"
            type="range"
            min="0"
            max={LONGEST_PAUSE_OFFERED_MS}
            step="50"
            value={settings.pauseBetweenWordsMs}
            onChange={(event) =>
              onChangeSettings({ pauseBetweenWordsMs: Number(event.target.value) })
            }
          />
        </div>

        <fieldset className="field">
          <legend>Traduction française</legend>
          <div className="seg">
            <button
              className={settings.showFrenchTranslation ? 'on' : ''}
              onClick={() => onChangeSettings({ showFrenchTranslation: true })}
              aria-pressed={settings.showFrenchTranslation}
            >
              👁️ Afficher
            </button>
            <button
              className={settings.showFrenchTranslation ? '' : 'on'}
              onClick={() => onChangeSettings({ showFrenchTranslation: false })}
              aria-pressed={!settings.showFrenchTranslation}
            >
              🙈 Cacher
            </button>
          </div>
        </fieldset>

        <div className="row">
          <button
            className="btn"
            onClick={() => speechPlayer.speak(VOICE_TEST_SENTENCE, {}).catch(ignoreSpeechFailure)}
          >
            🔊 Tester la voix
          </button>
          <button className="btn ghost" onClick={() => speechPlayer.stop()}>
            ⏹️ Stop
          </button>
        </div>
      </section>

      <ProgressReport progress={progress} onProgressCleared={onProgressCleared} />
      <DeviceReport englishVoices={englishVoices} />
    </>
  )
}

function ProgressReport({ progress, onProgressCleared }) {
  return (
    <section className="card">
      <h2 className="section">⭐ Progrès</h2>
      <p className="star-total">
        {progress.totalStars} étoile{progress.totalStars > 1 ? 's' : ''}
      </p>

      {progress.recentExercises.length > 0 && (
        <ul className="muted">
          {progress.recentExercises.slice(0, EXERCISES_SHOWN_IN_HISTORY).map((exercise) => (
            <li key={exercise.completedAt}>
              {exercise.exerciseType === EXERCISE_TYPE.readAloud ? '🎤' : '✍️'} {exercise.subject} —{' '}
              {'⭐'.repeat(exercise.earnedStars)}
              {exercise.scorePercentage !== undefined ? ` (${exercise.scorePercentage}%)` : ''}
            </li>
          ))}
        </ul>
      )}

      <button
        className="btn ghost"
        onClick={() => {
          if (window.confirm('Remettre les étoiles à zéro ?')) onProgressCleared(clearProgress())
        }}
      >
        🔄 Remettre à zéro
      </button>
    </section>
  )
}

function DeviceReport({ englishVoices }) {
  return (
    <section className="card">
      <h2 className="section">🔧 Diagnostic</h2>
      <ul className="muted">
        <li>Lecture à voix haute : {isSpeechSynthesisAvailable() ? '✅ disponible' : '❌ indisponible'}</li>
        <li>
          Micro (reconnaissance) :{' '}
          {isSpeechRecognitionAvailable() ? '✅ disponible' : '❌ indisponible sur ce navigateur'}
        </li>
        <li>Connexion sécurisée (HTTPS) : {window.isSecureContext ? '✅ oui' : '❌ non'}</li>
        <li>Voix anglaises trouvées : {englishVoices.length}</li>
      </ul>

      {englishVoices.length === 0 && (
        <p className="notice">
          Aucune voix anglaise n’est installée. Sous Windows :{' '}
          <strong>
            Paramètres → Heure et langue → Langue et région → Ajouter une langue → English (United
            Kingdom)
          </strong>
          , puis cocher « Synthèse vocale ». Redémarre ensuite le navigateur.
        </p>
      )}
    </section>
  )
}

function ignoreSpeechFailure() {}
