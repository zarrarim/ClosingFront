/**
 * Assets Manager
 * Manages all game assets: maps, country flags, images, territories
 * Integrates all resources from resources/ directory
 */

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  colors: string[];
  territories: string[];
}

export interface MapInfo {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  size: number;
  terrainTypes: string[];
  waterPercentage: number;
  difficulty: "easy" | "normal" | "hard";
}

export interface TerrainType {
  id: string;
  name: string;
  texture: string;
  color: number;
  passable: boolean;
  defensiveBonus: number;
  resourceBonus: number;
}

export class AssetsManager {
  private countryFlags: Map<string, CountryInfo> = new Map();
  private maps: Map<string, MapInfo> = new Map();
  private terrainTypes: Map<string, TerrainType> = new Map();
  private imageCache: Map<string, HTMLImageElement | null> = new Map();

  constructor() {
    this.initializeCountries();
    this.initializeMaps();
    this.initializeTerrains();
  }

  /**
   * Initialize all country data with flags
   */
  private initializeCountries(): void {
    const countries: CountryInfo[] = [
      {
        code: "US",
        name: "United States",
        flag: "/assets/flags/us.svg",
        colors: ["#B22234", "#FFFFFF", "#3C3B6B"],
        territories: ["east_coast", "midwest", "west_coast"],
      },
      {
        code: "FR",
        name: "France",
        flag: "/assets/flags/fr.svg",
        colors: ["#002395", "#FFFFFF", "#ED2939"],
        territories: ["french_north", "french_central", "french_south"],
      },
      {
        code: "DE",
        name: "Germany",
        flag: "/assets/flags/de.svg",
        colors: ["#000", "#D00", "#FFCE00"],
        territories: ["german_north", "german_central", "german_south"],
      },
      {
        code: "GB",
        name: "United Kingdom",
        flag: "/assets/flags/gb.svg",
        colors: ["#012169", "#FFFFFF", "#C8102E"],
        territories: ["england", "scotland", "wales", "ireland"],
      },
      {
        code: "JP",
        name: "Japan",
        flag: "/assets/flags/jp.svg",
        colors: ["#FFFFFF", "#BC002D"],
        territories: ["honshu", "hokkaido", "kyushu", "shikoku"],
      },
      {
        code: "CN",
        name: "China",
        flag: "/assets/flags/cn.svg",
        colors: ["#DE2910"],
        territories: ["north_china", "central_china", "south_china"],
      },
      {
        code: "IN",
        name: "India",
        flag: "/assets/flags/in.svg",
        colors: ["#FF9933", "#FFFFFF", "#128807"],
        territories: ["north_india", "central_india", "south_india"],
      },
      {
        code: "BR",
        name: "Brazil",
        flag: "/assets/flags/br.svg",
        colors: ["#009C3B", "#FFCD00", "#002776"],
        territories: ["amazon", "southeast", "northeast"],
      },
      {
        code: "RU",
        name: "Russia",
        flag: "/assets/flags/ru.svg",
        colors: ["#FFFFFF", "#0039A6", "#D52B1E"],
        territories: ["european_russia", "siberia", "far_east"],
      },
      {
        code: "AU",
        name: "Australia",
        flag: "/assets/flags/au.svg",
        colors: ["#00008B", "#FFFFFF"],
        territories: ["eastern_australia", "western_australia", "outback"],
      },
    ];

    countries.forEach((country) => {
      this.countryFlags.set(country.code, country);
    });
  }

