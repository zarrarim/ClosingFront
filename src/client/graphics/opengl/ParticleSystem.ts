/**
 * OpenGL Particle System
 * Handles explosions, smoke, fire, and other visual effects
 * AGPL 3.0 License - See LICENSE file for details
 */

declare let THREE: any;

export interface ParticleEmitterConfig {
  particleCount: number;
  lifetime: number; // ms
  emissionRate: number;
  velocity: any;
  velocityVariance: number;
  gravity: any;
  color: any;
  colorVariance: number;
  size: number;
  sizeVariance: number;
  drag: number;
}

export interface Particle {
  position: any;
  velocity: any;
  acceleration: any;
  color: any;
  size: number;
  lifetime: number;
  maxLifetime: number;
  dead: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private particleGroup: any = null;
  private config: ParticleEmitterConfig;
  private lastEmissionTime: number = 0;
  private isActive: boolean = true;

  constructor(config: Partial<ParticleEmitterConfig> = {}) {
    this.config = {
      particleCount: 100,
      lifetime: 2000,
      emissionRate: 50,
      velocity: new THREE.Vector3(0, 0, 0),
      velocityVariance: 0.5,
      gravity: new THREE.Vector3(0, -9.8, 0),
      color: new THREE.Color(1, 1, 1),
      colorVariance: 0,
      size: 1,
      sizeVariance: 0,
      drag: 0.01,
      ...config,
    };
  }

  private createParticle(): Particle {
    const velocity = this.config.velocity.clone();
    const variance = this.config.velocityVariance;

    velocity.x += (Math.random() - 0.5) * variance;
    velocity.y += (Math.random() - 0.5) * variance;
    velocity.z += (Math.random() - 0.5) * variance;

    const color = this.config.color.clone();
    if (this.config.colorVariance > 0) {
      color.multiplyScalar(
        1 + (Math.random() - 0.5) * this.config.colorVariance,
      );
    }

    const size = this.config.size;
    const sizeVariance =
      size * (Math.random() - 0.5) * this.config.sizeVariance;

    return {
      position: new THREE.Vector3(0, 0, 0),
      velocity,
      acceleration: this.config.gravity.clone(),
      color,
      size: size + sizeVariance,
      lifetime: 0,
      maxLifetime: this.config.lifetime,
      dead: false,
    };
  }

  private createParticleMesh(particle: Particle): any {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      -particle.size,
      -particle.size,
      0,
      particle.size,
      -particle.size,
      0,
      particle.size,
      particle.size,
      0,
      -particle.size,
      particle.size,
      0,
    ]);

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(
      new THREE.BufferAttribute(new Uint16Array([0, 1, 2, 0, 2, 3]), 1),
    );

    const material = new THREE.MeshBasicMaterial({
      color: particle.color,
      transparent: true,
      opacity: 1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  public emit(position: any, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.config.particleCount) break;

      const particle = this.createParticle();
      particle.position = position.clone();
      this.particles.push(particle);

      const mesh = this.createParticleMesh(particle);
      mesh.position.copy(particle.position);
      this.particleGroup.add(mesh);
    }
  }

  public update(deltaTime: number): void {
    const meshes = this.particleGroup.children;

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const mesh = meshes[i] as any;

      if (!particle || particle.dead) continue;

      // Update lifetime
      particle.lifetime += deltaTime * 1000;
      if (particle.lifetime >= particle.maxLifetime) {
        particle.dead = true;
        if (mesh) {
          this.particleGroup.remove(mesh);
        }
        continue;
      }

      // Apply physics
      const drag = 1 - this.config.drag;
      particle.velocity.multiplyScalar(drag);
      particle.velocity.add(
        particle.acceleration.clone().multiplyScalar(deltaTime),
      );
      particle.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime),
      );

      // Update opacity
      const progress = particle.lifetime / particle.maxLifetime;
      const opacity = 1 - Math.pow(progress, 2);

      // Update mesh position
      if (mesh) {
        mesh.position.copy(particle.position);
        (mesh.material as any).opacity = opacity;
      }
    }

    // Remove dead particles
    this.particles = this.particles.filter((p) => !p.dead);
  }

  public getGroup(): any {
    return this.particleGroup;
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  public reset(): void {
    this.particles = [];
    this.particleGroup.clear();
  }

  public dispose(): void {
    this.reset();
    this.particleGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as any).dispose();
      }
    });
  }
}

/**
 * Predefined particle effect creators
 */
export class ParticleEffects {
  static createExplosion(position: any, intensity: number = 1): ParticleSystem {
    const system = new ParticleSystem({
      particleCount: Math.floor(50 * intensity),
      lifetime: 1000,
      emissionRate: 100 * intensity,
      velocity: new THREE.Vector3(0, 5, 0),
      velocityVariance: 15 * intensity,
      gravity: new THREE.Vector3(0, -9.8, 0),
      color: new THREE.Color(1, 0.5, 0),
      colorVariance: 0.3,
      size: 2 * intensity,
      sizeVariance: 0.5,
      drag: 0.05,
    });

    system.emit(position, Math.floor(20 * intensity));
    return system;
  }

  static createSmoke(position: any, intensity: number = 1): ParticleSystem {
    const system = new ParticleSystem({
      particleCount: Math.floor(100 * intensity),
      lifetime: 3000,
      emissionRate: 50 * intensity,
      velocity: new THREE.Vector3(0, 2, 0),
      velocityVariance: 3 * intensity,
      gravity: new THREE.Vector3(0, 0.5, 0),
      color: new THREE.Color(0.5, 0.5, 0.5),
      colorVariance: 0.2,
      size: 3 * intensity,
      sizeVariance: 0.4,
      drag: 0.02,
    });

    system.emit(position, Math.floor(30 * intensity));
    return system;
  }

  static createFire(position: any, intensity: number = 1): ParticleSystem {
    const system = new ParticleSystem({
      particleCount: Math.floor(40 * intensity),
      lifetime: 800,
      emissionRate: 80 * intensity,
      velocity: new THREE.Vector3(0, 3, 0),
      velocityVariance: 2 * intensity,
      gravity: new THREE.Vector3(0, 1, 0),
      color: new THREE.Color(1, 1, 0),
      colorVariance: 0.5,
      size: 1.5 * intensity,
      sizeVariance: 0.3,
      drag: 0.03,
    });

    system.emit(position, Math.floor(15 * intensity));
    return system;
  }

  static createImpact(position: any, intensity: number = 1): ParticleSystem {
    const system = new ParticleSystem({
      particleCount: Math.floor(30 * intensity),
      lifetime: 500,
      emissionRate: 100 * intensity,
      velocity: new THREE.Vector3(0, 0, 0),
      velocityVariance: 20 * intensity,
      gravity: new THREE.Vector3(0, -15, 0),
      color: new THREE.Color(1, 1, 1),
      colorVariance: 0.2,
      size: 0.5 * intensity,
      sizeVariance: 0.3,
      drag: 0.1,
    });

    system.emit(position, Math.floor(15 * intensity));
    return system;
  }

  static createLaserFire(start: any, end: any): ParticleSystem {
    const direction = end.clone().sub(start).normalize();
    const distance = start.distanceTo(end);

    const system = new ParticleSystem({
      particleCount: 50,
      lifetime: 300,
      emissionRate: 100,
      velocity: direction.multiplyScalar(distance),
      velocityVariance: 5,
      gravity: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(0, 1, 1),
      colorVariance: 0.1,
      size: 1,
      sizeVariance: 0.2,
      drag: 0.05,
    });

    system.emit(start, 10);
    return system;
  }
}
