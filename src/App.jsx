import { useCallback, useEffect, useMemo, useState } from 'react'
import { BUILT_IN_LESSONS } from './lib/lessons/builtInLessons.js'
import { EXERCISE_TYPE } from './lib/exerciseTypes.js'
import { stopSpeaking } from './lib/speech/speechSynthesisService.js'
import {
  deleteParentLesson,
  loadParentLessons,
  saveParentLesson,
} from './lib/storage/lessonRepository.js'
import { loadProgress, recordCompletedExercise } from './lib/storage/progressRepository.js'
import { loadSettings, saveSettings } from './lib/storage/settingsRepository.js'
import { requestPersistentStorage } from './lib/storage/persistentStorageRequest.js'
import { useSpeechPlayer } from './hooks/useSpeechPlayer.js'
import { useWordRecordings } from './hooks/useWordRecordings.js'
import { useLessonVoiceBackup } from './hooks/useLessonVoiceBackup.js'
import AppHeader from './components/AppHeader.jsx'
import DictationScreen from './components/DictationScreen.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import LessonEditorScreen from './components/LessonEditorScreen.jsx'
import LessonPickerScreen from './components/LessonPickerScreen.jsx'
import ListeningScreen from './components/ListeningScreen.jsx'
import ReadAloudScreen from './components/ReadAloudScreen.jsx'
import SettingsScreen from './components/SettingsScreen.jsx'
import VoiceStudioScreen from './components/VoiceStudioScreen.jsx'

/**
 * Racine de l'application : garde l'etat partage (lecon en cours, reglages,
 * etoiles) et decide quel ecran afficher. La navigation tient en une variable :
 * l'appli n'a qu'un seul niveau d'ecrans, tous accessibles depuis l'accueil.
 */

const SCREEN = {
  home: 'home',
  lessonPicker: 'lessonPicker',
  lessonEditor: 'lessonEditor',
  settings: 'settings',
  voiceStudio: 'voiceStudio',
  ...EXERCISE_TYPE,
}

const SCREEN_TITLES = {
  [SCREEN.home]: 'My English Helper',
  [SCREEN.lessonPicker]: 'Choisir une leçon',
  [SCREEN.lessonEditor]: 'Ajouter les devoirs',
  [SCREEN.settings]: 'Réglages',
  [SCREEN.voiceStudio]: 'Studio de voix',
  [SCREEN.listening]: 'Écouter',
  [SCREEN.readAloud]: 'Lire à voix haute',
  [SCREEN.dictation]: 'Dictée',
}

