#!/bin/bash
# Script pour servir le build Vite complet d'OpenFront

set -e

echo "🎮 OpenFront Full Build Server"
echo "======================================"
echo ""

# Aller au répertoire racine
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé!"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Vérifier si le build existe
if [ ! -d "static" ]; then
    echo "⚠️  Dossier 'static' non trouvé"
    echo "📦 Lancement du build Vite..."
    npm run build-prod
fi

echo ""
echo "✅ Build Vite trouvé!"
echo "📁 Fichiers à servir:"
ls -lh static/ | head -5
echo ""

# Démarrer le serveur
PORT=${PORT:-3000}
echo "🚀 Démarrage du serveur sur http://localhost:$PORT"
echo ""

node -e "
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const buildPath = path.join('$SCRIPT_DIR', 'static');

// Logs
console.log('');
console.log('='.repeat(50));
console.log('🎮 OpenFront Full Build - Server Running');
console.log('='.repeat(50));
console.log('');
console.log('📁 Serveur: ' + buildPath);
console.log('🌐 URL: http://localhost:' + PORT);
console.log('');

// Servir les fichiers statiques
app.use(express.static(buildPath));

// SPA fallback - Envoyer index.html pour les routes client
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('❌ index.html non trouvé');
  }
});

// Démarrer
app.listen(PORT, () => {
  console.log('✅ Serveur OpenFront démarré!');
  console.log('');
  console.log('Appuyez sur Ctrl+C pour arrêter');
  console.log('');
});
"
