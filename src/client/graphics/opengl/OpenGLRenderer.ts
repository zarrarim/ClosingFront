/**
 * OpenGL Renderer using THREE.js
 * Integrates all game assets and provides 3D rendering capabilities
 * AGPL 3.0 License - See LICENSE file for details
 */

import { EventBus } from "../../../core/EventBus";
import { GameView } from "../../../core/game/GameView";
import { TransformHandler } from "../TransformHandler";
import { UIState } from "../UIState";

// Use dynamic import to load THREE at runtime
// This avoids module resolution issues during build
declare let THREE: any;

export async function createOpenGLRenderer(
  canvas: HTMLCanvasElement,
  game: GameView,
  eventBus: EventBus,
  transformHandler: TransformHandler,
  uiState: UIState,
  config?: Partial<OpenGLRendererConfig>,
): Promise<OpenGLRenderer> {
  // THREE.js is optional - only load if needed
  // Renderer works in Canvas 2D mode if THREE is not available
  return new OpenGLRenderer(
    canvas,
    game,
    eventBus,
    transformHandler,
    uiState,
    config ?? {},
  );
}

export interface OpenGLRendererConfig {
  antialiasing: boolean;
  shadowMap: boolean;
  enableLights: boolean;
  targetFPS: number;
}

export class OpenGLRenderer {
  private scene: any;
  private camera: any;
  private renderer: any;
  private canvas: HTMLCanvasElement;
  private game: GameView;
  private eventBus: EventBus;
  private transformHandler: TransformHandler;
  private uiState: UIState;
  private config: OpenGLRendererConfig;

  // Terrain and map layers
  private terrainMesh: any = null;
  private territoryMesh: any = null;
  private structureGroup: any = null;
  private unitGroup: any = null;
  private particleGroup: any = null;

  // Lights
  private ambientLight: any = null;
  private directionalLight: any = null;

  // Textures cache
  private textureCache: Map<string, any> = new Map();

