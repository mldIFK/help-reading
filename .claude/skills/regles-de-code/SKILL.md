---
name: regles-de-code
description: Règles obligatoires pour toute modification du code de help-reading — TDD (test écrit AVANT le code), nommage fonctionnel sans abréviation, clean code, architecture en couches. À charger AVANT d'écrire ou de modifier le moindre fichier du projet : nouvelle fonctionnalité, correction de bug, refactorisation, ajout de leçon, changement de style. Contient aussi les pièges techniques déjà rencontrés (regex unicode, voix distantes, HTTPS du micro, clés de stockage versionnées).
---

# Règles de code — help-reading

Ce projet est destiné à durer et à être repris par des développeurs humains.
Le code lisible passe avant le code court, et avant le code rapide à écrire.

**Ces règles ne sont pas des suggestions.** Si l'une d'elles empêche de faire ce
qui est demandé, il faut le dire explicitement à l'utilisateur — pas la contourner
en silence.

---

## 1. TDD — le test d'abord, sans exception

Le cycle, pour chaque comportement ajouté ou modifié :

1. **Écrire le test** qui décrit le comportement attendu.
2. **Le lancer et le voir échouer** (`npm test`). Un test qui passe du premier
   coup avant d'avoir écrit le code ne teste rien.
3. **Écrire le code minimal** qui le fait passer.
4. **Nettoyer** le code, en gardant les tests verts.

### Ce qui compte comme « fait »

- Une correction de bug commence par **un test qui reproduit le bug**.
- Une fonctionnalité n'est pas terminée tant que son comportement n'est pas
  couvert.
- Ne jamais annoncer « c'est terminé » sans avoir lancé `npm test` et montré le
  résultat réel. Si des tests échouent, le dire avec la sortie.

### Le garde-fou mécanique

Un hook git (`.githooks/pre-commit`) **refuse tout commit** tant qu'un test
échoue. Il est activé par `core.hooksPath`, que le script `prepare` de
`package.json` rearme automatiquement à chaque `npm install`.

Conséquences à respecter :

- **Ne jamais utiliser `git commit --no-verify`**, ni désactiver `core.hooksPath`,
  ni supprimer le test gênant pour faire passer un commit. Un commit refusé est
  une information, pas un obstacle : le code n'est pas prêt.
- Si le hook bloque, la seule issue est de corriger le code ou le test.
- Le hook a besoin de `node_modules` : après un clone, faire `npm install` avant
  le premier commit.

### Ce qu'un test doit dire

Le nom du test décrit un **comportement observable**, en vocabulaire métier,
jamais l'implémentation.

```js
// Oui — on comprend la règle métier sans lire le code
it('marks a skipped word as missing and keeps the other words correct', ...)
it('ne récompense pas un mot révélé avant d’être écrit', ...)
it('survit à un stockage corrompu au lieu de faire planter l’application', ...)

// Non — décrit la mécanique, ne survivra pas à une refactorisation
it('returns the correct array', ...)
it('calls alignWords with two arguments', ...)
it('works', ...)
```

Les `describe` portent le nom de la fonction publique testée. Les noms de tests
sont en anglais dans `src/lib` (le domaine est l'anglais scolaire, ça se lit comme
une phrase) ; le français est accepté s'il est plus clair.

### Quoi tester, et jusqu'où

| Couche | Testée ? | Comment |
|---|---|---|
| `src/lib/**` — logique pure | **Toujours, exhaustivement** | Tests unitaires, sans navigateur |
| `src/components/**` portant des règles | **Oui** | `@testing-library/react`, on simule un vrai usage |
| `src/components/**` purement présentationnel | Non | Le test n'apprendrait rien |
| `src/lib/speech/*Service.js` | Non (APIs navigateur) | Vérification manuelle dans le navigateur |

Toujours inclure les cas limites : entrée vide, entrée absente (`null`/`undefined`),
stockage corrompu, liste à un seul élément, division par zéro.

