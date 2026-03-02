/* ===============================
   LANDING INTRO ANIMATION — ULTIMATE EDITION
   Circuit traces + digital rain + robotic assembly +
   wave letters + glitch/RGB split + shockwave ripples +
   particle explosions + scanline + dramatic reveal
================================ */

(function () {
  const intro = document.getElementById('landing-intro');
  if (!intro) return;

  if (sessionStorage.getItem('introSeen')) {
    intro.remove();
    const main = document.getElementById('main-content');
    if (main) main.style.opacity = '1';
    return;
  }

  document.body.style.overflow = 'hidden';

  const canvas = document.getElementById('intro-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let animRunning = true;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const W = () => canvas.width;
  const H = () => canvas.height;
  const isMobile = window.innerWidth < 768;

  // ============================================
  //  1. MATRIX / DIGITAL RAIN
  // ============================================
  const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモラリルレロ';
  const matrixColumns = [];
  const matrixFontSize = 14;
  let matrixActive = true;

  function initMatrix() {
    const cols = Math.ceil(W() / matrixFontSize);
    matrixColumns.length = 0;
    for (let i = 0; i < cols; i++) {
      matrixColumns.push({
        x: i * matrixFontSize,
        y: Math.random() * H() * -2,
        speed: Math.random() * 3 + 2,
        chars: [],
        length: Math.floor(Math.random() * 15) + 8,
      });
    }
  }
  initMatrix();

  function drawMatrix() {
    if (!matrixActive) return;
    matrixColumns.forEach(col => {
      for (let j = 0; j < col.length; j++) {
        const charY = col.y - j * matrixFontSize;
        if (charY < -matrixFontSize || charY > H()) continue;
        const alpha = j === 0 ? 1 : Math.max(0, 1 - j / col.length);
        const isHead = j === 0;
        ctx.font = `${matrixFontSize}px monospace`;
        if (isHead) {
          ctx.fillStyle = `rgba(160, 230, 255, ${alpha * 0.9})`;
          ctx.shadowColor = 'rgba(71, 160, 184, 0.8)';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = `rgba(71, 160, 184, ${alpha * 0.4})`;
          ctx.shadowBlur = 0;
        }
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(char, col.x, charY);
        ctx.shadowBlur = 0;
      }
      col.y += col.speed;
      if (col.y - col.length * matrixFontSize > H()) {
        col.y = Math.random() * -200;
        col.speed = Math.random() * 3 + 2;
      }
    });
  }

  // ============================================
  //  2. CIRCUIT TRACES
  // ============================================
  let circuits = [];

  class CircuitTrace {
    constructor(startX, startY, targetX, targetY) {
      this.points = [{ x: startX, y: startY }];
      this.targetX = targetX;
      this.targetY = targetY;
      this.progress = 0;
      this.speed = 0.015 + Math.random() * 0.01;
      this.complete = false;
      this.life = 1;
      this.segments = [];
      this.generatePath();
      this.glowIntensity = 0;
    }
    generatePath() {
      let cx = this.points[0].x;
      let cy = this.points[0].y;
      const steps = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < steps; i++) {
        const t = (i + 1) / (steps + 1);
        const tx = this.points[0].x + (this.targetX - this.points[0].x) * t;
        const ty = this.points[0].y + (this.targetY - this.points[0].y) * t;
        // Circuit-style: go horizontal then vertical (or vice versa)
        if (Math.random() > 0.5) {
          this.points.push({ x: tx, y: cy });
          this.points.push({ x: tx, y: ty });
        } else {
          this.points.push({ x: cx, y: ty });
          this.points.push({ x: tx, y: ty });
        }
        cx = tx;
        cy = ty;
      }
      this.points.push({ x: this.targetX, y: this.targetY });
    }
    update() {
      if (this.complete) {
        this.life -= 0.008;
        this.glowIntensity = Math.max(0, this.glowIntensity - 0.02);
        return;
      }
      this.progress += this.speed;
      this.glowIntensity = Math.min(1, this.glowIntensity + 0.05);
      if (this.progress >= 1) {
        this.progress = 1;
        this.complete = true;
      }
    }
    draw() {
      if (this.life <= 0) return;
      const totalPoints = this.points.length;
      const drawToIndex = Math.floor(this.progress * (totalPoints - 1));
      const subProgress = (this.progress * (totalPoints - 1)) - drawToIndex;

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i <= drawToIndex && i < totalPoints; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      if (drawToIndex < totalPoints - 1) {
        const fromPt = this.points[drawToIndex];
        const toPt = this.points[drawToIndex + 1];
        ctx.lineTo(
          fromPt.x + (toPt.x - fromPt.x) * subProgress,
          fromPt.y + (toPt.y - fromPt.y) * subProgress
        );
      }
      ctx.strokeStyle = `rgba(71, 160, 184, ${this.life * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = `rgba(71, 160, 184, ${this.glowIntensity * 0.6})`;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw nodes at corners
      for (let i = 0; i <= drawToIndex && i < totalPoints; i++) {
        ctx.beginPath();
        ctx.arc(this.points[i].x, this.points[i].y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(71, 160, 184, ${this.life * 0.9})`;
        ctx.fill();
      }

      // Glowing head
      if (!this.complete && drawToIndex < totalPoints - 1) {
        const fromPt = this.points[drawToIndex];
        const toPt = this.points[drawToIndex + 1];
        const headX = fromPt.x + (toPt.x - fromPt.x) * subProgress;
        const headY = fromPt.y + (toPt.y - fromPt.y) * subProgress;
        ctx.beginPath();
        ctx.arc(headX, headY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(160, 230, 255, 0.9)';
        ctx.shadowColor = 'rgba(71, 160, 184, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  // ============================================
  //  3. SHOCKWAVE RIPPLES
  // ============================================
  let shockwaves = [];

  class Shockwave {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = Math.max(W(), H()) * 0.4;
      this.speed = 8;
      this.life = 1;
    }
    update() {
      this.radius += this.speed;
      this.life = Math.max(0, 1 - this.radius / this.maxRadius);
    }
    draw() {
      if (this.life <= 0) return;
      // Outer ring
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(71, 160, 184, ${this.life * 0.5})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = `rgba(71, 160, 184, ${this.life * 0.3})`;
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Inner subtle ring
      if (this.radius > 10) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(71, 160, 184, ${this.life * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // ============================================
  //  4. FLOATING PARTICLES + SPARKS
  // ============================================
  let introParticles = [];
  let sparks = [];

  class IntroParticle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W();
      this.y = Math.random() * H();
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.boosted = false;
    }
    update(t) {
      this.x += this.speedX;
      this.y += this.speedY;
      if (!this.boosted) {
        this.opacity = (Math.sin(t * this.pulseSpeed + this.pulseOffset) + 1) * 0.25 + 0.1;
      } else {
        this.opacity = Math.max(this.opacity - 0.01, 0.1);
        if (this.opacity <= 0.15) this.boosted = false;
      }
      if (this.x < 0 || this.x > W()) this.speedX *= -1;
      if (this.y < 0 || this.y > H()) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(71, 160, 184, ${this.opacity})`;
      ctx.fill();
    }
    boost() {
      this.opacity = 0.9;
      this.size = Math.min(this.size + 0.5, 4);
      this.boosted = true;
    }
  }

  class Spark {
    constructor(x, y, opts = {}) {
      this.x = x;
      this.y = y;
      const angle = opts.angle != null ? opts.angle : Math.random() * Math.PI * 2;
      const speed = opts.speed || (Math.random() * 6 + 2);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1;
      this.decay = opts.decay || (Math.random() * 0.02 + 0.01);
      this.size = opts.size || (Math.random() * 3 + 1);
      this.color = opts.color || (Math.random() > 0.5 ? '71, 160, 184' : '255, 255, 255');
      this.trail = [];
      this.maxTrail = opts.trail || 5;
    }
    update() {
      this.trail.push({ x: this.x, y: this.y, life: this.life });
      if (this.trail.length > this.maxTrail) this.trail.shift();
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.97;
      this.vy *= 0.97;
      this.life -= this.decay;
    }
    draw() {
      if (this.life <= 0) return;
      // Trail
      this.trail.forEach((pt, i) => {
        const a = (i / this.trail.length) * this.life * 0.4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, this.size * 0.5 * (i / this.trail.length), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${a})`;
        ctx.fill();
      });
      // Head
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.life})`;
      ctx.shadowColor = `rgba(${this.color}, ${this.life * 0.5})`;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ============================================
  //  5. HEX GRID BACKGROUND
  // ============================================
  let hexOpacity = 0;

  function drawHexGrid() {
    if (hexOpacity <= 0) return;
    const size = 40;
    const h = size * Math.sqrt(3);
    ctx.strokeStyle = `rgba(71, 160, 184, ${hexOpacity * 0.06})`;
    ctx.lineWidth = 0.5;
    for (let row = -1; row < H() / h + 1; row++) {
      for (let col = -1; col < W() / (size * 1.5) + 1; col++) {
        const x = col * size * 1.5;
        const y = row * h + (col % 2 === 0 ? 0 : h / 2);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = x + size * 0.6 * Math.cos(angle);
          const py = y + size * 0.6 * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  // ============================================
  //  INIT PARTICLES
  // ============================================
  const particleCount = isMobile ? 30 : 80;
  for (let i = 0; i < particleCount; i++) {
    introParticles.push(new IntroParticle());
  }

  // ============================================
  //  MAIN RENDER LOOP
  // ============================================
  let frameCount = 0;

  function render() {
    if (!animRunning || !ctx) return;
    ctx.clearRect(0, 0, W(), H());
    frameCount++;

    // Layer 1: Hex grid
    drawHexGrid();

    // Layer 2: Matrix rain
    drawMatrix();

    // Layer 3: Circuit traces
    circuits = circuits.filter(c => c.life > 0);
    circuits.forEach(c => { c.update(); c.draw(); });

    // Layer 4: Particles + connections
    introParticles.forEach(p => { p.update(frameCount); p.draw(); });
    if (!isMobile) {
      for (let i = 0; i < introParticles.length; i++) {
        for (let j = i + 1; j < introParticles.length; j++) {
          const dx = introParticles[i].x - introParticles[j].x;
          const dy = introParticles[i].y - introParticles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(introParticles[i].x, introParticles[j].y);
            ctx.lineTo(introParticles[j].x, introParticles[j].y);
            ctx.strokeStyle = `rgba(71, 160, 184, ${(1 - dist / 120) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    // Layer 5: Shockwaves
    shockwaves = shockwaves.filter(s => s.life > 0);
    shockwaves.forEach(s => { s.update(); s.draw(); });

    // Layer 6: Sparks
    sparks = sparks.filter(s => s.life > 0);
    sparks.forEach(s => { s.update(); s.draw(); });

    requestAnimationFrame(render);
  }
  render();

  // ============================================
  //  HELPER FUNCTIONS
  // ============================================
  function spawnSparksFromLetter(letter, count) {
    const rect = letter.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const n = count || (isMobile ? 10 : 20);
    for (let i = 0; i < n; i++) {
      sparks.push(new Spark(cx, cy, { trail: 6 }));
    }
  }

  function spawnShockwave(letter) {
    const rect = letter.getBoundingClientRect();
    shockwaves.push(new Shockwave(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    ));
  }

  function spawnCircuitsToLetter(letter) {
    const rect = letter.getBoundingClientRect();
    const tx = rect.left + rect.width / 2;
    const ty = rect.top + rect.height / 2;
    // Spawn 2-3 circuit traces from random edges
    const count = isMobile ? 1 : 2;
    for (let i = 0; i < count; i++) {
      let sx, sy;
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { sx = Math.random() * W(); sy = 0; }
      else if (edge === 1) { sx = W(); sy = Math.random() * H(); }
      else if (edge === 2) { sx = Math.random() * W(); sy = H(); }
      else { sx = 0; sy = Math.random() * H(); }
      circuits.push(new CircuitTrace(sx, sy, tx, ty));
    }
  }

  function boostNearbyParticles(x, y, radius) {
    introParticles.forEach(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < radius) {
        p.boost();
        // Push particles away from shockwave center
        const angle = Math.atan2(dy, dx);
        p.speedX += Math.cos(angle) * 0.5;
        p.speedY += Math.sin(angle) * 0.5;
      }
    });
  }

  // ============================================
  //  GSAP TIMELINE — THE MEGA SEQUENCE
  // ============================================
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

    // ── PHASE 1: DIGITAL RAIN + HEX GRID FADE IN ──
    tl.to({}, {
      duration: 0.8,
      onUpdate: function () {
        hexOpacity = this.progress();
      }
    });

    // ── PHASE 2: CORNER BRACKETS GLITCH IN ──
    // Each corner flickers before settling
    corners.forEach((corner, i) => {
      tl.set(corner, { opacity: 0 }, `corners+=${i * 0.1}`);
      tl.to(corner, { opacity: 1, duration: 0.05 }, `corners+=${i * 0.1}`);
      tl.to(corner, { opacity: 0, duration: 0.05 }, `corners+=${i * 0.1 + 0.05}`);
      tl.to(corner, { opacity: 1, duration: 0.05 }, `corners+=${i * 0.1 + 0.1}`);
      tl.to(corner, { opacity: 0.3, duration: 0.05 }, `corners+=${i * 0.1 + 0.15}`);
      tl.to(corner, { opacity: 1, duration: 0.1 }, `corners+=${i * 0.1 + 0.2}`);
    });

    // ── PHASE 3: SCANLINE SWEEP — ACTIVATES MATRIX ──
    tl.set(scanline, { opacity: 0.8, top: '0%' });
    tl.to(scanline, {
      top: '100%',
      duration: 0.8,
      ease: 'none',
      onUpdate: function () {
        const scanY = parseFloat(scanline.style.top) / 100 * H();
        introParticles.forEach(p => {
          if (Math.abs(p.y - scanY) < 50) p.boost();
        });
      }
    });
    tl.set(scanline, { opacity: 0 });

    // ── PHASE 4: CIRCUIT TRACES RACE TOWARD LETTER POSITIONS ──
    tl.add(() => {
      letters.forEach((letter, i) => {
        setTimeout(() => spawnCircuitsToLetter(letter), i * 80);
      });
    });
    tl.to({}, { duration: 0.6 }); // Let circuits draw

    // ── PHASE 5: LETTERS — ROBOTIC ASSEMBLY + WAVE DROP ──
    // Each letter: glitch flicker → assemble → drop with wave → shockwave + sparks
    letters.forEach((letter, i) => {
      const delay = i * 0.12;
      const label = `assemble+=${delay}`;

      // Glitch flicker phase (RGB split effect via CSS)
      tl.set(letter, {
        opacity: 0.7,
        filter: 'blur(8px)',
        textShadow: '-3px 0 #ff0000, 3px 0 #00ffff',
        y: 100 + Math.random() * 40,
        rotateX: 90,
        scale: 0.5,
      }, label);

      // Quick flicker
      tl.to(letter, {
        opacity: 0.4, duration: 0.05,
        textShadow: '3px 0 #ff0000, -3px 0 #00ffff',
      }, `${label}+=0.05`);
      tl.to(letter, {
        opacity: 0.8, duration: 0.05,
        textShadow: '-2px 0 #ff0000, 2px 0 #00ffff',
        filter: 'blur(4px)',
      }, `${label}+=0.1`);
      tl.to(letter, {
        opacity: 0.3, duration: 0.03,
        textShadow: '4px 0 #ff0000, -4px 0 #00ffff',
      }, `${label}+=0.15`);

      // Assembly: snap into place
      tl.to(letter, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        filter: 'blur(0px)',
        textShadow: '0 0 0 transparent',
        duration: 0.4,
        ease: 'back.out(2)',
        onStart: () => {
          spawnSparksFromLetter(letter, isMobile ? 12 : 25);
          spawnShockwave(letter);
          const rect = letter.getBoundingClientRect();
          boostNearbyParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 150);
        },
      }, `${label}+=0.18`);

      // Arrival glow
      tl.to(letter, {
        textShadow: '0 0 40px rgba(71, 160, 184, 0.9), 0 0 80px rgba(71, 160, 184, 0.5), 0 0 120px rgba(71, 160, 184, 0.3)',
        duration: 0.25,
        ease: 'power2.in',
      }, `${label}+=0.4`);

      tl.to(letter, {
        textShadow: '0 0 10px rgba(71, 160, 184, 0.3)',
        duration: 0.3,
        ease: 'power2.out',
      }, `${label}+=0.65`);
    });

    // ── PHASE 6: WAVE TILT — letters rock like a wave ──
    tl.to('.intro-word-top .intro-letter', {
      rotateZ: (i) => [5, -3, 6, -4][i % 4],
      y: (i) => Math.sin(i * 1.2) * 12,
      duration: 0.5,
      stagger: 0.06,
      ease: 'sine.inOut',
    }, '-=0.1');

    tl.to('.intro-word-bottom .intro-letter', {
      rotateZ: (i) => [-4, 3, -5, 4, -3][i % 5],
      y: (i) => Math.sin(i * 1.2 + 2) * 12,
      duration: 0.5,
      stagger: 0.06,
      ease: 'sine.inOut',
    }, '<');

    // Continuous wave motion (3 cycles)
    for (let cycle = 0; cycle < 2; cycle++) {
      tl.to('.intro-word-top .intro-letter', {
        y: (i) => Math.sin(i * 1.2 + cycle * 3) * 15,
        rotateZ: (i) => Math.sin(i * 0.9 + cycle * 2) * 5,
        duration: 0.4,
        stagger: 0.04,
        ease: 'sine.inOut',
      });
      tl.to('.intro-word-bottom .intro-letter', {
        y: (i) => Math.sin(i * 1.2 + cycle * 3 + 1) * 15,
        rotateZ: (i) => Math.sin(i * 0.9 + cycle * 2 + 1) * 5,
        duration: 0.4,
        stagger: 0.04,
        ease: 'sine.inOut',
      }, '<');
    }

    // ── PHASE 7: DECORATIVE LINES ──
    tl.to([lineLeft, lineRight], {
      width: '20vw',
      duration: 0.5,
      ease: 'power3.out',
    }, '-=0.3');

    // ── PHASE 8: MATRIX FADE OUT, TAGLINE IN ──
    tl.add(() => { matrixActive = false; });
    tl.to(taglineWords, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.1,
      ease: 'power3.out',
    }, '-=0.2');

    // ── PHASE 9: MEGA ENERGY PULSE ──
    // All letters glow, massive particle explosion, screen shake
    tl.to(letters, {
      textShadow: '0 0 80px rgba(71, 160, 184, 1), 0 0 160px rgba(71, 160, 184, 0.7), 0 0 240px rgba(71, 160, 184, 0.4)',
      scale: 1.08,
      rotateZ: 0,
      y: 0,
      duration: 0.25,
      ease: 'power4.in',
      onStart: () => {
        // Massive spark explosion from center
        const cx = W() / 2, cy = H() / 2;
        const count = isMobile ? 40 : 100;
        for (let i = 0; i < count; i++) {
          sparks.push(new Spark(cx, cy, {
            speed: Math.random() * 10 + 3,
            size: Math.random() * 4 + 1,
            trail: 8,
            decay: Math.random() * 0.015 + 0.005,
          }));
        }
        // Shockwave from center
        shockwaves.push(new Shockwave(cx, cy));
        // Boost all particles
        introParticles.forEach(p => p.boost());
      }
    }, '+=0.2');

    // Flash — white then teal then black
    tl.to(intro, { backgroundColor: 'rgba(255, 255, 255, 0.15)', duration: 0.06 });
    tl.to(intro, { backgroundColor: 'rgba(71, 160, 184, 0.2)', duration: 0.08 });
    tl.to(intro, { backgroundColor: '#000', duration: 0.15, ease: 'power2.out' });

    // Screen shake
    tl.to(intro, { x: -5, duration: 0.03 });
    tl.to(intro, { x: 5, duration: 0.03 });
    tl.to(intro, { x: -3, duration: 0.03 });
    tl.to(intro, { x: 3, duration: 0.03 });
    tl.to(intro, { x: 0, duration: 0.05 });

    // ── PHASE 10: SETTLE ──
    tl.to(letters, {
      scale: 1,
      textShadow: '0 0 15px rgba(71, 160, 184, 0.4)',
      duration: 0.4,
      ease: 'power2.out',
    });

    // Brief hold
    tl.to({}, { duration: 0.3 });

    // ── PHASE 11: GLITCH EXIT ──
    // One more glitch flicker before exit
    tl.to(letters, {
      textShadow: '-3px 0 rgba(255,0,0,0.5), 3px 0 rgba(0,255,255,0.5)',
      duration: 0.04,
    });
    tl.to(letters, {
      textShadow: '3px 0 rgba(255,0,0,0.7), -3px 0 rgba(0,255,255,0.7)',
      duration: 0.04,
    });
    tl.to(letters, {
      textShadow: '0 0 10px rgba(71, 160, 184, 0.4)',
      duration: 0.06,
    });

    // ── PHASE 12: DRAMATIC EXIT ──
    // "ROBO" explodes up, "NEXUS" explodes down
    tl.to('.intro-word-top .intro-letter', {
      y: -H(),
      opacity: 0,
      rotateX: -120,
      rotateZ: (i) => (i - 1.5) * 15,
      scale: 0.3,
      duration: 0.7,
      stagger: { each: 0.04, from: 'center' },
      ease: 'power3.in',
      onStart: () => {
        // Trail sparks as letters fly away
        letters.forEach(l => spawnSparksFromLetter(l, 8));
      }
    });

    tl.to('.intro-word-bottom .intro-letter', {
      y: H(),
      opacity: 0,
      rotateX: 120,
      rotateZ: (i) => (i - 2) * -15,
      scale: 0.3,
      duration: 0.7,
      stagger: { each: 0.04, from: 'center' },
      ease: 'power3.in',
    }, '<');

    tl.to([taglineWords, lineLeft, lineRight], {
      opacity: 0, scale: 0.6, duration: 0.3, ease: 'power2.in',
    }, '<');

    tl.to('.intro-corner-tl', { x: 50, y: 50, opacity: 0, scale: 0, duration: 0.3, ease: 'power2.in' }, '<');
    tl.to('.intro-corner-tr', { x: -50, y: 50, opacity: 0, scale: 0, duration: 0.3, ease: 'power2.in' }, '<');
    tl.to('.intro-corner-bl', { x: 50, y: -50, opacity: 0, scale: 0, duration: 0.3, ease: 'power2.in' }, '<');
    tl.to('.intro-corner-br', { x: -50, y: -50, opacity: 0, scale: 0, duration: 0.3, ease: 'power2.in' }, '<');

    // Exit scanline
    tl.set(scanline, { opacity: 0.8, top: '0%' });
    tl.to(scanline, { top: '100%', duration: 0.3, ease: 'power2.in' });

    // Hex grid fade out
    tl.to({}, {
      duration: 0.3,
      onUpdate: function () { hexOpacity = 1 - this.progress(); }
    }, '<');

    // ── PHASE 13: REVEAL MAIN CONTENT ──
    tl.to(intro, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        animRunning = false;
        intro.remove();
      }
    });

    tl.to(mainContent, {
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out',
    }, '<+=0.15');
  });
})();
