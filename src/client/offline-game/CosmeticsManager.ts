/**
 * Cosmetics Manager
 * Handles all cosmetic items: skins, flags, badges, effects, emotes
 * Includes all cosmetics from resources/cosmetics/
 * Supports custom flag creation in offline mode
 */

export interface CosmeticItem {
  id: string;
  name: string;
  category:
    | "unit_skin"
    | "structure_skin"
    | "flag"
    | "badge"
    | "effect"
    | "emote";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  thumbnail: string;
  asset: string;
  description: string;
  price?: number;
  isPremium?: boolean;
  isUnlocked: boolean;
}

export interface CustomFlag {
  id: string;
  name: string;
  playerId: string;
  primary: string;
  secondary: string;
  accent: string;
  pattern: "solid" | "stripes" | "cross" | "diagonal" | "quartered";
  createdAt: number;
  isEquipped?: boolean;
}

export interface PlayerCosmetics {
  playerId: string;
  unlockedItems: Map<string, CosmeticItem>;
  customFlags: Map<string, CustomFlag>;
  equipped: {
    unitSkin?: string;
    structureSkin?: string;
    flag?: string;
    badge?: string;
    effect?: string;
  };
  favorites: Set<string>;
}

export class CosmeticsManager {
  private allCosmetics: Map<string, CosmeticItem> = new Map();
  private playerCosmetics: Map<string, PlayerCosmetics> = new Map();
  private offlineMode: boolean = false;

  constructor() {
    this.initializeAllCosmetics();
  }

  /**
   * Set offline mode (unlocks all cosmetics)
   */
  setOfflineMode(enabled: boolean): void {
    this.offlineMode = enabled;
  }

