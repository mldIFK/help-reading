import { EXERCISES } from '../lib/exerciseTypes.js'
import { isSpeechRecognitionAvailable } from '../lib/speech/speechRecognitionService.js'
import { isSpeechSynthesisAvailable } from '../lib/speech/speechSynthesisService.js'

/**
 * Accueil : la lecon du moment, puis les trois exercices.
 *
 * Les limitations de l'appareil sont annoncees ici plutot que decouvertes au
 * milieu d'un exercice.
 */
export default function HomeScreen({
  lesson,
  onChangeLesson,
  onAddLesson,
  onStartExercise,
}) {
  return (
    <>
      <button className="lesson-chip" onClick={onChangeLesson}>
        <span className="emoji">{lesson?.emoji ?? '📚'}</span>
        <span className="lesson-chip-text">
          <span className="title">{lesson?.title ?? 'Choisir une leçon'}</span>
          <span className="sub">{lesson?.subtitle ?? 'Appuie pour changer'}</span>
        </span>
        <span aria-hidden="true">🔄</span>
      </button>

      <div className="mode-grid">
        {EXERCISES.map((exercise) => (
          <button
            key={exercise.type}
            className={`mode-card ${exercise.type}`}
            onClick={() => onStartExercise(exercise.type)}
          >
            <span className="emoji">{exercise.emoji}</span>
            <span className="name">{exercise.name}</span>
            <span className="hint">{exercise.hint}</span>
          </button>
        ))}
      </div>

      <div className="row">
        <button className="btn ghost" onClick={onAddLesson}>
          ➕ Ajouter les devoirs de la semaine
        </button>
      </div>

      <DeviceLimitations />
    </>
  )
}

/** Ce que cet appareil ne saura pas faire, et ce qui marche quand meme. */
function DeviceLimitations() {
  const canSpeak = isSpeechSynthesisAvailable()
  const canListen = isSpeechRecognitionAvailable()
  const isSecurePage = typeof window !== 'undefined' && window.isSecureContext

  return (
    <>
      {!canSpeak && (
        <p className="notice error">
          Ce navigateur ne sait pas lire à voix haute. Utilise Chrome, Edge ou Safari.
        </p>
      )}

      {!canListen && (
        <p className="notice">
          🎤 Le mode « Lire tout haut » a besoin de Chrome ou Edge (il ne marche pas sur Safari
          iPhone/iPad). Les modes Écouter et Dictée fonctionnent partout.
        </p>
      )}

      {canListen && !isSecurePage && (
        <p className="notice">
          🎤 Le micro est bloqué car la page n’est pas en HTTPS. Sur la tablette, ouvre l’adresse
          en <strong>https://…</strong> (commande <code>npm run tablette</code>).
        </p>
      )}
    </>
  )
}
