/**
 * Choix de la lecon.
 *
 * Les devoirs saisis par le parent sont presentes a part, et sont les seuls a
 * pouvoir etre modifies ou supprimes : les lecons livrees avec l'application
 * restent toujours disponibles.
 */
export default function LessonPickerScreen({
  parentLessons,
  builtInLessons,
  selectedLessonId,
  onSelectLesson,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
}) {
  return (
    <>
      {parentLessons.length > 0 && (
        <section className="card">
          <h2 className="section">📝 Mes devoirs</h2>
          <div className="lesson-list">
            {parentLessons.map((lesson) => (
              <LessonTile
                key={lesson.id}
                lesson={lesson}
                isSelected={lesson.id === selectedLessonId}
                onSelect={onSelectLesson}
                onEdit={onEditLesson}
                onDelete={onDeleteLesson}
              />
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h2 className="section">📚 Leçons de l’appli</h2>
        <div className="lesson-list">
          {builtInLessons.map((lesson) => (
            <LessonTile
              key={lesson.id}
              lesson={lesson}
              isSelected={lesson.id === selectedLessonId}
              onSelect={onSelectLesson}
            />
          ))}
        </div>
      </section>

      <div className="row center">
        <button className="btn" onClick={onAddLesson}>
          ➕ Nouvelle leçon
        </button>
      </div>
    </>
  )
}

function LessonTile({ lesson, isSelected, onSelect, onEdit, onDelete }) {
  const canBeModified = Boolean(onEdit && onDelete)

  return (
    <div className="lesson-tile-holder">
      <button
        className={`lesson-tile ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(lesson.id)}
        aria-current={isSelected}
      >
        <span className="emoji">{lesson.emoji ?? '📚'}</span>
        <span className="title">{lesson.title}</span>
        <span className="sub">{lesson.subtitle}</span>
      </button>

      {canBeModified && (
        <>
          <button
            className="tile-action tile-action-edit"
            onClick={() => onEdit(lesson)}
            aria-label={`Modifier la leçon ${lesson.title}`}
          >
            ✏️
          </button>
          <button
            className="tile-action tile-action-delete"
            onClick={() => onDelete(lesson)}
            aria-label={`Supprimer la leçon ${lesson.title}`}
          >
            🗑️
          </button>
        </>
      )}
    </div>
  )
}
