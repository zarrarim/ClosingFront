/**
 * Offline Game UI System
 * Clean and modern UI for offline gameplay
 * Includes all core UI elements and HUD components
 */

export interface UITheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;
}

export interface GameHUDState {
  showMinimap: boolean;
  showResourcePanel: boolean;
  showUnitPanel: boolean;
  showTerritoryPanel: boolean;
  selectedUnit: string | null;
  selectedTerritory: string | null;
  showMenu: boolean;
  showSettings: boolean;
  chatVisible: boolean;
}

export class GameUIManager {
  private theme: UITheme;
  private hudState: GameHUDState;
  private container: HTMLElement | null = null;

  constructor() {
    this.theme = this.getDefaultTheme();
    this.hudState = {
      showMinimap: true,
      showResourcePanel: true,
      showUnitPanel: true,
      showTerritoryPanel: true,
      selectedUnit: null,
      selectedTerritory: null,
      showMenu: false,
      showSettings: false,
      chatVisible: true,
    };
  }

  /**
   * Get default theme
   */
  private getDefaultTheme(): UITheme {
    return {
      primaryColor: "#1a1a2e",
      secondaryColor: "#16213e",
      accentColor: "#0f3460",
      backgroundColor: "#0f0f1e",
      textColor: "#e0e0e0",
      borderColor: "#00d4ff",
      shadowColor: "rgba(0, 0, 0, 0.5)",
    };
  }

  /**
   * Initialize UI
   */
  initialize(containerId: string): boolean {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container ${containerId} not found`);
      return false;
    }

    this.createBaseLayout();
    this.applyTheme();
    this.addEventListeners();

    return true;
  }

  /**
   * Create base UI layout
   */
  private createBaseLayout(): void {
    if (!this.container) return;

    const html = `
      <div id="game-hud" class="game-hud">
        <!-- Top Bar -->
        <div id="top-bar" class="top-bar">
          <div id="game-title" class="game-title">OpenFront Offline</div>
          <div id="resource-panel" class="resource-panel">
            <div class="resource-item">
              <span class="icon">💰</span>
              <span class="value" id="gold-count">5000</span>
            </div>
            <div class="resource-item">
              <span class="icon">🌾</span>
              <span class="value" id="food-count">2000</span>
            </div>
            <div class="resource-item">
              <span class="icon">🪵</span>
              <span class="value" id="wood-count">1500</span>
            </div>
            <div class="resource-item">
              <span class="icon">👥</span>
              <span class="value" id="population-count">1000</span>
            </div>
          </div>
          <div id="game-time" class="game-time">Turn: <span id="turn-count">0</span></div>
        </div>

        <!-- Left Sidebar -->
        <div id="left-sidebar" class="left-sidebar">
          <div id="minimap" class="minimap-container">
            <canvas id="minimap-canvas" width="200" height="200"></canvas>
          </div>
          <div id="unit-list" class="unit-list-panel">
            <h3>Units</h3>
            <div id="units-container" class="units-container"></div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div id="right-sidebar" class="right-sidebar">
          <div id="territory-info" class="territory-panel">
            <h3>Territory</h3>
            <div id="territory-details" class="territory-details"></div>
          </div>
          <div id="building-queue" class="building-queue">
            <h3>Buildings</h3>
            <div id="buildings-container" class="buildings-container"></div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div id="bottom-bar" class="bottom-bar">
          <div id="chat-panel" class="chat-panel">
            <div id="chat-messages" class="chat-messages"></div>
            <input id="chat-input" type="text" placeholder="Type message..." />
          </div>
        </div>

        <!-- Center Menu -->
        <div id="game-menu" class="game-menu hidden">
          <div class="menu-content">
            <h2>Game Menu</h2>
            <button id="btn-continue" class="menu-btn">Continue</button>
            <button id="btn-settings" class="menu-btn">Settings</button>
            <button id="btn-save" class="menu-btn">Save Game</button>
            <button id="btn-load" class="menu-btn">Load Game</button>
            <button id="btn-exit" class="menu-btn">Exit to Home</button>
          </div>
        </div>

        <!-- Settings Panel -->
        <div id="settings-panel" class="settings-panel hidden">
          <div class="settings-content">
            <h2>Settings</h2>
            <div class="setting-group">
              <label>Game Speed:</label>
              <select id="game-speed-select">
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="4">4x</option>
              </select>
            </div>
            <div class="setting-group">
              <label>Volume:</label>
              <input type="range" id="volume-slider" min="0" max="100" value="80" />
            </div>
            <div class="setting-group">
              <label>
                <input type="checkbox" id="show-ui-checkbox" checked />
                Show UI
              </label>
            </div>
            <button id="btn-close-settings" class="menu-btn">Close</button>
          </div>
        </div>

        <!-- Notifications -->
        <div id="notifications" class="notifications"></div>

        <!-- Loading Screen -->
        <div id="loading-screen" class="loading-screen hidden">
          <div class="loading-content">
            <h2>Loading Game...</h2>
            <div class="loading-bar">
              <div id="loading-progress" class="loading-progress"></div>
            </div>
            <p id="loading-text">Initializing...</p>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.addStyles();
  }

