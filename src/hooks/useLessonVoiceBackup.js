import { useState } from 'react'
import {
  exportLessonVoiceBackupFile,
  importLessonVoiceBackupFile,
} from '../lib/backup/lessonVoiceBackupFile.js'

/**
 * Sauvegarde et restauration des lecons et des voix enregistrees, sous forme
 * d'un fichier que le parent range ou envoie lui-meme — independant du
 * navigateur et de l'appareil.
 */
export function useLessonVoiceBackup({ onLessonsImported }) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [problem, setProblem] = useState('')
  const [importSummary, setImportSummary] = useState('')

  const exportBackup = async () => {
    setProblem('')
    setIsExporting(true)
    try {
      await exportLessonVoiceBackupFile()
    } catch {
      setProblem('La sauvegarde a échoué. Réessaie.')
    } finally {
      setIsExporting(false)
    }
  }

  const importBackup = async (backupFile) => {
    setProblem('')
    setImportSummary('')
    setIsImporting(true)

    try {
      const result = await importLessonVoiceBackupFile(backupFile)

      if (!result.isReadable) {
        setProblem(result.problem)
        return
      }

      onLessonsImported(result.lessons)
      setImportSummary(
        `${result.importedLessonCount} leçon(s) et ${result.importedRecordingCount} voix importée(s).`
      )
    } catch {
      setProblem('La lecture du fichier a échoué. Réessaie.')
    } finally {
      setIsImporting(false)
    }
  }

  return { isExporting, isImporting, problem, importSummary, exportBackup, importBackup }
}