  /**
   * Initialize all available maps
   */
  private initializeMaps(): void {
    const maps: MapInfo[] = [
      {
        id: "map_classic_world",
        name: "Classic World Map",
        description: "Traditional world map with all continents",
        thumbnail: "/assets/maps/world.png",
        size: 10000,
        terrainTypes: ["grassland", "forest", "mountain", "desert", "water"],
        waterPercentage: 40,
        difficulty: "normal",
      },
      {
        id: "map_archipelago",
        name: "Archipelago",
        description: "Islands scattered across endless ocean",
        thumbnail: "/assets/maps/archipelago.png",
        size: 8000,
        terrainTypes: ["grassland", "forest", "beach", "water"],
        waterPercentage: 60,
        difficulty: "hard",
      },
      {
        id: "map_continental",
        name: "Continental",
        description: "Large landmass with diverse terrains",
        thumbnail: "/assets/maps/continental.png",
        size: 12000,
        terrainTypes: [
          "grassland",
          "forest",
          "mountain",
          "desert",
          "tundra",
          "water",
        ],
        waterPercentage: 30,
        difficulty: "normal",
      },
      {
        id: "map_mountains",
        name: "Mountain Kingdom",
        description: "Challenging terrain with high mountains",
        thumbnail: "/assets/maps/mountains.png",
        size: 6000,
        terrainTypes: ["grassland", "mountain", "forest", "water"],
        waterPercentage: 25,
        difficulty: "hard",
      },
      {
        id: "map_desert",
        name: "Desert Expanse",
        description: "Vast desert with few oases",
        thumbnail: "/assets/maps/desert.png",
        size: 9000,
        terrainTypes: ["desert", "grassland", "water", "oasis"],
        waterPercentage: 10,
        difficulty: "hard",
      },
      {
        id: "map_forest",
        name: "Ancient Forest",
        description: "Dense forests and wildlife",
        thumbnail: "/assets/maps/forest.png",
        size: 7000,
        terrainTypes: ["forest", "grassland", "swamp", "water"],
        waterPercentage: 20,
        difficulty: "easy",
      },
      {
        id: "map_island_chain",
        name: "Island Chain",
        description: "Long chain of connected islands",
        thumbnail: "/assets/maps/island_chain.png",
        size: 8500,
        terrainTypes: ["grassland", "forest", "beach", "water"],
        waterPercentage: 50,
        difficulty: "normal",
      },
      {
        id: "map_tutorial",
        name: "Tutorial Island",
        description: "Perfect for learning the game",
        thumbnail: "/assets/maps/tutorial.png",
        size: 3000,
        terrainTypes: ["grassland", "forest", "water"],
        waterPercentage: 20,
        difficulty: "easy",
      },
    ];

    maps.forEach((map) => {
      this.maps.set(map.id, map);
    });
  }

  /**
   * Initialize terrain types
   */
  private initializeTerrains(): void {
    const terrains: TerrainType[] = [
      {
        id: "grassland",
        name: "Grassland",
        texture: "/assets/textures/grassland.png",
        color: 0x228b22,
        passable: true,
        defensiveBonus: 0,
        resourceBonus: 1.0,
      },
      {
        id: "forest",
        name: "Forest",
        texture: "/assets/textures/forest.png",
        color: 0x154e0f,
        passable: true,
        defensiveBonus: 1.5,
        resourceBonus: 1.2,
      },
      {
        id: "mountain",
        name: "Mountain",
        texture: "/assets/textures/mountain.png",
        color: 0x8b7355,
        passable: false,
        defensiveBonus: 3.0,
        resourceBonus: 0.5,
      },
      {
        id: "desert",
        name: "Desert",
        texture: "/assets/textures/desert.png",
        color: 0xdaa520,
        passable: true,
        defensiveBonus: 0.5,
        resourceBonus: 0.3,
      },
      {
        id: "water",
        name: "Water",
        texture: "/assets/textures/water.png",
        color: 0x1e90ff,
        passable: false,
        defensiveBonus: 0,
        resourceBonus: 0,
      },
      {
        id: "swamp",
        name: "Swamp",
        texture: "/assets/textures/swamp.png",
        color: 0x556b2f,
        passable: true,
        defensiveBonus: 1.0,
        resourceBonus: 0.8,
      },
      {
        id: "tundra",
        name: "Tundra",
        texture: "/assets/textures/tundra.png",
        color: 0xb0c4de,
        passable: true,
        defensiveBonus: 0.5,
        resourceBonus: 0.2,
      },
      {
        id: "beach",
        name: "Beach",
        texture: "/assets/textures/beach.png",
        color: 0xf4a460,
        passable: true,
        defensiveBonus: 0.2,
        resourceBonus: 0.6,
      },
      {
        id: "oasis",
        name: "Oasis",
        texture: "/assets/textures/oasis.png",
        color: 0x00d084,
        passable: true,
        defensiveBonus: 0.5,
        resourceBonus: 2.0,
      },
    ];

    terrains.forEach((terrain) => {
      this.terrainTypes.set(terrain.id, terrain);
    });
  }

