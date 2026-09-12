# help-reading

Application d'aide aux devoirs d'anglais pour une enfant de primaire (CP/CE1).
React + Vite, sans backend : voix et micro fournis par le navigateur, données
stockées sur l'appareil. Voir `README.md` pour l'usage et la structure.

## Avant de toucher au code

**Charger le skill `regles-de-code`** (`.claude/skills/regles-de-code/SKILL.md`)
et le suivre. Il s'applique à toute modification : fonctionnalité, correction de
bug, refactorisation, style, ajout de leçon.

Ce qu'il impose, en résumé — le détail et les exemples sont dans le skill :

1. **TDD** — le test est écrit avant le code, et on le voit échouer d'abord.
   Un bug se corrige en partant d'un test qui le reproduit.
2. **Nommage fonctionnel** — aucune abréviation, aucune lettre seule, aucun nom
   passe-partout (`data`, `item`, `result`), aucun nombre magique.
3. **Architecture en couches** — `components/ → hooks/ → lib/`, jamais l'inverse.
   Un composant n'appelle jamais une API du navigateur directement.
4. **Rien n'est « terminé »** sans `npm test` et `npm run build` verts, résultat
   montré, et vérification dans un vrai navigateur si le changement est visible.

Le code doit rester repris par des développeurs humains sur le long terme : la
lisibilité passe avant la concision et avant la rapidité d'écriture.
