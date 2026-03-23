// ─── UI.JS ────────────────────────────────────────────────
// Screen management, HUD updates, transitions, and sound FX

// ── SCREEN MANAGER ──────────────────────────────────────
const UI = {
  currentScreen: 'start',

  show(id) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
    });
    const el = document.getElementById('screen-' + id);
    if (el) el.classList.add('active');
    this.currentScreen = id;
  },

  // Update HUD
  updateHUD(player) {
    document.getElementById('hud-name').textContent = player.name;
    document.getElementById('hud-score').textContent = 'SCORE: ' + player.score;

    // Health bar
    const pct = Math.max(0, player.hp / player.maxHp);
    document.getElementById('hud-health-bar').style.width = (pct * 100) + '%';

    // Lives hearts
    const hearts = document.querySelectorAll('#hud-lives .heart');
    hearts.forEach((h, i) => {
      h.classList.toggle('lost', i >= player.lives);
    });
  },

  showGameOver(score) {
    document.getElementById('go-score').textContent = 'SCORE: ' + score;
    this.show('gameover');
  },

  showVictory(name, score) {
    document.getElementById('vic-name').textContent = name + '!';
    document.getElementById('vic-score').textContent = 'SCORE: ' + score;
    this.show('victory');
  },
};

// ── SOUND EFFECTS (Web Audio API) ───────────────────────
const SoundFX = {
  ctx: null,
  enabled: true,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { this.enabled = false; }
  },

  // Unlock audio context on first user interaction
  unlock() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  play(type) {
    if (!this.enabled || !this.ctx) return;
    try {
      this.unlock();
      const ac = this.ctx;
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      switch (type) {
        case 'jump':
          osc.type = 'square';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now); osc.stop(now + 0.15); break;

        case 'attack':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now); osc.stop(now + 0.12); break;

        case 'hurt':
        case 'playerHurt':
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now); osc.stop(now + 0.2); break;

        case 'enemyHurt':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now); osc.stop(now + 0.1); break;

        case 'kill':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(500, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now); osc.stop(now + 0.25); break;

        case 'coin':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.setValueAtTime(900, now + 0.06);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now); osc.stop(now + 0.18); break;

        case 'die':
          osc.type = 'square';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now); osc.stop(now + 0.5); break;

        case 'victory':
          [0, 0.1, 0.2, 0.4].forEach((t, i) => {
            const o2 = ac.createOscillator();
            const g2 = ac.createGain();
            o2.connect(g2); g2.connect(ac.destination);
            o2.type = 'square';
            const freqs = [523, 659, 784, 1047];
            o2.frequency.value = freqs[i];
            g2.gain.setValueAtTime(0.12, now + t);
            g2.gain.exponentialRampToValueAtTime(0.001, now + t + 0.2);
            o2.start(now + t); o2.stop(now + t + 0.25);
          }); break;

        case 'gameover':
          osc.type = 'square';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.start(now); osc.stop(now + 0.8); break;
      }
    } catch (e) { /* ignore audio errors */ }
  },
};
