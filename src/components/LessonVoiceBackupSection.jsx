import { useRef } from 'react'

/**
 * Sauvegarde et partage des lecons et des voix enregistrees, sous forme d'un
 * fichier. Sert deux usages : se proteger d'un nettoyage du navigateur, et
 * transmettre une lecon a un autre parent ou a la maitresse sans backend.
 */
export default function LessonVoiceBackupSection({ lessonVoiceBackup }) {
  const backupFileFieldRef = useRef(null)

  return (
    <section className="card">
      <h2 className="section">💾 Sauvegarde et partage</h2>
      <p className="muted">
        Enregistre un fichier contenant les leçons ajoutées et les voix enregistrées. Range-le où tu
        veux (ordinateur, clé USB, mail) : il permet de tout retrouver sur cet appareil après un
        nettoyage du navigateur, ou de transmettre une leçon à un autre parent ou à la maîtresse.
      </p>

      <div className="row">
        <button
          className="btn"
          onClick={lessonVoiceBackup.exportBackup}
          disabled={lessonVoiceBackup.isExporting}
        >
          {lessonVoiceBackup.isExporting ? '⏳ Préparation…' : '⬇️ Sauvegarder dans un fichier'}
        </button>

        <button
          className="btn ghost"
          type="button"
          onClick={() => backupFileFieldRef.current?.click()}
          disabled={lessonVoiceBackup.isImporting}
        >
          {lessonVoiceBackup.isImporting ? '⏳ Import…' : '⬆️ Importer un fichier'}
        </button>

        <input
          ref={backupFileFieldRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          aria-label="Choisir le fichier de sauvegarde"
          onChange={(event) => {
            const backupFile = event.target.files[0]
            if (backupFile) lessonVoiceBackup.importBackup(backupFile)
            event.target.value = ''
          }}
        />
      </div>

      {lessonVoiceBackup.problem && <p className="notice error">{lessonVoiceBackup.problem}</p>}
      {lessonVoiceBackup.importSummary && <p className="notice">{lessonVoiceBackup.importSummary}</p>}
    </section>
  )
}
