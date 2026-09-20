import { useRef, useState } from 'react'
import { FILE_PICKER_ACCEPT } from '../lib/lessons/import/importedFiles.js'
import {
  FileImportError,
  extractTextFromFile,
} from '../lib/lessons/import/fileTextExtraction.js'
import { buildLessonFromImport } from '../lib/lessons/import/lessonFromImport.js'

/**
 * Zone d'import d'un fichier de devoirs, par clic ou par glisser-deposer.
 *
 * Le fichier n'est jamais enregistre tel quel : il remplit les champs de
 * l'editeur, que le parent relit avant de valider.
 */

export default function LessonImportField({ onLessonImported }) {
  const [isFileOverTheZone, setIsFileOverTheZone] = useState(false)
  const [isReadingFile, setIsReadingFile] = useState(false)
  const [problem, setProblem] = useState('')
  const [warnings, setWarnings] = useState([])
  const fileFieldRef = useRef(null)

  const importFile = async (file) => {
    if (!file) return

    setProblem('')
    setWarnings([])
    setIsReadingFile(true)

    try {
      const text = await extractTextFromFile(file)

      const { lesson, warnings: importWarnings } = buildLessonFromImport({
        fileName: file.name,
        text,
      })

      setWarnings(importWarnings)
      onLessonImported(lesson)
    } catch (error) {
      setProblem(
        error instanceof FileImportError
          ? error.message
          : `Ce fichier n’a pas pu être lu (${error.message}).`
      )
    } finally {
      setIsReadingFile(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsFileOverTheZone(false)
    importFile(event.dataTransfer.files[0])
  }

  return (
    <section className="card import-zone-holder">
      <h2 className="section">📂 Importer un fichier</h2>

      <div
        data-testid="import-drop-zone"
        className={`import-zone ${isFileOverTheZone ? 'hovered' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsFileOverTheZone(true)
        }}
        onDragLeave={() => setIsFileOverTheZone(false)}
        onDrop={handleDrop}
      >
        <p className="import-zone-hint">
          Dépose ici le fichier des devoirs, ou choisis-le sur l’appareil.
          <br />
          <span className="muted">
            Texte, tableau, PDF ou Word&nbsp;:
            <br />
            .txt, .md, .csv, .tsv, .pdf, .docx
          </span>
        </p>

        <button
          className="btn"
          type="button"
          onClick={() => fileFieldRef.current?.click()}
          disabled={isReadingFile}
        >
          {isReadingFile ? '⏳ Lecture…' : '📄 Choisir un fichier'}
        </button>

        <input
          ref={fileFieldRef}
          type="file"
          accept={FILE_PICKER_ACCEPT}
          className="visually-hidden"
          aria-label="Choisir le fichier des devoirs"
          onChange={(event) => {
            importFile(event.target.files[0])
            // Permet de réimporter le même fichier après une correction.
            event.target.value = ''
          }}
        />
      </div>

      {problem && <p className="notice error">{problem}</p>}

      {warnings.map((warning) => (
        <p className="notice" key={warning}>
          {warning}
        </p>
      ))}
    </section>
  )
}
