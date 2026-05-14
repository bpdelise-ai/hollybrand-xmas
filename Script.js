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

  // ── POTATO FACTS BY LOCATION ──
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
    var cal  = document.getElementById('fact-california');
    var veg  = document.getElementById('fact-vegas');
    var sum  = document.getElementById('fact-summerlin');
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
    playSound(introMusic);
    startScreen.classList.add('hidden');
    startScreen.addEventListener('transitionend', function () {
      startScreen.remove();
    }, { once: true });
    experience.style.display = 'block';
    experience.removeAttribute('aria-hidden');
    injectFacts();
    initSnow();
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
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ── GAME FRAME LAZY LOAD / UNLOAD ──
  // Only the visible game runs — others are unloaded.
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

  // ── KONAMI CODE ──
  var seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var idx = 0;
  document.addEventListener('keydown', function (e) {
    if (e.key === seq[idx]) {
      idx++;
      if (idx === seq.length) {
        idx = 0;
        var flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;z-index:9996;background:rgba(0,255,136,0.15);pointer-events:none;transition:opacity 1.2s ease';
        document.body.appendChild(flash);
        requestAnimationFrame(function () {
          flash.style.opacity = '0';
          flash.addEventListener('transitionend', function () { flash.remove(); }, { once: true });
        });
        playSound(secretSound);
      }
    } else { idx = 0; }
  });

})();
