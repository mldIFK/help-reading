/** Bandeau permanent : ou l'on est, combien d'etoiles, comment revenir. */
export default function AppHeader({ title, totalStars, onGoBack, onOpenSettings }) {
  return (
    <header className="topbar">
      {onGoBack && (
        <button className="btn ghost icon" onClick={onGoBack} aria-label="Revenir à l’accueil">
          ⬅️
        </button>
      )}

      <h1>{title}</h1>

      <div className="stars" aria-label={`${totalStars} étoiles gagnées`}>
        ⭐ {totalStars}
      </div>

      {onOpenSettings && (
        <button className="btn ghost icon" onClick={onOpenSettings} aria-label="Réglages">
          ⚙️
        </button>
      )}
    </header>
  )
}
