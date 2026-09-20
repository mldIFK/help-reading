/**
 * Fabrique le dictionnaire de prononciation britannique utilise par la voix
 * enregistree, a partir du paquet `ipa-dict`.
 *
 * Le paquet source pese 160 Mo et couvre des dizaines de langues : il reste une
 * dependance de developpement, et seul le resultat — un fichier texte compact —
 * est servi a l'application.
 *
 * Le dictionnaire d'origine ignore une partie des mots les plus frequents
 * (« the », « a », « I », « mother », les jours de la semaine). Ils sont
 * completes ici a la main, en prononciation britannique.
 */

import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const destination = join(projectRoot, 'public', 'pronunciation', 'en-GB.txt')

const ZERO_WIDTH_JOINER = '‍'
const LENGTH_MARK = 'ː'
const SYMBOLS_TO_IGNORE = new Set(['/', 'ˈ', 'ˌ', '.', ' ', '-', ZERO_WIDTH_JOINER])

/**
 * Sons admis. Tout mot contenant autre chose est ecarte plutot que de faire
 * reposer la lecture sur un son que personne n'aura enregistre.
 */
const KNOWN_PHONEMES = new Set([
  'p', 'b', 't', 'd', 'k', 'ɡ', 'tʃ', 'dʒ', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ',
  'h', 'm', 'n', 'ŋ', 'l', 'ɹ', 'w', 'j',
  'ɪ', 'ɛ', 'æ', 'ʌ', 'ɒ', 'ʊ', 'ə', 'i', 'ɐ',
  'iː', 'ɑː', 'ɔː', 'uː', 'ɜː',
  'eɪ', 'aɪ', 'ɔɪ', 'əʊ', 'aʊ', 'iə', 'eə',
])

/** Sequences que le dictionnaire soude, mais qui s'enregistrent separement. */
const SEQUENCES_TO_SPLIT = { 'əl': ['ə', 'l'], 'ən': ['ə', 'n'], 'əm': ['ə', 'm'] }

/**
 * Mots frequents absents du dictionnaire source, transcrits a la main en
 * prononciation britannique.
 */
const HAND_WRITTEN_PRONUNCIATIONS = {
  a: 'ə', the: 'ð ə', i: 'aɪ', am: 'æ m', are: 'ɑː', do: 'd uː', does: 'd ʌ z',
  have: 'h æ v', has: 'h æ z', had: 'h æ d', no: 'n əʊ', yes: 'j ɛ s',
  house: 'h aʊ s', live: 'l ɪ v', lives: 'l ɪ v z', mother: 'm ʌ ð ə',
  father: 'f ɑː ð ə', mouse: 'm aʊ s', mouth: 'm aʊ θ', evening: 'iː v n ɪ ŋ',
  morning: 'm ɔː n ɪ ŋ', fine: 'f aɪ n', france: 'f ɹ ɑː n s',
  monday: 'm ʌ n d eɪ', tuesday: 't j uː z d eɪ', wednesday: 'w ɛ n z d eɪ',
  thursday: 'θ ɜː z d eɪ', friday: 'f ɹ aɪ d eɪ', saturday: 's æ t ə d eɪ',
  sunday: 's ʌ n d eɪ', today: 't ə d eɪ', tomorrow: 't ə m ɒ ɹ əʊ',
  lucy: 'l uː s i', mia: 'm iː ə',
  is: 'ɪ z', it: 'ɪ t', in: 'ɪ n', on: 'ɒ n', at: 'æ t', to: 't uː', of: 'ɒ v',
  and: 'æ n d', you: 'j uː', your: 'j ɔː', he: 'h iː', she: 'ʃ iː', we: 'w iː',
  they: 'ð eɪ', me: 'm iː', my: 'm aɪ', her: 'h ɜː', his: 'h ɪ z',
  this: 'ð ɪ s', that: 'ð æ t', with: 'w ɪ ð', very: 'v ɛ ɹ i',
  not: 'n ɒ t', can: 'k æ n', will: 'w ɪ l', was: 'w ɒ z', were: 'w ɜː',
  be: 'b iː', like: 'l aɪ k', likes: 'l aɪ k s', go: 'ɡ əʊ', goes: 'ɡ əʊ z',
  every: 'ɛ v ɹ i', day: 'd eɪ', old: 'əʊ l d', years: 'j iə z', name: 'n eɪ m',
}

function splitTranscription(transcription) {
  const phonemes = []

  for (let position = 0; position < transcription.length; position += 1) {
    const character = transcription[position]
    if (SYMBOLS_TO_IGNORE.has(character)) continue

    let phoneme = character
    if (transcription[position + 1] === ZERO_WIDTH_JOINER) {
      phoneme = character + transcription[position + 2]
      position += 2
    } else if (transcription[position + 1] === LENGTH_MARK) {
      phoneme = character + LENGTH_MARK
      position += 1
    }

    const split = SEQUENCES_TO_SPLIT[phoneme]
    if (split) phonemes.push(...split)
    else phonemes.push(phoneme)
  }

  return phonemes
}

const isWritableWord = (word) => /^[a-z'-]+$/.test(word)

function buildDictionary() {
  // Chemin direct plutot que nom de paquet : `ipa-dict` restreint ses
  // sous-chemins par son champ `exports`, alors que seul ce fichier nous sert.
  const source = require(join(projectRoot, 'node_modules', 'ipa-dict', 'lib', 'en_UK.js'))
  const pronunciations = new Map()
  let skipped = 0

  for (const [word, transcriptions] of source) {
    const normalisedWord = word.toLowerCase()
    if (!isWritableWord(normalisedWord) || pronunciations.has(normalisedWord)) continue

    const phonemes = splitTranscription(transcriptions[0])
    if (phonemes.length === 0 || !phonemes.every((phoneme) => KNOWN_PHONEMES.has(phoneme))) {
      skipped += 1
      continue
    }

    pronunciations.set(normalisedWord, phonemes.join(' '))
  }

  // Les transcriptions ecrites a la main font autorite sur celles du paquet.
  // Elles sont verifiees : une faute de frappe sur un symbole produirait un mot
  // que personne ne pourrait prononcer, faute d'avoir enregistre ce son.
  for (const [word, phonemes] of Object.entries(HAND_WRITTEN_PRONUNCIATIONS)) {
    const unknown = phonemes.split(' ').filter((phoneme) => !KNOWN_PHONEMES.has(phoneme))
    if (unknown.length > 0) {
      throw new Error(
        `Transcription manuscrite de « ${word} » : son inconnu ${unknown.join(', ')}. ` +
          'Utilise uniquement les symboles de KNOWN_PHONEMES.'
      )
    }

    pronunciations.set(word, phonemes)
  }

  return { pronunciations, skipped }
}

const { pronunciations, skipped } = buildDictionary()

const lines = [...pronunciations]
  .sort(([firstWord], [secondWord]) => firstWord.localeCompare(secondWord))
  .map(([word, phonemes]) => `${word}\t${phonemes}`)

await mkdir(dirname(destination), { recursive: true })
await writeFile(destination, lines.join('\n'), 'utf8')

console.log(`[prononciation] ${pronunciations.size} mots ecrits (${skipped} ecartes)`)
