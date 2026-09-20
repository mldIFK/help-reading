import { describe, expect, it } from 'vitest'
import { FILE_KIND } from './importedFiles.js'
import { recogniseFileKindFromSignature } from './fileSignatures.js'

/** Construit les premiers octets d'un fichier, comme le ferait une lecture. */
const bytes = (...values) => new Uint8Array(values)
const asciiBytes = (text) => new Uint8Array([...text].map((character) => character.charCodeAt(0)))

describe('recogniseFileKindFromSignature', () => {
  // L'import de photos a ete retire : une image reste non reconnue, meme a la
  // lecture de ses premiers octets.
  it('ne reconnaît pas une image', () => {
    expect(recogniseFileKindFromSignature(bytes(0xff, 0xd8, 0xff, 0xe0))).toBeNull() // JPEG
    expect(
      recogniseFileKindFromSignature(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))
    ).toBeNull() // PNG
  })

  it('reconnaît un PDF', () => {
    expect(recogniseFileKindFromSignature(asciiBytes('%PDF-1.4'))).toBe(FILE_KIND.pdf)
  })

  it('reconnaît un document Word, qui est une archive', () => {
    expect(recogniseFileKindFromSignature(bytes(0x50, 0x4b, 0x03, 0x04))).toBe(
      FILE_KIND.wordDocument
    )
  })

  it('reconnaît un texte brut, même sans extension', () => {
    expect(recogniseFileKindFromSignature(asciiBytes('cat = chat\ndog = chien'))).toBe(
      FILE_KIND.plainText
    )
  })

  it('reconnaît un texte accentué encodé en UTF-8', () => {
    expect(recogniseFileKindFromSignature(new TextEncoder().encode('chat = félin'))).toBe(
      FILE_KIND.plainText
    )
  })

  it('ne prend pas des données binaires pour du texte', () => {
    expect(recogniseFileKindFromSignature(bytes(0x00, 0x01, 0x02, 0x00, 0xff, 0xfe))).toBeNull()
  })

  it('renvoie null pour un fichier vide', () => {
    expect(recogniseFileKindFromSignature(bytes())).toBeNull()
    expect(recogniseFileKindFromSignature(undefined)).toBeNull()
  })
})
