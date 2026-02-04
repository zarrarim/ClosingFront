#!/bin/bash

# Script de lancement OpenFront Full Build
# Cet script construit et lance le serveur en une commande

set -e

echo ""
echo "🎮 OpenFront Full Build - Launcher"
echo "===================================="
echo ""

# Aller au répertoire racine
cd "$(dirname "$0")"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé!"
    echo "Installez depuis: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Étape 1: Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

# Étape 2: Build Vite (si nécessaire)
if [ ! -d "static" ]; then
    echo "🔨 Build Vite en cours..."
    npm run build-prod
    echo ""
fi

# Étape 3: Lancer le serveur
PORT=${PORT:-3000}

echo "═════════════════════════════════════════════════════"
echo "✅ OpenFront Full Build Ready!"
echo "═════════════════════════════════════════════════════"
echo ""
echo "🎮 Accédez au jeu:"
echo "   http://localhost:$PORT"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"
echo "═════════════════════════════════════════════════════"
echo ""

# Lancer le serveur
node server-fullbuild.mjs