  /**
   * Add CSS styles to the page
   */
  private addStyles(): void {
    const styleId = "game-ui-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .game-hud {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        font-family: 'Arial', sans-serif;
        color: ${this.theme.textColor};
        z-index: 1000;
        pointer-events: none;
      }

      .game-hud > * {
        pointer-events: auto;
      }

      /* Top Bar */
      .top-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: linear-gradient(135deg, ${this.theme.primaryColor}, ${this.theme.secondaryColor});
        border-bottom: 2px solid ${this.theme.borderColor};
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        box-shadow: 0 4px 12px ${this.theme.shadowColor};
        z-index: 1001;
      }

      .game-title {
        font-size: 24px;
        font-weight: bold;
        color: ${this.theme.borderColor};
        text-shadow: 0 2px 4px ${this.theme.shadowColor};
      }

      .resource-panel {
        display: flex;
        gap: 30px;
        align-items: center;
      }

      .resource-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        padding: 5px 15px;
        background: ${this.theme.accentColor};
        border-radius: 4px;
        border: 1px solid ${this.theme.borderColor};
      }

      .resource-item .icon {
        font-size: 18px;
      }

      .resource-item .value {
        font-weight: bold;
        color: ${this.theme.borderColor};
      }

      .game-time {
        font-size: 14px;
        padding: 5px 15px;
        background: ${this.theme.accentColor};
        border-radius: 4px;
        border: 1px solid ${this.theme.borderColor};
      }

      /* Sidebars */
      .left-sidebar {
        position: fixed;
        left: 0;
        top: 60px;
        bottom: 60px;
        width: 250px;
        background: ${this.theme.primaryColor};
        border-right: 2px solid ${this.theme.borderColor};
        overflow-y: auto;
        padding: 15px;
      }

      .right-sidebar {
        position: fixed;
        right: 0;
        top: 60px;
        bottom: 60px;
        width: 250px;
        background: ${this.theme.primaryColor};
        border-left: 2px solid ${this.theme.borderColor};
        overflow-y: auto;
        padding: 15px;
      }

      /* Panels */
      .minimap-container,
      .unit-list-panel,
      .territory-panel,
      .building-queue {
        background: ${this.theme.secondaryColor};
        border: 1px solid ${this.theme.borderColor};
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 15px;
      }

      .minimap-container h3,
      .unit-list-panel h3,
      .territory-panel h3,
      .building-queue h3 {
        color: ${this.theme.borderColor};
        font-size: 14px;
        margin-bottom: 10px;
        text-transform: uppercase;
      }

      #minimap-canvas {
        width: 100%;
        height: 200px;
        border: 1px solid ${this.theme.borderColor};
        background: ${this.theme.backgroundColor};
        border-radius: 4px;
      }

      /* Bottom Bar */
      .bottom-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: linear-gradient(135deg, ${this.theme.primaryColor}, ${this.theme.secondaryColor});
        border-top: 2px solid ${this.theme.borderColor};
        padding: 10px 20px;
        display: flex;
        align-items: center;
        z-index: 1001;
      }

      .chat-panel {
        flex: 1;
        display: flex;
        gap: 10px;
        align-items: center;
      }

      #chat-input {
        flex: 1;
        padding: 8px 12px;
        background: ${this.theme.secondaryColor};
        border: 1px solid ${this.theme.borderColor};
        color: ${this.theme.textColor};
        border-radius: 4px;
        font-size: 12px;
      }

      #chat-input:focus {
        outline: none;
        border-color: ${this.theme.accentColor};
        box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
      }

      /* Menus */
      .game-menu,
      .settings-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${this.theme.primaryColor};
        border: 2px solid ${this.theme.borderColor};
        border-radius: 8px;
        padding: 30px;
        min-width: 400px;
        box-shadow: 0 8px 32px ${this.theme.shadowColor};
        z-index: 1002;
      }

      .game-menu h2,
      .settings-panel h2 {
        color: ${this.theme.borderColor};
        margin-bottom: 20px;
        text-align: center;
      }

      .menu-btn,
      .settings-panel select,
      .settings-panel input[type="range"] {
        width: 100%;
        padding: 12px;
        margin: 8px 0;
        background: ${this.theme.secondaryColor};
        border: 1px solid ${this.theme.borderColor};
        color: ${this.theme.textColor};
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .menu-btn:hover {
        background: ${this.theme.accentColor};
        box-shadow: 0 0 12px rgba(0, 212, 255, 0.4);
      }

      .setting-group {
        margin: 15px 0;
      }

      .setting-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
      }

      /* Hidden State */
      .hidden {
        display: none !important;
      }

      /* Notifications */
      .notifications {
        position: fixed;
        top: 70px;
        right: 20px;
        z-index: 1001;
      }

      .notification {
        background: ${this.theme.secondaryColor};
        border-left: 4px solid ${this.theme.borderColor};
        padding: 15px;
        margin: 10px 0;
        border-radius: 4px;
        min-width: 300px;
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      /* Loading Screen */
      .loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${this.theme.backgroundColor};
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }

      .loading-content {
        text-align: center;
      }

      .loading-bar {
        width: 300px;
        height: 8px;
        background: ${this.theme.secondaryColor};
        border-radius: 4px;
        margin: 20px 0;
        overflow: hidden;
        border: 1px solid ${this.theme.borderColor};
      }

      .loading-progress {
        height: 100%;
        background: linear-gradient(90deg, ${this.theme.accentColor}, ${this.theme.borderColor});
        width: 0%;
        transition: width 0.3s ease;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .left-sidebar,
        .right-sidebar {
          width: 150px;
        }

        .top-bar {
          flex-wrap: wrap;
          height: auto;
        }

        .resource-panel {
          gap: 10px;
        }

        .resource-item {
          padding: 3px 10px;
          font-size: 12px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Apply theme colors
   */
  private applyTheme(): void {
    const root = document.documentElement;
    root.style.setProperty("--primary", this.theme.primaryColor);
    root.style.setProperty("--secondary", this.theme.secondaryColor);
    root.style.setProperty("--accent", this.theme.accentColor);
    root.style.setProperty("--background", this.theme.backgroundColor);
    root.style.setProperty("--text", this.theme.textColor);
    root.style.setProperty("--border", this.theme.borderColor);
  }

  /**
   * Add event listeners
   */
  private addEventListeners(): void {
    const menuBtn = document.getElementById("btn-continue");
    const settingsBtn = document.getElementById("btn-settings");
    const closeSettingsBtn = document.getElementById("btn-close-settings");

    if (menuBtn) menuBtn.addEventListener("click", () => this.toggleMenu());
    if (settingsBtn)
      settingsBtn.addEventListener("click", () => this.toggleSettings());
    if (closeSettingsBtn)
      closeSettingsBtn.addEventListener("click", () => this.toggleSettings());

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.toggleMenu();
      if (e.key === "p" || e.key === "P") this.toggleMenu();
    });
  }

  /**
   * Toggle menu visibility
   */
  toggleMenu(): void {
    const menu = document.getElementById("game-menu");
    if (menu) {
      menu.classList.toggle("hidden");
      this.hudState.showMenu = !this.hudState.showMenu;
    }
  }

  /**
   * Toggle settings visibility
   */
  toggleSettings(): void {
    const settings = document.getElementById("settings-panel");
    if (settings) {
      settings.classList.toggle("hidden");
      this.hudState.showSettings = !this.hudState.showSettings;
    }
  }

  /**
   * Show notification
   */
  showNotification(
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
  ): void {
    const container = document.getElementById("notifications");
    if (!container) return;

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Update resource display
   */
  updateResources(resources: any): void {
    const goldEl = document.getElementById("gold-count");
    const foodEl = document.getElementById("food-count");
    const woodEl = document.getElementById("wood-count");
    const popEl = document.getElementById("population-count");

    if (goldEl) goldEl.textContent = Math.floor(resources.gold ?? 0).toString();
    if (foodEl) foodEl.textContent = Math.floor(resources.food ?? 0).toString();
    if (woodEl) woodEl.textContent = Math.floor(resources.wood ?? 0).toString();
    if (popEl)
      popEl.textContent = Math.floor(resources.population ?? 0).toString();
  }

  /**
   * Update turn counter
   */
  updateTurn(turn: number): void {
    const turnEl = document.getElementById("turn-count");
    if (turnEl) turnEl.textContent = turn.toString();
  }

  /**
   * Show loading screen
   */
  showLoading(progress: number = 0, text: string = "Loading..."): void {
    const loadingScreen = document.getElementById("loading-screen");
    const loadingProgress = document.getElementById("loading-progress");
    const loadingText = document.getElementById("loading-text");

    if (loadingScreen) loadingScreen.classList.remove("hidden");
    if (loadingProgress)
      loadingProgress.style.width = Math.min(progress, 100) + "%";
    if (loadingText) loadingText.textContent = text;
  }

  /**
   * Hide loading screen
   */
  hideLoading(): void {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) loadingScreen.classList.add("hidden");
  }

  /**
   * Get HUD state
   */
  getHUDState(): GameHUDState {
    return this.hudState;
  }

  /**
   * Set theme
   */
  setTheme(theme: Partial<UITheme>): void {
    this.theme = { ...this.theme, ...theme };
    this.applyTheme();
  }

  /**
   * Get theme
   */
  getTheme(): UITheme {
    return this.theme;
  }
}

export const gameUIManager = new GameUIManager();
export default GameUIManager;