Ne jamais tester via les détails internes (état React, fonctions privées) : on
teste par ce que l'utilisateur voit et par les valeurs retournées.

---

## 2. Nommage — fonctionnel, entier, explicite

### Interdits absolus

| Interdit | Exemples réellement supprimés de ce projet |
|---|---|
| Abréviations | `dp`, `gi`, `exp`, `got`, `re`, `ctrl`, `idx`, `ms` (seul `Ms` en suffixe d'unité est admis) |
| Lettres seules | `n`, `m`, `b`, `t`, `l`, `i`, `j`, `e` — **sauf** `index`/`position` explicites |
| Noms passe-partout | `data`, `item`, `value`, `result`, `handle`, `temp`, `obj`, `info`, `utils`, `helpers`, `manager` |
| Booléen sans verbe | `active` → `isPlaying`, `revealed` → `wasRevealed`, `translation` → `showFrenchTranslation` |
| Nombre magique | `0.35`, `50`, `350` posés dans le code → constante nommée en haut du fichier |

### Ce qu'on écrit à la place

```js
// Avant                          // Après
dp[i][j]                          cheapestCost[expectedIndex][heardIndex]
const exp = ..., got = ...        const comparableExpectedWords, comparableHeardWords
token.gi                          token.wordIndex
speaker.say(text, {slow})         speechPlayer.speak(text, { slowly })
status: 'ok' | 'close' | 'wrong'  WORD_PRONUNCIATION.correct | almost | incorrect
if (d <= 2)                       if (editCount <= TOLERATED_EDITS_ON_LONG_WORD)
```

### Règles de forme

- **Fonctions** : un verbe. `scorePronunciation`, `listDictationWords`,
  `findWordIndexAtCharacter`. Les prédicats commencent par `is`/`has`/`can`/`was`.
- **Fichiers** : le nom dit le rôle, au singulier métier —
  `pronunciationScoring.js`, pas `scoreUtils.js`.
- **Constantes** : `SCREAMING_SNAKE_CASE`, et le nom porte l'unité quand il y en a
  une (`PAUSE_BETWEEN_SENTENCES_MS`, `SHORTEST_WORD_WORTH_DICTATING`).
- **Un nom long et juste bat un nom court et vague.** `comparableExpectedWords`
  est préférable à `words`.

---

## 3. Clean code

- **Une fonction, une responsabilité.** Si on doit écrire « et » pour la décrire,
  elle en fait deux.
- **Pas plus d'un niveau d'abstraction par fonction.** Une fonction qui orchestre
  ne manipule pas d'index en même temps.
- **Retour tôt** plutôt qu'imbrication : `if (!lesson) return []` en tête.
- **Pas de paramètre booléen positionnel.** `speak(text, { slowly: true })`, jamais
  `speak(text, true)`.
- **Pas de duplication tolérée à la troisième occurrence.** Le hook
  `useCancellableSpeechSequence` existe parce que la même boucle d'annulation
  était recopiée dans trois composants.
- **Composants React** : au-delà d'environ 150 lignes ou de deux responsabilités
  visuelles, découper (`ListeningScreen` → `VocabularyFlashcards` +
  `ReadingTextPlayer`).

### Commentaires

Un commentaire explique **pourquoi**, jamais **quoi** — le code dit déjà le quoi.

```js
// Non : paraphrase le code
// Incrémente la position
position += 1

// Oui : explique une décision non devinable
// Sauter un mot coûte un peu moins cher que le confondre avec un autre : face à
// une lecture incomplète, on préfère conclure « mot oublié » plutôt que
// « mot mal prononcé ».
const ALIGNMENT_COST = { ... }
```

Chaque module commence par un bloc qui dit son rôle et la raison de son existence.

Commentaires et messages d'interface en **français**. Les fichiers sont en UTF-8,
les accents sont donc permis ; garder un fichier cohérent avec lui-même et ne pas
lancer de réécriture de masse pour cette seule raison.

---

## 4. Architecture — trois couches, une seule direction

```
components/  ──►  hooks/  ──►  lib/speech, lib/storage  ──►  API du navigateur
                              lib/text, lib/scoring, lib/lessons  (pur, testable)
```

**Règle de dépendance : les flèches ne remontent jamais.**

- Un composant **n'appelle jamais** `speechSynthesis`, `localStorage`,
  `SpeechRecognition` ou `window.*` directement. Il passe par `lib/` ou un hook.
- `lib/text`, `lib/scoring`, `lib/lessons` sont **purs** : aucune référence à
  React, au DOM ou au navigateur. C'est ce qui les rend testables sans jsdom — ne
  jamais y introduire de dépendance.
- `lib/` ne connaît pas `components/`.
- Une règle métier (barème, tolérance, seuil) vit dans `lib/`, jamais dans un
  composant.

Avant d'ajouter un fichier, chercher la couche à laquelle il appartient. S'il
n'en a pas, c'est probablement qu'il fait deux choses.

---

## 5. Pièges déjà rencontrés dans ce projet

- **Regex avec caractères unicode** : écrire les échappements `\u00C0-\u024F`, `\u0300-\u036f`, `\u2019` — jamais les caractères littéraux. Les marques combinantes sont
  invisibles dans un éditeur et se corrompent silencieusement.
- **Pas de `<StrictMode>`** dans `main.jsx` : son double montage en développement
  déclencherait deux fois les lectures audio. Ne pas le remettre.
- **Le micro exige HTTPS** (ou `localhost`). Toute évolution du mode « Lire tout
  haut » doit être vérifiée via `npm run tablette`, pas seulement sur localhost.
- **Les voix distantes (Google) n'émettent pas d'événement `onboundary`.** Tout
  surlignage mot à mot doit garder un fonctionnement dégradé sans cet événement.
- **Clés de `localStorage` versionnées** (`helpReading.settings.v1`). Changer la
  forme des données stockées impose une nouvelle clé `.v2` **et** la lecture des
  anciennes, sinon on efface le travail déjà fait par l'enfant.
- **`speechSynthesis` s'interrompt après ~15 s sur Chrome** : le ping
  `pause()/resume()` de `speechSynthesisService.js` n'est pas décoratif.
- **Ne jamais casser un exercice pour en réparer un autre.** Les trois modes
  partagent `lib/` : une modification de `pronunciationScoring` ou de
  `textSegmentation` se répercute partout — lancer toute la suite, pas un fichier.

---

## 6. Avant d'annoncer que c'est terminé

```bash
npm test          # tout doit être vert, sortie à l'appui
npm run build     # doit passer
```

Puis, pour tout changement visible : **vérifier dans le navigateur réel**
(`npm run dev`), et vérifier l'absence d'erreur dans la console.

Checklist finale :

- [ ] Chaque comportement nouveau ou corrigé a son test, écrit avant le code
- [ ] `npm test` et `npm run build` passent, résultat montré
- [ ] Aucune abréviation, aucune lettre seule, aucun nom passe-partout introduit
- [ ] Aucun nombre magique introduit
- [ ] Aucun composant n'appelle une API du navigateur directement
- [ ] Les fichiers remplacés ont été supprimés, pas laissés à côté
- [ ] `LISEZ-MOI.md` mis à jour si la structure ou l'usage a changé
- [ ] Ce qui n'a pas pu être vérifié est dit explicitement (ex. le micro, qui
      demande une autorisation de l'utilisateur)

---

## Commandes

```bash
npm run dev            # développement sur localhost
npm run tablette       # HTTPS + réseau local (obligatoire pour tester le micro)
npm test               # suite complète
npm run test:watch     # relance à chaque modification
npm run build          # vérification de compilation
```
