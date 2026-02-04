/**
 * Custom Flag UI
 * Provides UI for creating, editing, and managing custom flags
 */

import { CosmeticsManager, CustomFlag } from "./CosmeticsManager";

export class CustomFlagUI {
  private cosmeticsManager: CosmeticsManager;
  private playerId: string;
  private container: HTMLElement | null = null;
  private colors = {
    primary: "#FF0000",
    secondary: "#FFFFFF",
    accent: "#0000FF",
  };
  private currentPattern: CustomFlag["pattern"] = "stripes";

  constructor(cosmeticsManager: CosmeticsManager, playerId: string) {
    this.cosmeticsManager = cosmeticsManager;
    this.playerId = playerId;
  }

  /**
   * Initialize the UI
   */
  initialize(container: HTMLElement): void {
    this.container = container;
    this.setupUI();
  }

  /**
   * Setup the flag creation UI
   */
  private setupUI(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="custom-flag-container" style="background: #1a1a2e; padding: 20px; border-radius: 8px; color: #00d4ff;">
        <h2 style="margin-top: 0; border-bottom: 2px solid #00d4ff; padding-bottom: 10px;">Custom Flag Creator</h2>
        
        <div class="flag-creation-section" style="margin-top: 20px;">
          <h3>Create New Flag</h3>
          
          <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px;">Flag Name:</label>
            <input type="text" id="flagNameInput" placeholder="My Custom Flag" 
              style="width: 100%; padding: 8px; background: #0f0f1e; border: 1px solid #00d4ff; color: #00d4ff; border-radius: 4px;" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 15px 0;">
            <div>
              <label style="display: block; margin-bottom: 5px;">Primary Color:</label>
              <input type="color" id="primaryColorInput" value="${this.colors.primary}" 
                style="width: 100%; height: 40px; cursor: pointer; border: 1px solid #00d4ff; border-radius: 4px;" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 5px;">Secondary Color:</label>
              <input type="color" id="secondaryColorInput" value="${this.colors.secondary}" 
                style="width: 100%; height: 40px; cursor: pointer; border: 1px solid #00d4ff; border-radius: 4px;" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 5px;">Accent Color:</label>
              <input type="color" id="accentColorInput" value="${this.colors.accent}" 
                style="width: 100%; height: 40px; cursor: pointer; border: 1px solid #00d4ff; border-radius: 4px;" />
            </div>
          </div>

          <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px;">Pattern:</label>
            <select id="patternSelect" 
              style="width: 100%; padding: 8px; background: #0f0f1e; border: 1px solid #00d4ff; color: #00d4ff; border-radius: 4px;">
              <option value="solid">Solid</option>
              <option value="stripes" selected>Stripes</option>
              <option value="cross">Cross</option>
              <option value="diagonal">Diagonal</option>
              <option value="quartered">Quartered</option>
            </select>
          </div>

          <div style="margin: 15px 0; height: 150px; background: #0f0f1e; border: 1px solid #00d4ff; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <canvas id="flagPreview" width="200" height="120" style="border: 1px solid #00d4ff;"></canvas>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
            <button id="createFlagBtn" 
              style="padding: 10px; background: #00d4ff; color: #1a1a2e; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
              Create Flag
            </button>
            <button id="resetBtn" 
              style="padding: 10px; background: #333; color: #00d4ff; border: 1px solid #00d4ff; border-radius: 4px; cursor: pointer;">
              Reset
            </button>
          </div>
        </div>

        <div class="player-flags-section" style="margin-top: 30px;">
          <h3>Your Custom Flags</h3>
          <div id="playerFlagsContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
            <!-- Flags will be rendered here -->
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.renderPlayerFlags();
    this.updatePreview();
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    const primaryInput = this.container?.querySelector(
      "#primaryColorInput",
    ) as HTMLInputElement;
    const secondaryInput = this.container?.querySelector(
      "#secondaryColorInput",
    ) as HTMLInputElement;
    const accentInput = this.container?.querySelector(
      "#accentColorInput",
    ) as HTMLInputElement;
    const patternSelect = this.container?.querySelector(
      "#patternSelect",
    ) as HTMLSelectElement;
    const createBtn = this.container?.querySelector(
      "#createFlagBtn",
    ) as HTMLButtonElement;
    const resetBtn = this.container?.querySelector(
      "#resetBtn",
    ) as HTMLButtonElement;

    primaryInput?.addEventListener("change", (e) => {
      this.colors.primary = (e.target as HTMLInputElement).value;
      this.updatePreview();
    });

    secondaryInput?.addEventListener("change", (e) => {
      this.colors.secondary = (e.target as HTMLInputElement).value;
      this.updatePreview();
    });

    accentInput?.addEventListener("change", (e) => {
      this.colors.accent = (e.target as HTMLInputElement).value;
      this.updatePreview();
    });

    patternSelect?.addEventListener("change", (e) => {
      this.currentPattern = (e.target as HTMLSelectElement)
        .value as CustomFlag["pattern"];
      this.updatePreview();
    });

    createBtn?.addEventListener("click", () => this.createFlag());
    resetBtn?.addEventListener("click", () => this.resetForm());
  }

