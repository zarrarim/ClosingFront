#!/bin/bash

# Build complet OpenFront avec Vite

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║     🚀 OPENFRONT FULLBUILD - DÉMARRAGE        ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non installé!"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Aller au root
cd "$(dirname "$0")/.."

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm ci --ignore-scripts
    echo ""
fi

# Vérifier fichiers critiques
if [ ! -f "vite.config.ts" ]; then
    echo "❌ vite.config.ts non trouvé!"
    exit 1
fi

if [ ! -f "index.html" ]; then
    echo "❌ index.html non trouvé!"
    exit 1
fi

if [ ! -f "tsconfig.json" ]; then
    echo "❌ tsconfig.json non trouvé!"
    exit 1
fi

# Créer répertoire static s'il n'existe pas
mkdir -p static

echo "🏗️  Building OpenFront avec Vite..."
echo ""

# Build production
if npm run build-prod; then
    echo ""
    echo "✅ Build réussi!"
    echo ""

    # Vérifier build output
    if [ -f "static/index.html" ]; then
        SIZE=$(du -sh static | cut -f1)
        echo "📊 Build size: $SIZE"
        echo ""
        echo "✨ OPENFRONT FULLBUILD PRÊT!"
        echo ""
        echo "Pour démarrer:"
        echo "  cd fullbuild"
        echo "  npm start"
        echo ""
        echo "Puis ouvrez: http://localhost:3000"
    else
        echo "❌ Build index.html non trouvé!"
        exit 1
    fi
else
    echo "❌ Build échoué!"
    exit 1
fi
