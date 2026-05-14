/* ==========================================
   HOLLYBRAND 2.0 — script.js
   ========================================== */

(function () {
  'use strict';

  // ── ELEMENTS ───────────────────────────
  const startScreen  = document.getElementById('start-screen');
  const startButton  = document.getElementById('startButton');
  const experience   = document.getElementById('experience');
  const introMusic   = document.getElementById('introMusic');
  const worldSound   = document.getElementById('worldSound');
  const secretSound  = document.getElementById('secretSound');

  // ── HELPERS ────────────────────────────

  function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(function () {
      // Autoplay blocked by browser — silent fail is fine
    });
  }

  // ── START BUTTON ────────────────────────
  // Keyboard: Enter / Space also triggers start

  startButton.addEventListener('click', handleStart);
  startButton.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') handleStart();
  });

  function handleStart() {
    playSound(introMusic);

    // Fade out start screen
    startScreen.classList.add('hidden');
    startScreen.addEventListener('transitionend', function () {
      startScreen.remove();
    }, { once: true });

    // Reveal main experience
    experience.style.display = 'block';
    experience.removeAttribute('aria-hidden');

    // Kick off scroll-based effects
    initScrollObserver();
  }

  // ── WORLD TRANSITION OBSERVER ──────────
  // Plays world-transition sound and animates
  // the world card when it scrolls into view.

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
              // Force reflow then restart
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

  // ── GAME FRAME ERROR DETECTION ─────────
  // Shows the hint paragraph if a game frame
  // fails to load (only meaningful on a server).

  var gameFrames = document.querySelectorAll('.game-frame');
  gameFrames.forEach(function (frame) {
    frame.addEventListener('error', function () {
      var hint = frame.closest('.game-section')
                      .querySelector('.game-hint');
      if (hint) hint.style.opacity = '1';
    });
  });

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
    // Flash the page gold briefly
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
