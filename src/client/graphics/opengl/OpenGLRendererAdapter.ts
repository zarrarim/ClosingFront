/**
 * OpenGL Renderer Adapter
 * Bridges OpenGL rendering with existing game renderer system
 * Maintains compatibility with existing code while enabling 3D rendering
 * AGPL 3.0 License - See LICENSE file for details
 */

import { EventBus } from "../../../core/EventBus";
import { GameView } from "../../../core/game/GameView";
import { TransformHandler } from "../TransformHandler";
import { UIState } from "../UIState";
import { assetManager } from "./AssetManager";
import {
  ExplosionEvent,
  ExplosionParticleEvent,
  FireParticleEvent,
  GameStateUpdateEvent,
  ImpactParticleEvent,
  OpenGLReadyEvent,
  RenderModeChangedEvent,
  SmokeParticleEvent,
  StructureDestroyedEvent,
  UnitAttackEvent,
} from "./OpenGLEvents";
import { OpenGLRenderer } from "./OpenGLRenderer";
import { ParticleEffects, ParticleSystem } from "./ParticleSystem";

export enum RenderMode {
  CANVAS_2D = "2d",
  OPENGL = "opengl",
  HYBRID = "hybrid", // Uses OpenGL for background, 2D for UI
}

export class OpenGLRendererAdapter {
  private canvas: HTMLCanvasElement;
  private game: GameView;
  private eventBus: EventBus;
  private transformHandler: TransformHandler;
  private uiState: UIState;

  private renderMode: RenderMode = RenderMode.HYBRID;
  private openglRenderer: OpenGLRenderer | null = null;
  private particleSystems: Map<string, ParticleSystem> = new Map();

