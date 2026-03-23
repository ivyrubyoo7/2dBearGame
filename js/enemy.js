// ─── ENEMY.JS ─────────────────────────────────────────────
// Enemy entity with AI patrol, aggro, attack, and three types

  // ─── ENEMY.JS ─────────────────────────────────────────────

// 🔥 Load GIF
const enemyImg = new Image();
enemyImg.src = "assets/pmob.gif";

enemyImg.onload = () => {
  console.log("Enemy GIF loaded ✅");
};

// Enemy types (logic only, no sprite draw now)
const ENEMY_TYPES = {
  slime: {
    hp: 40, speed: 1.2, dmg: 10, score: 50,
    w: 36, h: 30, range: 120, atkRange: 32,
    atkCd: 50, jumpForce: -9,
  },
  goblin: {
    hp: 70, speed: 2.0, dmg: 15, score: 100,
    w: 38, h: 50, range: 200, atkRange: 42,
    atkCd: 40, jumpForce: -11,
  },
  orc: {
    hp: 140, speed: 1.4, dmg: 25, score: 200,
    w: 52, h: 58, range: 180, atkRange: 55,
    atkCd: 70, jumpForce: -10,
  },
};

class Enemy {
  constructor(x, y, type = 'slime') {
    const cfg = ENEMY_TYPES[type] || ENEMY_TYPES.slime;

    Object.assign(this, cfg);

    this.type = type;
    this.x = x;
    this.y = y;

    // 🔥 FORCE SIZE FOR GIF (VERY IMPORTANT)
    this.w = 80;
    this.h = 80;

    this.vx = 0;
    this.vy = 0;

    this.onGround = false;
    this.dir = -1;

    this.maxHp = this.hp;

    // AI
    this.state = 'patrol';
    this.patrolLeft  = x - 80;
    this.patrolRight = x + 80;

    this.atkCooldown = 0;
    this.hurtTimer   = 0;

    // Animation
    this.frame     = 0;
    this.frameTick = 0;

    this.dead = false;
    this.deathTimer = 0;
  }

  // 🔥 Dynamic hitbox
  get hitbox() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    };
  }

  // ── UPDATE ─────────────────────────────
  update(player, platforms) {
    if (this.dead) {
      this.deathTimer++;
      return;
    }

    if (this.atkCooldown > 0) this.atkCooldown--;
    if (this.hurtTimer > 0) {
      this.hurtTimer--;
      return;
    }

    const px = player.x + player.w / 2;
    const ex = this.x + this.w / 2;
    const dist = Math.abs(px - ex);

    // AI
    if (dist < this.range && player.state !== 'dead') {
      this.state = 'chase';
    } else if (this.state === 'chase' && dist > this.range * 1.5) {
      this.state = 'patrol';
    }

    if (this.state === 'chase') {
      const dx = px - ex;
      this.dir = dx > 0 ? 1 : -1;
      this.vx = this.dir * this.speed;

      // Attack
      const verticalDist = Math.abs((player.y + player.h/2) - (this.y + this.h/2));

      if (
        dist < this.atkRange &&
        verticalDist < 40 &&   // 🔥 CONTROL HEIGHT RANGE HERE
        this.atkCooldown === 0
      ){
        this.state = 'attack';
        this.atkCooldown = this.atkCd;

        const result = player.takeDamage(this.dmg, this.x + this.w / 2);
        if (result) {
          Game.screenShake(6);
          SoundFX.play('playerHurt');
        }
      }
    } else {
      // Patrol
      if (ex < this.patrolLeft)  this.dir = 1;
      if (ex > this.patrolRight) this.dir = -1;
      this.vx = this.dir * this.speed * 0.6;
    }

    // Physics
    Physics.applyGravity(this);
    Physics.moveAndCollide(this, platforms);

    // Edge detection
    if (this.state === 'patrol' && this.onGround) {
      let overEdge = true;
      const testX = this.dir === 1 ? this.x + this.w + 4 : this.x - 4;

      for (const p of platforms) {
        if (
          testX >= p.x &&
          testX <= p.x + p.w &&
          this.y + this.h >= p.y &&
          this.y + this.h <= p.y + p.h + 4
        ) {
          overEdge = false;
          break;
        }
      }

      if (overEdge) this.dir *= -1;
    }

    // Animation tick
    this.frameTick++;
    if (this.frameTick >= 5) {
      this.frame++;
      this.frameTick = 0;
    }
  }

  // ── DAMAGE ─────────────────────────────
  takeDamage(amount, fromX) {
    if (this.dead) return;

    this.hp = Math.max(0, this.hp - amount);
    this.hurtTimer = 12;

    Physics.applyKnockback(this, fromX, 5, 3);
    SoundFX.play('enemyHurt');

    if (this.hp <= 0) {
      this.dead = true;
      this.deathTimer = 0;
      SoundFX.play('kill');
      return true;
    }

    return false;
  }

  // ── DRAW ─────────────────────────────
  draw(ctx) {
    if (this.dead) return;

    // 🔥 Ensure image loaded
    if (!enemyImg.complete) return;

    // 🔥 DEBUG (you can remove later)
    // ctx.fillStyle = "red";
    // ctx.fillRect(this.x, this.y, this.w, this.h);

    // 🔥 Draw GIF
    ctx.drawImage(
      enemyImg,
      this.x,
      this.y,
      this.w,
      this.h
    );

    // Hurt flash
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 3) % 2 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.restore();
    }

    // Health bar
    Utils.healthBar(
      ctx,
      this.x,
      this.y - 8,
      this.w,
      5,
      this.hp / this.maxHp,
      '#e84040',
      '#2a0000'
    );

    // Sleep indicator
    if (this.state === 'patrol') {
      ctx.font = "8px 'Press Start 2P'";
      ctx.fillStyle = '#aaa';
      ctx.textAlign = 'center';
      ctx.fillText('z', this.x + this.w / 2, this.y - 14);
    }
  }
}
