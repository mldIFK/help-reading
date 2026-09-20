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

### Importer un fichier

Dépose le fichier des devoirs dans la zone d'import, ou choisis-le sur
l'appareil. Formats reconnus :

| Format | Usage |
|---|---|
| `.txt` `.md` | Texte de lecture, liste de mots, ou les deux |
| `.csv` `.tsv` | Tableau de vocabulaire, y compris un export Excel français (`;`) |
| `.pdf` | Devoir envoyé par l'école, à condition qu'il contienne du texte |
| `.docx` | Document Word |

Le format est reconnu **au contenu du fichier**, pas à son nom : un fichier
téléchargé sans extension ou un document renommé sont acceptés tels quels.
Une photo n'est pas prise en charge : un `PDF` scanné ou une image doit être
recopié à la main.

L'appli sépare toute seule **la liste de vocabulaire du texte à lire**, et tire
le titre de la leçon du nom du fichier. Rien n'est enregistré directement : les
champs sont pré-remplis, tu relis et corriges avant de valider — la
reconnaissance propose, elle ne décide pas. Le texte à lire étant obligatoire,
un fichier qui n'apporte qu'une liste de mots (un tableau, par exemple) ne
rend la leçon enregistrable qu'une fois un texte ajouté à la main.

### Saisir à la main

- **Texte à lire** (obligatoire) : recopiez le texte du cahier. Le correcteur
  d'orthographe du navigateur souligne les mots qu'il ne reconnaît pas comme
  anglais.

  > Si des mots anglais corrects sont soulignés, c'est que le navigateur ne
  > vérifie qu'une autre langue (souvent le français, réglé par défaut). Dans
  > Chrome : **Paramètres → Langues** → ajoutez l'anglais et activez
  > « Vérifier l'orthographe » pour cette langue — ou activez le
  > **correcteur enrichi** (« Enhanced spell check »), qui détecte la langue
  > de chaque champ tout seul. Aucun réglage du site ne peut le faire à la
  > place du navigateur.
- **Liste de mots** : remplie automatiquement à partir du texte dès que vous
  le tapez, un mot par ligne. Corrigez-la et ajoutez les traductions au format
  `anglais = français` :

  ```
  cat = chat
  dog = chien
  house = maison
  ```

  Dès que vous modifiez cette liste à la main, elle n'est plus recalculée à
  partir du texte : vos corrections sont conservées.

- **Voix humaine par mot** (facultatif) : sous la liste de mots, un bouton
  🎙️ **Enregistrer** par mot permet à un adulte anglophone d'enregistrer sa
  propre prononciation. Dès qu'un mot est enregistré, cette voix remplace la
  synthèse **partout** où le mot est prononcé (Écouter, Lire à voix haute,
  Dictée) — pour les autres mots, la synthèse continue de parler normalement.
  L'enregistrement reste sur l'appareil et demande le micro (HTTPS ou
  `localhost`, comme pour « Lire tout haut »).

  Dans **Écouter → Le texte**, dès qu'un mot de la leçon a un enregistrement,
  un choix apparaît au-dessus du texte : **🎙️ Ma voix** (utilise les
  enregistrements, par défaut) ou **🔊 Voix automatique** (ignore les
  enregistrements et lit tout en synthèse).

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

### Obtenir une voix qui ne sonne pas robotique

L'application n'invente pas de voix : elle utilise **celles du navigateur**.
Leur qualité varie énormément, et c'est le navigateur — pas l'application — qui
détermine ce qui est disponible.

| Navigateur | Voix anglaises proposées |
|---|---|
| **Edge** | Voix **naturelles** Microsoft (Sonia, Libby, Ryan…) — très proches d'une vraie personne |
| Chrome | Voix Google d'ancienne génération, mécaniques |
| Safari | Voix système Apple, correctes |

**Le plus simple pour bien sonner : ouvrir la même adresse dans Microsoft Edge.**
Rien à installer, rien à changer dans l'application.

Dans ⚙️ Réglages, les voix naturelles sont signalées par une **⭐**, et
l'application choisit automatiquement la meilleure de l'accent demandé. Si elle
ne trouve que de vieilles voix, elle le signale et conseille Edge.

### Voix enregistrée par une personne (studio de voix)

⚙️ Réglages → **🎙️ Ouvrir le studio de voix**.

L'application peut reconstituer les mots à partir des **45 sons de l'anglais
britannique**, enregistrés au micro par un adulte anglophone. Chaque son est
présenté avec un mot d'exemple et une explication en français.

Une fois les 45 sons enregistrés, l'application sait prononcer n'importe lequel
des **65 000 mots** de son dictionnaire de prononciation britannique — sans
connexion, et sans que rien ne quitte l'appareil.

**Avant de faire enregistrer quelqu'un**, utilise le banc d'essai
(*🔊 Écouter le rendu*) : enregistre les sons rapidement toi-même, même mal, et
écoute ce que donne un mot entier. Enchaîner des sons enregistrés isolément peut
sonner haché — c'est la limite connue du procédé, et il vaut mieux la constater
en dix minutes qu'après une séance d'enregistrement complète.

Le studio a besoin du micro : page en `https://` ou sur `localhost`.

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
