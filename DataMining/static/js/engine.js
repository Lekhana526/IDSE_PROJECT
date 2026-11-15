/**
 * Data Miner: The Treasure Hunt - 2D Canvas Engine
 * Handles camera, scaling, screen transforms, dynamic cave lighting, particles, and collisions.
 */

class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.width = viewportWidth;
    this.height = viewportHeight;
    this.target = null;
    this.lerpSpeed = 0.15;
    this.scale = 1.5;
    this.resize(viewportWidth, viewportHeight);
  }

  follow(target) {
    this.target = target;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    // Auto-scale: crisp pixel zoom for immersive adventure feel
    if (w >= 1400 && h >= 800) {
      this.scale = 1.6;
    } else if (w >= 1000) {
      this.scale = 1.35;
    } else {
      this.scale = 1.1;
    }
  }

  update(worldWidth, worldHeight) {
    const viewW = this.width / this.scale;
    const viewH = this.height / this.scale;

    // Horizontal centering or scrolling
    if (viewW >= worldWidth) {
      this.x = 0;
      this.offsetX = Math.floor((viewW - worldWidth) / 2);
    } else {
      this.offsetX = 0;
      if (this.target) {
        const targetX = this.target.x + this.target.width / 2 - viewW / 2;
        this.x += (targetX - this.x) * this.lerpSpeed;
        this.x = Math.max(0, Math.min(this.x, worldWidth - viewW));
      }
    }

    // Vertical centering or scrolling
    if (viewH >= worldHeight) {
      this.y = 0;
      this.offsetY = Math.floor((viewH - worldHeight) / 2);
    } else {
      this.offsetY = 0;
      if (this.target) {
        const targetY = this.target.y + this.target.height / 2 - viewH / 2;
        this.y += (targetY - this.y) * this.lerpSpeed;
        this.y = Math.max(0, Math.min(this.y, worldHeight - viewH));
      }
    }
  }

  toScreenX(worldX) {
    return Math.floor(worldX - this.x + this.offsetX);
  }

  toScreenY(worldY) {
    return Math.floor(worldY - this.y + this.offsetY);
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, color, count = 8, speed = 2, life = 35) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.4 + Math.random() * 0.8) * speed;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 0.5,
        color: color,
        alpha: 1.0,
        size: 2 + Math.random() * 3,
        life: life,
        maxLife: life
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.life--;
      p.alpha = p.life / p.maxLife;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx, camera) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(camera.toScreenX(p.x), camera.toScreenY(p.y), p.size, p.size);
      ctx.restore();
    }
  }
}

class LightSource {
  constructor(x, y, radius, color = 'rgba(255, 230, 180, 0.9)', flicker = true) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.baseRadius = radius;
    this.color = color;
    this.flicker = flicker;
  }

  update() {
    if (this.flicker) {
      this.radius = this.baseRadius + (Math.random() - 0.5) * 5;
    }
  }
}

class LightingEngine {
  constructor() {
    this.lightCanvas = document.createElement('canvas');
    this.lightCtx = this.lightCanvas.getContext('2d');
  }

  resize(w, h, scale = 1.0) {
    this.lightCanvas.width = Math.max(1, Math.ceil(w / scale));
    this.lightCanvas.height = Math.max(1, Math.ceil(h / scale));
  }

  render(ctx, camera, lights, darkOpacity = 0.68) {
    const w = this.lightCanvas.width;
    const h = this.lightCanvas.height;
    const lCtx = this.lightCtx;

    // 1. Fill light canvas with a soft warm chocolate-brown ambient shadow (NOT deep black)
    lCtx.clearRect(0, 0, w, h);
    lCtx.fillStyle = `rgba(60, 40, 24, ${darkOpacity})`;
    lCtx.fillRect(0, 0, w, h);

    // 2. Punch soft light openings for light sources using 'destination-out'
    lCtx.globalCompositeOperation = 'destination-out';

    for (const light of lights) {
      const screenX = camera.toScreenX(light.x);
      const screenY = camera.toScreenY(light.y);

      if (screenX + light.radius < 0 || screenX - light.radius > w ||
          screenY + light.radius < 0 || screenY - light.radius > h) {
        continue;
      }

      const grad = lCtx.createRadialGradient(
        screenX, screenY, light.radius * 0.2,
        screenX, screenY, light.radius
      );
      grad.addColorStop(0, 'rgba(0,0,0,1.0)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.5)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      lCtx.fillStyle = grad;
      lCtx.beginPath();
      lCtx.arc(screenX, screenY, light.radius, 0, Math.PI * 2);
      lCtx.fill();
    }

    lCtx.globalCompositeOperation = 'source-over';

    // 3. Render soft, subtle colored glow overlays (reduced intensity, no huge halos)
    for (const light of lights) {
      const screenX = camera.toScreenX(light.x);
      const screenY = camera.toScreenY(light.y);
      if (screenX + light.radius < 0 || screenX - light.radius > w) continue;

      const glowRadius = light.radius * 0.55;
      const grad = ctx.createRadialGradient(
        screenX, screenY, 0,
        screenX, screenY, glowRadius
      );
      grad.addColorStop(0, light.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      ctx.globalAlpha = 0.35; // Gentle, muted glow that preserves ground textures
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(screenX, screenY, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Blend darkness onto main game canvas
    ctx.drawImage(this.lightCanvas, 0, 0);
  }
}

window.Camera = Camera;
window.ParticleSystem = ParticleSystem;
window.LightSource = LightSource;
window.LightingEngine = LightingEngine;
