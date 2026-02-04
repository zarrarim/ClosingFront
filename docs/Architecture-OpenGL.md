# 🏗️ OpenGL Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Window                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           Main.ts / ClientGameRunner.ts              │ │
│  │              (Game Entry Points)                      │ │
│  └──────────────────────┬────────────────────────────────┘ │
│                        │                                    │
│                        ▼                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │          GameRenderer (Canvas Renderer)              │ │
│  │  - Canvas 2D context                                  │ │
│  │  - Layer management                                   │ │
│  │  - Transform handling                                 │ │
│  └──────────────────────┬────────────────────────────────┘ │
│                        │                                    │
│          ┌─────────────┴─────────────┐                     │
│          ▼                           ▼                     │
│  ┌──────────────────┐      ┌──────────────────────────┐   │
│  │ Canvas 2D Layers │      │ OpenGLRendererAdapter    │   │
│  │ (UI, structures) │      │ (Bridge to OpenGL)       │   │
│  └──────────────────┘      └──────────┬───────────────┘   │
│                                       │                    │
│                                       ▼                    │
│                         ┌─────────────────────────────┐   │
│                         │  OpenGLRenderer (THREE.js)  │   │
│                         │ ┌───────────────────────┐  │   │
│                         │ │ Scene Setup           │  │   │
│                         │ │ - Terrain mesh        │  │   │
│                         │ │ - Units (spheres)     │  │   │
│                         │ │ - Structures (boxes)  │  │   │
│                         │ │ - Lighting            │  │   │
│                         │ └───────────────────────┘  │   │
│                         │ ┌───────────────────────┐  │   │
│                         │ │ Asset Management      │  │   │
│                         │ │ - AssetManager        │  │   │
│                         │ │ - Texture loading     │  │   │
│                         │ │ - Cache management    │  │   │
│                         │ └───────────────────────┘  │   │
│                         │ ┌───────────────────────┐  │   │
│                         │ │ Particle System       │  │   │
│                         │ │ - Explosions          │  │   │
│                         │ │ - Smoke               │  │   │
│                         │ │ - Fire                │  │   │
│                         │ │ - Impact effects      │  │   │
│                         │ └───────────────────────┘  │   │
│                         └─────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. GameRenderer

**Location**: `src/client/graphics/GameRenderer.ts`

**Responsibilities**:

- Canvas setup and context management
- Layer orchestration
- Canvas 2D rendering pipeline
- OpenGL adapter initialization

**Key Methods**:

```typescript
initialize(); // Start game rendering
renderGame(); // Main render loop
tick(); // Update tick
getOpenGLAdapter(); // Access OpenGL
createParticleEffect(); // Create effects
```

### 2. OpenGLRendererAdapter

**Location**: `src/client/graphics/opengl/OpenGLRendererAdapter.ts`

**Responsibilities**:

- Bridge between game and THREE.js
- Event handling
- Render mode management
- Particle system orchestration

**Key Methods**:

```typescript
initialize(); // Load assets & init renderer
setRenderMode(); // Switch between 2D/OpenGL/Hybrid
createParticleEffect(); // Create visual effects
getScene(); // Access THREE.js scene
getThreeRenderer(); // Access WebGL renderer
```

**Event Listeners**:

- `unit-attack` → Creates explosion
- `structure-destroyed` → Creates explosion + smoke
- `explosion` → Creates custom effect
- `game-state-update` → Updates rendering

### 3. OpenGLRenderer

**Location**: `src/client/graphics/opengl/OpenGLRenderer.ts`

**Responsibilities**:

- THREE.js scene management
- Mesh creation and updates
- Camera management
- Lighting setup

**Key Methods**:

```typescript
render(); // Render frame
updateGameState(); // Update scene from game state
updateStructures(); // Position structures
updateUnits(); // Position units
createParticleMesh(); // Create particle geometry
```

### 4. AssetManager

**Location**: `src/client/graphics/opengl/AssetManager.ts`

**Responsibilities**:

- Texture loading from resources/
- Asset caching
- Parallel loading
- Progress tracking

**Key Methods**:

