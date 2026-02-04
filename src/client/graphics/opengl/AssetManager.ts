/**
 * OpenGL Asset Manager
 * Manages loading and caching of all game assets for OpenGL rendering
 * AGPL 3.0 License - See LICENSE file for details
 */

declare let THREE: any;

export interface AssetReference {
  type: "texture" | "model" | "sound" | "animation";
  path: string;
  cached: boolean;
  data?: any;
}

export class AssetManager {
  private textureLoader: any;
  private assetCache: Map<string, AssetReference> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  constructor() {
    this.initializeLoader().catch((e) =>
      console.warn("AssetManager init failed:", e),
    );
  }

  private async initializeLoader(): Promise<void> {
    try {
      const THREEModule =
        typeof THREE !== "undefined" ? THREE : await this.loadThree();
      if (THREEModule?.TextureLoader) {
        this.textureLoader = new THREEModule.TextureLoader();
      }
    } catch (e) {
      console.warn("Could not initialize TextureLoader", e);
    }
  }

  private async loadThree(): Promise<any> {
    // THREE.js is optional - return empty object if not available
    // This allows AssetManager to work without THREE dependency
    try {
      // Try to use global THREE if available
      if (typeof THREE !== "undefined") {
        return THREE;
      }
      return {};
    } catch (e) {
      console.warn("THREE.js not available");
      return {};
    }
  }

  /**
   * Load all game assets from resources directory
   */
  async loadAllAssets(): Promise<void> {
    const assetGroups = [
      this.loadTerrainAssets(),
      this.loadUnitAssets(),
      this.loadStructureAssets(),
      this.loadCosmeticAssets(),
      this.loadParticleAssets(),
      this.loadFlagAssets(),
    ];

    await Promise.all(assetGroups);
  }

  private async loadTerrainAssets(): Promise<void> {
    const terrainPaths = [
      "resources/images/terrain.png",
      "resources/maps/terrain-texture.png",
      "resources/maps/grass.png",
      "resources/maps/water.png",
      "resources/maps/mountain.png",
    ];

    for (const path of terrainPaths) {
      await this.loadTexture(path, `terrain_${path.split("/").pop()}`);
    }
  }

  private async loadUnitAssets(): Promise<void> {
    const unitTypes = [
      "soldier",
      "tank",
      "helicopter",
      "ship",
      "missile",
      "tank-light",
      "tank-heavy",
    ];

    for (const unitType of unitTypes) {
      const path = `resources/sprites/${unitType}.png`;
      await this.loadTexture(path, `unit_${unitType}`);
    }
  }

  private async loadStructureAssets(): Promise<void> {
    const structures = [
      "barracks",
      "factory",
      "powerplant",
      "radar",
      "sam",
      "bridge",
      "house",
      "tower",
      "wall",
      "gate",
      "airport",
      "harbor",
      "hospital",
      "mine",
      "farm",
      "research",
      "missile-silo",
    ];

    for (const structure of structures) {
      const path = `resources/images/${structure}.png`;
      await this.loadTexture(path, `structure_${structure}`);
    }
  }

  private async loadCosmeticAssets(): Promise<void> {
    const cosmetics = [
      "flag-us",
      "flag-uk",
      "flag-fr",
      "flag-de",
      "flag-ru",
      "flag-cn",
      "shield-gold",
      "shield-silver",
      "shield-bronze",
      "aura-gold",
      "aura-silver",
      "aura-blue",
      "crown",
      "trophy",
    ];

    for (const cosmetic of cosmetics) {
      const path = `resources/cosmetics/${cosmetic}.png`;
      await this.loadTexture(path, `cosmetic_${cosmetic}`);
    }
  }

  private async loadParticleAssets(): Promise<void> {
    const particles = [
      "explosion",
      "smoke",
      "fire",
      "spark",
      "dust",
      "impact",
      "flame",
      "water-splash",
      "blood",
      "debris",
      "flash",
      "glow",
    ];

    for (const particle of particles) {
      const path = `resources/fx/${particle}.png`;
      await this.loadTexture(path, `particle_${particle}`);
    }
  }

  private async loadFlagAssets(): Promise<void> {
    const flags = [
      "us",
      "uk",
      "fr",
      "de",
      "ru",
      "cn",
      "jp",
      "ca",
      "au",
      "br",
      "in",
      "mx",
    ];

    for (const flag of flags) {
      const path = `resources/flags/${flag}.png`;
      await this.loadTexture(path, `flag_${flag}`);
    }
  }

  async loadTexture(path: string, key: string): Promise<any> {
    // Check if already loaded
    if (this.assetCache.has(key)) {
      const asset = this.assetCache.get(key);
      if (asset?.cached) {
        return (asset.data as any) ?? null;
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    // Create loading promise
    const loadPromise = new Promise<any>((resolve) => {
      if (!this.textureLoader) {
        console.warn("TextureLoader not initialized");
        resolve(null);
        return;
      }

      this.textureLoader.load(
        path,
        (texture: any) => {
          if (typeof THREE !== "undefined" && THREE.NearestFilter) {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
          }

          this.assetCache.set(key, {
            type: "texture",
            path,
            cached: true,
            data: texture,
          });

          this.loadingPromises.delete(key);
          resolve(texture);
        },
        undefined,
        (error: any) => {
          console.warn(`Failed to load texture: ${path}`, error);
          this.loadingPromises.delete(key);
          resolve(null);
        },
      );
    });

    this.loadingPromises.set(key, loadPromise);
    return loadPromise;
  }

  getTexture(key: string): any {
    const asset = this.assetCache.get(key);
    return asset?.cached ? (asset.data as any) : undefined;
  }

  getAsset(key: string): AssetReference | undefined {
    return this.assetCache.get(key);
  }

  hasAsset(key: string): boolean {
    const asset = this.assetCache.get(key);
    return asset?.cached ?? false;
  }

  getAllAssets(): Map<string, AssetReference> {
    return new Map(this.assetCache);
  }

  clearCache(): void {
    this.assetCache.forEach((asset) => {
      if (asset.data instanceof THREE.Texture) {
        asset.data.dispose();
      }
    });
    this.assetCache.clear();
    this.loadingPromises.clear();
  }

  getLoadingProgress(): {
    loaded: number;
    total: number;
    percentage: number;
  } {
    const loaded = Array.from(this.assetCache.values()).filter(
      (a) => a.cached,
    ).length;
    const total = this.assetCache.size + this.loadingPromises.size;
    return {
      loaded,
      total,
      percentage: total > 0 ? (loaded / total) * 100 : 0,
    };
  }
}

export const assetManager = new AssetManager();
