# My English Helper 🇬🇧

Petite application pour aider un enfant de primaire à faire ses devoirs d'anglais :
**écouter la bonne prononciation, s'entraîner à lire à voix haute, et faire des dictées.**

Tout fonctionne avec les voix et le micro du navigateur : **aucun compte, aucun
abonnement, aucune clé API**, et rien ne sort de l'appareil.

---

## 1. Lancer l'application

Ouvrir un terminal dans ce dossier, puis :

```bash
npm install     # une seule fois
npm run dev     # démarre l'appli
```

Ouvrir ensuite l'adresse affichée (en général http://localhost:5173).

### Depuis la tablette ou le téléphone de votre fille

```bash
npm run tablette
```

Le terminal affiche alors une adresse « Network » du type `https://192.168.1.20:5173`.
Tapez cette adresse dans le navigateur de la tablette (les deux appareils doivent
être sur le même wifi).

> ⚠️ Le navigateur affichera un avertissement de sécurité (« connexion non privée »).
> C'est normal : le certificat est auto-signé et local. Cliquez sur
> **Paramètres avancés → Continuer**.
>
> Cet HTTPS est **obligatoire pour le micro** : les navigateurs refusent le micro
> sur une page en `http://` autre que `localhost`. Les modes *Écouter* et *Dictée*,
> eux, fonctionnent même en `http://`.

---

## 2. Les trois modes

| Mode | Ce que fait l'enfant | Ce que fait l'appli |
|---|---|---|
| 🔊 **Écouter** | Regarde les mots et le texte | Prononce chaque mot, surligne le mot lu, traduit |
| 🎤 **Lire tout haut** | Lit la phrase dans le micro | Écoute, colorie chaque mot (vert / orange / rouge), donne un score et des étoiles |
| ✍️ **Dictée** | Écoute puis écrit le mot | Corrige lettre par lettre |

Dans le mode **Écouter** :
- **🐢 Mot par mot** : chaque mot est prononcé lentement, l'un après l'autre.
- **📖 Lire l'histoire** : lecture naturelle, phrase par phrase.
- **Appuyer sur n'importe quel mot** le prononce tout seul.

---

## 3. Ajouter les devoirs de la semaine

Sur l'écran d'accueil : **➕ Ajouter les devoirs de la semaine**.

- **Liste de mots** : une ligne par mot, au format `anglais = français`

  ```
  cat = chat
  dog = chien
  house = maison
  ```

- **Texte à lire** : recopiez simplement le texte du cahier.

La leçon est enregistrée sur l'appareil et réutilisable dans les trois modes.
Les leçons personnelles peuvent être modifiées (✏️) ou supprimées (🗑️) depuis
l'écran « Choisir une leçon ».

12 leçons sont déjà intégrées (couleurs, nombres, animaux, famille, nourriture,
école, corps, jours, vêtements, premières phrases, une petite histoire…).

---

## 4. Réglages (⚙️)

- **Accent** : britannique (celui enseigné en France) ou américain.
- **Voix** : les voix « hors-ligne » (Microsoft) marchent sans internet et
  permettent le surlignage du mot lu ; les voix « en ligne » (Google) sonnent
  mieux mais demandent une connexion.
- **Vitesse** : 0,7 à 0,9 est idéal pour débuter.
- **Pause entre les mots**, **traduction affichée ou cachée**, **remise à zéro des étoiles**.
- Un **diagnostic** en bas indique si la lecture, le micro et l'HTTPS sont disponibles.

### Si aucune voix anglaise n'est trouvée (Windows)

Paramètres → Heure et langue → Langue et région → **Ajouter une langue** →
*English (United Kingdom)* → cocher **Synthèse vocale**. Puis redémarrer le navigateur.

---

## 5. Compatibilité

| | Écouter | Lire tout haut (micro) | Dictée |
|---|---|---|---|
| Chrome / Edge (PC) | ✅ | ✅ | ✅ |
| Chrome (tablette Android) | ✅ | ✅ (en HTTPS) | ✅ |
| Safari (iPad / iPhone) | ✅ | ❌ non supporté par Safari | ✅ |