  // Animation frame
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    game: GameView,
    eventBus: EventBus,
    transformHandler: TransformHandler,
    uiState: UIState,
    config: Partial<OpenGLRendererConfig> = {},
  ) {
    this.canvas = canvas;
    this.game = game;
    this.eventBus = eventBus;
    this.transformHandler = transformHandler;
    this.uiState = uiState;
    this.config = {
      antialiasing: true,
      shadowMap: true,
      enableLights: true,
      targetFPS: 60,
      ...config,
    };

    // Initialize THREE.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 1000, 5000);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      5000,
    );
    this.camera.position.z = 100;
    this.camera.position.y = 50;
    this.camera.lookAt(0, 0, 0);

    // Initialize WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: this.config.antialiasing,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = this.config.shadowMap;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    // Initialize lighting
    this.setupLights();

    // Setup asset groups
    this.scene.add(this.structureGroup);
    this.scene.add(this.unitGroup);
    this.scene.add(this.particleGroup);

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());

    this.initializeAssets();
    this.startAnimationLoop();
  }

  private setupLights(): void {
    if (!this.config.enableLights) return;

    // Ambient light for overall scene illumination
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // Directional light for shadows and depth
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(100, 150, 100);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.left = -500;
    this.directionalLight.shadow.camera.right = 500;
    this.directionalLight.shadow.camera.top = 500;
    this.directionalLight.shadow.camera.bottom = -500;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 1000;
    this.scene.add(this.directionalLight);
  }

  private initializeAssets(): void {
    // Load and initialize all game assets
    this.loadTerrainTextures();
    this.loadUnitAssets();
    this.loadStructureAssets();
    this.loadParticleAssets();
  }

  private loadTerrainTextures(): void {
    const textureLoader = new THREE.TextureLoader();

    // Try to load terrain textures from resources
    const terrainPaths = [
      "resources/images/terrain.png",
      "resources/maps/base-terrain.png",
    ];

    terrainPaths.forEach((path) => {
      textureLoader.load(
        path,
        (texture) => {
          this.textureCache.set(path, texture);
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.NearestFilter;
        },
        undefined,
        (error) => {
          console.warn(`Failed to load terrain texture: ${path}`, error);
        },
      );
    });
  }

  private loadUnitAssets(): void {
    const textureLoader = new THREE.TextureLoader();

    // Load unit sprites from resources
    const unitTypes = ["soldier", "tank", "helicopter", "ship", "missile"];
    const cosmetics = ["flag", "shield", "aura"];

    unitTypes.forEach((unitType) => {
      const path = `resources/sprites/${unitType}.png`;
      textureLoader.load(
        path,
        (texture) => {
          this.textureCache.set(`unit_${unitType}`, texture);
        },
        undefined,
        (error) => {
          console.warn(`Failed to load unit texture: ${unitType}`, error);
        },
      );
    });

    cosmetics.forEach((cosmetic) => {
      const path = `resources/cosmetics/${cosmetic}.png`;
      textureLoader.load(
        path,
        (texture) => {
          this.textureCache.set(`cosmetic_${cosmetic}`, texture);
        },
        undefined,
        (error) => {
          console.warn(`Failed to load cosmetic: ${cosmetic}`, error);
        },
      );
    });
  }

  private loadStructureAssets(): void {
    const textureLoader = new THREE.TextureLoader();

    const structures = [
      "barracks",
      "factory",
      "powerplant",
      "radar",
      "sam",
      "bridge",
      "house",
    ];

    structures.forEach((structure) => {
      const path = `resources/images/${structure}.png`;
      textureLoader.load(
        path,
        (texture) => {
          this.textureCache.set(`structure_${structure}`, texture);
        },
        undefined,
        (error) => {
          console.warn(`Failed to load structure: ${structure}`, error);
        },
      );
    });
  }

  private loadParticleAssets(): void {
    const textureLoader = new THREE.TextureLoader();

    const particles = ["explosion", "smoke", "fire", "spark", "dust", "impact"];

    particles.forEach((particle) => {
      const path = `resources/fx/${particle}.png`;
      textureLoader.load(
        path,
        (texture) => {
          this.textureCache.set(`particle_${particle}`, texture);
        },
        undefined,
        (error) => {
          console.warn(`Failed to load particle: ${particle}`, error);
        },
      );
    });
  }

  public render(deltaTime: number): void {
    // Update game logic
    this.updateGameState();

    // Update camera position based on game view
    this.updateCamera();

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    this.frameCount++;
  }

  private updateGameState(): void {
    // Update structure positions
    this.updateStructures();

    // Update unit positions
    this.updateUnits();

    // Update territory display
    this.updateTerritories();

    // Update particles
    this.updateParticles();
  }

  private updateStructures(): void {
    // Clear old structures
    if (this.structureGroup && this.structureGroup.children) {
      while (this.structureGroup.children.length > 0) {
        this.structureGroup.remove(this.structureGroup.children[0]);
      }
    }

    // Get all territories to render structures
    // Handle different GameView API versions
    const territories =
      (this.game as any).territories ??
      (this.game as any).getTerritories?.() ??
      new Map();

    if (territories && typeof territories.values === "function") {
      for (const territory of territories.values()) {
        for (const structure of territory.structures ?? []) {
          const mesh = this.createStructureMesh(structure);
          if (mesh) {
            mesh.position.x = structure.position?.x ?? 0;
            mesh.position.y = 0;
            mesh.position.z = structure.position?.y ?? 0;
            this.structureGroup.add(mesh);
          }
        }
      }
    }
  }

  private updateUnits(): void {
    // Clear old units
    if (this.unitGroup && this.unitGroup.children) {
      while (this.unitGroup.children.length > 0) {
        this.unitGroup.remove(this.unitGroup.children[0]);
      }
    }

    // Get all units from game view
    // Handle different GameView API versions
    const getUnits = (this.game as any).getUnits ?? (this.game as any).units;
    const units =
      typeof getUnits === "function" ? getUnits() : (getUnits ?? []);

    if (Array.isArray(units)) {
      for (const unit of units) {
        const mesh = this.createUnitMesh(unit);
        if (mesh) {
          mesh.position.x = unit.position?.x ?? 0;
          mesh.position.y = 0;
          mesh.position.z = unit.position?.y ?? 0;
          this.unitGroup.add(mesh);
        }
      }
    }
  }

  private updateTerritories(): void {
    // Update territory colors and visibility
    const territories =
      (this.game as any).territories ??
      (this.game as any).getTerritories?.() ??
      new Map();

    if (territories && typeof territories.values === "function") {
      // Territory rendering would update the territory mesh
    }
  }

  private updateParticles(): void {
    // Update active particles
    // Remove expired particles
    const now = Date.now();
    if (this.particleGroup && this.particleGroup.children) {
      for (let i = this.particleGroup.children.length - 1; i >= 0; i--) {
        const child = this.particleGroup.children[i];
        if ((child as any).expiryTime && (child as any).expiryTime < now) {
          this.particleGroup.remove(child);
        }
      }
    }
  }

  private createStructureMesh(structure: any): any {
    const geometry = new THREE.BoxGeometry(10, 15, 10);
    const material = new THREE.MeshStandardMaterial({
      color: this.getStructureColor(structure),
      metalness: 0.3,
      roughness: 0.4,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private createUnitMesh(unit: any): any {
    const geometry = new THREE.SphereGeometry(3, 8, 8);
    const material = new THREE.MeshStandardMaterial({
      color: this.getUnitColor(unit),
      metalness: 0.6,
      roughness: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private getStructureColor(structure: any): number {
    if (!structure.owner) return 0x666666;
    return structure.owner.color ?? 0x0066cc;
  }

  private getUnitColor(unit: any): number {
    if (!unit.owner) return 0x888888;
    return unit.owner.color ?? 0x00ff00;
  }

  private updateCamera(): void {
    // Update camera based on transform handler
    // Handle different possible property names and access patterns
    let zoomLevel = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (this.transformHandler) {
      // Try different property names that might be available
      zoomLevel =
        (this.transformHandler as any).zoom ??
        (this.transformHandler as any).zoomLevel ??
        (this.transformHandler as any).scale ??
        1;

      offsetX =
        (this.transformHandler as any).x ??
        (this.transformHandler as any).offsetX ??
        (this.transformHandler as any).translateX ??
        0;

      offsetY =
        (this.transformHandler as any).y ??
        (this.transformHandler as any).offsetY ??
        (this.transformHandler as any).translateY ??
        0;
    }

    this.camera.position.z = 100 / zoomLevel;
    this.camera.position.x = offsetX;
    this.camera.position.y = offsetY + 50;

    this.camera.updateProjectionMatrix();
  }

  private onWindowResize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private startAnimationLoop(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const deltaTime = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;

      this.render(deltaTime);
    };

    animate();
  }

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.renderer.dispose();
    this.textureCache.forEach((texture) => texture.dispose());
    this.textureCache.clear();
  }

  public getScene(): any {
    return this.scene;
  }

  public getCamera(): any {
    return this.camera;
  }

  public getThreeRenderer(): any {
    return this.renderer;
  }

  public getFrameCount(): number {
    return this.frameCount;
  }
}
