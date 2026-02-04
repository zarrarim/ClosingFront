# 🚀 OpenGL Quick Start

## Installation

The OpenGL system is **automatically integrated** - no installation needed!

```bash
# Build the project as usual
npm run build-prod

# Run the server
node server-fullbuild.mjs

# Open in browser
# http://localhost:3000
```

## Automatic Features

✅ **Loads automatically** on game start  
✅ **Uses hybrid rendering** by default  
✅ **Loads all assets** from resources/  
✅ **Creates particle effects** automatically  

## Enable/Disable

### Automatic (Default)
OpenGL initializes automatically in HYBRID mode:
```typescript
// In GameRenderer.initialize()
// OpenGL loads and runs in background
```

### Manual Control
```typescript
const gameRenderer = /* get renderer */;
const adapter = gameRenderer.getOpenGLAdapter();

if (adapter?.isOpenGLAvailable()) {
  // Switch render mode
  adapter.setRenderMode(RenderMode.OPENGL);
  
  // Create effects
  adapter.createParticleEffect("explosion", { x: 100, y: 200 });
}
```

## Using Particle Effects

### Automatic (Event-driven)
```typescript
// Game events automatically trigger effects
eventBus.emit("unit-attack", { position: { x, y } });
eventBus.emit("structure-destroyed", { position: { x, y } });
```

### Manual
```typescript
gameRenderer.createParticleEffect("explosion", { x: 100, y: 200 }, 1.5);
gameRenderer.createParticleEffect("smoke", { x: 100, y: 200 });
gameRenderer.createParticleEffect("fire", { x: 100, y: 200 });
gameRenderer.createParticleEffect("impact", { x: 100, y: 200 });
```

## Testing in Browser Console

```javascript
// Print status
window.openglTest.status();

// Test particle effects
window.openglTest.effects();

// Switch render modes
window.openglTest.modes();

// Check asset loading
window.openglTest.assets();

// Simulate game events
window.openglTest.events();

// Generate test pattern
window.openglTest.pattern();

// Get adapter directly
window.openglTest.adapter;
```

## Performance Settings

In `OpenGLRendererAdapter.initialize()`:

```typescript
const config: OpenGLRendererConfig = {
  antialiasing: true,      // MSAA enabled
  shadowMap: true,         // Shadows enabled
  enableLights: true,      // Dynamic lights
  targetFPS: 60,          // Target 60 FPS
};
```

## Render Modes

### Canvas 2D (Fallback)
Pure 2D canvas rendering, no 3D effects

### OpenGL (Full 3D)
Full WebGL 2.0 rendering, 3D with effects

### Hybrid (Default)
OpenGL background + Canvas 2D UI overlay

## Files Location

```
src/client/graphics/
├── opengl/
│   ├── OpenGLRenderer.ts       (Core THREE.js scene)
│   ├── AssetManager.ts         (Texture/asset loading)
│   ├── ParticleSystem.ts       (Particle effects)
│   ├── OpenGLRendererAdapter.ts (Bridge to game)
│   ├── OpenGLTestUtils.ts      (Testing utilities)
│   └── index.ts                (Exports)
└── GameRenderer.ts             (Modified for OpenGL)
```

## Assets Loaded

All assets from `resources/` are automatically loaded:

```
resources/
├── images/          ✅ Terrain & structures
├── sprites/         ✅ Units & weapons
├── cosmetics/       ✅ Player cosmetics
├── fx/              ✅ Particle textures
├── flags/           ✅ Country flags
├── maps/            ✅ Terrain assets
├── sounds/          ✅ Audio assets
└── icons/           ✅ UI icons
```

## Performance Tips

1. **Lower-end devices**
   ```typescript
   adapter.setRenderMode(RenderMode.CANVAS_2D);
   ```

2. **Reduce particles**
   - Modify `ParticleEmitterConfig.particleCount`
   - Lower `emissionRate`

3. **Disable shadows**
   ```typescript
   const config = { shadowMap: false };
   ```

4. **Monitor progress**
   ```typescript
   const progress = adapter.getLoadingProgress();
   console.log(`Loaded: ${progress.percentage}%`);
   ```

## Troubleshooting

### "OpenGL renderer not available"
- Browser doesn't support WebGL 2.0
- Falls back to Canvas 2D automatically
- Game still works fine

### Assets not loading
- Check `resources/` directory exists
- Check browser Network tab for 404s
- Wait for `opengl-ready` event

### Low FPS
- Reduce particle count
- Disable shadows
- Switch to Canvas 2D mode
- Check browser performance

### Effects not showing
- Verify event emission
- Check event names match
- Check particle effect type
- Monitor console for errors

## Next Steps

- Read [docs/OpenGL.md](../docs/OpenGL.md) for full documentation
- Check [OPENGL-CHANGELOG.md](../OPENGL-CHANGELOG.md) for details
- Try test utilities in browser console
- Experiment with different render modes

## Questions?

- Check browser console for errors
- Enable test utilities: `window.openglTest`
- Review asset loading: `window.openglTest.assets()`
- Check render mode: `window.openglTest.status()`

---

**Status**: ✅ Ready to use  
**No configuration needed**: ✅  
**All assets included**: ✅  
**Fully compatible**: ✅  