  /**
   * Get country by code
   */
  getCountry(code: string): CountryInfo | undefined {
    return this.countryFlags.get(code);
  }

  /**
   * Get all countries
   */
  getAllCountries(): CountryInfo[] {
    return Array.from(this.countryFlags.values());
  }

  /**
   * Get map by ID
   */
  getMap(mapId: string): MapInfo | undefined {
    return this.maps.get(mapId);
  }

  /**
   * Get all maps
   */
  getAllMaps(): MapInfo[] {
    return Array.from(this.maps.values());
  }

  /**
   * Get maps by difficulty
   */
  getMapsByDifficulty(difficulty: "easy" | "normal" | "hard"): MapInfo[] {
    return Array.from(this.maps.values()).filter(
      (map) => map.difficulty === difficulty,
    );
  }

  /**
   * Get terrain type
   */
  getTerrain(terrainId: string): TerrainType | undefined {
    return this.terrainTypes.get(terrainId);
  }

  /**
   * Get all terrain types
   */
  getAllTerrains(): TerrainType[] {
    return Array.from(this.terrainTypes.values());
  }

  /**
   * Load image asynchronously
   */
  async loadImage(url: string): Promise<HTMLImageElement | null> {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url) ?? null;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${url}`);
        this.imageCache.set(url, null);
        resolve(null);
      };
      img.src = url;
    });
  }

  /**
   * Get flag image for a country
   */
  async getCountryFlagImage(code: string): Promise<HTMLImageElement | null> {
    const country = this.getCountry(code);
    if (!country) return null;
    return this.loadImage(country.flag);
  }

  /**
   * Get map thumbnail
   */
  async getMapThumbnail(mapId: string): Promise<HTMLImageElement | null> {
    const map = this.getMap(mapId);
    if (!map) return null;
    return this.loadImage(map.thumbnail);
  }

  /**
   * Get terrain texture
   */
  async getTerrainTexture(terrainId: string): Promise<HTMLImageElement | null> {
    const terrain = this.getTerrain(terrainId);
    if (!terrain) return null;
    return this.loadImage(terrain.texture);
  }

  /**
   * Preload all flag images
   */
  async preloadAllFlags(): Promise<void> {
    const promises = this.getAllCountries().map((country) =>
      this.loadImage(country.flag),
    );
    await Promise.all(promises);
  }

  /**
   * Preload all map thumbnails
   */
  async preloadAllMaps(): Promise<void> {
    const promises = this.getAllMaps().map((map) =>
      this.loadImage(map.thumbnail),
    );
    await Promise.all(promises);
  }

  /**
   * Preload all terrain textures
   */
  async preloadAllTerrains(): Promise<void> {
    const promises = this.getAllTerrains().map((terrain) =>
      this.loadImage(terrain.texture),
    );
    await Promise.all(promises);
  }

  /**
   * Preload all assets
   */
  async preloadAll(): Promise<void> {
    await Promise.all([
      this.preloadAllFlags(),
      this.preloadAllMaps(),
      this.preloadAllTerrains(),
    ]);
    console.log("✅ All game assets preloaded");
  }

  /**
   * Clear image cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.imageCache.size;
  }
}

export const assetsManager = new AssetsManager();
export default AssetsManager;
