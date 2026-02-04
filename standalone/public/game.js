class OpenFrontGame {
  constructor() {
    this.ws = null;
    this.playerId = null;
    this.gameId = null;
    this.playerName = "";
    this.currentScreen = "login";
    this.gameState = null;
    this.selectedTerritory = null;
    this.isGameCreator = false;

    this.initEventListeners();
  }

  initEventListeners() {
    // Login screen
    document
      .getElementById("createGameBtn")
      .addEventListener("click", () => this.openCreateGame());
    document
      .getElementById("joinGameBtn")
      .addEventListener("click", () => this.openJoinGame());
    document
      .getElementById("confirmJoinBtn")
      .addEventListener("click", () => this.confirmJoinGame());
    document
      .getElementById("cancelJoinBtn")
      .addEventListener("click", () => this.closeJoinGame());

    // Lobby screen
    document
      .getElementById("startGameBtn")
      .addEventListener("click", () => this.startGame());
    document
      .getElementById("leaveLobbyBtn")
      .addEventListener("click", () => this.leaveLobby());

    // Game screen
    document
      .getElementById("quitGameBtn")
      .addEventListener("click", () => this.quitGame());

    // Canvas interaction
    const canvas = document.getElementById("gameCanvas");
    canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
    canvas.addEventListener("mousemove", (e) => this.handleCanvasMouseMove(e));
  }

  connectWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.ws = new WebSocket(`${protocol}//${window.location.host}`);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      alert("Erreur de connexion");
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case "GAME_CREATED":
        this.playerId = message.playerId;
        this.gameId = message.gameId;
        this.gameState = message.gameState;
        this.isGameCreator = true;
        this.showLobby();
        break;

      case "GAME_JOINED":
        this.playerId = message.playerId;
        this.gameId = message.gameId;
        this.gameState = message.gameState;
        this.isGameCreator = false;
        this.showLobby();
        break;

      case "PLAYER_JOINED":
      case "STATE_UPDATE":
        this.gameState = message.gameState;
        if (this.currentScreen === "lobby") {
          this.updateLobby();
        } else if (this.currentScreen === "game") {
          this.updateGameState();
        }
        break;

      case "GAME_STARTED":
        this.gameState = message.gameState;
        this.showGame();
        break;

      case "TERRITORY_ATTACKED":
      case "UNITS_ADDED":
        this.gameState = message.gameState;
        this.updateGameState();
        break;

      case "PLAYER_LEFT":
        this.gameState = message.gameState;
        if (this.currentScreen === "lobby") {
          this.updateLobby();
        }
        break;

      case "ERROR":
        alert(message.message);
        break;
    }
  }

  openCreateGame() {
    this.playerName =
      document.getElementById("playerNameInput").value ||
      "Joueur " + Math.floor(Math.random() * 9000);
    if (!this.playerName.trim()) {
      alert("Veuillez entrer un nom");
      return;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connectWebSocket();
      setTimeout(() => {
        this.sendMessage({
          type: "CREATE_GAME",
          playerName: this.playerName,
        });
      }, 500);
    } else {
      this.sendMessage({
        type: "CREATE_GAME",
        playerName: this.playerName,
      });
    }
  }

  openJoinGame() {
    document.getElementById("joinGameForm").classList.remove("hidden");
  }

  closeJoinGame() {
    document.getElementById("joinGameForm").classList.add("hidden");
  }

  confirmJoinGame() {
    this.playerName =
      document.getElementById("playerNameInput").value ||
      "Joueur " + Math.floor(Math.random() * 9000);
    this.gameId = document.getElementById("gameCodeInput").value.toUpperCase();

    if (!this.playerName.trim() || !this.gameId.trim()) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connectWebSocket();
      setTimeout(() => {
        this.sendMessage({
          type: "JOIN_GAME",
          gameId: this.gameId,
          playerName: this.playerName,
        });
      }, 500);
    } else {
      this.sendMessage({
        type: "JOIN_GAME",
        gameId: this.gameId,
        playerName: this.playerName,
      });
    }
  }

  startGame() {
    if (this.isGameCreator) {
      this.sendMessage({
        type: "START_GAME",
      });
    }
  }

  leaveLobby() {
    if (this.ws) {
      this.ws.close();
    }
    this.showLoginScreen();
  }

  quitGame() {
    if (this.ws) {
      this.ws.close();
    }
    this.showLoginScreen();
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  showLoginScreen() {
    this.currentScreen = "login";
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.remove("active"));
    document.getElementById("loginScreen").classList.add("active");
    document.getElementById("joinGameForm").classList.add("hidden");
  }

  showLobby() {
    this.currentScreen = "lobby";
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.remove("active"));
    document.getElementById("lobbyScreen").classList.add("active");
    document.getElementById("gameCodeDisplay").textContent =
      "Code: " + this.gameId;

    // Enable start button only for creator
    const startBtn = document.getElementById("startGameBtn");
    startBtn.disabled = !this.isGameCreator;

    this.updateLobby();
  }

  updateLobby() {
    if (!this.gameState) return;

    const playerCount = this.gameState.playerCount || 0;
    document.getElementById("playerCount").textContent =
      `Joueurs: ${playerCount}/10`;

    const playersList = document.getElementById("playersList");
    playersList.innerHTML = "";

    this.gameState.players.forEach((player) => {
      const badge = document.createElement("div");
      badge.className = "player-badge";
      badge.innerHTML = `
        <div class="player-badge-color" style="background: ${player.color}"></div>
        <div>${player.name}</div>
        <div style="font-size: 12px; color: #888;">Niv. ${player.stats.level}</div>
      `;
      playersList.appendChild(badge);
    });

    // Enable start if creator and at least 1 player
    document.getElementById("startGameBtn").disabled =
      !this.isGameCreator || playerCount < 1;
  }

  showGame() {
    this.currentScreen = "game";
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.remove("active"));
    document.getElementById("gameScreen").classList.add("active");

    this.initCanvas();
    this.updateGameState();
  }

  updateGameState() {
    if (!this.gameState) return;

    // Update player stats
    const player = this.gameState.players.find((p) => p.id === this.playerId);
    if (player) {
      document.getElementById("playerNameDisplay").textContent = player.name;
      document.getElementById("playerStatsDisplay").textContent =
        `Niv. ${player.stats.level}`;
      document.getElementById("territoriesCount").textContent =
        player.stats.territories;
      document.getElementById("unitsCount").textContent = player.stats.units;
      document.getElementById("levelCount").textContent = player.stats.level;
    }

    // Update leaderboard
    this.updateLeaderboard();

    // Redraw canvas
    this.drawGame();
  }

  updateLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = "";

    const sortedPlayers = [...this.gameState.players].sort(
      (a, b) => b.stats.territories - a.stats.territories,
    );

    sortedPlayers.slice(0, 10).forEach((player, index) => {
      const item = document.createElement("div");
      item.className = "leaderboard-item";
      item.style.borderLeftColor = player.color;

      item.innerHTML = `
        <span class="leaderboard-item-rank">#${index + 1}</span>
        <span class="leaderboard-item-name">${player.name}</span>
        <span class="leaderboard-item-score">${player.stats.territories}</span>
      `;
      leaderboard.appendChild(item);
    });
  }

  initCanvas() {
    const canvas = document.getElementById("gameCanvas");
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    this.drawGame();
  }

  drawGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(10, 30, 50, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!this.gameState || !this.gameState.territories) return;

    // Calculate grid size
    const gridWidth = 20;
    const gridHeight = 20;
    const cellWidth = canvas.width / gridWidth;
    const cellHeight = canvas.height / gridHeight;

    // Draw territories
    this.gameState.territories.forEach((territory) => {
      const x = territory.x * cellWidth;
      const y = territory.y * cellHeight;

      // Get player color
      let color = "#1a3a52";
      let borderColor = "#0f3460";

      if (territory.owner) {
        const owner = this.gameState.players.find(
          (p) => p.id === territory.owner,
        );
        if (owner) {
          color = owner.color;
          borderColor = owner.color;
        }
      }

      // Draw territory
      ctx.fillStyle = color;
      ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);

      // Draw border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);

      // Draw units count
      if (territory.units > 0) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(territory.units, x + cellWidth / 2, y + cellHeight / 2);
      }

      // Highlight selected territory
      if (
        this.selectedTerritory &&
        this.selectedTerritory.id === territory.id
      ) {
        ctx.strokeStyle = "#00d4ff";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
      }
    });
  }

  handleCanvasClick(e) {
    const canvas = document.getElementById("gameCanvas");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridWidth = 20;
    const gridHeight = 20;
    const cellWidth = canvas.width / gridWidth;
    const cellHeight = canvas.height / gridHeight;

    const gridX = Math.floor(x / cellWidth);
    const gridY = Math.floor(y / cellHeight);

    const territory = this.gameState.territories.find(
      (t) => t.x === gridX && t.y === gridY,
    );

    if (territory) {
      this.selectedTerritory = territory;
      this.showTerritoryInfo(territory);
      this.drawGame();
    }
  }

  handleCanvasMouseMove(e) {
    const canvas = document.getElementById("gameCanvas");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridWidth = 20;
    const gridHeight = 20;
    const cellWidth = canvas.width / gridWidth;
    const cellHeight = canvas.height / gridHeight;

    const gridX = Math.floor(x / cellWidth);
    const gridY = Math.floor(y / cellHeight);

    const territory = this.gameState.territories.find(
      (t) => t.x === gridX && t.y === gridY,
    );
    canvas.title = territory
      ? `${territory.x},${territory.y} - Propriétaire: ${territory.owner ? "Occupé" : "Libre"} - Unités: ${territory.units}`
      : "";
  }

  showTerritoryInfo(territory) {
    const info = document.getElementById("selectedTerritoryInfo");
    const owner = this.gameState.players.find((p) => p.id === territory.owner);

    let ownerText = "Libre";
    if (owner) {
      ownerText = `Propriétaire: <span style="color: ${owner.color}">${owner.name}</span>`;
    }

    let actionsHtml = "";

    // Show upgrade button if owned by current player
    if (territory.owner === this.playerId) {
      actionsHtml = `<button class="btn btn-primary" onclick="game.upgradeTerritory('${territory.id}')">Améliorer (20 ⚔️)</button>`;
    } else if (territory.owner) {
      // Show attack button if adjacent and owned by current player
      const adjacent = this.getAdjacentTerritories(territory).some(
        (t) => t.owner === this.playerId && t.units >= 10,
      );
      if (adjacent) {
        actionsHtml = `<button class="btn btn-primary" onclick="game.attackTerritory('${territory.id}')">Attaquer</button>`;
      }
    } else {
      // Show capture button if adjacent and owned by current player
      const adjacent = this.getAdjacentTerritories(territory).some(
        (t) => t.owner === this.playerId && t.units >= 10,
      );
      if (adjacent) {
        actionsHtml = `<button class="btn btn-primary" onclick="game.captureTerritory('${territory.id}')">Capturer</button>`;
      }
    }

    document.getElementById("territoryOwner").innerHTML = ownerText;
    document.getElementById("territoryUnits").textContent =
      `Unités: ${territory.units}`;
    document.getElementById("territoryActions").innerHTML = actionsHtml;

    info.classList.remove("hidden");
  }

  getAdjacentTerritories(territory) {
    return this.gameState.territories.filter((t) => {
      return (
        Math.abs(t.x - territory.x) <= 1 &&
        Math.abs(t.y - territory.y) <= 1 &&
        !(t.x === territory.x && t.y === territory.y)
      );
    });
  }

  attackTerritory(territoryId) {
    if (!this.selectedTerritory) return;

    this.sendMessage({
      type: "ATTACK",
      fromId: this.selectedTerritory.id,
      toId: territoryId,
    });
  }

  captureTerritory(territoryId) {
    if (!this.selectedTerritory) return;

    this.sendMessage({
      type: "ATTACK",
      fromId: this.selectedTerritory.id,
      toId: territoryId,
    });
  }

  upgradeTerritory(territoryId) {
    const territory = this.gameState.territories.find(
      (t) => t.id === territoryId,
    );
    if (
      territory &&
      territory.owner === this.playerId &&
      territory.units >= 20
    ) {
      this.sendMessage({
        type: "ADD_UNITS",
        territoryId: territoryId,
        count: -20,
      });
    }
  }
}

// Initialize game
const game = new OpenFrontGame();
window.addEventListener("load", () => {
  game.showLoginScreen();
});

// Reconnect WebSocket if disconnected
window.addEventListener("beforeunload", () => {
  if (game.ws) {
    game.ws.close();
  }
});
