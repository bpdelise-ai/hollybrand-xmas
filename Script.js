/* ==========================================
   HOLLYBRAND 2.0 — script.js
   ========================================== */

(function () {
  'use strict';

  // ── ELEMENTS ───────────────────────────
  var startScreen = document.getElementById('start-screen');
  var startButton = document.getElementById('startButton');
  var experience  = document.getElementById('experience');
  var introMusic  = document.getElementById('introMusic');
  var worldSound  = document.getElementById('worldSound');
  var secretSound = document.getElementById('secretSound');

  // ── HELPERS ────────────────────────────

  function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(function () {});
  }

  // ── START BUTTON ────────────────────────

  startButton.addEventListener('click', handleStart);
  startButton.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') handleStart();
  });

  function handleStart() {
    playSound(introMusic);

    startScreen.classList.add('hidden');
    startScreen.addEventListener('transitionend', function () {
      startScreen.remove();
    }, { once: true });

    experience.style.display = 'block';
    experience.removeAttribute('aria-hidden');

    // Kick off all scroll observers
    initScrollObserver();
    initGameFrames();
  }

  // ── WORLD TRANSITION OBSERVER ──────────

  function initScrollObserver() {
    var worldSections = document.querySelectorAll('.transition-section');
    var secretSection = document.querySelector('.secret-section');
    var alreadyPlayed = new WeakSet();

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = entry.target;

          if (alreadyPlayed.has(target)) return;
          alreadyPlayed.add(target);

          if (target.classList.contains('transition-section')) {
            playSound(worldSound);
            var card = target.querySelector('.world-card');
            if (card) {
              card.style.animation = 'none';
              void card.offsetWidth;
              card.style.animation = '';
            }
          }

          if (target === secretSection) {
            playSound(secretSound);
          }
        });
      },
      { threshold: 0.4 }
    );

    worldSections.forEach(function (s) { observer.observe(s); });
    if (secretSection) observer.observe(secretSection);
  }

  // ── GAME FRAME LAZY LOAD / UNLOAD ──────
  // Iframes use data-src instead of src.
  // The src is only set when the iframe scrolls
  // into view, and cleared when it scrolls away
  // — so only one ROM runs at a time.

  function initGameFrames() {
    var gameFrames = document.querySelectorAll('.game-frame');

    var gameObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var frame = entry.target;
          var dataSrc = frame.getAttribute('data-src');

          if (entry.isIntersecting) {
            // Load emulator only when scrolled into view
            if (dataSrc && frame.getAttribute('src') !== dataSrc) {
              frame.setAttribute('src', dataSrc);
            }
          } else {
            // Unload when scrolled away — stops audio & CPU
            if (frame.getAttribute('src')) {
              frame.removeAttribute('src');
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    gameFrames.forEach(function (frame) {
      gameObserver.observe(frame);
    });
  }

  // ── KONAMI CODE EASTER EGG ─────────────

  var konamiSequence = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a'
  ];
  var konamiIndex = 0;

  document.addEventListener('keydown', function (e) {
    if (e.key === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        activateKonami();
      }
    } else {
      konamiIndex = 0;
    }
  });

  function activateKonami() {
    var flash = document.createElement('div');
    flash.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:9998',
      'background:rgba(255,215,0,0.18)',
      'pointer-events:none',
      'transition:opacity 1s ease'
    ].join(';');
    document.body.appendChild(flash);
    requestAnimationFrame(function () {
      flash.style.opacity = '0';
      flash.addEventListener('transitionend', function () {
        flash.remove();
      }, { once: true });
    });
    playSound(secretSound);
  }

})();
