import * as THREE from 'three';
import { createWindPhysics } from './windPhysics';

type PetalLayer = 'far' | 'mid' | 'near';

interface Petal {
  sprite: THREE.Sprite;
  layer: PetalLayer;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  seed: number;
}

function makePetalTexture(seed = 0): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Unable to create a 2D canvas context');

  ctx.clearRect(0, 0, size, size);
  ctx.translate(size / 2, size / 2);
  ctx.rotate((seed * 0.7) % (Math.PI * 2));

  const grad = ctx.createRadialGradient(120, 110, 10, 0, 0, 260);
  grad.addColorStop(0, `hsla(${336 + seed * 5}, 92%, 90%, 1)`);
  grad.addColorStop(0.3, `hsla(${346 + seed * 3}, 80%, 78%, 1)`);
  grad.addColorStop(0.68, `hsla(${352 + seed * 2}, 68%, 66%, 1)`);
  grad.addColorStop(1, `hsla(${360 + seed}, 62%, 52%, 1)`);

  ctx.beginPath();
  ctx.moveTo(0, -185);
  ctx.bezierCurveTo(88, -190, 172, -118, 147, -18);
  ctx.bezierCurveTo(176, 70, 90, 150, 0, 182);
  ctx.bezierCurveTo(-90, 150, -176, 70, -147, -18);
  ctx.bezierCurveTo(-172, -118, -88, -190, 0, -185);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.shadowBlur = 18;
  ctx.shadowColor = 'rgba(220, 120, 170, 0.25)';
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, -160);
  ctx.quadraticCurveTo(18, -94, 12, 18);
  ctx.moveTo(0, -160);
  ctx.quadraticCurveTo(-20, -95, -12, 18);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(210,100,160,0.35)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, -150);
  ctx.quadraticCurveTo(46, -98, 42, -16);
  ctx.moveTo(0, -150);
  ctx.quadraticCurveTo(-46, -98, -42, -16);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.ellipse(-12, 8, 90, 28, -0.22, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export class PetalSimulation {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly petals: Petal[] = [];
  private readonly wind = createWindPhysics();
  private readonly mouseInfluence = new THREE.Vector2();
  private lastFrame = 0;
  private elapsed = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 60);
    this.camera.position.set(0, 0, 12);
    this.camera.lookAt(0, 0, 0);

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);

    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.resize, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibility);
    window.addEventListener('pointermove', (event: PointerEvent) => {
      this.mouseInfluence.x = (event.clientX / window.innerWidth - 0.5) * 2;
      this.mouseInfluence.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  async init(): Promise<void> {
    const textureSet = Array.from({ length: 16 }, (_, i) => makePetalTexture(i));
    this.setupPetals(textureSet);
    this.resize();
    this.start();
  }

  private setupPetals(textureSet: THREE.CanvasTexture[]): void {
    const layers: { name: PetalLayer; count: number; opacity: number }[] = [
      { name: 'far', count: 28, opacity: 0.42 },
      { name: 'mid', count: 42, opacity: 0.68 },
      { name: 'near', count: 58, opacity: 0.92 },
    ];

    layers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i += 1) {
        const spriteMaterial = new THREE.SpriteMaterial({
          map: textureSet[(i + layerIndex * 4) % textureSet.length],
          transparent: true,
          opacity: layer.opacity,
          depthWrite: false,
          alphaTest: 0.02,
          color: 0xffffff,
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.32, 0.4, 1);
        sprite.position.set(
          (Math.random() - 0.5) * 16,
          6 + Math.random() * 10,
          (Math.random() - 0.5) * 4,
        );
        sprite.material.rotation = Math.random() * Math.PI;

        this.scene.add(sprite);
        this.petals.push({
          sprite,
          layer: layer.name,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            -(0.012 + Math.random() * 0.016),
            (Math.random() - 0.5) * 0.12,
          ),
          spin: new THREE.Vector3(
            (Math.random() - 0.5) * 3.1,
            (Math.random() - 0.5) * 4.2,
            (Math.random() - 0.5) * 3.8,
          ),
          seed: Math.random() * Math.PI * 2,
        });
      }
    });
  }

  private respawnPetal(petal: Petal): void {
    petal.sprite.position.set(
      (Math.random() - 0.5) * 15,
      6 + Math.random() * 8,
      (Math.random() - 0.5) * 4,
    );
    petal.velocity.set(
      (Math.random() - 0.5) * 0.12,
      -(0.012 + Math.random() * 0.016),
      (Math.random() - 0.5) * 0.1,
    );
    petal.seed = Math.random() * Math.PI * 2;
  }

  private update(dt: number, elapsed: number): void {
    const wind = this.wind.update(dt, elapsed);

    for (const petal of this.petals) {
      const layerFactor = petal.layer === 'far' ? 0.7 : petal.layer === 'mid' ? 1 : 1.2;
      petal.velocity.x += (wind.windX * 0.08 + Math.sin(elapsed * 1.6 + petal.seed) * 0.016 + this.mouseInfluence.x * 0.018) * dt * layerFactor;
      petal.velocity.y -= 0.003 * dt * layerFactor;
      petal.velocity.z += (wind.windY * 0.08 + Math.cos(elapsed * 1.5 + petal.seed) * 0.015) * dt;
      petal.velocity.multiplyScalar(0.9975);

      petal.sprite.position.addScaledVector(petal.velocity, dt * 52);
      petal.sprite.material.rotation += petal.spin.z * dt * 0.35;
      petal.sprite.position.x += Math.sin(elapsed * 1.7 + petal.seed) * 0.032 * dt * 52;

      if (petal.sprite.position.y < -8) {
        this.respawnPetal(petal);
      }
    }
  }

  private resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private start(): void {
    this.lastFrame = performance.now() * 0.001;
    this.renderer.setAnimationLoop(this.animate);
  }

  private handleVisibility(): void {
    if (document.hidden) {
      this.renderer.setAnimationLoop(null);
      return;
    }
    this.lastFrame = performance.now() * 0.001;
    this.renderer.setAnimationLoop(this.animate);
  }

  private animate(time: number): void {
    const seconds = time * 0.001;
    const dt = Math.min(Math.max(seconds - this.lastFrame, 0.016), 0.033);
    this.lastFrame = seconds;

    if (document.hidden) return;

    this.elapsed += dt;
    this.update(dt, this.elapsed);
    this.renderer.render(this.scene, this.camera);
  }
}