  /**
   * Initialize all available cosmetics
   */
  private initializeAllCosmetics(): void {
    // Unit skins
    const unitSkins = [
      {
        id: "unit_skin_knight",
        name: "Royal Knight",
        category: "unit_skin" as const,
        rarity: "epic" as const,
        thumbnail: "/assets/cosmetics/units/knight.png",
        asset: "/models/units/knight.gltf",
        description: "Elite knight with golden armor",
        isUnlocked: true,
      },
      {
        id: "unit_skin_archer",
        name: "Shadow Archer",
        category: "unit_skin" as const,
        rarity: "rare" as const,
        thumbnail: "/assets/cosmetics/units/archer.png",
        asset: "/models/units/archer.gltf",
        description: "Dark elf archer with precision strikes",
        isUnlocked: true,
      },
      {
        id: "unit_skin_mage",
        name: "Archmage",
        category: "unit_skin" as const,
        rarity: "legendary" as const,
        thumbnail: "/assets/cosmetics/units/mage.png",
        asset: "/models/units/mage.gltf",
        description: "Powerful wizard with mystical powers",
        price: 9999,
        isPremium: true,
        isUnlocked: false,
      },
      {
        id: "unit_skin_dragon",
        name: "Dragon Knight",
        category: "unit_skin" as const,
        rarity: "legendary" as const,
        thumbnail: "/assets/cosmetics/units/dragon.png",
        asset: "/models/units/dragon.gltf",
        description: "Ride a legendary dragon into battle",
        price: 15000,
        isPremium: true,
        isUnlocked: false,
      },
      {
        id: "unit_skin_skeleton",
        name: "Undead Warrior",
        category: "unit_skin" as const,
        rarity: "epic" as const,
        thumbnail: "/assets/cosmetics/units/skeleton.png",
        asset: "/models/units/skeleton.gltf",
        description: "Rise from the grave as an undead warrior",
        price: 5000,
        isPremium: true,
        isUnlocked: false,
      },
    ];

    // Structure skins
    const structureSkins = [
      {
        id: "structure_skin_castle",
        name: "Royal Castle",
        category: "structure_skin" as const,
        rarity: "epic" as const,
        thumbnail: "/assets/cosmetics/structures/castle.png",
        asset: "/models/structures/castle.gltf",
        description: "Majestic royal castle with golden spires",
        isUnlocked: true,
      },
      {
        id: "structure_skin_tower",
        name: "Dark Tower",
        category: "structure_skin" as const,
        rarity: "rare" as const,
        thumbnail: "/assets/cosmetics/structures/tower.png",
        asset: "/models/structures/tower.gltf",
        description: "Ominous dark tower with mystical energy",
        isUnlocked: true,
      },
      {
        id: "structure_skin_fortress",
        name: "Iron Fortress",
        category: "structure_skin" as const,
        rarity: "legendary" as const,
        thumbnail: "/assets/cosmetics/structures/fortress.png",
        asset: "/models/structures/fortress.gltf",
        description: "Impenetrable iron fortress with ancient power",
        price: 12000,
        isPremium: true,
        isUnlocked: false,
      },
    ];

    // Flags
    const flags = [
      {
        id: "flag_red",
        name: "Red Kingdom",
        category: "flag" as const,
        rarity: "common" as const,
        thumbnail: "/assets/cosmetics/flags/red.png",
        asset: "/assets/cosmetics/flags/red.svg",
        description: "Classic red flag",
        isUnlocked: true,
      },
      {
        id: "flag_blue",
        name: "Blue Empire",
        category: "flag" as const,
        rarity: "common" as const,
        thumbnail: "/assets/cosmetics/flags/blue.png",
        asset: "/assets/cosmetics/flags/blue.svg",
        description: "Noble blue flag",
        isUnlocked: true,
      },
      {
        id: "flag_gold",
        name: "Golden Dynasty",
        category: "flag" as const,
        rarity: "rare" as const,
        thumbnail: "/assets/cosmetics/flags/gold.png",
        asset: "/assets/cosmetics/flags/gold.svg",
        description: "Majestic golden flag",
        isUnlocked: true,
      },
      {
        id: "flag_dragon",
        name: "Dragon Banner",
        category: "flag" as const,
        rarity: "epic" as const,
        thumbnail: "/assets/cosmetics/flags/dragon.png",
        asset: "/assets/cosmetics/flags/dragon.svg",
        description: "Legendary dragon banner",
        price: 3000,
        isPremium: true,
        isUnlocked: false,
      },
    ];

    // Badges
    const badges = [
      {
        id: "badge_victor",
        name: "Victor Badge",
        category: "badge" as const,
        rarity: "rare" as const,
        thumbnail: "/assets/cosmetics/badges/victor.png",
        asset: "/assets/cosmetics/badges/victor.png",
        description: "Awarded to champions",
        isUnlocked: false,
      },
      {
        id: "badge_legendary",
        name: "Legendary Badge",
        category: "badge" as const,
        rarity: "legendary" as const,
        thumbnail: "/assets/cosmetics/badges/legendary.png",
        asset: "/assets/cosmetics/badges/legendary.png",
        description: "Highest achievement",
        isUnlocked: false,
      },
    ];

    // Effects
    const effects = [
      {
        id: "effect_fire",
        name: "Fire Aura",
        category: "effect" as const,
        rarity: "rare" as const,
        thumbnail: "/assets/cosmetics/effects/fire.png",
        asset: "fire_aura.glsl",
        description: "Burning aura effect",
        isUnlocked: true,
      },
      {
        id: "effect_ice",
        name: "Ice Aura",
        category: "effect" as const,
        rarity: "rare" as const,
        thumbnail: "/assets/cosmetics/effects/ice.png",
        asset: "ice_aura.glsl",
        description: "Freezing aura effect",
        isUnlocked: true,
      },
      {
        id: "effect_holy",
        name: "Holy Light",
        category: "effect" as const,
        rarity: "epic" as const,
        thumbnail: "/assets/cosmetics/effects/holy.png",
        asset: "holy_light.glsl",
        description: "Divine holy light",
        price: 4000,
        isPremium: true,
        isUnlocked: false,
      },
    ];

    // Emotes
    const emotes = [
      {
        id: "emote_laugh",
        name: "Laugh",
        category: "emote" as const,
        rarity: "common" as const,
        thumbnail: "/assets/cosmetics/emotes/laugh.png",
        asset: "/animations/emotes/laugh.gltf",
        description: "Laugh out loud",
        isUnlocked: true,
      },
      {
        id: "emote_victory",
        name: "Victory",
        category: "emote" as const,
        rarity: "uncommon" as const,
        thumbnail: "/assets/cosmetics/emotes/victory.png",
        asset: "/animations/emotes/victory.gltf",
        description: "Celebrate victory",
        isUnlocked: true,
      },
      {
        id: "emote_dance",
        name: "Dance",
        category: "emote" as const,
        rarity: "rare" as const,
        thumbnail: "/assets/cosmetics/emotes/dance.png",
        asset: "/animations/emotes/dance.gltf",
        description: "Break into a dance",
        price: 2000,
        isPremium: true,
        isUnlocked: false,
      },
    ];

    const allItems = [
      ...unitSkins,
      ...structureSkins,
      ...flags,
      ...badges,
      ...effects,
      ...emotes,
    ];

    allItems.forEach((item) => {
      this.allCosmetics.set(item.id, item as CosmeticItem);
    });
  }

