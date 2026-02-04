const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Game state management
class Game {
  constructor(gameId) {
    this.id = gameId;
    this.players = new Map();
    this.territories = this.initializeTerritories();
    this.gameStarted = false;
    this.createdAt = Date.now();
  }

  initializeTerritories() {
    const territories = [];
    const gridSize = 20;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        territories.push({
          id: `${i}-${j}`,
          x: i,
          y: j,
          owner: null,
          units: 0,
          level: 0,
        });
      }
    }
    return territories;
  }

  addPlayer(playerId, playerName) {
    const startTerritory =
      this.territories[Math.floor(Math.random() * this.territories.length)];
    startTerritory.owner = playerId;
    startTerritory.units = 50;
    startTerritory.level = 1;

    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      color: this.getRandomColor(),
      startTerritory: startTerritory.id,
      joined: Date.now(),
      stats: {
        territories: 1,
        units: 50,
        level: 1,
      },
    });
  }

  getRandomColor() {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      // Free up territories
      this.territories.forEach((t) => {
        if (t.owner === playerId) {
          t.owner = null;
          t.units = 0;
        }
      });
    }
    this.players.delete(playerId);
  }

  getState() {
    return {
      id: this.id,
      gameStarted: this.gameStarted,
      players: Array.from(this.players.values()),
      territories: this.territories,
      playerCount: this.players.size,
    };
  }

  addUnits(playerId, territoryId, count) {
    const territory = this.territories.find((t) => t.id === territoryId);
    if (territory && territory.owner === playerId) {
      territory.units = Math.min(territory.units + count, 1000);
      return true;
    }
    return false;
  }

  attackTerritory(playerId, fromId, toId) {
    const fromTerritory = this.territories.find((t) => t.id === fromId);
    const toTerritory = this.territories.find((t) => t.id === toId);

    if (!fromTerritory || !toTerritory) return false;
    if (fromTerritory.owner !== playerId) return false;
    if (fromTerritory.units < 10) return false;

    const isAdjacent = this.areAdjacent(fromTerritory, toTerritory);
    if (!isAdjacent) return false;

    const attackForce = Math.floor(fromTerritory.units * 0.7);
    const defenseForce = toTerritory.owner ? toTerritory.units : 0;

    const attackerWins =
      Math.random() * (attackForce + defenseForce) < attackForce;

    if (attackerWins) {
      toTerritory.owner = playerId;
      toTerritory.units = Math.max(1, Math.floor(attackForce * 0.5));
      fromTerritory.units -= attackForce;
    } else {
      toTerritory.units = Math.max(
        0,
        defenseForce - Math.floor(attackForce * 0.3),
      );
    }

    fromTerritory.units = Math.max(0, fromTerritory.units - attackForce);

    return {
      success: attackerWins,
      fromTerritory: fromTerritory.id,
      toTerritory: toTerritory.id,
      newOwner: toTerritory.owner,
    };
  }

  areAdjacent(from, to) {
    return (
      Math.abs(from.x - to.x) <= 1 &&
      Math.abs(from.y - to.y) <= 1 &&
      !(from.x === to.x && from.y === to.y)
    );
  }

  tick() {
    // Resource generation
    this.territories.forEach((territory) => {
      if (territory.owner) {
        const generatedUnits = 1 + territory.level;
        territory.units = Math.min(territory.units + generatedUnits, 1000);
      }
    });

    // Update player stats
    this.players.forEach((player) => {
      const playerTerritories = this.territories.filter(
        (t) => t.owner === player.id,
      );
      player.stats.territories = playerTerritories.length;
      player.stats.units = playerTerritories.reduce(
        (sum, t) => sum + t.units,
        0,
      );
      player.stats.level = Math.floor(Math.sqrt(playerTerritories.length));
    });
  }
}

// Game management
const games = new Map();
const playerGameMap = new Map();

function getOrCreateGame(gameId) {
  if (!games.has(gameId)) {
    games.set(gameId, new Game(gameId));
  }
  return games.get(gameId);
}

