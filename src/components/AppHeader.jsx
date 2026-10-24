/** Bandeau permanent : ou l'on est, combien d'etoiles, comment revenir. */
export default function AppHeader({ title, totalStars, onGoBack, onOpenProgress, onOpenSettings }) {
  return (
    <header className="topbar">
      {onGoBack && (
        <button className="btn ghost icon" onClick={onGoBack} aria-label="Revenir à l’accueil">
          ⬅️
        </button>
      )}

      <h1>{title}</h1>

      {onOpenProgress ? (
        <button
          className="stars"
          onClick={onOpenProgress}
          aria-label={`${totalStars} étoiles gagnées, voir le progrès`}
        >
          ⭐ {totalStars}
        </button>
      ) : (
        <div className="stars" aria-label={`${totalStars} étoiles gagnées`}>
          ⭐ {totalStars}
        </div>
      )}

      {onOpenSettings && (
        <button className="btn ghost icon" onClick={onOpenSettings} aria-label="Réglages">
          ⚙️
        </button>
      )}
    </header>
  )
}
