/**
 * Partition de lecture : la forme du texte dont l'ecran de lecture a besoin.
 *
 * Le texte est regroupe en phrases (l'unite que la synthese vocale prononce le
 * plus naturellement) et chaque mot recoit un numero continu sur l'ensemble du
 * texte. Un seul numero suffit alors pour savoir quel mot surligner, quel que
 * soit le mode de lecture choisi.
 */

import { TOKEN_KIND, splitIntoSentences, splitIntoTokens } from './textSegmentation.js'

export function buildReadingScript(text) {
  const spokenWords = []

  const sentences = splitIntoSentences(text).map((sentenceText) => ({
    text: sentenceText,
    tokens: splitIntoTokens(sentenceText).map((token) => {
      if (token.kind !== TOKEN_KIND.word) return token

      const tokenWithContinuousIndex = { ...token, wordIndex: spokenWords.length }
      spokenWords.push(token.text)
      return tokenWithContinuousIndex
    }),
  }))

  return { sentences, spokenWords }
}

/**
 * Retrouve le mot prononce a une position donnee dans la phrase.
 *
 * La synthese vocale signale sa progression par un numero de caractere ; cette
 * fonction le traduit en numero de mot pour deplacer le surlignage.
 */
export function findWordIndexAtCharacter(sentence, characterPosition) {
  const wordTokens = sentence.tokens.filter((token) => token.kind === TOKEN_KIND.word)
  if (wordTokens.length === 0) return null

  const startedWords = wordTokens.filter((token) => token.startOffset <= characterPosition)
  const currentWord = startedWords.at(-1) ?? wordTokens[0]

  return currentWord.wordIndex
}