```typescript
loadAllAssets(); // Load all game assets
loadTexture(); // Load single texture
getTexture(); // Retrieve cached texture
getLoadingProgress(); // Get load percentage
clearCache(); // Cleanup memory
```

**Assets Loaded**:

```
resources/
├── images/              (terrain, structures)
├── sprites/             (units)
├── cosmetics/           (player items)
├── fx/                  (particles)
├── flags/               (countries)
└── maps/                (terrain data)
```

### 5. ParticleSystem

**Location**: `src/client/graphics/opengl/ParticleSystem.ts`

**Responsibilities**:

- Particle physics simulation
- Effect creation and management
- Mesh generation per particle

**Key Methods**:

```typescript
emit(); // Create particles
update(); // Update physics
getGroup(); // Access THREE.js group
reset(); // Clear particles
```

**Predefined Effects**:

- `createExplosion()` - Orange particles, high velocity
- `createSmoke()` - Gray particles, upward drift
- `createFire()` - Yellow particles, upward movement
- `createImpact()` - White particles, multi-direction

### 6. OpenGLTestUtils

**Location**: `src/client/graphics/opengl/OpenGLTestUtils.ts`

**Responsibilities**:

- Testing utilities for development
- Performance benchmarking
- Debug console setup

**Functions**:

```typescript
testParticleEffects(); // Test all effects
testRenderModes(); // Switch modes
testAssetLoading(); // Monitor assets
simulateGameEvents(); // Trigger events
benchmarkRendering(); // Performance test
setupTestConsole(); // Enable window.openglTest
```

## Data Flow

### Initialization

```
GameRenderer.initialize()
    ↓
initializeOpenGL()
    ↓
createOpenGLAdapter()
    ↓
OpenGLRendererAdapter.initialize()
    ↓
assetManager.loadAllAssets()
    ├── loadTerrainAssets()
    ├── loadUnitAssets()
    ├── loadStructureAssets()
    ├── loadCosmeticAssets()
    ├── loadParticleAssets()
    └── loadFlagAssets()
    ↓
OpenGLRenderer initialization
    ├── Scene setup
    ├── Camera setup
    ├── Lighting setup
    └── Asset groups creation
    ↓
✅ OpenGL Ready
```

### Rendering Loop

```
requestAnimationFrame()
    ↓
GameRenderer.renderGame()
    ├── Canvas 2D Background
    │   ├── TerrainLayer
    │   ├── TerritoryLayer
    │   ├── StructureLayer
    │   └── UnitLayer
    │
    ├── OpenGL (if enabled)
    │   ├── Update game state
    │   ├── Update structures
    │   ├── Update units
    │   ├── Update particles
    │   └── Render scene
    │
    └── Canvas 2D UI Overlay
        ├── UILayer
        ├── Menus
        └── HUD elements
```

### Effect Triggering

```
Game Event
    ↓
eventBus.emit("structure-destroyed", { position })
    ↓
OpenGLRendererAdapter.onStructureDestroyed()
    ├── createParticleEffect("explosion", position)
    ├── createParticleEffect("smoke", position)
    │
    └── Return to renderer for 2D effects
```

## Memory Management

### Texture Caching

```
AssetManager
    ├── Texture loading
    ├── Cache storage (Map<string, THREE.Texture>)
    ├── Memory tracking
    └── Cleanup on dispose
```

### Particle Pooling

```
ParticleSystem
    ├── Create particle instances
    ├── Track active particles
    ├── Remove expired particles
    └── Clean mesh geometry
```

### Asset Cleanup

```
GameRenderer.dispose()
    ├── Stop animation loops
    ├── Dispose THREE.js resources
    ├── Clear texture cache
    ├── Clear particle systems
    └── Release GPU memory
```

## Event System

### Game Events

```
eventBus.emit("unit-attack", {
    type: "explosion",
    position: { x: number, y: number }
})

eventBus.emit("structure-destroyed", {
    position: { x: number, y: number }
})

eventBus.emit("explosion", {
    effectType: string,
    position: { x: number, y: number },
    intensity: number
})
```

### OpenGL Events

