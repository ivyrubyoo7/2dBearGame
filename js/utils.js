// ─── UTILS.JS ─────────────────────────────────────────────
// Shared utility functions used across all modules

const Utils = {
  // Clamp a value between min and max
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },

  // Linear interpolation
  lerp(a, b, t) { return a + (b - a) * t; },

  // Check AABB rectangle overlap
  rectsOverlap(a, b) {
    if (!a || !b) return false;
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  },

  // Random integer
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Draw pixel rect
  pixelRect(ctx, x, y, w, h, fill, stroke, lineW = 2) {
    ctx.fillStyle = fill;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineW;
      ctx.strokeRect(Math.round(x) + lineW / 2, Math.round(y) + lineW / 2, w - lineW, h - lineW);
    }
  },

  // Text
  pixelText(ctx, text, x, y, size = 10, color = '#fff', align = 'left') {
    ctx.font = `${size}px 'Press Start 2P', monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, Math.round(x), Math.round(y));
  },

  // Health bar
  healthBar(ctx, x, y, w, h, pct, fgColor = '#e84040', bgColor = '#2a0000') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fgColor;
    ctx.fillRect(x, y, Math.round(w * pct), h);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
};


// ─── POWERUPS ─────────────────────────────────────────────
Utils.POWERUPS = {
  DOUBLE_JUMP: "double_jump",
  SPEED: "speed",
  INVINCIBLE: "invincible"
};

Utils.POWERUP_DURATION = {
  double_jump: 8000,
  speed: 6000,
  invincible: 4000
};


// ─── PARTICLES ────────────────────────────────────────────
Utils.particles = [];

// Basic particles
Utils.spawnParticles = function (x, y, type = "default") {
  for (let i = 0; i < 10; i++) {
    Utils.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * -3,
      life: 30,
      size: 2 + Math.random() * 2,
      type
    });
  }
};


// 🔥 BLOOD SPLASH (UPGRADED)
Utils.spawnBlood = function (x, y) {
  for (let i = 0; i < 25; i++) {
    Utils.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -6,
      life: 40 + Math.random() * 20,
      size: 2 + Math.random() * 3,
      type: "blood"
    });
  }
};


// Update
Utils.updateParticles = function () {
  for (let i = Utils.particles.length - 1; i >= 0; i--) {
    const p = Utils.particles[i];

    p.x += p.vx;
    p.y += p.vy;

    // gravity
    p.vy += 0.25;

    // slight air drag
    p.vx *= 0.98;

    p.life--;

    if (p.life <= 0) {
      Utils.particles.splice(i, 1);
    }
  }
};


// Draw
Utils.drawParticles = function (ctx, camera) {
  Utils.particles.forEach(p => {

    if (p.type === "blood") {
      // 🔥 darker + layered blood
      ctx.fillStyle = "#aa0000";
      ctx.fillRect(
        Math.round(p.x - camera.x),
        Math.round(p.y - camera.y),
        p.size,
        p.size
      );

      // highlight
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(
        Math.round(p.x - camera.x),
        Math.round(p.y - camera.y),
        p.size * 0.5,
        p.size * 0.5
      );

    } else {
      ctx.fillStyle =
        p.type === "jump" ? "#cccccc" :
        p.type === "hit" ? "#ff4444" :
        "#ffffff";

      ctx.fillRect(
        Math.round(p.x - camera.x),
        Math.round(p.y - camera.y),
        p.size,
        p.size
      );
    }
  });
};


// ─── SCREEN SHAKE ─────────────────────────────────────────
Utils.screenShake = function (camera, intensity = 5) {
  camera.x += (Math.random() - 0.5) * intensity;
  camera.y += (Math.random() - 0.5) * intensity;
};


// EXPORT
window.Utils = Utils;