  private isInitialized: boolean = false;
  private assetsLoading: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    game: GameView,
    eventBus: EventBus,
    transformHandler: TransformHandler,
    uiState: UIState,
  ) {
    this.canvas = canvas;
    this.game = game;
    this.eventBus = eventBus;
    this.transformHandler = transformHandler;
    this.uiState = uiState;

    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // Listen for game events that trigger visual effects
    this.eventBus.on(UnitAttackEvent, (event: UnitAttackEvent) => {
      this.onUnitAttack(event);
    });

    this.eventBus.on(
      StructureDestroyedEvent,
      (event: StructureDestroyedEvent) => {
        this.onStructureDestroyed(event);
      },
    );

    this.eventBus.on(ExplosionEvent, (event: ExplosionEvent) => {
      this.onExplosion(event);
    });

    this.eventBus.on(GameStateUpdateEvent, (event: GameStateUpdateEvent) => {
      this.onGameStateUpdate(event);
    });
  }

  /**
   * Initialize OpenGL renderer with all assets
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.assetsLoading = true;

      // Load all game assets
      await assetManager.loadAllAssets();

      // Create OpenGL renderer
      this.openglRenderer = new OpenGLRenderer(
        this.canvas,
        this.game,
        this.eventBus,
        this.transformHandler,
        this.uiState,
        {
          antialiasing: true,
          shadowMap: true,
          enableLights: true,
          targetFPS: 60,
        },
      );

      this.isInitialized = true;
      this.assetsLoading = false;

      // Notify that OpenGL is ready
      this.eventBus.emit(new OpenGLReadyEvent(this));
    } catch (error) {
      console.error("Failed to initialize OpenGL renderer:", error);
      this.assetsLoading = false;
      // Fallback to canvas 2D
      this.renderMode = RenderMode.CANVAS_2D;
    }
  }

  /**
   * Set render mode (2D, OpenGL, or Hybrid)
   */
  setRenderMode(mode: RenderMode): void {
    if (!this.isInitialized && mode !== RenderMode.CANVAS_2D) {
      console.warn(
        "OpenGL not initialized. Cannot switch to",
        mode,
        "- falling back to 2D",
      );
      this.renderMode = RenderMode.CANVAS_2D;
      return;
    }

    this.renderMode = mode;
    this.eventBus.emit(new RenderModeChangedEvent(mode));
  }

  /**
   * Get current render mode
   */
  getRenderMode(): RenderMode {
    return this.renderMode;
  }

  /**
   * Check if OpenGL is available
   */
  isOpenGLAvailable(): boolean {
    return this.isInitialized && this.openglRenderer !== null;
  }

  /**
   * Check if assets are still loading
   */
  isLoadingAssets(): boolean {
    return this.assetsLoading;
  }

  /**
   * Get asset loading progress
   */
  getLoadingProgress(): { loaded: number; total: number; percentage: number } {
    return assetManager.getLoadingProgress();
  }

  /**
   * Render a frame
   */
  render(deltaTime: number): void {
    if (!this.isInitialized) return;

    // Update particle systems
    this.updateParticles(deltaTime);

    // Render based on mode
    switch (this.renderMode) {
      case RenderMode.OPENGL:
        if (this.openglRenderer) {
          this.openglRenderer.render(deltaTime);
        }
        break;

      case RenderMode.HYBRID:
        // OpenGL renders in background via animation loop
        // 2D rendering happens separately via game renderer
        break;

      case RenderMode.CANVAS_2D:
        // Use standard canvas 2D rendering
        break;
    }
  }

  /**
   * Add a particle effect at position
   */
  createParticleEffect(
    effectType: string,
    position: { x: number; y: number },
    intensity: number = 1,
  ): ParticleSystem | null {
    if (!this.openglRenderer) {
      console.warn("OpenGL renderer not available for particle effects");
      return null;
    }

    const pos = { x: position.x, y: position.y, z: 0 };
    let particleSystem: ParticleSystem | null = null;

    switch (effectType) {
      case "explosion":
        // Emit event for 2D renderer
        this.eventBus.emit(new ExplosionParticleEvent(position, { intensity }));
        // Also create 3D particles
        particleSystem = ParticleEffects.createExplosion(
          { x: pos.x, y: pos.y, z: pos.z } as any,
          intensity,
        );
        break;

      case "smoke":
        this.eventBus.emit(new SmokeParticleEvent(position, { intensity }));
        particleSystem = ParticleEffects.createSmoke(
          { x: pos.x, y: pos.y, z: pos.z } as any,
          intensity,
        );
        break;

      case "fire":
        this.eventBus.emit(new FireParticleEvent(position, { intensity }));
        particleSystem = ParticleEffects.createFire(
          { x: pos.x, y: pos.y, z: pos.z } as any,
          intensity,
        );
        break;

      case "impact":
        this.eventBus.emit(new ImpactParticleEvent(position, { intensity }));
        particleSystem = ParticleEffects.createImpact(
          { x: pos.x, y: pos.y, z: pos.z } as any,
          intensity,
        );
        break;
    }

    if (particleSystem) {
      const effectKey = `${effectType}_${Date.now()}`;
      this.particleSystems.set(effectKey, particleSystem);

      // Auto-cleanup after effect expires
      setTimeout(() => {
        const system = this.particleSystems.get(effectKey);
        if (system) {
          system.dispose();
          this.particleSystems.delete(effectKey);
        }
      }, 5000);
    }

    return particleSystem;
  }

  /**
   * Update all active particle systems
   */
  private updateParticles(deltaTime: number): void {
    const deadSystems: string[] = [];

    this.particleSystems.forEach((system, key) => {
      system.update(deltaTime);
      if (system.getParticleCount() === 0) {
        deadSystems.push(key);
      }
    });

    // Cleanup dead particle systems
    deadSystems.forEach((key) => {
      const system = this.particleSystems.get(key);
      if (system) {
        system.dispose();
        this.particleSystems.delete(key);
      }
    });
  }

  /**
   * Event handlers for game events
   */
  private onUnitAttack(event: UnitAttackEvent): void {
    if (event.attacker) {
      this.createParticleEffect("explosion", event.position, 1);
    }
  }

  private onStructureDestroyed(event: StructureDestroyedEvent): void {
    this.createParticleEffect("explosion", event.position, 1.5);
    this.createParticleEffect("smoke", event.position, 1);
  }

  private onExplosion(event: ExplosionEvent): void {
    this.createParticleEffect("explosion", event.position, event.intensity);
  }

  private onGameStateUpdate(event: GameStateUpdateEvent): void {
    // Update game state for rendering
    if (this.openglRenderer) {
      // Renderer will pull from game state
    }
  }

  /**
   * Get the THREE.js renderer for advanced operations
   */
  getThreeRenderer(): any {
    return this.openglRenderer?.getThreeRenderer() ?? null;
  }

  /**
   * Get the THREE.js scene for adding custom objects
   */
  getScene(): any {
    return this.openglRenderer?.getScene() ?? null;
  }

  /**
   * Cleanup and dispose resources
   */
  dispose(): void {
    this.particleSystems.forEach((system) => {
      system.dispose();
    });
    this.particleSystems.clear();

    if (this.openglRenderer) {
      this.openglRenderer.dispose();
      this.openglRenderer = null;
    }

    assetManager.clearCache();
    this.isInitialized = false;
  }
}

/**
 * Factory function to create adapter
 */
export function createOpenGLAdapter(
  canvas: HTMLCanvasElement,
  game: GameView,
  eventBus: EventBus,
  transformHandler: TransformHandler,
  uiState: UIState,
): OpenGLRendererAdapter {
  return new OpenGLRendererAdapter(
    canvas,
    game,
    eventBus,
    transformHandler,
    uiState,
  );
}
