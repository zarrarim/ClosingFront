# OpenFront Standalone - Version HTML/CSS/JS

Une version fonctionnelle et simplifiée d'OpenFront avec Node.js et interface web.

## 🚀 Installation et Démarrage

### Prérequis

- Node.js v16+ avec npm

### Installation

```bash
cd standalone
npm install
```

### Lancer le serveur

```bash
npm start
```

Puis ouvrez votre navigateur sur `http://localhost:3000`

### Mode développement (avec auto-reload)

```bash
npm run dev
```

## 🎮 Fonctionnalités

### Gameplay

- ✅ **Création de parties** - Créez une partie et partagez le code
- ✅ **Multiplayer** - Jusqu'à 10 joueurs par partie
- ✅ **Stratégie temps réel** - Capturez et défendez des territoires
- ✅ **Système de ressources** - Générez automatiquement des unités
- ✅ **Améliorations** - Améliorez vos territoires
- ✅ **Classement** - Voyez qui domine la carte

### Interface

- 🎨 Design moderne avec gradient bleu
- 📱 Responsive (desktop et tablette)
- ⚡ Interactions fluides
- 🎯 Canvas optimisé pour les performances

### Sans compte / Authentification

- ✅ Mode anonyme complet
- ✅ Pas de création de compte
- ✅ Pas de sauvegarde persistante
- ✅ Tous les cosmétiques gratuits

## 🎮 Comment Jouer

### 1. Créer une Partie

- Entrez votre nom
- Cliquez "Créer une Partie"
- Partagez le code avec vos amis

### 2. Rejoindre une Partie

- Entrez votre nom
- Cliquez "Rejoindre une Partie"
- Entrez le code de la partie

### 3. Pendant la Partie

- **Cliquez sur un territoire** pour le sélectionner
- **Améliorer** (+20 unités pour améliorer) si c'est le vôtre
- **Attaquer** un territoire adjacent occupé par un rival
- **Capturer** un territoire libre adjacent

### 4. Objectif

- Conquérir le maximum de territoires
- Défendre vos positions
- Dominer la carte!

## 📊 Architecture

```
standalone/
├── server.js          # Serveur Express + WebSocket
├── package.json       # Dépendances
└── public/
    ├── index.html     # Interface web
    ├── styles.css     # Styles
    └── game.js        # Logique client
```

### Serveur (Node.js)

- Express pour servir les fichiers statiques
- WebSocket pour la communication temps réel
- Gestion d'état de jeu
- Logique de combat
- Synchronisation des territoires

### Client (HTML/CSS/JS)

- Canvas HTML5 pour le rendu de la carte
- WebSocket pour la communication bidirectionnelle
- UI responsive et moderne
- Gestion des événements utilisateur

## 🔧 Personnalisation

### Changer la taille de la grille

Dans `server.js`, fonction `initializeTerritories()`:

```javascript
const gridSize = 20; // Changez cette valeur
```

### Changer le nombre de joueurs max

Dans `server.js`, fonction `addPlayer()`:

```javascript
if (game.players.size >= 10) { // Changez 10
```

### Changer les couleurs

Dans `public/styles.css`:

```css
background: linear-gradient(135deg, #00d4ff, #0099ff); /* Bleu par défaut */
```

## 📝 Notes

- Les données ne sont pas persistantes (jeu stateless)
- Parfait pour jouer localement ou en LAN
- Pas de base de données requise
- Tout fonctionne sans serveur externe

## 🎯 Prochaines Améliorations Possibles

- [ ] Sauvegarde des replays
- [ ] Plus de 10 joueurs
- [ ] Système d'alliances
- [ ] Chat multiplayer
- [ ] Statistiques des joueurs
- [ ] Cosmétiques personnalisés
- [ ] Différents types de cartes
- [ ] Mode single-player contre IA

## 📄 Licence

AGPL-3.0

---

**Créé pour jouer au stratégie temps réel facilement!** 🎮⚡
