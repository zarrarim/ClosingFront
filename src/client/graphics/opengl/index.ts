/**
 * OpenGL Rendering Module
 * Exports all OpenGL-related classes and utilities
 * AGPL 3.0 License - See LICENSE file for details
 */

export {
  AssetManager,
  assetManager,
  type AssetReference,
} from "./AssetManager";
export {
  OpenGLRenderer,
  createOpenGLRenderer,
  type OpenGLRendererConfig,
} from "./OpenGLRenderer";
export {
  OpenGLRendererAdapter,
  RenderMode,
  createOpenGLAdapter,
} from "./OpenGLRendererAdapter";
export {
  ParticleEffects,
  ParticleSystem,
  type Particle,
  type ParticleEmitterConfig,
} from "./ParticleSystem";
