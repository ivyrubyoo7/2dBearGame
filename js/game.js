// ─── GAME.JS ──────────────────────────────────────────────
// Core game loop, level definition, camera, collisions, particles

const Game = {
  canvas:  null,
  ctx:     null,
  running: false,
  paused:  false,
  frameId: null,

  // World
  worldW:  3200,  // total level width
  camX:    0,
  camY:    0,

  // Shake effect
  shakeMag:   0,
  shakeDuration: 0,

  // Entities
  player:   null,
  enemies:  [],
  platforms: [],
  coins:    [],
  flagX:    0,

  // Particle system
  particles: [],

  // Frame counter
  tick: 0,

  // ── INIT ──────────────────────────────────────────────
  init(charType, playerName) {
    this.canvas = document.getElementById('game-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.paused = false;
    this.running = true;
    this.tick    = 0;
    this.particles = [];

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this._buildLevel();
    this.player = new Player(100, 400, charType, playerName);

    Controls.init();
    SoundFX.init();

    if (this.frameId) cancelAnimationFrame(this.frameId);
    this._loop();
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.canvas.width  = W;
    this.canvas.height = H;
    this.VW = W;
    this.VH = H;
  },

  // ── LEVEL BUILDER ─────────────────────────────────────
  _buildLevel() {
    const H = window.innerHeight;
    const ground = H - 60;

    this.platforms = [];
    this.enemies   = [];
    this.coins     = [];

    // ── Ground sections ──
    const groundSections = [
      { x: 0,    w: 600  },
      { x: 650,  w: 300  },
      { x: 1010, w: 400  },
      { x: 1470, w: 350  },
      { x: 1880, w: 400  },
      { x: 2340, w: 350  },
      { x: 2750, w: 500  },
    ];
    groundSections.forEach(s => {
      this.platforms.push({ x: s.x, y: ground, w: s.w, h: 80, type: 'grass' });
    });

    // ── Elevated platforms ──
    const elevated = [
      { x: 200,  y: ground - 130, w: 160, type: 'stone' },
      { x: 440,  y: ground - 90,  w: 120, type: 'stone' },
      { x: 700,  y: ground - 150, w: 140, type: 'stone' },
      { x: 870,  y: ground - 80,  w: 100, type: 'dirt'  },
      { x: 1060, y: ground - 120, w: 150, type: 'stone' },
      { x: 1260, y: ground - 180, w: 130, type: 'stone' },
      { x: 1530, y: ground - 130, w: 160, type: 'grass' },
      { x: 1720, y: ground - 90,  w: 120, type: 'stone' },
      { x: 1950, y: ground - 160, w: 140, type: 'stone' },
      { x: 2150, y: ground - 100, w: 130, type: 'dirt'  },
      { x: 2400, y: ground - 140, w: 150, type: 'stone' },
      { x: 2580, y: ground - 90,  w: 110, type: 'stone' },
      { x: 2800, y: ground - 150, w: 140, type: 'grass' },
      { x: 3000, y: ground - 100, w: 150, type: 'stone' },
    ];
    elevated.forEach(p => {
      this.platforms.push({ ...p, h: 20 });
    });

    // ── Flag / Goal ──
    this.flagX = 3130;
    this.platforms.push({ x: 3100, y: ground, w: 100, h: 80, type: 'grass' });

    // ── Enemies ──
    const enemyDefs = [
      { x: 500,  type: 'slime'  },
      { x: 720,  type: 'slime'  },
      { x: 900,  type: 'goblin' },
      { x: 1100, type: 'slime'  },
      { x: 1320, type: 'goblin' },
      { x: 1560, type: 'slime'  },
      { x: 1760, type: 'orc'    },
      { x: 2000, type: 'goblin' },
      { x: 2200, type: 'slime'  },
      { x: 2450, type: 'orc'    },
      { x: 2620, type: 'goblin' },
      { x: 2850, type: 'slime'  },
      { x: 3020, type: 'orc'    },
    ];
    enemyDefs.forEach(e => {
      this.enemies.push(new Enemy(e.x, ground - ENEMY_TYPES[e.type].h - 2, e.type));
    });

    // ── Coins ──
    for (let i = 0; i < 40; i++) {
      const cx = 200 + i * 72;
      // Some on ground, some on platforms
      const py = i % 3 === 0 ? ground - 45 : ground - 120 - Utils.randInt(0, 80);
      this.coins.push({ x: cx, y: py, r: 10, collected: false });
    }
  },

  // ── SCREEN SHAKE ──────────────────────────────────────
  screenShake(mag) {
    this.shakeMag = mag;
    this.shakeDuration = 15;
  },

  // ── SPAWN PARTICLES ───────────────────────────────────
  spawnParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1, decay: 0.03 + Math.random() * 0.03,
        size: 4 + Math.random() * 4,
        color,
      });
    }
  },

  // ── PAUSE ─────────────────────────────────────────────
  togglePause() {
    if (!this.running) return;
    this.paused = !this.paused;
    if (this.paused) {
      UI.show('pause');
    } else {
      UI.show('game');
      this._loop();
    }
  },

  stop() {
    this.running = false;
    if (this.frameId) { cancelAnimationFrame(this.frameId); this.frameId = null; }
  },

  // ── MAIN LOOP ─────────────────────────────────────────
  _loop() {
    if (!this.running || this.paused) return;
    this.frameId = requestAnimationFrame(() => this._loop());
    this._update();
    this._render();
  },

  _update() {
    this.tick++;
    const p = this.player;

    // Player update
    p.update(Controls, this.platforms);

    // Keep player in world bounds
    p.x = Utils.clamp(p.x, 0, this.worldW - p.w);

    // ── Camera ──────────────────────────────────────────
    const targetCamX = p.x + p.w / 2 - this.VW / 2;
    this.camX = Utils.lerp(this.camX, targetCamX, 0.1);
    this.camX = Utils.clamp(this.camX, 0, this.worldW - this.VW);

    // ── Enemy updates ───────────────────────────────────
    this.enemies.forEach(e => {
      if (!e.dead) e.update(p, this.platforms);
    });

    // ── Attack hit detection ─────────────────────────────
    if (p.attackBox) {
      this.enemies.forEach(e => {
        if (e.dead) return;
        if (p.attackBox && e.hitbox && Utils.rectsOverlap(p.attackBox, e.hitbox)) {
          const killed = e.takeDamage(p.attackDmg, p.x + p.w / 2);
          if (killed) {
            p.score += ENEMY_TYPES[e.type].score;
            this.spawnParticles(
              e.x + e.w / 2, e.y + e.h / 2,
              e.type === 'slime' ? '#2ecc71' : e.type === 'goblin' ? '#6aaa3a' : '#8a3a20',
              12
            );
          } else {
            this.spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#ffcc00', 5);
          }
          p.attackBox = null; // one hit per swing
        }
      });
    }

    // ── Coin collection ─────────────────────────────────
    this.coins.forEach(c => {
      if (c.collected) return;
      const coinBox = { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 };
      if (Utils.rectsOverlap(p, coinBox)) {
        c.collected = true;
        p.score += 10;
        SoundFX.play('coin');
        this.spawnParticles(c.x, c.y, '#f5c518', 6);
      }
    });

    // ── Screen shake ────────────────────────────────────
    if (this.shakeDuration > 0) {
      this.shakeDuration--;
      if (this.shakeDuration === 0) this.shakeMag = 0;
    }

    // ── Update particles ────────────────────────────────
    this.particles = this.particles.filter(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.15;
      pt.life -= pt.decay;
      return pt.life > 0;
    });

    // ── Win / Lose checks ───────────────────────────────
    // Victory: reach flag
    const flagBox = { x: this.flagX, y: 0, w: 50, h: this.VH };
    if (Utils.rectsOverlap(p, flagBox) && p.state !== 'dead') {
      this.stop();
      SoundFX.play('victory');
      setTimeout(() => UI.showVictory(p.name, p.score), 500);
      return;
    }

    // Game over
    if (p.state === 'dead' && p.lives <= 0) {
      this.stop();
      SoundFX.play('gameover');
      setTimeout(() => UI.showGameOver(p.score), 800);
      return;
    }

    // Fell off the world
    if (p.y > this.VH + 100) {
      p.y = 200;
      p.x = Math.max(0, this.camX + this.VW / 2 - p.w / 2);
      p.vy = 0;
      p.takeDamage(p.hp, p.x); // force death/live loss
    }

    // ── HUD ─────────────────────────────────────────────
    UI.updateHUD(p);
  },

  _render() {
    const ctx  = this.ctx;
    const VW   = this.VW;
    const VH   = this.VH;

    ctx.clearRect(0, 0, VW, VH);

    // Screen shake offset
    const sx = this.shakeDuration > 0
      ? (Math.random() - 0.5) * this.shakeMag * 2
      : 0;
    const sy = this.shakeDuration > 0
      ? (Math.random() - 0.5) * this.shakeMag
      : 0;

    // ── Background ──────────────────────────────────────
    Sprites.drawBackground(ctx, VW, VH, this.camX);

    ctx.save();
    ctx.translate(-Math.round(this.camX) + sx, sy);

    // ── Platforms ───────────────────────────────────────
    this.platforms.forEach(p => {
      const screenX = p.x - this.camX;
      if (screenX > VW + 100 || screenX + p.w < -100) return;
      Sprites.drawPlatform(ctx, p.x, p.y, p.w, p.h, p.type);
    });

    // ── Flag / Goal ──────────────────────────────────────
    const groundY = VH - 60;
    Sprites.drawFlag(ctx, this.flagX, groundY - 80, 80, this.tick);

    // ── Coins ────────────────────────────────────────────
    this.coins.forEach(c => {
      if (c.collected) return;
      const screenX = c.x - this.camX;
      if (screenX > VW + 50 || screenX < -50) return;
      const bob = Math.sin(this.tick * 0.08 + c.x * 0.02) * 4;
      Sprites.drawCoin(ctx, c.x, c.y + bob, c.r, this.tick);
    });

    // ── Enemies ──────────────────────────────────────────
    this.enemies.forEach(e => {
      const screenX = e.x - this.camX;
      if (screenX > VW + 100 || screenX + e.w < -100) return;
      e.draw(ctx);
    });

    // ── Player ───────────────────────────────────────────
    this.player.draw(ctx);

    // ── Particles ────────────────────────────────────────
    this.particles.forEach(pt => {
      ctx.save();
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.color;
      ctx.fillRect(
        Math.round(pt.x - pt.size / 2),
        Math.round(pt.y - pt.size / 2),
        Math.round(pt.size), Math.round(pt.size)
      );
      ctx.restore();
    });

    ctx.restore();

    // ── Distance progress indicator ──────────────────────
    this._drawProgressBar(ctx, VW, VH);
  },

  _drawProgressBar(ctx, VW, VH) {
    const p = this.player;
    const pct = Utils.clamp(p.x / (this.flagX - 100), 0, 1);
    const bw = Math.round(VW * 0.4);
    const bx = Math.round((VW - bw) / 2);
    const by = VH - 16;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx - 2, by - 2, bw + 4, 10);
    ctx.fillStyle = '#f5c518';
    ctx.fillRect(bx, by, Math.round(bw * pct), 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, 6);

    // Start / End markers
    ctx.font = "7px 'Press Start 2P'";
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';  ctx.fillText('A', bx - 14, by + 5);
    ctx.textAlign = 'right'; ctx.fillText('B', bx + bw + 14, by + 5);

    // Player icon on bar
    ctx.fillStyle = '#f5c518';
    ctx.beginPath();
    ctx.arc(bx + Math.round(bw * pct), by + 3, 5, 0, Math.PI * 2);
    ctx.fill();
  },
};
window.Game = Game;