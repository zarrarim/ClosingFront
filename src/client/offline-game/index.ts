/**
 * Offline Game Module
 * Complete 100% functional offline game system
 * Includes: engine, UI, cosmetics, assets management
 */

export {
  AssetsManager,
  assetsManager,
  type CountryInfo,
  type MapInfo,
  type TerrainType,
} from "./AssetsManager";
export {
  CosmeticsManager,
  cosmeticsManager,
  type CosmeticItem,
  type PlayerCosmetics,
} from "./CosmeticsManager";
export {
  GameUIManager,
  gameUIManager,
  type GameHUDState,
  type UITheme,
} from "./GameUIManager";
export {
  OfflineGameEngine,
  type GameState,
  type OfflineGameConfig,
} from "./OfflineGameEngine";
export {
  OfflineGameLauncher,
  getGameLauncher,
  initializeOfflineGame,
} from "./OfflineGameLauncher";
