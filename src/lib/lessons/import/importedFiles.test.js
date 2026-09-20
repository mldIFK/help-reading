import { describe, expect, it } from 'vitest'
import {
  ACCEPTED_FILE_EXTENSIONS,
  FILE_KIND,
  LARGEST_ACCEPTED_FILE_BYTES,
  describeUnsupportedFile,
  recogniseFileKind,
} from './importedFiles.js'

describe('recogniseFileKind', () => {
  it('reconnaît un fichier texte', () => {
    expect(recogniseFileKind('devoirs.txt')).toBe(FILE_KIND.plainText)
    expect(recogniseFileKind('devoirs.md')).toBe(FILE_KIND.plainText)
  })

  it('reconnaît un tableau de vocabulaire', () => {
    expect(recogniseFileKind('vocabulaire.csv')).toBe(FILE_KIND.spreadsheet)
    expect(recogniseFileKind('vocabulaire.tsv')).toBe(FILE_KIND.spreadsheet)
  })

  it('reconnaît un PDF et un document Word', () => {
    expect(recogniseFileKind('lecture.pdf')).toBe(FILE_KIND.pdf)
    expect(recogniseFileKind('lecture.docx')).toBe(FILE_KIND.wordDocument)
  })

  it('ignore la casse de l’extension', () => {
    expect(recogniseFileKind('LECTURE.PDF')).toBe(FILE_KIND.pdf)
  })

  it('se fie à la dernière extension d’un nom qui en contient plusieurs', () => {
    expect(recogniseFileKind('anglais.semaine.3.txt')).toBe(FILE_KIND.plainText)
  })

  it('renvoie null pour un format non pris en charge', () => {
    expect(recogniseFileKind('ancien.doc')).toBeNull()
    expect(recogniseFileKind('sans-extension')).toBeNull()
  })

  // L'import de photos a ete retire : la reconnaissance de texte embarquee
  // n'etait pas fiable. Une image reste donc un format non pris en charge,
  // quelle que soit son extension ou le type declare par le systeme.
  it('refuse toujours une image, quel que soit son format', () => {
    expect(recogniseFileKind('cahier.jpg')).toBeNull()
    expect(recogniseFileKind('cahier.png')).toBeNull()
    expect(recogniseFileKind('cahier.webp')).toBeNull()
    expect(recogniseFileKind('photo.heic')).toBeNull()
    expect(recogniseFileKind('cahier.jfif', 'image/jpeg')).toBeNull()
    expect(recogniseFileKind('capture', 'image/png')).toBeNull()
  })

  it('laisse l’extension décider quand elle est connue', () => {
    expect(recogniseFileKind('devoirs.pdf', 'application/pdf')).toBe(FILE_KIND.pdf)
    expect(recogniseFileKind('devoirs.txt', 'text/plain')).toBe(FILE_KIND.plainText)
  })

  it('refuse toujours ce qui n’est pas un document reconnu', () => {
    expect(recogniseFileKind('musique.mp3', 'audio/mpeg')).toBeNull()
    expect(recogniseFileKind('archive.zip', 'application/zip')).toBeNull()
  })
})

describe('describeUnsupportedFile', () => {
  it('oriente vers le bon format pour un ancien document Word', () => {
    expect(describeUnsupportedFile('ancien.doc')).toMatch(/\.docx/i)
  })

  it('reste compréhensible pour un format inconnu', () => {
    expect(describeUnsupportedFile('archive.zip').length).toBeGreaterThan(0)
  })

  it('explique qu’une photo n’est plus prise en charge', () => {
    expect(describeUnsupportedFile('photo.jpg')).toMatch(/format non pris en charge/i)
  })
})

describe('ACCEPTED_FILE_EXTENSIONS', () => {
  it('décrit tous les formats reconnus, pour le sélecteur de fichier', () => {
    ACCEPTED_FILE_EXTENSIONS.split(',').forEach((extension) => {
      expect(recogniseFileKind(`fichier${extension.trim()}`)).not.toBeNull()
    })
  })
})

describe('LARGEST_ACCEPTED_FILE_BYTES', () => {
  it('laisse passer un devoir ordinaire tout en bornant la mémoire', () => {
    expect(LARGEST_ACCEPTED_FILE_BYTES).toBeGreaterThan(1_000_000)
    expect(LARGEST_ACCEPTED_FILE_BYTES).toBeLessThanOrEqual(25_000_000)
  })
})
