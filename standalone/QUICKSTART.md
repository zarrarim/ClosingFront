# 🚀 DÉMARRAGE RAPIDE - OpenFront Standalone

## ⚡ En 3 commandes

```bash
cd standalone
npm install
npm start
```

Puis ouvrez: **http://localhost:3000**

---

## 📖 Guide Complet

### 1️⃣ Préparation

Assurez-vous d'avoir **Node.js 16+** installé:

```bash
node --version # Doit afficher v16.0.0 ou plus
```

### 2️⃣ Installation

```bash
cd standalone
npm install
```

Cela télécharge les 3 dépendances:

- `express` - Serveur web
- `ws` - WebSocket temps réel
- `uuid` - Génération d'ID

### 3️⃣ Lancement

#### Option A: Commande npm

```bash
npm start
```

#### Option B: Script shell (Linux/Mac)

```bash
./start.sh
```

#### Option C: Direct Node

```bash
node server.js
```

#### Option D: Mode développement (auto-reload)

```bash
npm run dev
```

### 4️⃣ Accès au jeu

Ouvrez votre navigateur:

- 🔗 **http://localhost:3000**

---

## 🎮 Première Partie

### Joueur 1 (Créateur)

1. Entrez votre nom
2. Cliquez **"Créer une Partie"**
3. Copiez le **CODE** affiché (ex: ABC12XYZ)

### Joueur 2+ (Participants)

1. Entrez votre nom
2. Cliquez **"Rejoindre une Partie"**
3. Collez le **CODE** du créateur
4. Cliquez **"Rejoindre"**

### Démarrer le Jeu

- Le créateur voit le bouton **"Démarrer la Partie"**
- Cliquez dessus quand tous les joueurs sont prêts

---

## 🎯 Commandes de Jeu

| Action                      | Comment                                   |
| --------------------------- | ----------------------------------------- |
| **Sélectionner territoire** | Clic sur la carte                         |
| **Attaquer**                | Clic territoire + bouton "Attaquer"       |
| **Capturer**                | Clic territoire libre + bouton "Capturer" |
| **Améliorer**               | Clic territoire + bouton "Améliorer"      |
| **Quitter**                 | Bouton "Quitter le Jeu"                   |

---

## 🔧 Configuration

### Changer le port (par défaut 3000)

```bash
PORT=8080 npm start
```

### Limiter le nombre de joueurs

Dans `server.js`, cherchez `game.players.size >= 10` et changez la valeur.

### Changer la taille de la grille

Dans `server.js`, cherchez `const gridSize = 20` et changez.

---

## 📊 Architecture Simple

```
Navigateur (HTML/CSS/JS)
         ↕ WebSocket
Serveur Node.js (Express + WS)
         ↕ Gestion d'état
Parties actives (en mémoire)
```

**Pas de base de données, pas d'API externe, tout en local!**

---

## ⚙️ Dépannage

### ❌ "Port 3000 déjà utilisé"

```bash
PORT=3001 npm start
```

### ❌ "Erreur de connexion WebSocket"

- Vérifiez que le serveur tourne
- Rechargez la page (F5)
- Essayez un autre port

### ❌ "Node.js pas installé"

Téléchargez depuis: https://nodejs.org/

---

## 💡 Astuces

✅ **Jouer en réseau local**: Utilisez l'IP du serveur au lieu de localhost

```
http://192.168.1.100:3000
```

✅ **Plusieurs parties simultanées**: Chaque code = partie différente

✅ **Rejouer**: Fermer et rouvrir, tout est réinitialisé

---

## 📁 Fichiers Importants

| Fichier             | Rôle                        |
| ------------------- | --------------------------- |
| `server.js`         | Logique serveur + WebSocket |
| `public/index.html` | Interface du jeu            |
| `public/styles.css` | Design et animations        |
| `public/game.js`    | Logique client et Canvas    |
| `package.json`      | Dépendances                 |

---

## 🎨 Personnalisation

### Couleurs du design

Dans `public/styles.css`, cherchez `#00d4ff` (bleu) et remplacez par votre couleur.

### Message d'accueil

Dans `public/index.html`, ligne avec "OpenFront".

### Nombres et équilibrage

Dans `server.js`, cherchez les valeurs numériques (50 unités, etc.).

---

## 📞 Support

Le jeu est simple et autonome. En cas de problème:

1. Vérifiez Node.js est installé
2. Relancez le serveur
3. Videz le cache du navigateur (Ctrl+Shift+Del)
4. Rechargez la page

---

**Bon jeu! 🎮⚡**
