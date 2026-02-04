README — Build & déploiement statique

But: Ce document explique comment construire et déployer la partie client en tant que site statique.

Prérequis
- Node.js (>=18 recommandé)
- npm ou yarn

Build
1. Installer les dépendances :

```bash
npm ci
```

2. Produire le build de production :

```bash
npm run build-prod
```

Résultat
- Le build est écrit dans le dossier `static/` (voir `vite.config.ts`).
- Déployez le contenu de `static/` sur n'importe quel hébergement statique.

Déploiements courants
- GitHub Pages: Publiez le contenu de `static/` sur la branche `gh-pages` ou utilisez une action CI.
- Netlify / Vercel: Connectez votre repo et pointez la publication sur le dossier `static/`.
- S3 + CloudFront / CDN: Uploadez le contenu de `static/` et configurez la distribution.

Tester localement (serveur statique)

```bash
# Node 'serve'
npx serve static

# ou Python
python3 -m http.server 8080 --directory static
```

Limitations (important)
- Le build statique contient uniquement la partie client. Les fonctionnalités serveur ne fonctionneront pas sans un serveur Node:
  - WebSockets (/lobbies, /w0, /w1, /w2)
  - API (/api)
  - Authentification, persistance, matchmaking

Options si vous avez besoin des fonctionnalités serveur
- Déployer séparément le serveur Node (par ex. `npm run start:server` sur un VPS ou PaaS). Ensuite, configurez l'URL/API dans les variables d'environnement ou via `vite`/build.
- Utiliser la version hors-ligne/standalone fournie (`standalone/` ou `src/client/offline-game`) pour une démo jouable sans serveur.
- Ajouter des mocks locaux ou un petit serveur WebSocket embarqué (demande des modifications du code).

Notes utiles
- Les variables d'environnement sont gérées via `vite.config.ts` et `process.env.*` / `import.meta.env`.
- Si vous publiez statiquement, vérifiez les URLs des assets et du `base` dans `vite.config.ts`.

Questions / prochaines étapes
- Voulez-vous que je génère un "tout-en-un" HTML/JS/CSS inliné pour une démo locale (sans changer la logique) ?
