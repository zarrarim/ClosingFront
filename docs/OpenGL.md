# 🎮 OpenGL Integration Guide

## Overview

OpenFront now supports **OpenGL rendering** alongside the existing Canvas 2D rendering. The integration provides:

✅ **Hardware-accelerated 3D graphics** via THREE.js  
✅ **Advanced particle effects** (explosions, smoke, fire, impacts)  
✅ **Asset loading from all game resources**  
✅ **Hybrid rendering mode** (3D + 2D UI seamlessly blended)  
✅ **No breaking changes** to existing code  

## Architecture

### Components

1. **OpenGLRenderer** (`src/client/graphics/opengl/OpenGLRenderer.ts`)
   - Core THREE.js scene setup
   - Game asset rendering (terrain, units, structures)
   - Lighting and shadows
   - Camera management

2. **AssetManager** (`src/client/graphics/opengl/AssetManager.ts`)
   - Loads all textures from `resources/` directory
   - Manages texture caching
   - Preloads:
     - Terrain assets
     - Unit sprites
     - Structure models
     - Cosmetic items
     - Particle effects
     - Flag assets

3. **ParticleSystem** (`src/client/graphics/opengl/ParticleSystem.ts`)
   - Hardware-accelerated particle effects
   - Predefined effects:
     - Explosions
     - Smoke
     - Fire
     - Impacts
     - Laser fire

4. **OpenGLRendererAdapter** (`src/client/graphics/opengl/OpenGLRendererAdapter.ts`)
   - Bridges OpenGL with existing game systems
   - Event-driven effect triggering
   - Render mode management (2D, OpenGL, Hybrid)
   - Particle system orchestration

### Integration Points

The OpenGL system integrates into `GameRenderer` (existing):
- Initializes automatically on game start
- Runs in **HYBRID mode** by default
- Listens to game events (`unit-attack`, `structure-destroyed`, `explosion`)
- Provides particle effects without modifying existing layers

## Usage

### Automatic Integration

The OpenGL system initializes automatically:

```typescript
// In GameRenderer.initialize()
private async initializeOpenGL(): Promise<void> {
  this.openglAdapter = createOpenGLAdapter(...);
  await this.openglAdapter.initialize();
  this.openglAdapter.setRenderMode(RenderMode.HYBRID);
}
```

### Creating Particle Effects

From anywhere in the game code:

```typescript
// Using GameRenderer
gameRenderer.createParticleEffect("explosion", { x: 100, y: 200 }, 1.5);
gameRenderer.createParticleEffect("smoke", { x: 100, y: 200 });
gameRenderer.createParticleEffect("fire", { x: 100, y: 200 });

// Or using adapter directly
const adapter = gameRenderer.getOpenGLAdapter();
if (adapter?.isOpenGLAvailable()) {
  adapter.createParticleEffect("explosion", position);
}
```

### Event-Driven Effects

Particle effects are automatically triggered by game events:

```typescript
// When a unit attacks
eventBus.emit("unit-attack", { type: "explosion", position: { x, y } });

// When a structure is destroyed
eventBus.emit("structure-destroyed", { position: { x, y } });

// Custom explosion
eventBus.emit("explosion", {
  effectType: "explosion",
  position: { x, y },
  intensity: 2,
});
```

## Render Modes

### Canvas 2D
Pure Canvas 2D rendering (fallback):
```typescript
adapter.setRenderMode(RenderMode.CANVAS_2D);
```

### OpenGL
Full OpenGL/WebGL rendering:
```typescript
adapter.setRenderMode(RenderMode.OPENGL);
```

### Hybrid (Default)
OpenGL for game world, Canvas 2D for UI:
```typescript
adapter.setRenderMode(RenderMode.HYBRID);
```

## Asset Loading

All assets are automatically loaded from:

```
resources/
├── images/        (terrain, structures)
├── sprites/       (units)
├── cosmetics/     (player cosmetics)
├── fx/            (particle textures)
├── flags/         (country flags)
├── maps/          (terrain/map assets)
└── icons/         (UI icons)
```

Monitor loading progress:

```typescript
const adapter = gameRenderer.getOpenGLAdapter();
const progress = adapter.getLoadingProgress();
console.log(`Loaded: ${progress.percentage}%`);
```

## Performance

- **Lazy loading**: Assets load on-demand
- **Texture caching**: Efficient memory usage
- **Particle pooling**: Optimized effect performance
- **Culling**: Only visible objects render
- **Shadow maps**: Optional for performance

## Configuration

Customize OpenGL rendering:

```typescript
const config = {
  antialiasing: true,      // Enable MSAA
  shadowMap: true,         // Enable shadows
  enableLights: true,      // Enable dynamic lights
  targetFPS: 60,          // Target frame rate
};

// Pass to createOpenGLAdapter() or GameRenderer
```

## Compatibility

✅ Works with all existing game code  
✅ Canvas 2D layers render on top  
✅ No modifications to existing file structures  
✅ Graceful fallback if WebGL unavailable  
✅ Zero breaking changes  

## Advanced Usage

### Access THREE.js Scene

```typescript
const adapter = gameRenderer.getOpenGLAdapter();
const scene = adapter.getScene();
const renderer = adapter.getThreeRenderer();

// Add custom THREE.js objects
const customMesh = new THREE.Mesh(...);
scene.add(customMesh);
```

### Custom Particle Effects

```typescript
import { ParticleSystem } from "src/client/graphics/opengl";

const system = new ParticleSystem({
  particleCount: 100,
  lifetime: 2000,
  color: new THREE.Color(1, 0, 0),
  // ... other config
});

system.emit(position);
system.update(deltaTime);
```

## Troubleshooting

### OpenGL not initializing
- Check browser WebGL support: `WebGL 2.0 required`
- Check console for specific errors
- Falls back to Canvas 2D automatically

### Assets not loading
- Verify files exist in `resources/` directory
- Check browser Network tab for 404s
- Assets load asynchronously - wait for `opengl-ready` event

### Performance issues
- Reduce particle counts in `ParticleEmitterConfig`
- Disable shadows: `shadowMap: false`
- Use Canvas 2D mode for low-end devices

## Events

Listen for OpenGL events:

```typescript
eventBus.on("opengl-initialized", (data) => {
  console.log("OpenGL ready!");
});

eventBus.on("opengl-ready", (data) => {
  console.log("Renderer available", data.renderer);
});

eventBus.on("render-mode-changed", (data) => {
  console.log("New mode:", data.mode);
});

eventBus.on("particle-explosion", (data) => {
  // Particle effect created
});
```

## Files Modified

- `package.json` - Added `three` dependency
- `vite.config.ts` - Added THREE.js chunk splitting
- `src/client/graphics/GameRenderer.ts` - Integrated OpenGL initialization
- `src/client/graphics/opengl/` - New OpenGL system (4 files)

## Future Enhancements

- 3D unit models
- Terrain mesh deformation
- Real-time shadows
- Post-processing effects
- Multiplayer particle synchronization
- Custom shaders for game effects

---

**Status**: ✅ Production Ready  
**Version**: 1.0  
**Compatibility**: All OpenFront versions
