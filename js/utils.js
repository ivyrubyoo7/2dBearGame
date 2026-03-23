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

  // Random integer in range [min, max]
  randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },

  // Draw a pixelated rectangle with outline
  pixelRect(ctx, x, y, w, h, fill, stroke, lineW = 2) {
    ctx.fillStyle = fill;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineW;
      ctx.strokeRect(Math.round(x) + lineW / 2, Math.round(y) + lineW / 2, w - lineW, h - lineW);
    }
  },

  // Draw pixel text (wraps ctx.fillText with pixel snapping)
  pixelText(ctx, text, x, y, size = 10, color = '#fff', align = 'left') {
    ctx.font = `${size}px 'Press Start 2P', monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, Math.round(x), Math.round(y));
  },

  // Draw a health bar
  healthBar(ctx, x, y, w, h, pct, fgColor = '#e84040', bgColor = '#2a0000') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fgColor;
    ctx.fillRect(x, y, Math.round(w * pct), h);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  },
};
window.Utils = Utils;