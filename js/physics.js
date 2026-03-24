// ─── PHYSICS.JS ───────────────────────────────────────────
// Gravity, jump constants, and AABB collision resolution

const Physics = {
  GRAVITY:      0.55,
  MAX_FALL:     18,
  JUMP_FORCE:  -13.5,
  FRICTION:     0.82,
  AIR_RESIST:   0.92,

  // Apply gravity to an entity that has .vy and .onGround
  applyGravity(entity) {
    if (!entity.onGround) {
      entity.vy += this.GRAVITY;
      if (entity.vy > this.MAX_FALL) entity.vy = this.MAX_FALL;
    }
  },

  // Move entity by velocity and resolve collisions against platforms array
  // Returns { hitLeft, hitRight, hitTop, hitBottom }
  moveAndCollide(entity, platforms) {
    entity.hitSpike = false;
    let hitLeft = false, hitRight = false, hitTop = false, hitBottom = false;
    entity.onGround = false;
    entity.onPlatform = null; // track which platform player is standing on
    // ── Horizontal ──────────────────────────────────────
    entity.x += entity.vx;
    for (const p of platforms) {
      if (!Utils.rectsOverlap(entity, p)) continue;
      if (entity.vx > 0) { entity.x = p.x - entity.w; hitRight = true; }
      else if (entity.vx < 0) { entity.x = p.x + p.w; hitLeft = true; }
      entity.vx = 0;
    }

    // ── Vertical ────────────────────────────────────────
    entity.y += entity.vy;
    for (const p of platforms) {
      if (!Utils.rectsOverlap(entity, p)) continue;

      if (entity.vy > 0) {
        entity.y = p.y - entity.h;
        entity.onGround = true;
        entity.onPlatform = p;
        hitBottom = true;

        // ── FALLING PLATFORM TRIGGER ──
        if (p.type === "falling") {
          if (!p.fallTimer) p.fallTimer = Date.now();
        }

        // ── SPIKE DETECTION ──
        if (p.type === "spike") {
          entity.hitSpike = true;
        }

      } else if (entity.vy < 0) {
        entity.y = p.y + p.h;
        hitTop = true;
      }

      entity.vy = 0;
    }

    // ── MOVING PLATFORM CARRY ─────────────────────
    if (entity.onPlatform && entity.onPlatform.type === "moving") {
      const p = entity.onPlatform;

      // Apply platform movement to player
      entity.x += p.vx || 0;
      entity.y += p.vy || 0;
    }

  // ── SPIKE DETECTION ──
    return { hitLeft, hitRight, hitTop, hitBottom };
  },

  // Knock an entity back from a direction
  applyKnockback(entity, fromX, force = 6, upward = 4) {
    const dir = entity.x + entity.w / 2 > fromX ? 1 : -1;
    entity.vx = dir * force;
    entity.vy = -upward;
    entity.onGround = false;
  },
};
