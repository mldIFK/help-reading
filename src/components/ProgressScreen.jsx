import { EXERCISE_TYPE } from '../lib/exerciseTypes.js'
import { clearProgress } from '../lib/storage/progressRepository.js'

/**
 * Synthese du progres : etoiles gagnees et derniers exercices reussis.
 *
 * Ecran a part, atteint directement depuis le compteur d'etoiles du bandeau :
 * l'enfant doit pouvoir voir sa recompense sans passer par les reglages du
 * parent.
 */

const EXERCISES_SHOWN_IN_HISTORY = 8

export default function ProgressScreen({ progress, onProgressCleared }) {
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