  /**
   * Get player cosmetics profile
   */
  getPlayerCosmetics(playerId: string): PlayerCosmetics {
    if (!this.playerCosmetics.has(playerId)) {
      this.initializePlayerCosmetics(playerId);
    }
    return this.playerCosmetics.get(playerId)!;
  }

  /**
   * Initialize cosmetics for a new player
   */
  private initializePlayerCosmetics(playerId: string): void {
    const unlockedItems = new Map<string, CosmeticItem>();

    // In offline mode, unlock all items. Otherwise, give defaults.
    if (this.offlineMode) {
      this.allCosmetics.forEach((item) => {
        unlockedItems.set(item.id, { ...item, isUnlocked: true });
      });
    } else {
      // Give all common cosmetics by default
      this.allCosmetics.forEach((item) => {
        if (!item.isPremium || item.isUnlocked) {
          unlockedItems.set(item.id, { ...item });
        }
      });
    }

    this.playerCosmetics.set(playerId, {
      playerId,
      unlockedItems,
      customFlags: new Map(),
      equipped: {
        flag: "flag_red",
        effect: "effect_fire",
      },
      favorites: new Set(),
    });
  }

  /**
   * Unlock a cosmetic item for a player
   */
  unlockCosmetic(playerId: string, cosmeticId: string): boolean {
    const playerCosmetics = this.getPlayerCosmetics(playerId);
    const cosmetic = this.allCosmetics.get(cosmeticId);

    if (!cosmetic || playerCosmetics.unlockedItems.has(cosmeticId)) {
      return false;
    }

    playerCosmetics.unlockedItems.set(cosmeticId, { ...cosmetic });
    return true;
  }

  /**
   * Equip a cosmetic item
   */
  equipCosmetic(
    playerId: string,
    cosmeticId: string,
    slot: keyof PlayerCosmetics["equipped"],
  ): boolean {
    const playerCosmetics = this.getPlayerCosmetics(playerId);
    const cosmetic = playerCosmetics.unlockedItems.get(cosmeticId);

    if (!cosmetic) return false;

    playerCosmetics.equipped[slot] = cosmeticId;
    return true;
  }

  /**
   * Add to favorites
   */
  addToFavorites(playerId: string, cosmeticId: string): boolean {
    const playerCosmetics = this.getPlayerCosmetics(playerId);

    if (!playerCosmetics.unlockedItems.has(cosmeticId)) {
      return false;
    }

    playerCosmetics.favorites.add(cosmeticId);
    return true;
  }

  /**
   * Remove from favorites
   */
  removeFromFavorites(playerId: string, cosmeticId: string): boolean {
    const playerCosmetics = this.getPlayerCosmetics(playerId);
    return playerCosmetics.favorites.delete(cosmeticId);
  }

