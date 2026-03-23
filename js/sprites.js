// ─── SPRITES.JS ───────────────────────────────────────────
// Procedural pixel-art sprite drawing (no external image files needed)
// All sprites are drawn programmatically on the canvas

const Sprites = {

  // ── PLAYER SPRITES ──────────────────────────────────────

  drawBoy(ctx, x, y, w, h, frame, dir, action) {
    Sprites._drawCharacter(ctx, x, y, w, h, frame, dir, action,
      { skin: '#f5c58a', hair: '#4a2c0a', shirt: '#3a6fd8', pants: '#2a2a6a', shoe: '#2a1a0a' });
  },

  drawGirl(ctx, x, y, w, h, frame, dir, action) {
    Sprites._drawCharacter(ctx, x, y, w, h, frame, dir, action,
      { skin: '#f5c58a', hair: '#c0306a', shirt: '#d83a6a', pants: '#6a2a8a', shoe: '#2a1a0a' });
  },

  _drawCharacter(ctx, x, y, w, h, frame, dir, action, colors) {
    const s  = w / 16; // scale unit (16px base)
    const cx = Math.round(x + w / 2);
    const cy = Math.round(y);
    const flip = dir < 0;

    ctx.save();
    if (flip) {
      ctx.translate(cx * 2, 0);
      ctx.scale(-1, 1);
    }

    const bx = Math.round(x); // base x
    const by = Math.round(y); // base y

    // Walk animation offsets
    const walkCycle = [0, -1, 0, 1];
    const legOff    = action === 'walk' ? walkCycle[Math.floor(frame / 4) % 4] * s * 2 : 0;
    const bodyBob   = action === 'walk' ? Math.abs(walkCycle[Math.floor(frame / 4) % 4]) * s : 0;

    // Jump squish/stretch
    const jumpStretch = action === 'jump' ? 1.15 : 1;
    const jumpSquish  = action === 'jump' ? 0.85 : 1;

    // Attack arm swing
    const atkArm = action === 'attack'
      ? (Math.floor(frame / 3) % 4) * 3 * s
      : 0;

    const hScale = jumpStretch;
    const wScale = jumpSquish;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(bx + w / 2, by + h - 2, w * 0.4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Feet / Shoes
    const shoeH = Math.round(3 * s);
    const shoeW = Math.round(5 * s);
    // Left shoe
    Sprites._rect(ctx, bx + s * 1 + legOff, by + h - shoeH, shoeW, shoeH, colors.shoe);
    // Right shoe
    Sprites._rect(ctx, bx + s * 10 - legOff, by + h - shoeH, shoeW, shoeH, colors.shoe);

    // Pants / Legs
    const legH = Math.round(5 * s * hScale);
    const legW = Math.round(5 * s * wScale);
    Sprites._rect(ctx, bx + s * 1 + legOff, by + h - shoeH - legH + bodyBob, legW, legH, colors.pants);
    Sprites._rect(ctx, bx + s * 10 - legOff, by + h - shoeH - legH + bodyBob, legW, legH, colors.pants);

    // Torso / Shirt
    const torsoY = by + h - shoeH - legH - Math.round(6 * s * hScale) + bodyBob;
    const torsoW = Math.round(12 * s * wScale);
    const torsoH = Math.round(7 * s * hScale);
    Sprites._rect(ctx, bx + s * 2, torsoY, torsoW, torsoH, colors.shirt);

    // Left arm (static or swinging)
    const armY  = torsoY + s;
    const armH  = Math.round(5 * s);
    const armW  = Math.round(3 * s);
    // Back arm
    Sprites._rect(ctx, bx - s + atkArm, armY, armW, armH, colors.skin);
    // Front arm
    Sprites._rect(ctx, bx + s * 14 - atkArm, armY, armW, armH, colors.skin);

    // Attack weapon (sword) when attacking
    if (action === 'attack' && atkArm > s * 4) {
      ctx.fillStyle = '#c0c0d0';
      ctx.fillRect(bx + s * 14 + s, armY - s * 2, s * 2, s * 8);
      ctx.fillStyle = '#8a6020';
      ctx.fillRect(bx + s * 14 + s, armY + s * 5, s * 2, s * 3);
    }

    // Head
    const headW = Math.round(10 * s * wScale);
    const headH = Math.round(9 * s * hScale);
    const headX = bx + s * 3;
    const headY = torsoY - headH + s;
    Sprites._rect(ctx, headX, headY, headW, headH, colors.skin);

    // Hair
    Sprites._rect(ctx, headX, headY, headW, Math.round(3 * s), colors.hair);
    Sprites._rect(ctx, headX, headY, Math.round(2 * s), Math.round(5 * s), colors.hair);
    if (colors.hair === '#c0306a') { // Girl: longer hair
      Sprites._rect(ctx, headX + headW - s * 2, headY, s * 2, headH, colors.hair);
    }

    // Eyes
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(headX + s * 2, headY + s * 4, Math.round(2 * s), Math.round(2 * s));
    ctx.fillRect(headX + s * 6, headY + s * 4, Math.round(2 * s), Math.round(2 * s));
    // Eye whites/highlight
    ctx.fillStyle = '#fff';
    ctx.fillRect(headX + s * 3, headY + s * 4, s, s);
    ctx.fillRect(headX + s * 7, headY + s * 4, s, s);

    // Mouth
    ctx.fillStyle = colors.hair === '#c0306a' ? '#e05080' : '#c05030';
    ctx.fillRect(headX + s * 3, headY + s * 7, Math.round(4 * s), s);

    ctx.restore();
  },

  // ── ENEMY SPRITES ──────────────────────────────────────

  drawSlime(ctx, x, y, w, h, frame, dir) {
    const s = w / 16;
    const bx = Math.round(x);
    const by = Math.round(y);
    const bounce = Math.sin(frame * 0.15) * s * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(bx + w / 2, by + h - 2, w * 0.4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (bouncy)
    const bH = Math.round(h * 0.7 - bounce);
    const bW = Math.round(w * 0.85 + bounce);
    const bOffX = Math.round((w - bW) / 2);
    const bY = Math.round(by + h - bH - 4);

    // Base green body
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(bx + bOffX, bY, bW, bH);
    // Darker top
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(bx + bOffX + s, bY, bW - s * 2, Math.round(bH * 0.4));
    // Lighter belly
    ctx.fillStyle = '#55efc4';
    ctx.fillRect(bx + bOffX + s * 2, bY + Math.round(bH * 0.5), bW - s * 4, Math.round(bH * 0.35));

    // Rounded corners (pixel style)
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(bx + bOffX, bY + s, s, s);
    ctx.fillRect(bx + bOffX + bW - s, bY + s, s, s);

    // Eyes
    const eyeY = bY + Math.round(bH * 0.25);
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx + bOffX + s * 2, eyeY, s * 3, s * 3);
    ctx.fillRect(bx + bOffX + bW - s * 5, eyeY, s * 3, s * 3);
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(bx + bOffX + s * 3, eyeY + s, s * 2, s * 2);
    ctx.fillRect(bx + bOffX + bW - s * 4, eyeY + s, s * 2, s * 2);

    // Angry eyebrows
    ctx.fillStyle = '#1a5a30';
    ctx.fillRect(bx + bOffX + s * 2, eyeY - s, s * 3, s);
    ctx.fillRect(bx + bOffX + bW - s * 5, eyeY - s, s * 3, s);

    // Mouth
    ctx.fillStyle = '#1a5a30';
    ctx.fillRect(bx + bOffX + s * 3, bY + Math.round(bH * 0.6), bW - s * 6, s);
    // Fangs
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx + bOffX + s * 4, bY + Math.round(bH * 0.6), s, s * 2);
    ctx.fillRect(bx + bOffX + bW - s * 5, bY + Math.round(bH * 0.6), s, s * 2);
  },

  drawGoblin(ctx, x, y, w, h, frame, dir) {
    const s = w / 16;
    const bx = Math.round(x);
    const by = Math.round(y);
    const walkBob = Math.sin(frame * 0.2) * s;
    const flip = dir < 0;

    ctx.save();
    if (flip) { ctx.translate((bx + w / 2) * 2, 0); ctx.scale(-1, 1); }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(bx + w / 2, by + h - 2, w * 0.4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#5a3a0a';
    ctx.fillRect(bx + s * 3, by + h - s * 5 + walkBob, s * 4, s * 5);
    ctx.fillRect(bx + s * 9, by + h - s * 5 - walkBob, s * 4, s * 5);

    // Body
    ctx.fillStyle = '#5a8a30';
    ctx.fillRect(bx + s * 2, by + h - s * 10, s * 12, s * 6);
    // Chest detail
    ctx.fillStyle = '#4a7020';
    ctx.fillRect(bx + s * 4, by + h - s * 9, s * 8, s * 3);

    // Arms
    ctx.fillStyle = '#5a8a30';
    ctx.fillRect(bx, by + h - s * 10, s * 3, s * 5);      // left
    ctx.fillRect(bx + s * 13, by + h - s * 10, s * 3, s * 5); // right
    // Claws
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(bx - s, by + h - s * 6, s * 2, s * 2);
    ctx.fillRect(bx + s * 15, by + h - s * 6, s * 2, s * 2);

    // Head
    ctx.fillStyle = '#6aaa3a';
    ctx.fillRect(bx + s * 3, by + s * 2, s * 10, s * 8);
    // Ears
    ctx.fillStyle = '#5a9a2a';
    ctx.fillRect(bx + s * 2, by + s * 3, s * 2, s * 4);   // left
    ctx.fillRect(bx + s * 12, by + s * 3, s * 2, s * 4);  // right

    // Eyes
    ctx.fillStyle = '#ff0';
    ctx.fillRect(bx + s * 4, by + s * 5, s * 3, s * 2);
    ctx.fillRect(bx + s * 9, by + s * 5, s * 3, s * 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(bx + s * 5, by + s * 5, s, s * 2);
    ctx.fillRect(bx + s * 10, by + s * 5, s, s * 2);

    // Nose
    ctx.fillStyle = '#4a8020';
    ctx.fillRect(bx + s * 7, by + s * 7, s * 2, s * 2);

    // Mouth (grin)
    ctx.fillStyle = '#2a5010';
    ctx.fillRect(bx + s * 4, by + s * 9, s * 8, s);
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx + s * 5, by + s * 9, s * 2, s * 2);
    ctx.fillRect(bx + s * 9, by + s * 9, s * 2, s * 2);

    // Helmet
    ctx.fillStyle = '#888';
    ctx.fillRect(bx + s * 3, by + s, s * 10, s * 3);

    ctx.restore();
  },

  drawOrc(ctx, x, y, w, h, frame, dir) {
    const s = w / 16;
    const bx = Math.round(x);
    const by = Math.round(y);
    const flip = dir < 0;
    const walkBob = Math.sin(frame * 0.15) * s * 1.5;

    ctx.save();
    if (flip) { ctx.translate((bx + w / 2) * 2, 0); ctx.scale(-1, 1); }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(bx + w / 2, by + h - 2, w * 0.45, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Big legs
    ctx.fillStyle = '#3a2a0a';
    ctx.fillRect(bx + s * 2, by + h - s * 6 + walkBob, s * 5, s * 6);
    ctx.fillRect(bx + s * 9, by + h - s * 6 - walkBob, s * 5, s * 6);

    // Massive body
    ctx.fillStyle = '#8a3a20';
    ctx.fillRect(bx + s, by + s * 7, s * 14, s * 7);
    ctx.fillStyle = '#aa4a30';
    ctx.fillRect(bx + s * 2, by + s * 7, s * 12, s * 4);

    // Armor plates
    ctx.fillStyle = '#777';
    ctx.fillRect(bx + s * 3, by + s * 8, s * 10, s * 2);

    // Arms (huge)
    ctx.fillStyle = '#8a3a20';
    ctx.fillRect(bx - s * 2, by + s * 7, s * 4, s * 7); // left
    ctx.fillRect(bx + s * 14, by + s * 7, s * 4, s * 7); // right
    // Fists
    ctx.fillStyle = '#6a2a10';
    ctx.fillRect(bx - s * 2, by + s * 13, s * 5, s * 3);
    ctx.fillRect(bx + s * 13, by + s * 13, s * 5, s * 3);

    // Big head
    ctx.fillStyle = '#7a3a1a';
    ctx.fillRect(bx + s * 3, by, s * 10, s * 9);
    // Jaw
    ctx.fillStyle = '#6a2a10';
    ctx.fillRect(bx + s * 2, by + s * 6, s * 12, s * 3);

    // Eyes
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(bx + s * 4, by + s * 3, s * 3, s * 3);
    ctx.fillRect(bx + s * 9, by + s * 3, s * 3, s * 3);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(bx + s * 5, by + s * 4, s, s);
    ctx.fillRect(bx + s * 10, by + s * 4, s, s);

    // Tusks
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(bx + s * 4, by + s * 8, s * 2, s * 3);
    ctx.fillRect(bx + s * 10, by + s * 8, s * 2, s * 3);

    // Horns
    ctx.fillStyle = '#4a3010';
    ctx.fillRect(bx + s * 4, by - s * 2, s * 2, s * 3);
    ctx.fillRect(bx + s * 10, by - s * 2, s * 2, s * 3);

    ctx.restore();
  },

  // ── ENVIRONMENT ────────────────────────────────────────

  drawBackground(ctx, W, H, camX) {
    // Sky gradient
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0,   '#1a2a5a');
    grd.addColorStop(0.4, '#2a4a8a');
    grd.addColorStop(1,   '#3a6aaa');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Clouds (slow parallax)
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    const clouds = [
      { x: 80,  y: H * 0.12, w: 120, h: 40 },
      { x: 260, y: H * 0.08, w: 90,  h: 30 },
      { x: 440, y: H * 0.15, w: 150, h: 45 },
      { x: 620, y: H * 0.1,  w: 110, h: 35 },
      { x: 820, y: H * 0.13, w: 130, h: 38 },
    ];
    clouds.forEach(c => {
      const px = ((c.x - camX * 0.2) % (W + 200) + W + 200) % (W + 200) - 100;
      Sprites._drawCloud(ctx, px, c.y, c.w, c.h);
    });

    // Far mountains (parallax layer)
    ctx.fillStyle = 'rgba(30,50,90,0.6)';
    const mts = [0, 130, 260, 400, 540, 670, 800];
    mts.forEach((mx, i) => {
      const px = ((mx - camX * 0.35) % (W + 300) + W + 300) % (W + 300) - 150;
      const mh = H * (0.25 + (i % 3) * 0.07);
      ctx.beginPath();
      ctx.moveTo(px, H * 0.65);
      ctx.lineTo(px + 80, H * 0.65 - mh);
      ctx.lineTo(px + 160, H * 0.65);
      ctx.fill();
    });
  },

  _drawCloud(ctx, x, y, w, h) {
    // Simple pixelated cloud
    const b = Math.round(h / 3);
    ctx.fillRect(x + b, y, w - b * 2, h);
    ctx.fillRect(x, y + b, w, h - b);
    ctx.beginPath();
    ctx.arc(x + b * 2, y + b, b * 1.2, 0, Math.PI * 2);
    ctx.arc(x + w - b * 2, y + b, b * 1.5, 0, Math.PI * 2);
    ctx.fill();
  },

  drawPlatform(ctx, x, y, w, h, type = 'grass') {
    const colors = {
      grass: { top: '#4caf50', mid: '#8B5E3C', dark: '#5D3A1A' },
      stone: { top: '#9e9e9e', mid: '#757575', dark: '#424242' },
      dirt:  { top: '#a1887f', mid: '#795548', dark: '#4e342e' },
    };
    const c = colors[type] || colors.grass;

    // Main body
    ctx.fillStyle = c.mid;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);

    // Top grass strip
    ctx.fillStyle = c.top;
    ctx.fillRect(Math.round(x), Math.round(y), w, Math.min(10, h / 3));

    // Bottom dark strip
    ctx.fillStyle = c.dark;
    ctx.fillRect(Math.round(x), Math.round(y + h - 4), w, 4);

    // Pixel detail pattern
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let px = Math.round(x); px < Math.round(x + w); px += 16) {
      for (let py = Math.round(y + 12); py < Math.round(y + h - 4); py += 12) {
        ctx.fillRect(px, py, 8, 4);
      }
    }

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, w - 1, h - 1);
  },

  drawCoin(ctx, x, y, r, frame) {
    const angle = frame * 0.1;
    const scaleX = Math.abs(Math.cos(angle));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, 1);
    ctx.fillStyle = '#f5c518';
    ctx.strokeStyle = '#e8a000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.font = `bold ${r}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 1);
    ctx.restore();
  },

  drawFlag(ctx, x, y, h, frame) {
    // Pole
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(Math.round(x), Math.round(y), 4, h);

    // Waving flag
    const wave = Math.sin(frame * 0.1) * 5;
    const flagW = 36;
    const flagH = 24;
    const fy    = Math.round(y + 10);
    ctx.fillStyle = '#f5c518';
    ctx.beginPath();
    ctx.moveTo(x + 4, fy);
    ctx.lineTo(x + 4 + flagW, fy + wave);
    ctx.lineTo(x + 4 + flagW, fy + flagH + wave);
    ctx.lineTo(x + 4, fy + flagH);
    ctx.closePath();
    ctx.fill();
    // Star on flag
    ctx.fillStyle = '#e84040';
    ctx.font = '14px serif';
    ctx.textAlign = 'left';
    ctx.fillText('★', x + 12, fy + flagH * 0.7 + wave * 0.5);
  },

  drawExplosion(ctx, x, y, radius, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const colors = ['#ff4400', '#ff8800', '#ffcc00', '#fff'];
    colors.forEach((c, i) => {
      const r = radius * (1 - i * 0.2);
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  },

  // Preview for char select
  drawPreview(ctx, type, w, h) {
    ctx.clearRect(0, 0, w, h);
    if (type === 'boy')  Sprites.drawBoy (ctx, 0, 0, w, h, 0, 1, 'idle');
    if (type === 'girl') Sprites.drawGirl(ctx, 0, 0, w, h, 0, 1, 'idle');
  },

  // Shared rect helper
  _rect(ctx, x, y, w, h, fill) {
    if (w <= 0 || h <= 0) return;
    ctx.fillStyle = fill;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  },
};
window.Sprites = Sprites;