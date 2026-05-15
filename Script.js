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
  startButton.addEventListener('click', handleStart);
  startButton.addEventListener('keydown', function (e) {
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
    gameFrames.forEach(function (f) { gameObserver.observe(f); });
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
