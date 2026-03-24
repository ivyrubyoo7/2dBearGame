// ─── ENEMY.JS ─────────────────────────────────────────────

// 🔥 Enemy GIF
const enemyImg = new Image();
enemyImg.src = "assets/pmob.gif";

// 🔥 Boss Image (YOUR IMAGE)
const bossImg = new Image();
bossImg.src = "assets/The_Man_From_The_Shadow_29.webp";

enemyImg.onload = () => {
  console.log("Enemy GIF loaded ✅");
};

// ─── ENEMY TYPES ─────────────────────────────────────────
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

ENEMY_TYPES.ranged = {
  hp: 50, speed: 1.0, dmg: 12, score: 120,
  w: 40, h: 40, range: 260, atkRange: 200,
  atkCd: 80, jumpForce: -8,
};


// ─── BASE ENEMY ─────────────────────────────────────────
class Enemy {
  constructor(x, y, type = 'slime') {
    const cfg = ENEMY_TYPES[type] || ENEMY_TYPES.slime;
    Object.assign(this, cfg);

    this.type = type;
    this.x = x;
    this.y = y;

    this.w = 80;
    this.h = 80;

    this.vx = 0;
    this.vy = 0;

    this.onGround = false;
    this.dir = -1;

    this.maxHp = this.hp;

    this.state = 'patrol';
    this.patrolLeft  = x - 80;
    this.patrolRight = x + 80;

    this.atkCooldown = 0;
    this.hurtTimer   = 0;

    this.frame = 0;
    this.frameTick = 0;

    this.dead = false;
    this.deathTimer = 0;

    this.projectiles = [];
  }

  get hitbox() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(player, platforms) {
    if (this.dead) return;

    if (this.atkCooldown > 0) this.atkCooldown--;
    if (this.hurtTimer > 0) {
      this.hurtTimer--;
      return;
    }

    const px = player.x + player.w / 2;
    const ex = this.x + this.w / 2;
    const dist = Math.abs(px - ex);

    if (dist < this.range && player.state !== 'dead') {
      this.state = 'chase';
    } else if (this.state === 'chase' && dist > this.range * 1.5) {
      this.state = 'patrol';
    }

    if (this.state === 'chase') {
      const dx = px - ex;
      this.dir = dx > 0 ? 1 : -1;
      this.vx = this.dir * this.speed;

      if (dist < this.atkRange && this.atkCooldown === 0) {
        this.atkCooldown = this.atkCd;

        if (player.takeDamage(this.dmg, this.x + this.w / 2)) {
          Utils.spawnBlood(player.x, player.y);
          Game.screenShake(5);
        }
      }
    }

    Physics.applyGravity(this);
    Physics.moveAndCollide(this, platforms);
  }

  takeDamage(amount, fromX) {
    if (this.dead) return;

    this.hp -= amount;
    this.hurtTimer = 12;

    Utils.spawnBlood(this.x + this.w / 2, this.y + this.h / 2);

    if (this.hp <= 0) {
      this.dead = true;
      Utils.spawnBlood(this.x, this.y);
      return true;
    }

    return false;
  }

  draw(ctx) {
    if (this.dead || !enemyImg.complete) return;

    ctx.drawImage(enemyImg, this.x, this.y, this.w, this.h);

    Utils.healthBar(ctx, this.x, this.y - 8, this.w, 5, this.hp / this.maxHp);
  }
}


// ─── BOSS ENEMY ─────────────────────────────────────────
class BossEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 'orc');

    this.maxHp = 300;
    this.hp = this.maxHp;

    this.w = 160;
    this.h = 140;

    this.phase = 1;
    this.attackTimer = 0;
    this.wasInAir = false;
  }

  update(player, platforms) {
    if (this.dead) return;

    const dx = player.x - this.x;
    const dist = Math.abs(dx);

    if (this.hp < this.maxHp / 2) this.phase = 2;

    if (this.attackTimer > 0) this.attackTimer--;

    if (this.phase === 1) {
      this.vx = Math.sign(dx) * 1.5;

      if (dist < 120 && this.attackTimer === 0 && this.onGround) {
        this.vy = -12;
        this.attackTimer = 60;
        this.state = 'smash';
        this.wasInAir = true;
      }

    } else {
      this.vx = Math.sign(dx) * 3;

      if (this.attackTimer === 0) {
        this.vx = Math.sign(dx) * 8;
        this.attackTimer = 80;
      }
    }

    Physics.applyGravity(this);
    Physics.moveAndCollide(this, platforms);

    // 💥 Smash landing
    if (this.state === 'smash' && this.onGround && this.wasInAir) {
      this.wasInAir = false;

      Utils.spawnBlood(this.x + this.w / 2, this.y + this.h);
      Game.screenShake(10);

      if (Math.abs(player.x - this.x) < 120) {
        player.takeDamage(20, this.x);
      }
    }

    // Contact damage
    if (Utils.rectsOverlap(this.hitbox, player.hitbox)) {
      player.takeDamage(25, this.x);
    }
  }

  draw(ctx) {
    if (this.dead) return;

    if (bossImg.complete) {
      ctx.drawImage(
        bossImg,
        this.x - 20,
        this.y - 20,
        this.w + 40,
        this.h + 40
      );
    } else {
      ctx.fillStyle = "purple";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    // Hurt flash
    if (this.hurtTimer > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    // Boss health bar
    Utils.healthBar(
      ctx,
      this.x,
      this.y - 12,
      this.w,
      6,
      this.hp / this.maxHp
    );
  }
}