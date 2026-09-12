/**
 * Les trois exercices de l'application.
 *
 * Ces identifiants nomment a la fois l'ecran affiche et le type d'exercice
 * enregistre dans l'historique : ils doivent rester stables, d'anciens
 * enregistrements y font reference.
 */

export const EXERCISE_TYPE = {
  listening: 'listening',
  readAloud: 'readAloud',
  dictation: 'dictation',
}

export const EXERCISES = [
  {
    type: EXERCISE_TYPE.listening,
    emoji: '🔊',
    name: 'Écouter',
    hint: 'Entendre les mots et le texte',
    needsMicrophone: false,
  },
  {
    type: EXERCISE_TYPE.readAloud,
    emoji: '🎤',
    name: 'Lire tout haut',
    hint: 'Je lis, l’appli me corrige',
    needsMicrophone: true,
  },
  {
    type: EXERCISE_TYPE.dictation,
    emoji: '✍️',
    name: 'Dictée',
    hint: 'J’écoute et j’écris',
    needsMicrophone: false,
  },
]
