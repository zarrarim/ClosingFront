/**
 * OpenGL Configuration File
 * Customize OpenGL rendering behavior
 * AGPL 3.0 License - See LICENSE file for details
 */

/**
 * OpenGL Renderer Configuration
 */
export const OPENGL_CONFIG = {
  // Enable/disable OpenGL rendering entirely
  enabled: true,

  // Rendering mode: "2d" | "opengl" | "hybrid"
  defaultMode: "hybrid",

  // Graphics quality settings
  graphics: {
    // Enable anti-aliasing (MSAA)
    antialiasing: true,

    // Enable shadow mapping
    shadowMap: true,

    // Enable dynamic lighting
    enableLights: true,

    // Target frame rate
    targetFPS: 60,

    // Shadow map resolution
    shadowMapResolution: 2048,
  },

  // Asset loading settings
  assets: {
    // Enable asset preloading
    preload: true,

    // Max concurrent texture loads
    maxConcurrentLoads: 5,

    // Asset path prefix
    pathPrefix: "resources/",

    // Asset groups to load
    groups: {
      terrain: true,
      units: true,
      structures: true,
      cosmetics: true,
      particles: true,
      flags: true,
    },
  },

  // Particle system settings
  particles: {
    // Enable particle effects
    enabled: true,

    // Maximum particles on screen
    maxParticles: 1000,

    // Particle quality: "low" | "medium" | "high"
    quality: "high",

    // Effect intensity multiplier
    intensityMultiplier: 1.0,

    // Predefined effects enabled
    effects: {
      explosion: true,
      smoke: true,
      fire: true,
      impact: true,
      sparks: true,
      dust: true,
    },
  },

  // Camera settings
  camera: {
    // FOV in degrees
    fov: 75,

    // Near clipping plane
    near: 0.1,

    // Far clipping plane
    far: 5000,

    // Initial zoom level
    initialZoom: 1.0,

    // Enable smooth camera transitions
    smoothTransitions: true,
  },

  // Performance optimization settings
  optimization: {
    // Enable frustum culling
    frustumCulling: true,

    // Enable LOD (Level of Detail)
    lod: false,

    // Maximum render distance
    maxRenderDistance: 1000,

    // Enable object pooling
    objectPooling: true,

    // Pool size for particles
    poolSize: 500,
  },

  // Development settings
  development: {
    // Enable debug mode
    debug: false,

    // Show performance overlay
    showPerformanceMetrics: false,

    // Log asset loading
    logAssetLoading: true,

    // Log rendering events
    logRenderingEvents: false,

    // Enable test utilities
    enableTestUtils: true,

    // Test utils hotkey (none for disabled)
    testUtilsHotkey: "ctrl+shift+o",
  },

  // Fallback behavior
  fallback: {
    // Fallback to 2D if WebGL unavailable
    to2DOnWebGLUnavailable: true,

    // Show warning message on fallback
    showFallbackWarning: false,

    // Log fallback reason
    logFallbackReason: true,
  },

  // Browser compatibility
  compatibility: {
    // Minimum WebGL version (2 required)
    minWebGLVersion: 2,

    // Check before initializing
    checkBefore: true,

    // List of browsers to disable for
    disabledBrowsers: [],

    // List of devices to disable for (regex patterns)
    disabledDevices: [
      "Android.*Chrome/(6[0-4]|[0-5][0-9])", // Old Android Chrome
    ],
  },
};

/**
 * Render mode enumeration
 */
export enum RenderMode {
  CANVAS_2D = "2d",
  OPENGL = "opengl",
  HYBRID = "hybrid",
}

/**
 * Get configuration value with fallback
 */
export function getConfig<T>(path: string, defaultValue: T): T {
  const keys = path.split(".");
  let value: any = OPENGL_CONFIG;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }

  return value;
}

/**
 * Update configuration at runtime
 */
export function updateConfig(path: string, value: any): void {
  const keys = path.split(".");
  const lastKey = keys.pop();

  if (!lastKey) return;

  let obj: any = OPENGL_CONFIG;
  for (const key of keys) {
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key];
  }

  obj[lastKey] = value;
}

/**
 * Get entire configuration object
 */
export function getFullConfig() {
  return { ...OPENGL_CONFIG };
}

/**
 * Validate configuration
 */
export function validateConfig(): string[] {
  const errors: string[] = [];

  if (!OPENGL_CONFIG.enabled) {
    errors.push("OpenGL is disabled");
  }

  if (!["2d", "opengl", "hybrid"].includes(OPENGL_CONFIG.defaultMode)) {
    errors.push(`Invalid default mode: ${OPENGL_CONFIG.defaultMode}`);
  }

  if (
    OPENGL_CONFIG.graphics.targetFPS < 30 ||
    OPENGL_CONFIG.graphics.targetFPS > 144
  ) {
    errors.push("Target FPS should be between 30 and 144");
  }

  if (OPENGL_CONFIG.particles.maxParticles < 0) {
    errors.push("Max particles cannot be negative");
  }

  if (!["low", "medium", "high"].includes(OPENGL_CONFIG.particles.quality)) {
    errors.push(`Invalid particle quality: ${OPENGL_CONFIG.particles.quality}`);
  }

  return errors;
}

/**
 * Log configuration (for debugging)
 */
export function logConfig(): void {
  console.group("🎮 OpenGL Configuration");
  console.log("Enabled:", OPENGL_CONFIG.enabled);
  console.log("Default Mode:", OPENGL_CONFIG.defaultMode);
  console.log("Graphics:", OPENGL_CONFIG.graphics);
  console.log("Particles:", OPENGL_CONFIG.particles);
  console.log("Assets:", OPENGL_CONFIG.assets);
  console.groupEnd();
}

// Validate on import
const validationErrors = validateConfig();
if (validationErrors.length > 0) {
  console.warn("⚠️ OpenGL Configuration Errors:", validationErrors);
}

// Log configuration in development
if (OPENGL_CONFIG.development.debug) {
  logConfig();
}

export default OPENGL_CONFIG;
