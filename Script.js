/* ==========================================
   HOLLY-BRAN 2.0 — script.js
   ========================================== */

(function () {
  'use strict';

  // Core variables declared in scope
  var startScreen, startButton, experience, introMusic, worldSound, secretSound;

  // ── POTATO FACTS ──
  var facts = {
    california: [
      "In-N-Out Burger, founded in California in 1948, still cuts its fries fresh from whole potatoes in every single location. The potato module respects this commitment."
    ],
    "red rock canyon": [
      "Red Rock Canyon National Conservation Area features Potato Knoll, a distinct desert peak named for its shape."
    ],
    "las vegas": [
      "Las Vegas restaurants collectively serve an estimated 2 million pounds of potatoes every week. The potato module considers this a personal achievement."
    ],
    summerlin: [
      "With 300+ sunny days per year, Summerlin's climate could theoretically support a rooftop potato garden. The potato module is monitoring this situation."
    ]
  };

  function getRandomFact(location) {
    var arr = facts[location];
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

function injectFacts() {
    var cal = document.getElementById('fact-california');
    var rrc = document.getElementById('fact-vegas');
    var lv = document.getElementById('fact-las-vegas'); // Add reference to the Las Vegas element
    var sum = document.getElementById('fact-summerlin');
    var sum2 = document.getElementById('fact-summerlin-2');

    if (cal) cal.textContent = getRandomFact('california');
    if (rrc) rrc.textContent = getRandomFact('red rock canyon');
    if (lv) lv.textContent = getRandomFact('las vegas'); // Inject the Las Vegas fact
    if (sum) sum.textContent = getRandomFact('summerlin');
    if (sum2) sum2.textContent = getRandomFact('summerlin');
  }

  // ── POTATO FACT REVEAL ──
  var activeFactBtn = null;

  function initFactReveal() {
    var btns = document.querySelectorAll('.fact-reveal-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeFactBtn = btn;
      });
      btn.addEventListener('focus', function () {
        activeFactBtn = btn;
      });
      // Allow clicking directly to reveal (no Enter required on mobile / mouse)
      btn.addEventListener('dblclick', function () {
        revealFact(btn);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      // Find the fact-reveal-btn that's currently focused or in the visible snap section
      var focusedBtn = document.querySelector('.fact-reveal-btn:focus');
      if (focusedBtn) { revealFact(focusedBtn); return; }
      // Find the visible fact section
      var snapContainer = document.getElementById('snap-container');
      if (!snapContainer) return;
      var scrollTop = snapContainer.scrollTop;
      var vh = window.innerHeight;
      var index = Math.round(scrollTop / vh);
      var sections = snapContainer.querySelectorAll('.snap-section');
      var current = sections[index];
      if (!current) return;
      var btn = current.querySelector('.fact-reveal-btn:not(.revealed)');
      if (btn) revealFact(btn);
    });
  }

  function revealFact(btn) {
    if (!btn || btn.classList.contains('revealed')) return;
    var factId = btn.getAttribute('data-fact-id');
    var factEl = document.getElementById(factId);
    if (!factEl) return;

    btn.classList.add('revealed');
    factEl.classList.add('revealed');

    // Update title
    var card = btn.closest('.fact-card');
    if (card) {
      var title = card.querySelector('.fact-title');
      if (title) { title.textContent = 'POTATO FACT UNLOCKED'; }
    }

    // Screen shake
    document.body.classList.add('shaking');
    document.body.addEventListener('animationend', function () {
      document.body.classList.remove('shaking');
    }, { once: true });

    // Potato fireworks
    triggerFactFireworks();
  }

  function triggerFactFireworks() {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99998';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var emojis = ['🥔','🥔','🥔','🍟','✨','💥','🥔'];
    var particles = [];

    function spawnBurst(x, y) {
      var count = 18;
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 / count) * i;
        var speed = 3 + Math.random() * 6;
        particles.push({
          x: x, y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1, decay: 0.018 + Math.random() * 0.01,
          size: 22 + Math.random() * 10,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          rotation: Math.random() * 6.28,
          rotSpeed: (Math.random() - 0.5) * 0.12,
          gravity: 0.18
        });
      }
    }

    // Burst from center and two sides
    spawnBurst(window.innerWidth / 2, window.innerHeight / 2);
    setTimeout(function () { spawnBurst(window.innerWidth * 0.25, window.innerHeight * 0.4); }, 200);
    setTimeout(function () { spawnBurst(window.innerWidth * 0.75, window.innerHeight * 0.4); }, 400);

    var animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(function (p) { return p.life > 0; });
      particles.forEach(function (p) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.font = p.size + 'px serif';
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= p.decay;
        p.rotation += p.rotSpeed;
      });
      if (particles.length > 0) {
        animId = requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    }
    draw();
  }

  // ── SOUND ──
  function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(function () {});
  }

  // ── MAIN INITIALIZATION ──
  function init() {
    startScreen = document.getElementById('start-screen');
    startButton = document.getElementById('startButton');
    experience  = document.getElementById('experience');
    introMusic  = document.getElementById('introMusic');
    worldSound  = document.getElementById('worldSound');
    secretSound = document.getElementById('secretSound');

    // Protect against execution if target elements are missing
    if (!startButton || !startScreen) {
      console.warn("HOLLY-BRAN 2.0 Initialization delayed: Start elements missing.");
      return;
    }

    // Bind start screen inputs safely
    startButton.addEventListener('click', handleStart);
    startScreen.addEventListener('click', handleStart);
    document.addEventListener('keydown', handleKeyPressStart);
  }

  function handleKeyPressStart(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      handleStart();
    }
  }

  function handleStart() {
    // Prevent double-firing
    if (startButton) startButton.removeEventListener('click', handleStart);
    if (startScreen) startScreen.removeEventListener('click', handleStart);
    document.removeEventListener('keydown', handleKeyPressStart);

    playSound(introMusic);

    if (experience) {
      experience.style.display = 'block';
      experience.style.height  = '100vh';
      experience.style.width   = '100%';
      experience.removeAttribute('aria-hidden');
    }

    if (startScreen) {
      startScreen.classList.add('hidden');
      
      var removed = false;
      function removeStart() {
        if (removed) return;
        removed = true;
        if (startScreen.parentNode) startScreen.remove();
      }
      startScreen.addEventListener('transitionend', removeStart, { once: true });
      setTimeout(removeStart, 1000); 
    }

    injectFacts();
    initFactReveal();
    initSnow();
    initGameFrames();
    initLockSystem();
  }

  // ── SNOW ──
  function initSnow() {
    var canvas = document.getElementById('snow');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var flakes = [];
    var snowVisible = true;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < 90; i++) {
      flakes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.5 + 1,
        speed: Math.random() * 0.8 + 0.3,
        drift: Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.5 + 0.15
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (snowVisible) {
        flakes.forEach(function (f) {
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,' + f.opacity + ')';
          ctx.fill();
          f.y += f.speed;
          f.x += f.drift;
          if (f.y > canvas.height) { f.y = -4; f.x = Math.random() * canvas.width; }
          if (f.x > canvas.width)  f.x = 0;
          if (f.x < 0)             f.x = canvas.width;
        });
      }
      requestAnimationFrame(draw);
    }
    draw();

    var snapContainer = document.getElementById('snap-container');
    if (!snapContainer) return;

    function checkCurrentSection() {
      var scrollTop = snapContainer.scrollTop;
      var vh = window.innerHeight;
      var index = Math.round(scrollTop / vh);
      var sections = snapContainer.querySelectorAll('.snap-section');
      var current = sections[index];
      if (!current) {
        snowVisible = true;
        canvas.style.opacity = '1';
        return;
      }
      var isMedia = current.classList.contains('video-section') ||
                    current.classList.contains('game-section');
      snowVisible = !isMedia;
      canvas.style.opacity = snowVisible ? '1' : '0';
    }

    snapContainer.addEventListener('scroll', checkCurrentSection, { passive: true });
    snowVisible = true;
    canvas.style.opacity = '1';
    checkCurrentSection();
  }

  // ── GAME FRAME LAZY LOAD / UNLOAD ──
  function initGameFrames() {
    var gameFrames = document.querySelectorAll('.game-frame');
    var gameObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var frame   = entry.target;
        var dataSrc = frame.getAttribute('data-src');

        var parentSection = frame.closest('[data-section]');
        var sectionNum    = parentSection ? parseInt(parentSection.getAttribute('data-section')) : null;
        var isLocked      = sectionNum && !unlockedSections[sectionNum];

        if (entry.isIntersecting && !isLocked) {
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
    gameFrames.forEach(function (f) { gameObserver.observe(f); });
  }

  // ── SECTION LOCK SYSTEM ──
  var SECTION_CODES = {
    2: ['ArrowUp','ArrowLeft','ArrowDown','ArrowRight','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'],
    3: ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowLeft','ArrowRight','ArrowRight'],
    4: ['ArrowRight','ArrowRight','ArrowUp','ArrowUp','ArrowLeft','ArrowLeft','ArrowDown','ArrowDown'],
    5: ['ArrowUp','ArrowDown','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight']
  };

  var unlockedSections = { 1: true, 2: false, 3: false, 4: false, 5: false };
  var lockInputBuffer = [];
  var lockListening   = false;
  var activeLockSection = null;

  function initLockSystem() {
    var lockedEls = document.querySelectorAll('.locked-section');
    lockedEls.forEach(function (el) {
      var sectionNum = parseInt(el.getAttribute('data-section'));
      buildLockOverlay(el, sectionNum);
    });

    document.addEventListener('keydown', function (e) {
      if (!lockListening) return;
      var arrows = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
      if (!arrows.includes(e.key)) return;

      e.preventDefault();
      e.stopPropagation();
      handleLockInput(e);
    });

    // Prevent scrolling into locked sections
    var snapContainer = document.getElementById('snap-container');
    if (snapContainer) {
      snapContainer.addEventListener('scroll', function () {
        enforceLockScroll(snapContainer);
      }, { passive: true });
    }
  }

function enforceLockScroll(container) {
    var vh = window.innerHeight;
    var scrollTop = container.scrollTop;
    var index = Math.round(scrollTop / vh);
    var sections = container.querySelectorAll('.snap-section');
    var current = sections[index];
    if (!current) return;

    var sectionNum = parseInt(current.getAttribute('data-section'));
    if (sectionNum && !unlockedSections[sectionNum]) {
      // Only snap back if the user scrolls past the main lock overlay into a silent lock
      if (current.querySelector('[data-silent-lock]')) {
        var prevIndex = index - 1;
        if (prevIndex < 0) prevIndex = 0;
        container.scrollTo({ top: prevIndex * vh, behavior: 'smooth' });
      }
    }
  }

  function buildLockOverlay(sectionEl, sectionNum) {
    var code    = SECTION_CODES[sectionNum];
    var overlay = document.createElement('div');
    overlay.className = 'lock-overlay';

    var isFirstOfSection = !document.getElementById('lock-overlay-' + sectionNum);
    if (!isFirstOfSection) {
      overlay.style.cssText = 'position:absolute;inset:0;z-index:500;background:var(--black)';
      overlay.setAttribute('data-silent-lock', sectionNum);
      sectionEl.appendChild(overlay);
      return;
    }
    overlay.id = 'lock-overlay-' + sectionNum;

    var labels = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
    overlay.innerHTML = [
      '<div class="lock-section-badge">SECTION ' + sectionNum + '</div>',
      '<div class="lock-icon">🔒</div>',
      '<div class="lock-title">SECTION ' + sectionNum + ' LOCKED</div>',
      '<div class="lock-subtitle">',
        '"A code is hidden somewhere in the previous game.<br>',
        'Find it. Enter it. Unlock what comes next."<br>',
        '<span style="color:var(--neon-green);font-size:.9em;">— HOLLY-BRAN 2.0</span>',
      '</div>',
      '<div class="lock-dots" id="lock-dots-' + sectionNum + '">',
        code.map(function(){ return '<div class="lock-dot"></div>'; }).join(''),
      '</div>',
      '<div class="lock-activate-btn" id="lock-btn-' + sectionNum + '">',
        '🔑 TAP HERE THEN ENTER CODE',
      '</div>',
      '<div class="lock-hint" id="lock-hint-' + sectionNum + '">USE ARROW KEYS AFTER TAPPING ABOVE</div>'
    ].join('');

    sectionEl.appendChild(overlay);

    var activateBtn = overlay.querySelector('.lock-activate-btn');
    activateBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      activeLockSection = sectionNum;
      lockListening     = true;
      lockInputBuffer   = [];
      updateDots(sectionNum, []);
      activateBtn.textContent = '🎮 ENTER CODE NOW...';
      activateBtn.classList.add('active');
      var hint = document.getElementById('lock-hint-' + sectionNum);
      if (hint) hint.style.color = 'var(--neon-green)';
    });
  }

  function updateDots(sectionNum, buffer) {
    var dotsEl = document.getElementById('lock-dots-' + sectionNum);
    if (!dotsEl) return;
    var dots = dotsEl.querySelectorAll('.lock-dot');
    dots.forEach(function (dot, i) {
      dot.classList.remove('active', 'wrong');
      if (i < buffer.length) dot.classList.add('active');
    });
  }

  function flashWrongDots(sectionNum) {
    var dotsEl = document.getElementById('lock-dots-' + sectionNum);
    if (!dotsEl) return;
    var dots = dotsEl.querySelectorAll('.lock-dot');
    dots.forEach(function (dot) {
      dot.classList.remove('active');
      dot.classList.add('wrong');
    });
    setTimeout(function () {
      dots.forEach(function (dot) { dot.classList.remove('wrong'); });
    }, 600);
  }

  function handleLockInput(e) {
    if (!lockListening || !activeLockSection) return;
    if (unlockedSections[activeLockSection]) return;

    var code = SECTION_CODES[activeLockSection];
    lockInputBuffer.push(e.key);

    if (lockInputBuffer.length > code.length) {
      lockInputBuffer = lockInputBuffer.slice(-code.length);
    }

    updateDots(activeLockSection, lockInputBuffer);

    if (lockInputBuffer.length === code.length) {
      var match = code.every(function (k, i) { return k === lockInputBuffer[i]; });
      if (match) {
        unlockSection(activeLockSection);
      } else {
        flashWrongDots(activeLockSection);
        lockInputBuffer = [];
        setTimeout(function () { updateDots(activeLockSection, []); }, 700);
      }
    }
  }

  function unlockSection(sectionNum) {
    unlockedSections[sectionNum] = true;
    lockListening     = false;
    activeLockSection = null;
    lockInputBuffer   = [];

    var sfx1 = document.getElementById('unlockSfx1');
    var sfx2 = document.getElementById('unlockSfx2');
    if (sfx1) { sfx1.currentTime = 0; sfx1.play().catch(function(){}); }
    if (sfx2) { sfx2.currentTime = 0; sfx2.play().catch(function(){}); }

    setTimeout(function () {
      var voices = [
        document.getElementById('unlockVoice1'),
        document.getElementById('unlockVoice2')
      ];
      var voice = voices[Math.floor(Math.random() * voices.length)];
      if (voice) { voice.currentTime = 0; voice.play().catch(function(){}); }
    }, 1200);

    document.body.classList.add('shaking');
    document.body.addEventListener('animationend', function () {
      document.body.classList.remove('shaking');
    }, { once: true });

    var overlays = document.querySelectorAll('.lock-overlay[id^="lock-overlay-"]');
    overlays.forEach(function (overlay) {
      if (overlay.id === 'lock-overlay-' + sectionNum) {
        var icon = overlay.querySelector('.lock-icon');
        if (icon) icon.textContent = '🔓';
        var title = overlay.querySelector('.lock-title');
        if (title) {
          title.textContent = 'SECTION ' + sectionNum + ' UNLOCKED';
          title.style.color = 'var(--neon-green)';
        }
        overlay.classList.add('unlocking', 'unlocked');
        setTimeout(function () { overlay.style.display = 'none'; }, 900);
      }
    });

    var allSectionEls = document.querySelectorAll('[data-section="' + sectionNum + '"]');
    allSectionEls.forEach(function (el) {
      var ov = el.querySelector('.lock-overlay');
      if (ov && ov.id !== 'lock-overlay-' + sectionNum) {
        setTimeout(function () { ov.style.display = 'none'; }, 950);
      }
    });

    setTimeout(function () {
      var frames = document.querySelectorAll('[data-section="' + sectionNum + '"] .game-frame');
      frames.forEach(function (frame) {
        var dataSrc = frame.getAttribute('data-src');
        if (dataSrc && !frame.getAttribute('src')) {
          var rect = frame.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            frame.setAttribute('src', dataSrc);
          }
        }
      });
    }, 1000);
  }

  // ── POTATO PARTY CHEAT CODE ──
  var cheatSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight'];
  var cheatIdx = 0;

  document.addEventListener('keydown', function (e) {
    if (e.key === cheatSeq[cheatIdx]) {
      cheatIdx++;
      if (cheatIdx === cheatSeq.length) {
        cheatIdx = 0;
        triggerPotatoParty();
      }
    } else {
      cheatIdx = 0;
      if (e.key === cheatSeq[0]) cheatIdx = 1;
    }
  });

  function triggerPotatoParty() {
    playSound(secretSound);

    var overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999', 'background:rgba(0,0,0,0.92)',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:center',
      'pointer-events:none', 'opacity:0', 'transition:opacity 0.3s ease'
    ].join(';');
    document.body.appendChild(overlay);

    var title = document.createElement('div');
    title.textContent = '🥔 POTATO PARTY 🥔';
    title.style.fontFamily = '"Press Start 2P", monospace';
    title.style.fontSize = 'clamp(1.2rem, 5vw, 2.8rem)';
    title.style.textAlign = 'center';
    title.style.animation = 'potatoTitle 0.4s ease-out both';
    title.style.zIndex = '2';
    overlay.appendChild(title);

    if (!document.getElementById('potato-party-styles')) {
      var style = document.createElement('style');
      style.id = 'potato-party-styles';
      style.textContent = [
        '@keyframes potatoTitle { 0% { transform:scale(0.2) rotate(-10deg); opacity:0; } 100% { transform:scale(1) rotate(0deg); opacity:1; text-shadow: 0 0 10px #ff2255, 0 0 25px #ff2255; } }',
        '@keyframes potatoCycle { 0%, 100% { color:#ff2255; } 25% { color:#00ff88; } 50% { color:#00e5ff; } 75% { color:#ffaa00; } }'
      ].join('\n');
      document.head.appendChild(style);
    }

    setTimeout(function () { title.style.animation = 'potatoCycle 0.8s linear infinite'; }, 450);

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    overlay.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var emojis = ['🥔','🥔','🥔','🍟','✨','💥'];
    var particles = [];

    function spawnBurst(x, y) {
      var count = 15;
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 / count) * i;
        particles.push({
          x: x, y: y, vx: Math.cos(angle) * (4 + Math.random() * 5), vy: Math.sin(angle) * (4 + Math.random() * 5),
          life: 1, decay: 0.02, size: 25, emoji: emojis[Math.floor(Math.random() * emojis.length)],
          rotation: Math.random() * 6, rotSpeed: 0.05, gravity: 0.15
        });
      }
    }

    spawnBurst(window.innerWidth / 2, window.innerHeight / 2);

    var animId;
    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(function (p) { return p.life > 0; });
      particles.forEach(function (p) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.font = p.size + 'px serif';
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.life -= p.decay; p.rotation += p.rotSpeed;
      });
      animId = requestAnimationFrame(drawParticles);
    }
    drawParticles();

    requestAnimationFrame(function () { overlay.style.opacity = '1'; });
    setTimeout(function () {
      overlay.style.opacity = '0';
      overlay.addEventListener('transitionend', function () { cancelAnimationFrame(animId); overlay.remove(); }, { once: true });
    }, 3000);
  }

  // ── WAIT FOR DOM ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();