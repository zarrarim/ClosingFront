#!/bin/bash

# Script de lancement OpenFront Standalone

echo "🎮 OpenFront - Jeu de Stratégie Temps Réel"
echo "=========================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé!"
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo ""

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé!"
    exit 1
fi

echo "✅ npm $(npm --version)"
echo ""

# Aller au répertoire
cd "$(dirname "$0")" || exit 1

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

# Démarrer le serveur
PORT=${PORT:-3000}

echo "🚀 Démarrage du serveur sur http://localhost:$PORT"
echo ""
echo "💡 Ouvrez votre navigateur et allez sur: http://localhost:$PORT"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

npm start
