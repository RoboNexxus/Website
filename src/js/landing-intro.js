/* ===============================
   LANDING INTRO ANIMATION
   Wave letters + particle burst + scanline + dramatic reveal
================================ */

(function () {
  const intro = document.getElementById('landing-intro');
  if (!intro) return;

  // Skip intro if already seen this session
  if (sessionStorage.getItem('introSeen')) {
    intro.remove();
    const main = document.getElementById('main-content');
    if (main) main.style.opacity = '1';
    return;
  }

  // Lock scroll during intro
  document.body.style.overflow = 'hidden';

  // ============================
  // INTRO PARTICLE CANVAS
  // ============================
  const canvas = document.getElementById('intro-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let introParticles = [];
  let sparks = [];
  let animRunning = true;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Floating dust particles
  class IntroParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity = (Math.sin(t * this.pulseSpeed + this.pulseOffset) + 1) * 0.25 + 0.1;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(71, 160, 184, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Spark explosion particles
  class Spark {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.01;
      this.size = Math.random() * 3 + 1;
      this.color = Math.random() > 0.5 ? '71, 160, 184' : '255, 255, 255';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.life -= this.decay;
    }
    draw() {
      if (this.life <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.life})`;
      ctx.fill();
      // Glow
      ctx.shadowColor = `rgba(${this.color}, ${this.life * 0.5})`;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Energy line that connects letters
  let energyLines = [];
  class EnergyLine {
    constructor(x1, y1, x2, y2, delay) {
      this.x1 = x1; this.y1 = y1;
      this.x2 = x2; this.y2 = y2;
      this.progress = 0;
      this.delay = delay;
      this.started = false;
      this.life = 1;
    }
    update(t) {
      if (t < this.delay) return;
      this.started = true;
      if (this.progress < 1) {
        this.progress = Math.min(1, this.progress + 0.05);
      } else {
        this.life -= 0.02;
      }
    }
    draw() {
      if (!this.started || this.life <= 0) return;
      const cx = this.x1 + (this.x2 - this.x1) * this.progress;
      const cy = this.y1 + (this.y2 - this.y1) * this.progress;
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = `rgba(71, 160, 184, ${this.life * 0.6})`;
      ctx.lineWidth = 1;
      ctx.shadowColor = `rgba(71, 160, 184, ${this.life * 0.3})`;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Initialize particles
  const particleCount = window.innerWidth < 768 ? 30 : 80;
  for (let i = 0; i < particleCount; i++) {
    introParticles.push(new IntroParticle());
  }

  let frameCount = 0;
  function animateIntroCanvas() {
    if (!animRunning || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frameCount++;

    // Draw and update dust particles
    introParticles.forEach(p => {
      p.update(frameCount);
      p.draw();
    });

    // Draw connections between nearby particles
    for (let i = 0; i < introParticles.length; i++) {
      for (let j = i + 1; j < introParticles.length; j++) {
        const dx = introParticles[i].x - introParticles[j].x;
        const dy = introParticles[i].y - introParticles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(introParticles[i].x, introParticles[i].y);
          ctx.lineTo(introParticles[j].x, introParticles[j].y);
          ctx.strokeStyle = `rgba(71, 160, 184, ${(1 - dist / 120) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw sparks
    sparks = sparks.filter(s => s.life > 0);
    sparks.forEach(s => {
      s.update();
      s.draw();
    });

    // Draw energy lines
    energyLines = energyLines.filter(l => l.life > 0);
    energyLines.forEach(l => {
      l.update(frameCount);
      l.draw();
    });

    requestAnimationFrame(animateIntroCanvas);
  }
  animateIntroCanvas();

  // ============================
  // SPAWN SPARKS FROM A LETTER
  // ============================
  function spawnSparksFromLetter(letter) {
    const rect = letter.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = window.innerWidth < 768 ? 8 : 15;
    for (let i = 0; i < count; i++) {
      sparks.push(new Spark(cx, cy));
    }
  }

  // ============================
  // MAIN ANIMATION TIMELINE
  // ============================
  function waitForGSAP(cb) {
    if (typeof gsap !== 'undefined') return cb();
    const check = setInterval(() => {
      if (typeof gsap !== 'undefined') { clearInterval(check); cb(); }
    }, 50);
  }

  waitForGSAP(() => {
    const letters = document.querySelectorAll('.intro-letter');
    const taglineWords = document.querySelectorAll('.tagline-word');
    const corners = document.querySelectorAll('.intro-corner');
    const scanline = document.querySelector('.intro-scanline');
    const lineLeft = document.getElementById('intro-line-left');
    const lineRight = document.getElementById('intro-line-right');
    const mainContent = document.getElementById('main-content');

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('introSeen', '1');
        document.body.style.overflow = '';
      }
    });

    // Phase 1: Corner brackets appear with a glitch
    tl.to(corners, {
      opacity: 1,
      duration: 0.3,
      stagger: 0.08,
      ease: 'power2.out',
    });

    // Scanline sweeps down
    tl.set(scanline, { opacity: 0.8, top: '0%' }, '-=0.1');
    tl.to(scanline, {
      top: '100%',
      duration: 0.6,
      ease: 'none',
      onUpdate: function () {
        // Make particles near scanline glow
        const scanY = parseFloat(scanline.style.top) / 100 * canvas.height;
        introParticles.forEach(p => {
          if (Math.abs(p.y - scanY) < 40) {
            p.opacity = 0.8;
            p.size = p.size < 3 ? p.size + 0.3 : p.size;
          }
        });
      }
    }, '-=0.1');
    tl.set(scanline, { opacity: 0 });

    // Phase 2: Letters wave in — the star of the show
    letters.forEach((letter, i) => {
      const delay = i * 0.1;

      tl.to(letter, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
        onStart: () => spawnSparksFromLetter(letter),
      }, `wave+=${delay}`);

      // Each letter gets a glow pulse on arrival
      tl.to(letter, {
        textShadow: '0 0 40px rgba(71, 160, 184, 0.8), 0 0 80px rgba(71, 160, 184, 0.4), 0 0 120px rgba(71, 160, 184, 0.2)',
        duration: 0.3,
        ease: 'power2.in',
      }, `wave+=${delay + 0.2}`);

      tl.to(letter, {
        textShadow: '0 0 10px rgba(71, 160, 184, 0.3), 0 0 20px rgba(71, 160, 184, 0.1)',
        duration: 0.4,
        ease: 'power2.out',
      }, `wave+=${delay + 0.5}`);
    });

    // Phase 3: Letters do a subtle tilt/wave wiggle
    tl.to('.intro-word-top .intro-letter', {
      rotateZ: (i) => [3, -2, 4, -3][i % 4],
      y: (i) => Math.sin(i * 0.8) * 8 - 4,
      duration: 0.5,
      stagger: 0.05,
      ease: 'sine.inOut',
    }, '-=0.2');

    tl.to('.intro-word-bottom .intro-letter', {
      rotateZ: (i) => [-3, 2, -4, 3, -2][i % 5],
      y: (i) => Math.sin(i * 0.8 + 1) * 8 - 4,
      duration: 0.5,
      stagger: 0.05,
      ease: 'sine.inOut',
    }, '<');

    // Phase 4: Decorative lines expand out
    tl.to([lineLeft, lineRight], {
      width: '20vw',
      duration: 0.6,
      ease: 'power3.out',
    }, '-=0.3');

    // Phase 5: Tagline fades in word by word
    tl.to(taglineWords, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.12,
      ease: 'power3.out',
    }, '-=0.2');

    // Phase 6: Big energy pulse — all letters glow together
    tl.to(letters, {
      textShadow: '0 0 60px rgba(71, 160, 184, 1), 0 0 120px rgba(71, 160, 184, 0.6), 0 0 200px rgba(71, 160, 184, 0.3)',
      scale: 1.05,
      duration: 0.3,
      ease: 'power4.in',
      onStart: () => {
        // Big spark burst from center
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        for (let i = 0; i < 60; i++) {
          sparks.push(new Spark(cx, cy));
        }
      }
    }, '+=0.3');

    // Flash effect
    tl.to(intro, {
      backgroundColor: 'rgba(71, 160, 184, 0.15)',
      duration: 0.1,
      ease: 'power4.in',
    });
    tl.to(intro, {
      backgroundColor: '#000',
      duration: 0.2,
      ease: 'power4.out',
    });

    // Phase 7: Letters settle back to straight
    tl.to(letters, {
      rotateZ: 0,
      y: 0,
      scale: 1,
      textShadow: '0 0 10px rgba(71, 160, 184, 0.3)',
      duration: 0.4,
      ease: 'power2.out',
    });

    // Phase 8: Hold for a beat
    tl.to({}, { duration: 0.4 });

    // Phase 9: DRAMATIC EXIT — everything flies apart
    // Letters shoot upward with stagger
    tl.to('.intro-word-top .intro-letter', {
      y: -window.innerHeight,
      opacity: 0,
      rotateX: -90,
      scale: 0.5,
      duration: 0.6,
      stagger: { each: 0.04, from: 'center' },
      ease: 'power3.in',
    });

    tl.to('.intro-word-bottom .intro-letter', {
      y: window.innerHeight,
      opacity: 0,
      rotateX: 90,
      scale: 0.5,
      duration: 0.6,
      stagger: { each: 0.04, from: 'center' },
      ease: 'power3.in',
    }, '<');

    // Tagline and lines fade
    tl.to([taglineWords, lineLeft, lineRight], {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: 'power2.in',
    }, '<');

    // Corners contract and vanish
    tl.to('.intro-corner-tl', { x: 30, y: 30, opacity: 0, duration: 0.3 }, '<');
    tl.to('.intro-corner-tr', { x: -30, y: 30, opacity: 0, duration: 0.3 }, '<');
    tl.to('.intro-corner-bl', { x: 30, y: -30, opacity: 0, duration: 0.3 }, '<');
    tl.to('.intro-corner-br', { x: -30, y: -30, opacity: 0, duration: 0.3 }, '<');

    // Final scanline sweep (exit)
    tl.set(scanline, { opacity: 0.6, top: '0%' });
    tl.to(scanline, {
      top: '100%',
      duration: 0.4,
      ease: 'power2.in',
    });

    // Phase 10: Reveal the main page
    tl.to(intro, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        animRunning = false;
        intro.remove();
        window.dispatchEvent(new CustomEvent('introComplete'));
      }
    });

    tl.to(mainContent, {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    }, '<+=0.1');
  });
})();
