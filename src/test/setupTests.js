import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom n'implemente pas `Blob.text()`, pourtant disponible dans tous les
// navigateurs vises. On la comble ici, et ici seulement : le code de
// l'application doit rester ecrit avec l'API standard.
if (typeof Blob !== 'undefined' && typeof Blob.prototype.text !== 'function') {
  Blob.prototype.text = function readBlobAsText() {
    return readBlobWith('readAsText', this).then(String)
  }
}

if (typeof Blob !== 'undefined' && typeof Blob.prototype.arrayBuffer !== 'function') {
  Blob.prototype.arrayBuffer = function readBlobAsArrayBuffer() {
    return readBlobWith('readAsArrayBuffer', this)
  }
}

function readBlobWith(readerMethod, blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader[readerMethod](blob)
  })
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
