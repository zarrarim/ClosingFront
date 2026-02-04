import compression from "compression";
import express from "express";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import WebSocket from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, "../static");
const INDEX_HTML = path.join(DIST_DIR, "index.html");

// Compression
app.use(compression());

// Vérifier si le build existe
if (!fs.existsSync(DIST_DIR)) {
  console.error("❌ Build non trouvé! Lancez: npm run build");
  console.error(`   Chemin attendu: ${DIST_DIR}`);
  process.exit(1);
}

// Servir fichiers statiques
app.use(
  express.static(DIST_DIR, {
    maxAge: "1d",
    etag: false,
    setHeaders: (res, path) => {
      if (path.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }),
);

// Servir index.html pour les routes
app.get("/*", (req, res) => {
  if (fs.existsSync(INDEX_HTML)) {
    res.sendFile(INDEX_HTML);
  } else {
    res.status(404).send("Build non trouvé. Lancez: npm run build");
  }
});

// WebSocket (pour futur multiplayer)
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", (data) => {
    console.log("Received:", data);
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

// Démarrer serveur
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║        🎮 OPENFRONT - FULLBUILD START          ║
╚════════════════════════════════════════════════╝

📍 Serveur: http://localhost:${PORT}
📁 Build:   ${DIST_DIR}
🔄 Mode:    ${process.env.NODE_ENV || "production"}

Ouvrez: http://localhost:${PORT}
  `);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⏹️  Arrêt du serveur...");
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });
  server.close(() => {
    process.exit(0);
  });
});
