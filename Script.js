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

  // ── POTATO FACTS ──
  var facts = {
    california: [
      "In 1926, Laura Scudder of Monterey Park invented the first sealed wax-paper bag for potato chips — revolutionizing snack packaging and the potato module's entire worldview.",
      "California is the 4th largest potato-producing state in the US. Tulelake, near the Oregon border, grows over 10,000 acres of potatoes annually in rich volcanic soil.",
      "The Napa Valley region was once a notable dry-farm potato area in the 1800s. Slow-growing tubers thrived in the coastal fog — much like good ideas.",
      "In-N-Out Burger, founded in California in 1948, still cuts its fries fresh from whole potatoes in every single location. The potato module respects this commitment.",
      "California surfers in the 1960s popularized the term 'couch potato' — indirectly giving the humble spud one of its most iconic cultural contributions."
    ],
    vegas: [
      "Las Vegas restaurants collectively serve an estimated 2 million pounds of potatoes every week. The potato module considers this a personal achievement.",
      "Nevada's arid climate makes potato farming nearly impossible — yet somehow every buffet in Las Vegas has an entire station dedicated to them. Impressive determination.",
      "The world record for largest serving of mashed potatoes — 1,375 lbs — was set in Idaho, but Las Vegas absolutely would have hosted the party.",
      "Caesar's Palace alone reportedly goes through over 300,000 lbs of potatoes per year. The potato module finds this deeply validating.",
      "Nevada imports nearly all its potatoes from Idaho and California. The potato module notes that Vegas runs on outside help — and that's what makes it work."
    ],
    summerlin: [
      "Summerlin, Nevada is named after Jean Amelia Summerlin, Howard Hughes' grandmother — a woman who almost certainly enjoyed a baked potato on occasion.",
      "The Summerlin area sits at roughly 3,000 feet elevation. At that altitude, potatoes would boil slightly slower — the potato module finds this poetic.",
      "Red Rock Canyon, just minutes from Summerlin, has soil rich enough for wild root vegetables. The potato module considers this a sign.",
      "Summerlin has over 150 parks. The potato module imagines one named Spud Park. It does not exist yet. Yet.",
      "With 300+ sunny days per year, Summerlin's climate could theoretically support a rooftop potato garden. The potato module is monitoring this situation."
    ]
  };

  function getRandomFact(location) {
    var arr = facts[location];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function injectFacts() {
    var cal = document.getElementById('fact-california');
    var veg = document.getElementById('fact-vegas');
    var sum = document.getElementById('fact-summerlin');
    if (cal) cal.textContent = getRandomFact('california');
    if (veg) veg.textContent = getRandomFact('vegas');
    if (sum) sum.textContent = getRandomFact('summerlin');
  }

  // ── SOUND ──
  function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(function () {});
  }

  // ── START ──
  // Click anywhere on the present OR press Enter/Space to unwrap
  startButton.addEventListener('click', handleStart);
  startScreen.addEventListener('click', handleStart);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') handleStart();
  });

  function handleStart() {
    // Prevent double-firing
    startButton.removeEventListener('click', handleStart);

    playSound(introMusic);

    // Show experience immediately
    experience.style.display = 'block';
    experience.style.height  = '100vh';
    experience.style.width   = '100%';
    experience.removeAttribute('aria-hidden');

    // Fade out start screen
    startScreen.classList.add('hidden');

    // Remove start screen after transition — with timeout fallback
    var removed = false;
    function removeStart() {
      if (removed) return;
      removed = true;
      if (startScreen.parentNode) startScreen.remove();
    }
    startScreen.addEventListener('transitionend', removeStart, { once: true });
    setTimeout(removeStart, 1000); // fallback if transitionend doesn't fire

    injectFacts();
    initSnow();
    initGameFrames();
    initLockSystem();
  }

  // ── SNOW ──
  // Uses scroll position on the snap container to detect which
  // section is active. Hides snow on video/game sections only.
  function initSnow() {
    var canvas = document.getElementById('snow');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var flakes = [];
    var snowVisible = true; // start visible — hero is first section

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

    // Check which section is snapped to on scroll
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
    // Run immediately — hero is first non-media section so snow shows right away
    snowVisible = true;
    canvas.style.opacity = '1';
    checkCurrentSection();
  }

  // ── GAME FRAME LAZY LOAD / UNLOAD ──
  // Does NOT load if the parent section is still locked
  function initGameFrames() {
    var gameFrames = document.querySelectorAll('.game-frame');
    var gameObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var frame   = entry.target;
        var dataSrc = frame.getAttribute('data-src');

        // Check if this frame lives inside a locked section
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


  // ══════════════════════════════════════════
  // SECTION LOCK SYSTEM
  // ══════════════════════════════════════════
  //
  // Codes to unlock each section (directional):
  //   Section 2: U L D R U L D R   (↑ ← ↓ → ↑ ← ↓ →)
  //   Section 3: U U D D L L R R   (↑ ↑ ↓ ↓ ← ← → →)
  //   Section 4: R R U U L L D D   (→ → ↑ ↑ ← ← ↓ ↓)
  //   Section 5: U D U D L R L R   (↑ ↓ ↑ ↓ ← → ← →)
  //
  // These match what Brandon hides in each game.
  // ══════════════════════════════════════════

  var SECTION_CODES = {
    2: ['ArrowUp','ArrowLeft','ArrowDown','ArrowRight','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'],
    3: ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowLeft','ArrowRight','ArrowRight'],
    4: ['ArrowRight','ArrowRight','ArrowUp','ArrowUp','ArrowLeft','ArrowLeft','ArrowDown','ArrowDown'],
    5: ['ArrowUp','ArrowDown','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight']
  };

  // Which sections are currently unlocked
  var unlockedSections = { 1: true, 2: false, 3: false, 4: false, 5: false };

  // Current input buffer
  var lockInputBuffer = [];
  var lockListening   = false;
  var activeLockSection = null;

  function initLockSystem() {
    // Build overlays for all locked sections
    var lockedEls = document.querySelectorAll('.locked-section');
    lockedEls.forEach(function (el) {
      var sectionNum = parseInt(el.getAttribute('data-section'));
      buildLockOverlay(el, sectionNum);
    });

    // Listen for arrow key input — only fires when lockListening is true
    // (i.e. user clicked the overlay to activate it)
    document.addEventListener('keydown', function (e) {
      if (!lockListening) return;
      var arrows = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
      if (!arrows.includes(e.key)) return;

      // Prevent arrow keys from scrolling the snap container while entering code
      e.preventDefault();
      e.stopPropagation();

      handleLockInput(e);
    });
  }

  function buildLockOverlay(sectionEl, sectionNum) {
    var code    = SECTION_CODES[sectionNum];
    var overlay = document.createElement('div');
    overlay.className = 'lock-overlay';

    // Only the FIRST section element gets the interactive unlock overlay
    // All subsequent ones for the same section just get a silent black blocker
    var isFirstOfSection = !document.getElementById('lock-overlay-' + sectionNum);
    if (!isFirstOfSection) {
      overlay.style.cssText = 'position:absolute;inset:0;z-index:500;background:var(--black)';
      overlay.setAttribute('data-silent-lock', sectionNum);
      sectionEl.appendChild(overlay);
      return;
    }
    overlay.id = 'lock-overlay-' + sectionNum;

    var labels = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
    var codeDisplay = code.map(function(k){ return labels[k]; }).join(' ');

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

    // Click the activate button to start listening for arrow keys
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

    // Trim buffer to code length
    if (lockInputBuffer.length > code.length) {
      lockInputBuffer = lockInputBuffer.slice(-code.length);
    }

    updateDots(activeLockSection, lockInputBuffer);

    // Check if last N keys match the code
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

    // ── UNLOCK AUDIO SEQUENCE ──
    // 1. Play both SFX simultaneously
    var sfx1 = document.getElementById('unlockSfx1');
    var sfx2 = document.getElementById('unlockSfx2');
    if (sfx1) { sfx1.currentTime = 0; sfx1.play().catch(function(){}); }
    if (sfx2) { sfx2.currentTime = 0; sfx2.play().catch(function(){}); }

    // 2. After both SFX finish (use the longer one as reference), play random voice
    // mk3-01095 and mk3-01040 are short SFX — we wait ~1.2s then play the voice
    setTimeout(function () {
      var voices = [
        document.getElementById('unlockVoice1'),
        document.getElementById('unlockVoice2')
      ];
      var voice = voices[Math.floor(Math.random() * voices.length)];
      if (voice) { voice.currentTime = 0; voice.play().catch(function(){}); }
    }, 1200);

    // ── SCREEN SHAKE ──
    document.body.classList.add('shaking');
    document.body.addEventListener('animationend', function () {
      document.body.classList.remove('shaking');
    }, { once: true });

    // Remove ALL overlays belonging to this section number at once
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

    // Also hide silent blockers on ALL sections tagged with this section number
    var allSectionEls = document.querySelectorAll('[data-section="' + sectionNum + '"]');
    allSectionEls.forEach(function (el) {
      var ov = el.querySelector('.lock-overlay');
      if (ov && ov.id !== 'lock-overlay-' + sectionNum) {
        setTimeout(function () { ov.style.display = 'none'; }, 950);
      }
    });

    // Re-check game frames for this section so they load after unlock
    setTimeout(function () {
      var frames = document.querySelectorAll('[data-section="' + sectionNum + '"] .game-frame');
      frames.forEach(function (frame) {
        var dataSrc = frame.getAttribute('data-src');
        if (dataSrc && !frame.getAttribute('src')) {
          // Only load if currently visible on screen
          var rect = frame.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            frame.setAttribute('src', dataSrc);
          }
        }
      });
    }, 1000);
  }

  // ── POTATO PARTY CHEAT CODE ──
  // Sequence: Up Up Down Down Left Right
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
      // Still check from index 1 in case key restarts sequence
      if (e.key === cheatSeq[0]) cheatIdx = 1;
    }
  });

  function triggerPotatoParty() {
    playSound(secretSound);

    // ── OVERLAY ──
    var overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:99999',
      'background:rgba(0,0,0,0.92)',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'justify-content:center',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity 0.3s ease'
    ].join(';');
    document.body.appendChild(overlay);

    // ── TITLE ──
    var title = document.createElement('div');
    title.textContent = '🥔 POTATO PARTY 🥔';
    title.style.fontFamily = '"Press Start 2P", monospace';
    title.style.fontSize = 'clamp(1.2rem, 5vw, 2.8rem)';
    title.style.textAlign = 'center';
    title.style.animation = 'potatoTitle 0.4s ease-out both';
    title.style.zIndex = '2';
    title.style.position = 'relative';
    overlay.appendChild(title);

    var sub = document.createElement('div');
    sub.textContent = 'CHEAT CODE ACTIVATED';
    sub.style.cssText = [
      "font-family: \"Press Start 2P\", monospace",
      'font-size:clamp(0.3rem,1.2vw,0.55rem)',
      'color:#aaa',
      'margin-top:1rem',
      'letter-spacing:0.2em',
      'z-index:2',
      'position:relative'
    ].join(';');
    overlay.appendChild(sub);

    // ── INJECT KEYFRAMES ──
    if (!document.getElementById('potato-party-styles')) {
      var style = document.createElement('style');
      style.id = 'potato-party-styles';
      style.textContent = [
        '@keyframes potatoTitle {',
        '  0%   { transform:scale(0.2) rotate(-10deg); opacity:0; text-shadow:none; }',
        '  60%  { transform:scale(1.15) rotate(3deg); }',
        '  100% { transform:scale(1) rotate(0deg); opacity:1;',
        '    text-shadow:',
        '      0 0 10px #ff2255, 0 0 25px #ff2255,',
        '      0 0 50px #00ff88, 0 0 80px #00e5ff,',
        '      0 0 120px #ffaa00;',
        '  }',
        '}',
        '@keyframes potatoCycle {',
        '  0%   { text-shadow: 0 0 10px #ff2255, 0 0 30px #ff2255, 0 0 60px #cc0033; color:#ff2255; }',
        '  25%  { text-shadow: 0 0 10px #00ff88, 0 0 30px #00ff88, 0 0 60px #00cc66; color:#00ff88; }',
        '  50%  { text-shadow: 0 0 10px #00e5ff, 0 0 30px #00e5ff, 0 0 60px #0099cc; color:#00e5ff; }',
        '  75%  { text-shadow: 0 0 10px #ffaa00, 0 0 30px #ffaa00, 0 0 60px #cc7700; color:#ffaa00; }',
        '  100% { text-shadow: 0 0 10px #ff2255, 0 0 30px #ff2255, 0 0 60px #cc0033; color:#ff2255; }',
        '}',
        '@keyframes potatoFly {',
        '  0%   { transform: translate(0,0) scale(1) rotate(0deg); opacity:1; }',
        '  100% { transform: translate(var(--tx), var(--ty)) scale(0.3) rotate(var(--tr)); opacity:0; }',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    }

    // Start cycling neon after pop-in
    setTimeout(function () {
      title.style.animation = 'potatoCycle 0.8s linear infinite';
    }, 450);

    // ── POTATO FIREWORKS ──
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    overlay.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var emojis = ['🥔','🥔','🥔','🍟','🥔','✨','🌟','🥔','💥','🥔'];
    var particles = [];

    function spawnBurst(x, y) {
      var count = 14 + Math.floor(Math.random() * 10);
      for (var i = 0; i < count; i++) {
        var angle  = (Math.PI * 2 / count) * i + Math.random() * 0.4;
        var speed  = 4 + Math.random() * 9;
        var emoji  = emojis[Math.floor(Math.random() * emojis.length)];
        particles.push({
          x: x, y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.012 + Math.random() * 0.016,
          size: 20 + Math.random() * 28,
          emoji: emoji,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.25,
          gravity: 0.18 + Math.random() * 0.1
        });
      }
    }

    // Fire bursts at random intervals
    var burstCount = 0;
    var maxBursts  = 12;
    var burstTimer = setInterval(function () {
      if (burstCount >= maxBursts) { clearInterval(burstTimer); return; }
      var x = window.innerWidth  * (0.15 + Math.random() * 0.7);
      var y = window.innerHeight * (0.1  + Math.random() * 0.6);
      spawnBurst(x, y);
      burstCount++;
    }, 280);

    // Also fire a burst right away at center
    spawnBurst(window.innerWidth / 2, window.innerHeight * 0.42);

    var animId;
    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(function (p) { return p.life > 0; });
      particles.forEach(function (p) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.font = p.size + 'px serif';
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
        ctx.restore();
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.97;
        p.life -= p.decay;
        p.rotation += p.rotSpeed;
      });
      animId = requestAnimationFrame(drawParticles);
    }
    drawParticles();

    // ── FADE IN ──
    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
    });

    // ── FADE OUT after 3.5s ──
    setTimeout(function () {
      overlay.style.transition = 'opacity 0.6s ease';
      overlay.style.opacity    = '0';
      clearInterval(burstTimer);
      overlay.addEventListener('transitionend', function () {
        cancelAnimationFrame(animId);
        overlay.remove();
      }, { once: true });
    }, 3500);
  }

})();
