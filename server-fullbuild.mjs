import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Chemin vers le dossier build Vite
const staticPath = path.join(__dirname, 'static');

console.log('');
console.log('═════════════════════════════════════════════════════');
console.log('🎮 OpenFront Full Build - Server');
console.log('═════════════════════════════════════════════════════');
console.log('');
console.log(`📁 Build Vite: ${staticPath}`);
console.log(`🌐 URL: http://localhost:${PORT}`);
console.log('');

// Middleware
app.use(express.static(staticPath));
app.use(express.json());

// SPA Routing - Envoyer index.html pour les routes client
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      error: '❌ Build Vite non trouvé',
      message: 'Exécutez: npm run build-prod',
      expected: indexPath,
    });
  }
});

// Démarrer
const server = app.listen(PORT, () => {
  console.log('✅ OpenFront server started!');
  console.log('');
  console.log('Fichiers servis:');
  if (fs.existsSync(staticPath)) {
    const files = fs.readdirSync(staticPath).slice(0, 8);
    files.forEach(f => console.log(`   📄 ${f}`));
    console.log('   ...');
  }
  console.log('');
  console.log('Appuyez sur Ctrl+C pour arrêter');
  console.log('═════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Arrêt du serveur...');
  server.close(() => {
    process.exit(0);
  });
});
