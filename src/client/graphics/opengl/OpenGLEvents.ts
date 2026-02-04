/**
 * OpenGL Event Classes
 * Event types for OpenGL rendering system
 * AGPL 3.0 License - See LICENSE file for details
 */

import { GameEvent } from "../../../core/EventBus";

/**
 * Fired when a unit attacks
 */
export class UnitAttackEvent implements GameEvent {
  constructor(
    public attacker: any,
    public target: any,
    public position: { x: number; y: number },
  ) {}
}

/**
 * Fired when a structure is destroyed
 */
export class StructureDestroyedEvent implements GameEvent {
  constructor(
    public structure: any,
    public position: { x: number; y: number },
  ) {}
}

/**
 * Fired for explosion effects
 */
export class ExplosionEvent implements GameEvent {
  constructor(
    public position: { x: number; y: number },
    public radius: number,
    public intensity: number,
  ) {}
}

/**
 * Fired when game state updates
 */
export class GameStateUpdateEvent implements GameEvent {
  constructor(public state: any) {}
}

/**
 * Fired when OpenGL renderer is ready
 */
export class OpenGLReadyEvent implements GameEvent {
  constructor(public adapter: any) {}
}

/**
 * Fired when render mode changes
 */
export class RenderModeChangedEvent implements GameEvent {
  constructor(public mode: string) {}
}

/**
 * Base particle effect event
 */
export class ParticleEffectEvent implements GameEvent {
  constructor(
    public effectType: string,
    public position: { x: number; y: number },
    public data?: any,
  ) {}
}

/**
 * Fired for fire particle effects
 */
export class FireParticleEvent extends ParticleEffectEvent {
  constructor(position: { x: number; y: number }, data?: any) {
    super("fire", position, data);
  }
}

/**
 * Fired for smoke particle effects
 */
export class SmokeParticleEvent extends ParticleEffectEvent {
  constructor(position: { x: number; y: number }, data?: any) {
    super("smoke", position, data);
  }
}

/**
 * Fired for explosion particle effects
 */
export class ExplosionParticleEvent extends ParticleEffectEvent {
  constructor(position: { x: number; y: number }, data?: any) {
    super("explosion", position, data);
  }
}

/**
 * Fired for impact particle effects
 */
export class ImpactParticleEvent extends ParticleEffectEvent {
  constructor(position: { x: number; y: number }, data?: any) {
    super("impact", position, data);
  }
}

/**
 * Fired for laser fire effects
 */
export class LaserFireParticleEvent extends ParticleEffectEvent {
  constructor(position: { x: number; y: number }, data?: any) {
    super("laser", position, data);
  }
}
