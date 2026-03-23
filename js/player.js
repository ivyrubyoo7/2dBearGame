// ─── PLAYER.JS ────────────────────────────────────────────
// Player entity: movement, jumping, attacking, taking damage, animation

class Player {
  constructor(x, y, charType, name) {
    this.x    = x;
    this.y    = y;
    this.w    = 40;
    this.h    = 52;
    this.vx   = 0;
    this.vy   = 0;
    this.onGround = false;
    this.dir  = 1;          // 1 = right, -1 = left
    this.name = name;
    this.charType = charType; // 'boy' | 'girl'

    // Stats
    this.maxHp   = charType === 'girl' ? 120 : 100;
    this.hp      = this.maxHp;
    this.speed   = charType === 'boy'  ? 4.2 : 3.8;
    this.lives   = 3;
    this.score   = 0;

    // State machine
    this.state    = 'idle'; // idle | walk | jump | attack | hurt | dead
    this.frame    = 0;
    this.frameTick = 0;

    // Attack
    this.attackCooldown = 0;
    this.ATTACK_CD      = 28;   // frames between attacks
    this.attackDuration = 0;
    this.ATTACK_DUR     = 18;   // frames attack hitbox lasts
    this.attackBox      = null;
    this.attackDmg      = charType === 'girl' ? 25 : 20;

    // Hurt invincibility frames
    this.iframes = 0;
    this.IFRAMES = 60;

    // Visual effects
    this.flashTimer = 0;
  }

  get hitbox() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  // ── UPDATE ────────────────────────────────────────────
  update(controls, platforms) {
    if (this.state === 'dead') return;

    // Timers
    if (this.attackCooldown  > 0) this.attackCooldown--;
    if (this.attackDuration  > 0) this.attackDuration--;
    if (this.iframes         > 0) this.iframes--;
    if (this.flashTimer      > 0) this.flashTimer--;

    controls.update();

    // ── Movement ──────────────────────────────────────
    const prevState = this.state;
    const isAttacking = this.attackDuration > 0;

    if (!isAttacking || !this.onGround) {
      if (controls.keys.left) {
        this.vx = -this.speed;
        this.dir = -1;
      } else if (controls.keys.right) {
        this.vx = this.speed;
        this.dir = 1;
      } else {
        this.vx *= this.onGround ? Physics.FRICTION : Physics.AIR_RESIST;
        if (Math.abs(this.vx) < 0.2) this.vx = 0;
      }
    }

    // ── Jump ──────────────────────────────────────────
    if (controls.jumpPressed && this.onGround) {
      this.vy = Physics.JUMP_FORCE;
      this.onGround = false;
      SoundFX.play('jump');
    }

    // ── Attack ──────────────────────────────────────
    if (controls.attackPressed && this.attackCooldown === 0) {
      this.attackCooldown  = this.ATTACK_CD;
      this.attackDuration  = this.ATTACK_DUR;
      this.state = 'attack';
      this.frame = 0;
      SoundFX.play('attack');

      // Build attack hitbox in front of player
      const reach = 44;
      this.attackBox = {
        x: this.dir === 1 ? this.x + this.w : this.x - reach,
        y: this.y + 8,
        w: reach,
        h: this.h - 16,
      };
    } else if (this.attackDuration === 0) {
      this.attackBox = null;
    }

    // ── Physics ──────────────────────────────────────
    Physics.applyGravity(this);
    Physics.moveAndCollide(this, platforms);

    // ── State ─────────────────────────────────────────
    if (this.state !== 'hurt') {
      if (this.attackDuration > 0) {
        this.state = 'attack';
      } else if (!this.onGround) {
        this.state = 'jump';
      } else if (Math.abs(this.vx) > 0.3) {
        this.state = 'walk';
      } else {
        this.state = 'idle';
      }
    } else if (this.iframes < this.IFRAMES - 20) {
      this.state = 'idle';
    }

    // ── Animation frame ───────────────────────────────
    const speeds = { idle: 12, walk: 5, jump: 8, attack: 3, hurt: 6 };
    this.frameTick++;
    if (this.frameTick >= (speeds[this.state] || 8)) {
      this.frame++;
      this.frameTick = 0;
    }
  }

  // ── TAKE DAMAGE ───────────────────────────────────────
  takeDamage(amount, fromX) {
    if (this.iframes > 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.iframes  = this.IFRAMES;
    this.flashTimer = 20;
    this.state    = 'hurt';
    this.frame    = 0;
    SoundFX.play('hurt');

    Physics.applyKnockback(this, fromX, 7, 5);

    if (this.hp <= 0) {
      this.lives--;
      if (this.lives > 0) {
        this.hp = this.maxHp;
        this.iframes = this.IFRAMES * 1.5;
        SoundFX.play('die');
      } else {
        this.state = 'dead';
        SoundFX.play('die');
      }
      return 'died';
    }
    return true;
  }

  // ── DRAW ──────────────────────────────────────────────
  draw(ctx) {
    // Invincibility flash
    if (this.iframes > 0 && Math.floor(this.iframes / 4) % 2 === 0) return;

    const drawFn = this.charType === 'girl' ? Sprites.drawGirl : Sprites.drawBoy;
    drawFn.call(Sprites, ctx, this.x, this.y, this.w, this.h, this.frame, this.dir, this.state);

    // Attack effect
    if (this.attackBox && this.attackDuration > 0) {
      const alpha = this.attackDuration / this.ATTACK_DUR;
      ctx.save();
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = '#ffff88';
      ctx.fillRect(this.attackBox.x, this.attackBox.y, this.attackBox.w, this.attackBox.h);
      // Slash arcs
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        this.x + this.w / 2 + this.dir * 20,
        this.y + this.h / 2,
        28, -0.8, 0.8
      );
      ctx.stroke();
      ctx.restore();
    }

    // Health bar above player
    Utils.healthBar(ctx,
      this.x, this.y - 10, this.w, 5,
      this.hp / this.maxHp,
      '#3ddc84', '#1a3020');
  }
}