  /**
   * Update flag preview canvas
   */
  private updatePreview(): void {
    const canvas = this.container?.querySelector(
      "#flagPreview",
    ) as HTMLCanvasElement;
    if (!canvas) return;

    this.drawFlag(canvas, this.colors, this.currentPattern);
  }

  /**
   * Draw flag on canvas
   */
  private drawFlag(
    canvas: HTMLCanvasElement,
    colors: { primary: string; secondary: string; accent: string },
    pattern: CustomFlag["pattern"],
  ): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (pattern) {
      case "solid":
        break;

      case "stripes": {
        ctx.fillStyle = colors.secondary;
        const stripeWidth = canvas.width / 3;
        for (let i = 1; i < 3; i++) {
          ctx.fillRect(stripeWidth * i, 0, stripeWidth, canvas.height);
        }
        break;
      }

      case "cross": {
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(canvas.width / 3, 0, canvas.width / 3, canvas.height);
        ctx.fillRect(0, canvas.height / 3, canvas.width, canvas.height / 3);
        ctx.fillStyle = colors.accent;
        const accentSize = Math.min(canvas.width, canvas.height) / 4;
        ctx.fillRect(
          canvas.width / 2 - accentSize / 2,
          canvas.height / 2 - accentSize / 2,
          accentSize,
          accentSize,
        );
        break;
      }

      case "diagonal":
        ctx.fillStyle = colors.secondary;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(canvas.width, 0);
        ctx.fill();
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.fill();
        break;

      case "quartered": {
        const w = canvas.width / 2;
        const h = canvas.height / 2;
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(0, 0, w, h);
        ctx.fillRect(w, h, w, h);
        ctx.fillStyle = colors.accent;
        ctx.fillRect(w, 0, w, h);
        ctx.fillRect(0, h, w, h);
        break;
      }
    }
  }

  /**
   * Create a new flag
   */
  private createFlag(): void {
    const nameInput = this.container?.querySelector(
      "#flagNameInput",
    ) as HTMLInputElement;
    const name = nameInput?.value?.trim();

    if (!name) {
      alert("Please enter a flag name");
      return;
    }

    const flag = this.cosmeticsManager.createCustomFlag(
      this.playerId,
      name,
      this.colors.primary,
      this.colors.secondary,
      this.colors.accent,
      this.currentPattern,
    );

    if (flag) {
      alert(`Flag "${name}" created successfully!`);
      this.resetForm();
      this.renderPlayerFlags();
    }
  }

  /**
   * Render player's custom flags
   */
  private renderPlayerFlags(): void {
    const container = this.container?.querySelector(
      "#playerFlagsContainer",
    ) as HTMLElement;
    if (!container) return;

    const flags = this.cosmeticsManager.getPlayerCustomFlags(this.playerId);

    if (flags.length === 0) {
      container.innerHTML =
        "<p style='color: #888;'>No custom flags created yet</p>";
      return;
    }

    container.innerHTML = flags
      .map(
        (flag) => `
      <div style="background: #0f0f1e; border: 1px solid #00d4ff; border-radius: 4px; padding: 10px;">
        <canvas 
          data-flag-id="${flag.id}" 
          width="150" 
          height="90" 
          style="width: 100%; border: 1px solid #00d4ff; border-radius: 3px; margin-bottom: 8px;">
        </canvas>
        <p style="margin: 5px 0; font-size: 12px;">${flag.name}</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
          <button class="equip-flag-btn" data-flag-id="${flag.id}" 
            style="padding: 5px; background: #00d4ff; color: #1a1a2e; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
            Equip
          </button>
          <button class="delete-flag-btn" data-flag-id="${flag.id}" 
            style="padding: 5px; background: #f00; color: #fff; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
            Delete
          </button>
        </div>
      </div>
    `,
      )
      .join("");

    // Render flag previews
    flags.forEach((flag) => {
      const canvas = container.querySelector(
        `canvas[data-flag-id="${flag.id}"]`,
      ) as HTMLCanvasElement;
      if (canvas) {
        this.drawFlag(
          canvas,
          {
            primary: flag.primary,
            secondary: flag.secondary,
            accent: flag.accent,
          },
          flag.pattern,
        );
      }
    });

    // Attach flag action listeners
    container.querySelectorAll(".equip-flag-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const flagId = (e.target as HTMLElement).getAttribute("data-flag-id");
        if (flagId) this.equipFlag(flagId);
      });
    });

    container.querySelectorAll(".delete-flag-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const flagId = (e.target as HTMLElement).getAttribute("data-flag-id");
        if (flagId) this.deleteFlag(flagId);
      });
    });
  }

  /**
   * Equip a flag
   */
  private equipFlag(flagId: string): void {
    const success = this.cosmeticsManager.equipCustomFlag(
      this.playerId,
      flagId,
    );
    if (success) {
      alert("Flag equipped!");
      this.renderPlayerFlags();
    }
  }

  /**
   * Delete a flag
   */
  private deleteFlag(flagId: string): void {
    if (confirm("Are you sure you want to delete this flag?")) {
      const success = this.cosmeticsManager.deleteCustomFlag(
        this.playerId,
        flagId,
      );
      if (success) {
        alert("Flag deleted!");
        this.renderPlayerFlags();
      }
    }
  }

  /**
   * Reset form
   */
  private resetForm(): void {
    const nameInput = this.container?.querySelector(
      "#flagNameInput",
    ) as HTMLInputElement;
    const primaryInput = this.container?.querySelector(
      "#primaryColorInput",
    ) as HTMLInputElement;
    const secondaryInput = this.container?.querySelector(
      "#secondaryColorInput",
    ) as HTMLInputElement;
    const accentInput = this.container?.querySelector(
      "#accentColorInput",
    ) as HTMLInputElement;
    const patternSelect = this.container?.querySelector(
      "#patternSelect",
    ) as HTMLSelectElement;

    if (nameInput) nameInput.value = "";
    if (primaryInput) {
      primaryInput.value = "#FF0000";
      this.colors.primary = "#FF0000";
    }
    if (secondaryInput) {
      secondaryInput.value = "#FFFFFF";
      this.colors.secondary = "#FFFFFF";
    }
    if (accentInput) {
      accentInput.value = "#0000FF";
      this.colors.accent = "#0000FF";
    }
    if (patternSelect) {
      patternSelect.value = "stripes";
      this.currentPattern = "stripes";
    }

    this.updatePreview();
  }
}

export default CustomFlagUI;
