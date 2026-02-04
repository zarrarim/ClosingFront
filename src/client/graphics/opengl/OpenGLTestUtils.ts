/**
 * OpenGL Testing Utilities
 * Helper functions for testing and debugging OpenGL features
 * AGPL 3.0 License - See LICENSE file for details
 */

import { EventBus } from "../../../core/EventBus";
import { OpenGLRendererAdapter, RenderMode } from "./index";

/**
 * Test particle effects
 */
export function testParticleEffects(
  adapter: OpenGLRendererAdapter | null,
): void {
  if (!adapter?.isOpenGLAvailable()) {
    console.warn("OpenGL not available");
    return;
  }

  console.log("Testing particle effects...");

  const position = { x: 400, y: 300 };
  const effects = ["explosion", "smoke", "fire", "impact"];

  effects.forEach((effect, index) => {
    setTimeout(() => {
      adapter.createParticleEffect(effect, position, 1);
      console.log(`✨ Created ${effect} effect`);
    }, index * 1000);
  });
}

/**
 * Test render mode switching
 */
export function testRenderModes(adapter: OpenGLRendererAdapter | null): void {
  if (!adapter?.isOpenGLAvailable()) {
    console.warn("OpenGL not available");
    return;
  }

  console.log("Testing render modes...");

  const modes = [RenderMode.CANVAS_2D, RenderMode.OPENGL, RenderMode.HYBRID];
  const modeNames: Record<RenderMode, string> = {
    [RenderMode.CANVAS_2D]: "Canvas 2D",
    [RenderMode.OPENGL]: "OpenGL",
    [RenderMode.HYBRID]: "Hybrid",
  };

  modes.forEach((mode, index) => {
    setTimeout(() => {
      adapter.setRenderMode(mode);
      console.log(`🎬 Switched to ${modeNames[mode]} mode`);
    }, index * 2000);
  });
}

/**
 * Test asset loading
 */
export function testAssetLoading(adapter: OpenGLRendererAdapter | null): void {
  if (!adapter?.isOpenGLAvailable()) {
    console.warn("OpenGL not available");
    return;
  }

  console.log("Checking asset loading progress...");

  const interval = setInterval(() => {
    const progress = adapter.getLoadingProgress();
    console.log(
      `Assets: ${progress.loaded}/${progress.total} (${progress.percentage.toFixed(1)}%)`,
    );

    if (progress.loaded === progress.total) {
      clearInterval(interval);
      console.log("✅ All assets loaded!");
    }
  }, 500);
}

/**
 * Simulate game events
 */
export async function simulateGameEvents(
  eventBus: EventBus,
  adapter: OpenGLRendererAdapter | null,
): Promise<void> {
  if (!adapter?.isOpenGLAvailable()) {
    console.warn("OpenGL not available");
    return;
  }

  console.log("Simulating game events...");

  // Import event classes
  const { UnitAttackEvent, StructureDestroyedEvent, ExplosionEvent } =
    await import("./OpenGLEvents");

  // Simulate unit attack
  setTimeout(() => {
    console.log("📍 Unit attack at (300, 300)");
    eventBus.emit(new UnitAttackEvent(null, null, { x: 300, y: 300 }));
  }, 1000);

  // Simulate structure destruction
  setTimeout(() => {
    console.log("💥 Structure destroyed at (500, 400)");
    eventBus.emit(new StructureDestroyedEvent(null, { x: 500, y: 400 }));
  }, 3000);

  // Simulate custom explosion
  setTimeout(() => {
    console.log("💣 Large explosion at (600, 200)");
    eventBus.emit(new ExplosionEvent({ x: 600, y: 200 }, 100, 2));
  }, 5000);
}

/**
 * Generate test pattern
 * Creates multiple effects across the screen
 */
export function generateTestPattern(
  adapter: OpenGLRendererAdapter | null,
): void {
  if (!adapter?.isOpenGLAvailable()) {
    console.warn("OpenGL not available");
    return;
  }

  console.log("Generating test pattern...");

  const positions = [
    { x: 200, y: 200 },
    { x: 400, y: 200 },
    { x: 600, y: 200 },
    { x: 200, y: 400 },
    { x: 400, y: 400 },
    { x: 600, y: 400 },
  ];

  const effects = ["explosion", "fire", "smoke"];

  positions.forEach((pos, index) => {
    const effect = effects[index % effects.length];
    setTimeout(() => {
      adapter.createParticleEffect(effect, pos, 1);
      console.log(`✨ ${effect} at (${pos.x}, ${pos.y})`);
    }, index * 300);
  });
}

/**
 * Print OpenGL status
 */
export function printOpenGLStatus(
  adapter: OpenGLRendererAdapter | null,
  gameRenderer: any,
): void {
  console.log("=== OpenGL Status ===");

  if (!adapter) {
    console.log("❌ Adapter not initialized");
    return;
  }

  console.log("✅ Adapter initialized");
  console.log(`Available: ${adapter.isOpenGLAvailable()}`);
  console.log(`Mode: ${adapter.getRenderMode()}`);
  console.log(`Loading assets: ${adapter.isLoadingAssets()}`);

  const progress = adapter.getLoadingProgress();
  console.log(
    `Assets: ${progress.loaded}/${progress.total} (${progress.percentage.toFixed(1)}%)`,
  );

  const scene = adapter.getScene();
  if (scene) {
    console.log(`Scene objects: ${scene.children.length}`);
  }

  console.log("====================");
}

/**
 * Create interactive test console
 */
export function setupTestConsole(gameRenderer: any, eventBus: EventBus): void {
  const adapter = gameRenderer.getOpenGLAdapter();

  // Expose to window for easy access
  (window as any).openglTest = {
    status: () => printOpenGLStatus(adapter, gameRenderer),
    effects: () => testParticleEffects(adapter),
    modes: () => testRenderModes(adapter),
    assets: () => testAssetLoading(adapter),
    events: () => simulateGameEvents(eventBus, adapter),
    pattern: () => generateTestPattern(adapter),
    adapter,
  };

  console.log("🧪 OpenGL Test Console Ready");
  console.log("Available commands:");
  console.log("  window.openglTest.status()   - Print OpenGL status");
  console.log("  window.openglTest.effects()  - Test particle effects");
  console.log("  window.openglTest.modes()    - Test render modes");
  console.log("  window.openglTest.assets()   - Check asset loading");
  console.log("  window.openglTest.events()   - Simulate game events");
  console.log("  window.openglTest.pattern()  - Generate test pattern");
}

/**
 * Benchmark rendering performance
 */
export function benchmarkRendering(
  adapter: OpenGLRendererAdapter | null,
  duration: number = 5000,
): void {
  if (!adapter?.isOpenGLAvailable()) {
    console.warn("OpenGL not available");
    return;
  }

  console.log(`Benchmarking for ${duration}ms...`);

  const startTime = performance.now();
  const position = { x: 400, y: 300 };
  let effectCount = 0;

  const benchmark = setInterval(() => {
    const effects = ["explosion", "smoke", "fire", "impact"];
    const effect = effects[Math.floor(Math.random() * effects.length)];
    adapter.createParticleEffect(effect, {
      x: position.x + (Math.random() - 0.5) * 200,
      y: position.y + (Math.random() - 0.5) * 200,
    });
    effectCount++;
  }, 100);

  setTimeout(() => {
    clearInterval(benchmark);
    const duration = performance.now() - startTime;
    const fps = (effectCount * 1000) / duration;
    console.log(
      `✅ Benchmark complete: ${effectCount} effects in ${duration.toFixed(0)}ms (${fps.toFixed(1)} effects/sec)`,
    );
  }, duration);
}