---

## 6. Structure du code

Le code est séparé en trois couches : une logique métier pure et testable, une
couche d'accès au navigateur, et les écrans React. Aucun écran n'appelle
directement l'API du navigateur.

```
src/
  lib/
    text/
      textSegmentation.js         découpe un texte en phrases, mots et jetons affichables
      wordNormalization.js        met deux mots sous forme comparable, distance d'édition
      readingScript.js            la partition de lecture : phrases + numéro de chaque mot
    scoring/
      pronunciationScoring.js     aligne ce qui était à lire avec ce qui a été entendu
      spellingComparison.js       correction de la dictée, lettre par lettre
      rewards.js                  barème des étoiles et messages d'encouragement
    lessons/
      builtInLessons.js           les 12 leçons livrées avec l'application
      lessonContent.js            ce qu'une leçon offre à travailler
      lessonParsing.js            lecture/écriture de la liste « anglais = français »
    speech/
      speechSynthesisService.js   lecture à voix haute (API du navigateur)
      speechRecognitionService.js écoute du micro (API du navigateur)
      voiceSelection.js           choix de la voix anglaise selon l'accent
    storage/
      localStorageAdapter.js      lecture/écriture JSON tolérante aux pannes
      settingsRepository.js       réglages
      lessonRepository.js         leçons saisies par le parent
      progressRepository.js       étoiles et historique
    exerciseTypes.js              les trois exercices
  hooks/
    useSpeechPlayer.js            le lecteur vocal partagé (voix + réglages)
    useCancellableSpeechSequence.js  enchaînements de lecture interruptibles
  components/                     un fichier par écran
  App.jsx                         état partagé et navigation
```

### Tests

```bash
npm test            # 151 tests
npm run test:watch  # relance à chaque modification
```

Les tests décrivent le comportement attendu en langage métier (« marque un mot
sauté comme manquant », « ne récompense pas un mot révélé avant d'être écrit »).
Ils sont le point d'entrée conseillé pour comprendre le code : chaque module a
son fichier `*.test.js` à côté de lui.

La logique métier (`src/lib`) est entièrement testée sans navigateur. Les deux
écrans porteurs de règles — la dictée et l'éditeur de leçons — ont des tests
d'interface qui simulent une vraie utilisation.

### Le commit est bloqué si un test échoue ou si le build casse

`.githooks/pre-commit` lance deux vérifications avant chaque commit et le refuse
si l'une des deux échoue :

1. `npm test` — les 151 tests doivent être verts ;
2. `npm run build` — le projet doit compiler.

La seconde n'est pas redondante : une erreur de syntaxe dans un écran qu'aucun
test n'importe laisse toute la suite verte, et seul le build l'attrape.

Le hook est versionné avec le projet (contrairement à `.git/hooks`, qui n'est
jamais cloné) et activé par `core.hooksPath`. Le script `prepare` de
`package.json` le rearme tout seul à chaque `npm install`, donc **il n'y a rien
à faire après un clone** hormis :

```bash
npm install     # installe les dépendances et arme le hook
```

Pour le réactiver manuellement en cas de besoin :

```bash
git config core.hooksPath .githooks
```

### Intégration continue (GitHub Actions)

`.github/workflows/ci.yml` rejoue les deux mêmes étapes — `npm test` puis
`npm run build` — à chaque poussée sur `main` et à chaque pull request.

La redondance avec le hook est voulue : le hook donne un retour immédiat en
local, le CI rattrape ce qui l'aurait contourné (un `--no-verify`, un clone où
`npm install` n'a pas encore armé le hook, une poussée depuis une autre
machine).

> ⚠️ Le CI ne s'exécute que si le dépôt est hébergé sur GitHub. Tant que le
> dépôt reste purement local (aucun *remote* configuré), le fichier est en
> place mais dormant — il n'y a rien à corriger, il s'activera tout seul au
> premier `git push`.