function generateGameId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// WebSocket handling
wss.on("connection", (ws) => {
  let playerId = uuidv4();
  let gameId = null;
  let playerName = "Joueur " + Math.floor(Math.random() * 9000);

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case "CREATE_GAME": {
          gameId = generateGameId();
          const game = getOrCreateGame(gameId);
          game.addPlayer(playerId, message.playerName || playerName);
          playerGameMap.set(playerId, gameId);
          playerName = message.playerName || playerName;

          ws.send(
            JSON.stringify({
              type: "GAME_CREATED",
              gameId,
              gameState: game.getState(),
              playerId,
            }),
          );
          break;
        }

        case "JOIN_GAME": {
          gameId = message.gameId;
          const game = getOrCreateGame(gameId);

          if (game.gameStarted) {
            ws.send(
              JSON.stringify({
                type: "ERROR",
                message: "Le jeu a déjà commencé",
              }),
            );
            break;
          }

          if (game.players.size >= 10) {
            ws.send(
              JSON.stringify({ type: "ERROR", message: "Le jeu est plein" }),
            );
            break;
          }

          game.addPlayer(playerId, message.playerName || playerName);
          playerGameMap.set(playerId, gameId);
          playerName = message.playerName || playerName;

          broadcastToGame(gameId, {
            type: "PLAYER_JOINED",
            gameState: game.getState(),
          });

          ws.send(
            JSON.stringify({
              type: "GAME_JOINED",
              gameId,
              gameState: game.getState(),
              playerId,
            }),
          );
          break;
        }

        case "START_GAME": {
          const game = games.get(gameId);
          if (game && game.players.size > 0) {
            game.gameStarted = true;
            broadcastToGame(gameId, {
              type: "GAME_STARTED",
              gameState: game.getState(),
            });

            // Start game tick
            startGameTick(gameId);
          }
          break;
        }

        case "ATTACK": {
          const game = games.get(gameId);
          if (game) {
            const result = game.attackTerritory(
              playerId,
              message.fromId,
              message.toId,
            );
            if (result) {
              broadcastToGame(gameId, {
                type: "TERRITORY_ATTACKED",
                result,
                gameState: game.getState(),
              });
            }
          }
          break;
        }

        case "ADD_UNITS": {
          const game = games.get(gameId);
          if (game) {
            game.addUnits(playerId, message.territoryId, message.count);
            broadcastToGame(gameId, {
              type: "UNITS_ADDED",
              territoryId: message.territoryId,
              gameState: game.getState(),
            });
          }
          break;
        }

        case "GET_STATE": {
          const game = games.get(gameId);
          if (game) {
            ws.send(
              JSON.stringify({
                type: "STATE_UPDATE",
                gameState: game.getState(),
              }),
            );
          }
          break;
        }
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  ws.on("close", () => {
    if (gameId && playerGameMap.has(playerId)) {
      const game = games.get(gameId);
      if (game) {
        game.removePlayer(playerId);
        broadcastToGame(gameId, {
          type: "PLAYER_LEFT",
          gameState: game.getState(),
        });

        // Clean up empty games
        if (game.players.size === 0 && !game.gameStarted) {
          games.delete(gameId);
        }
      }
      playerGameMap.delete(playerId);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Game tick
const gameTicks = new Map();

function startGameTick(gameId) {
  if (gameTicks.has(gameId)) return;

  const interval = setInterval(() => {
    const game = games.get(gameId);
    if (!game || !game.gameStarted) {
      clearInterval(interval);
      gameTicks.delete(gameId);
      return;
    }

    game.tick();
    broadcastToGame(gameId, {
      type: "STATE_UPDATE",
      gameState: game.getState(),
    });
  }, 1000); // Update every second

  gameTicks.set(gameId, interval);
}

// Broadcast to all clients in a game
function broadcastToGame(gameId, message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Check if this client is in the game
      const playerInGame = Array.from(playerGameMap.entries()).find(
        ([, gId]) => gId === gameId,
      );
      if (playerInGame) {
        client.send(JSON.stringify(message));
      }
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`🎮 OpenFront Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
});
