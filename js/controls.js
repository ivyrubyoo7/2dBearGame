// ─── CONTROLS.JS ──────────────────────────────────────────
// Manages keyboard and touch/mobile input

const Controls = {
  keys: {
    left:   false,
    right:  false,
    jump:   false,
    attack: false,
  },
  jumpPressed:   false, // edge-trigger for jump
  attackPressed: false, // edge-trigger for attack

  _prevJump:   false,
  _prevAttack: false,

  init() {
    // ── Keyboard ────────────────────────────────────────
    document.addEventListener('keydown', e => {
      switch (e.code) {
        case 'ArrowLeft':  this.keys.left  = true; e.preventDefault(); break;
        case 'ArrowRight': this.keys.right = true; e.preventDefault(); break;
        case 'Space':      this.keys.jump  = true; e.preventDefault(); break;
        case 'KeyF': case 'KeyJ': this.keys.attack = true; e.preventDefault(); break;
        case 'Escape': case 'KeyP': Game.togglePause(); break;
      }
    });
    document.addEventListener('keyup', e => {
      switch (e.code) {
        case 'ArrowLeft':  this.keys.left   = false; break;
        case 'ArrowRight': this.keys.right  = false; break;
        case 'Space':      this.keys.jump   = false; break;
        case 'KeyF': case 'KeyJ': this.keys.attack = false; break;
      }
    });

    // ── Mobile buttons ──────────────────────────────────
    this._bindMobileBtn('mc-left',   'left');
    this._bindMobileBtn('mc-right',  'right');
    this._bindMobileBtn('mc-jump',   'jump');
    this._bindMobileBtn('mc-attack', 'attack');
  },

  _bindMobileBtn(id, key) {
    const btn = document.getElementById(id);
    if (!btn) return;

    const start = e => {
      e.preventDefault();
      this.keys[key] = true;
      btn.classList.add('pressed');
    };
    const end = e => {
      e.preventDefault();
      this.keys[key] = false;
      btn.classList.remove('pressed');
    };

    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend',   end,   { passive: false });
    btn.addEventListener('touchcancel', end,  { passive: false });
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup',   end);
    btn.addEventListener('mouseleave', end);
  },

  // Call once per frame AFTER reading keys
  update() {
    this.jumpPressed   = this.keys.jump   && !this._prevJump;
    this.attackPressed = this.keys.attack && !this._prevAttack;
    this._prevJump     = this.keys.jump;
    this._prevAttack   = this.keys.attack;
  },
};
