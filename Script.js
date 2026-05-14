/* ==========================================
   HOLLY-BRAN 2.0 — script.js
   ========================================== */

(function () {
  'use strict';

  var startScreen = document.getElementById('start-screen');
  var startButton = document.getElementById('startButton');
  var experience  = document.getElementById('experience');
  var introMusic  = document.getElementById('introMusic');
  var worldSound  = document.getElementById('worldSound');
  var secretSound = document.getElementById('secretSound');

  function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(function () {});
  }

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
    initSnow();
    initScrollObserver();
    initGameFrames();
  }

  // ── SNOW ──
  function initSnow() {
    var canvas = document.getElementById('snow');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var flakes = [];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < 80; i++) {
      flakes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.5 + 1,
        speed: Math.random() * 0.8 + 0.3,
        drift: Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.forEach(function (f) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + f.opacity + ')';
        ctx.fill();
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > canvas.height) { f.y = -4; f.x = Math.random() * canvas.width; }
        if (f.x > canvas.width)  { f.x = 0; }
        if (f.x < 0)             { f.x = canvas.width; }
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ── WORLD TRANSITIONS ──
  function initScrollObserver() {
    var worldSections = document.querySelectorAll('.transition-section');
    var secretSection = document.querySelector('.secret-section');
    var alreadyPlayed = new WeakSet();

    var observer = new IntersectionObserver(function (entries) {
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
    }, { threshold: 0.4 });

    worldSections.forEach(function (s) { observer.observe(s); });
    if (secretSection) observer.observe(secretSection);
  }

  // ── GAME FRAME LAZY LOAD / UNLOAD ──
  function initGameFrames() {
    var gameFrames = document.querySelectorAll('.game-frame');

    var gameObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var frame = entry.target;
        var dataSrc = frame.getAttribute('data-src');

        if (entry.isIntersecting) {
          if (dataSrc && frame.getAttribute('src') !== dataSrc) {
            frame.setAttribute('src', dataSrc);
          }
        } else {
          if (frame.getAttribute('src')) {
            frame.removeAttribute('src');
          }
        }
      });
    }, { threshold: 0.3 });

    gameFrames.forEach(function (frame) { gameObserver.observe(frame); });
  }

  // ── KONAMI CODE ──
  var konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
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
    flash.style.cssText = 'position:fixed;inset:0;z-index:9996;background:rgba(255,215,0,0.2);pointer-events:none;transition:opacity 1.2s ease';
    document.body.appendChild(flash);
    requestAnimationFrame(function () {
      flash.style.opacity = '0';
      flash.addEventListener('transitionend', function () { flash.remove(); }, { once: true });
    });
    playSound(secretSound);
  }

})();