export default function App() {
  const [settings, setSettings] = useState(loadSettings)
  const [progress, setProgress] = useState(loadProgress)
  const [parentLessons, setParentLessons] = useState(loadParentLessons)
  const [currentScreen, setCurrentScreen] = useState(SCREEN.home)
  const [lessonBeingEdited, setLessonBeingEdited] = useState(null)
  const [selectedLessonId, setSelectedLessonId] = useState(
    () => loadParentLessons()[0]?.id ?? BUILT_IN_LESSONS[0].id
  )

  const { speechPlayer, englishVoices } = useSpeechPlayer(settings)
  const wordRecordings = useWordRecordings()
  const lessonVoiceBackup = useLessonVoiceBackup({ onLessonsImported: setParentLessons })

  useEffect(() => {
    requestPersistentStorage()
  }, [])

  const allLessons = useMemo(
    () => [...parentLessons, ...BUILT_IN_LESSONS],
    [parentLessons]
  )

  const selectedLesson = useMemo(
    () => allLessons.find((lesson) => lesson.id === selectedLessonId) ?? allLessons[0],
    [allLessons, selectedLessonId]
  )

  /** Changer d'ecran coupe toujours la lecture en cours. */
  const goToScreen = useCallback((screen) => {
    stopSpeaking()
    setCurrentScreen(screen)
  }, [])

  const goHome = useCallback(() => goToScreen(SCREEN.home), [goToScreen])

  const changeSettings = useCallback((changedValues) => {
    setSettings((previousSettings) => {
      const updatedSettings = { ...previousSettings, ...changedValues }
      saveSettings(updatedSettings)
      return updatedSettings
    })
  }, [])

  const rememberCompletedExercise = useCallback((completedExercise) => {
    setProgress(recordCompletedExercise(completedExercise))
  }, [])

  const openLessonEditor = useCallback(
    (lesson) => {
      setLessonBeingEdited(lesson)
      goToScreen(SCREEN.lessonEditor)
    },
    [goToScreen]
  )

  const saveLesson = useCallback(
    (lesson) => {
      setParentLessons(saveParentLesson(lesson))
      setSelectedLessonId(lesson.id)
      setLessonBeingEdited(null)
      goHome()
    },
    [goHome]
  )

  const deleteLesson = useCallback(
    (lesson) => {
      if (!window.confirm(`Supprimer « ${lesson.title} » ?`)) return

      const remainingLessons = deleteParentLesson(lesson.id)
      setParentLessons(remainingLessons)

      if (selectedLessonId === lesson.id) {
        setSelectedLessonId(remainingLessons[0]?.id ?? BUILT_IN_LESSONS[0].id)
      }
    },
    [selectedLessonId]
  )

  const exerciseProps = {
    lesson: selectedLesson,
    speechPlayer,
    settings,
    onExerciseCompleted: rememberCompletedExercise,
  }

  return (
    <div className="app">
      <AppHeader
        title={SCREEN_TITLES[currentScreen]}
        totalStars={progress.totalStars}
        onGoBack={currentScreen === SCREEN.home ? null : goHome}
        onOpenSettings={
          currentScreen === SCREEN.settings ? null : () => goToScreen(SCREEN.settings)
        }
      />

      <main className="screen">
        {currentScreen === SCREEN.home && (
          <HomeScreen
            lesson={selectedLesson}
            onChangeLesson={() => goToScreen(SCREEN.lessonPicker)}
            onAddLesson={() => openLessonEditor(null)}
            onStartExercise={goToScreen}
          />
        )}

        {currentScreen === SCREEN.lessonPicker && (
          <LessonPickerScreen
            parentLessons={parentLessons}
            builtInLessons={BUILT_IN_LESSONS}
            selectedLessonId={selectedLesson?.id}
            onSelectLesson={(lessonId) => {
              setSelectedLessonId(lessonId)
              goHome()
            }}
            onEditLesson={openLessonEditor}
            onDeleteLesson={deleteLesson}
            onAddLesson={() => openLessonEditor(null)}
          />
        )}

        {currentScreen === SCREEN.lessonEditor && (
          <LessonEditorScreen
            lesson={lessonBeingEdited}
            onSave={saveLesson}
            onCancel={goHome}
            wordRecordings={wordRecordings}
          />
        )}

        {currentScreen === SCREEN.listening && (
          <ListeningScreen
            lesson={selectedLesson}
            speechPlayer={speechPlayer}
            settings={settings}
            wordRecordings={wordRecordings}
          />
        )}

        {currentScreen === SCREEN.readAloud && <ReadAloudScreen {...exerciseProps} />}

        {currentScreen === SCREEN.dictation && <DictationScreen {...exerciseProps} />}

        {currentScreen === SCREEN.voiceStudio && <VoiceStudioScreen />}

        {currentScreen === SCREEN.settings && (
          <SettingsScreen
            onOpenVoiceStudio={() => goToScreen(SCREEN.voiceStudio)}
            settings={settings}
            englishVoices={englishVoices}
            activeVoice={speechPlayer.voice}
            speechPlayer={speechPlayer}
            progress={progress}
            onChangeSettings={changeSettings}
            onProgressCleared={setProgress}
            lessonVoiceBackup={lessonVoiceBackup}
          />
        )}
      </main>
    </div>
  )
}
