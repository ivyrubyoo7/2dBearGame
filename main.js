// ─── MAIN.JS ──────────────────────────────────────────────
// Entry point: wires up all UI screens and boots the game

window.SoundFX = {
  enabled: true,
  init: () => {},
  unlock: () => {},
  play: () => {}
};

(function () {
  'use strict';

  let selectedChar = 'boy';
  let soundOn      = true;

  // ── CHAR SELECT PREVIEWS ──────────────────────────────
  function drawPreviews() {
    const boyCanvas  = document.getElementById('preview-boy');
    const girlCanvas = document.getElementById('preview-girl');
    if (boyCanvas)  Sprites.drawPreview(boyCanvas.getContext('2d'),  'boy',  64, 64);
    if (girlCanvas) Sprites.drawPreview(girlCanvas.getContext('2d'), 'girl', 64, 64);
  }

  // Animate previews
  let previewFrame = 0;
  function animatePreviews() {
    requestAnimationFrame(animatePreviews);
    previewFrame++;
    const boyCtx  = document.getElementById('preview-boy')?.getContext('2d');
    const girlCtx = document.getElementById('preview-girl')?.getContext('2d');
    if (boyCtx) {
      boyCtx.clearRect(0, 0, 64, 64);
      Sprites.drawBoy (boyCtx,  0, 0, 64, 64, previewFrame, 1, 'idle');
    }
    if (girlCtx) {
      girlCtx.clearRect(0, 0, 64, 64);
      Sprites.drawGirl(girlCtx, 0, 0, 64, 64, previewFrame, 1, 'idle');
    }
  }

  // ── SCREEN WIRING ────────────────────────────────────

  // Start → Char Select
  document.getElementById('btn-play').addEventListener('click', () => {
    SoundFX.init();
    SoundFX.unlock();
    UI.show('charselect');
    animatePreviews();
  });

  // Start → Settings
  document.getElementById('btn-settings').addEventListener('click', () => {
    UI.show('settings');
  });

  // Settings → Back
  document.getElementById('btn-settings-back').addEventListener('click', () => {
    UI.show('start');
  });

  // Sound toggle
  document.getElementById('toggle-sound').addEventListener('click', function () {
    soundOn = !soundOn;
    SoundFX.enabled = soundOn;
    this.textContent = soundOn ? 'ON' : 'OFF';
    this.classList.toggle('off', !soundOn);
  });

  // Fullscreen toggle
  document.getElementById('toggle-fs').addEventListener('click', function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      this.textContent = 'ON';
      this.classList.remove('off');
    } else {
      document.exitFullscreen?.();
      this.textContent = 'OFF';
      this.classList.add('off');
    }
  });

  // Character cards
  document.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedChar = card.dataset.char;
    });
  });

  // Char Select → Start Game
  document.getElementById('btn-start-game').addEventListener('click', () => {
    const nameInput = document.getElementById('player-name').value.trim().toUpperCase();
    const playerName = nameInput || 'HERO';
    UI.show('game');
    Game.init(selectedChar, playerName);
  });

  // Pause button (in HUD)
  document.getElementById('btn-pause').addEventListener('click', () => {
    Game.togglePause();
  });

  // Pause → Resume
  document.getElementById('btn-resume').addEventListener('click', () => {
    Game.togglePause();
  });

  // Pause → Restart
  document.getElementById('btn-restart').addEventListener('click', () => {
    Game.stop();
    const nameInput = document.getElementById('player-name').value.trim().toUpperCase();
    UI.show('game');
    Game.init(selectedChar, nameInput || 'HERO');
  });

  // Pause → Quit
  document.getElementById('btn-quit').addEventListener('click', () => {
    Game.stop();
    UI.show('start');
  });

  // Game Over → Retry
  document.getElementById('btn-retry').addEventListener('click', () => {
    const nameInput = document.getElementById('player-name').value.trim().toUpperCase();
    UI.show('game');
    Game.init(selectedChar, nameInput || 'HERO');
  });

  // Game Over → Menu
  document.getElementById('btn-go-quit').addEventListener('click', () => {
    UI.show('start');
  });

  // Victory → Play Again
  document.getElementById('btn-play-again').addEventListener('click', () => {
    const nameInput = document.getElementById('player-name').value.trim().toUpperCase();
    UI.show('game');
    Game.init(selectedChar, nameInput || 'HERO');
  });

  // Victory → Menu
  document.getElementById('btn-vic-quit').addEventListener('click', () => {
    UI.show('start');
  });

  // ── KEYBOARD HINTS ────────────────────────────────────
  // Enter key on name input goes straight to game start
  document.getElementById('player-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      document.getElementById('btn-start-game').click();
    }
  });

  // ── MOBILE DETECTION ─────────────────────────────────
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.innerWidth <= 768
      || ('ontouchstart' in window);
  }

  // Show mobile controls in game screen when on mobile
  function updateMobileControls() {
    const mc = document.getElementById('mobile-controls');
    if (mc) mc.style.display = isMobile() ? 'flex' : 'none';
  }
  updateMobileControls();
  window.addEventListener('resize', updateMobileControls);

  // ── INITIAL SCREEN ────────────────────────────────────
  UI.show('start');

  // Init sound lazily
  document.addEventListener('click', () => SoundFX.init(), { once: true });
  document.addEventListener('touchstart', () => { SoundFX.init(); SoundFX.unlock(); }, { once: true });

  console.log('%c🎮 PIXEL QUEST – Path to Victory', 'color:#f5c518;font-size:16px;font-weight:bold');
  console.log('Controls: ← → Arrow Keys | Space = Jump | F/J = Attack | P = Pause');

})();