```
eventBus.on("opengl-initialized", (data) => {
    // Adapter created
})

eventBus.on("opengl-ready", (data) => {
    // Renderer initialized, ready to render
})

eventBus.on("render-mode-changed", (data) => {
    // Mode switched (2d/opengl/hybrid)
})

eventBus.on("particle-*", (data) => {
    // Particle effect created
})
```

## Render Modes

### Canvas 2D Mode

```
Canvas 2D Context
    ↓
All layers rendered via 2D context
    ↓
Standard performance, no acceleration
```

### OpenGL Mode

```
WebGL Context
    ↓
THREE.js Scene Graph
    ├── Terrain
    ├── Units
    ├── Structures
    └── Particles
    ↓
GPU accelerated rendering
```

### Hybrid Mode (Default)

```
Canvas 2D + WebGL Context
    ↓
WebGL rendered in background
    ├── Game world (3D)
    └── Canvas 2D overlay (UI)
    ↓
Best visual quality + performance
```

## Configuration

**Location**: `src/client/graphics/opengl/OpenGLConfig.ts`

**Configurable**:

- Rendering mode
- Graphics quality
- Particle settings
- Asset loading
- Performance optimization
- Development options

**Runtime Updates**:

```typescript
import { updateConfig } from "./opengl/OpenGLConfig";

updateConfig("particles.quality", "low");
updateConfig("graphics.enableLights", false);
```

## Browser Integration

### WebGL Detection

```
OpenGLRendererAdapter.initialize()
    ├── Check WebGL 2.0 support
    ├── Initialize renderer
    └── Fall back to 2D on failure
```

### Canvas Management

```
Canvas Resize
    ├── GameRenderer.resizeCanvas()
    ├── Update viewport
    ├── Update projection matrix
    └── Re-render
```

## Performance Considerations

### Optimizations

1. **Frustum Culling**: Only render visible objects
2. **Texture Pooling**: Reuse loaded textures
3. **Particle Batching**: Combine particles into groups
4. **LOD Support**: Level of detail for distant objects
5. **Shadow Caching**: Cache shadow maps

### Monitoring

```typescript
// Performance overlay
performanceOverlay.updateFrameMetrics(duration, layers);

// Frame profiling
FrameProfiler.start();
// ... render code ...
FrameProfiler.end("LayerName", startTime);
```

## File Organization

```
src/client/graphics/
├── GameRenderer.ts              (Main renderer)
├── FrameProfiler.ts
├── TransformHandler.ts
├── UIState.ts
│
├── opengl/                      (OpenGL subsystem)
│   ├── index.ts                 (Exports)
│   ├── OpenGLRenderer.ts        (THREE.js scene)
│   ├── AssetManager.ts          (Texture loading)
│   ├── ParticleSystem.ts        (Effects)
│   ├── OpenGLRendererAdapter.ts (Bridge)
│   ├── OpenGLTestUtils.ts       (Testing)
│   └── OpenGLConfig.ts          (Configuration)
│
├── layers/                      (2D layers)
│   ├── TerrainLayer.ts
│   ├── TerritoryLayer.ts
│   ├── StructureLayer.ts
│   ├── UnitLayer.ts
│   └── ... (many more)
│
└── ... (graphics utilities)
```

## Integration Points

### With GameView

- Access `game.board` for game state
- Access `game.config()` for settings
- Access `game.ticks()` for game ticks

### With EventBus

- Listen to game events
- Emit rendering events
- Coordinate with UI

### With InputHandler

- Receive mouse/keyboard input
- Update camera position
- Handle zoom/pan

### With UserSettings

- Read player preferences
- Apply visual settings
- Persist options

## Future Extensibility

### Custom Shaders

```typescript
// Add custom shader material
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: customVertexShader,
  fragmentShader: customFragmentShader,
});
```

### Additional Effects

```typescript
// Add to ParticleEffects
static createCustomEffect() {
    const system = new ParticleSystem({ ... });
    system.emit(position);
    return system;
}
```

### 3D Models

```typescript
// Load 3D models in future
const loader = new GLTFLoader();
loader.load("model.gltf", (gltf) => {
  scene.add(gltf.scene);
});
```

---

**Last Updated**: 2026-02-03  
**Version**: 1.0  
**Stability**: ✅ Stable