  /**
   * Get all cosmetics by category
   */
  getCosmeticsByCategory(category: CosmeticItem["category"]): CosmeticItem[] {
    return Array.from(this.allCosmetics.values()).filter(
      (item) => item.category === category,
    );
  }

  /**
   * Get all cosmetics by rarity
   */
  getCosmeticsByRarity(rarity: CosmeticItem["rarity"]): CosmeticItem[] {
    return Array.from(this.allCosmetics.values()).filter(
      (item) => item.rarity === rarity,
    );
  }

  /**
   * Get all premium cosmetics
   */
  getPremiumCosmetics(): CosmeticItem[] {
    return Array.from(this.allCosmetics.values()).filter(
      (item) => item.isPremium,
    );
  }

  /**
   * Get player's unlocked cosmetics
   */
  getPlayerUnlockedCosmetics(
    playerId: string,
    category?: CosmeticItem["category"],
  ): CosmeticItem[] {
    const playerCosmetics = this.getPlayerCosmetics(playerId);
    let items = Array.from(playerCosmetics.unlockedItems.values());

    if (category) {
      items = items.filter((item) => item.category === category);
    }

    return items;
  }

  /**
   * Create a custom flag
   */
  createCustomFlag(
    playerId: string,
    name: string,
    primary: string,
    secondary: string,
    accent: string,
    pattern: CustomFlag["pattern"] = "solid",
  ): CustomFlag {
    const playerCosmetics = this.getPlayerCosmetics(playerId);
    const flagId = `custom_flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const customFlag: CustomFlag = {
      id: flagId,
      name,
      playerId,
      primary,
      secondary,
      accent,
      pattern,
      createdAt: Date.now(),
    };

    playerCosmetics.customFlags.set(flagId, customFlag);
    return customFlag;
  }

  /**
   * Get all custom flags for a player
   */
  getPlayerCustomFlags(playerId: string): CustomFlag[] {
    const playerCosmetics = this.getPlayerCosmetics(playerId);
    return Array.from(playerCosmetics.customFlags.values());
  }

  /**
   * Get a specific custom flag
   */
  getCustomFlag(flagId: string): CustomFlag | undefined {
    for (const cosmetics of this.playerCosmetics.values()) {
      const flag = cosmetics.customFlags.get(flagId);
      if (flag) return flag;
    }
    return undefined;
  }

  /**
   * Equip a custom flag
   */
  equipCustomFlag(playerId: string, flagId: string): boolean {
    const playerCosmetics = this.getPlayerCosmetics(playerId);
    const customFlag = playerCosmetics.customFlags.get(flagId);

    if (!customFlag) return false;

    playerCosmetics.equipped.flag = flagId;
    return true;
  }

  /**
   * Get currently equipped custom flag
   */
  getEquippedCustomFlag(playerId: string): CustomFlag | undefined {
    const playerCosmetics = this.getPlayerCosmetics(playerId);
    const equippedFlagId = playerCosmetics.equipped.flag;

    if (equippedFlagId && equippedFlagId.startsWith("custom_flag_")) {
      return playerCosmetics.customFlags.get(equippedFlagId);
    }

    return undefined;
  }

  /**
   * Delete a custom flag
   */
  deleteCustomFlag(playerId: string, flagId: string): boolean {
    const playerCosmetics = this.getPlayerCosmetics(playerId);

    if (playerCosmetics.equipped.flag === flagId) {
      playerCosmetics.equipped.flag = "flag_red";
    }

    return playerCosmetics.customFlags.delete(flagId);
  }

  /**
   * Get all custom flags (all players)
   */
  getAllCustomFlags(): CustomFlag[] {
    const allFlags: CustomFlag[] = [];
    for (const cosmetics of this.playerCosmetics.values()) {
      allFlags.push(...Array.from(cosmetics.customFlags.values()));
    }
    return allFlags;
  }
}

export const cosmeticsManager = new CosmeticsManager();
export default CosmeticsManager;
