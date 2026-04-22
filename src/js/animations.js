/**
 * Robo Nexus — Animation System v3  (Cinematic Edition)
 *
 * Navbar: Inductions pill reveals first → main nav expands → Register pill settles in.
 * Everything else: GPU-friendly transforms + long cinematic durations.
 *
 * Requires GSAP + ScrollTrigger (already loaded on every page).
 * Load this as the LAST deferred script.
 */
(function RoboNexusAnim() {
  'use strict';

  /* ─── boot ──────────────────────────────────────────────────────── */
  function boot() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(boot, 40);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ force3D: true, overwrite: 'auto' });

    var hasIntro = !!document.getElementById('landing-intro');

    /* inner pages: soft page reveal */
    if (!hasIntro) {
      gsap.set('.page-content', { opacity: 0, y: 12 });
      gsap.to('.page-content', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'expo.out'
      });
    }

    /* navbar cinematic sequence ONLY on landing page */
    if (hasIntro) {
      var navbarStarted = false;

      function tryStartNavbarCinematic() {
        if (navbarStarted) return;

        var introReady = !!window.__rnIntroGlideStarted;
        var subnavReady = !!window.__rnSubnavReady || !!document.getElementById('rn-inductions-pill');

        if (!introReady || !subnavReady) return;

        navbarStarted = true;
        navbarCinematic(0);
      }

      window.addEventListener('introGlideStart', function () {
        window.__rnIntroGlideStarted = true;
        tryStartNavbarCinematic();
      });

      window.addEventListener('subnavReady', function () {
        window.__rnSubnavReady = true;
        tryStartNavbarCinematic();
      });

      tryStartNavbarCinematic();
    } else {
      gsap.set('.spotlight-nav', { opacity: 1, y: 0, scaleX: 1, x: 0, clipPath: 'inset(0 0% 0 0 round 22px)' });
      gsap.set('.nav-links', { opacity: 1, y: 0 });
      gsap.set('.nav-logo img', { opacity: 1, y: 0, scale: 1 });
      gsap.set('.rn26-pill', { opacity: 1, x: 0, scaleX: 1 });
    }

    pageTransitions();
    staticReveals();
    dynamicWatchers();
    cardHovers();

    requestAnimationFrame(function () {
      ScrollTrigger.refresh();
    });
  }

  boot();


  /* ═══════════════════════════════════════════════════════════════════
     1 · NAVBAR — Continuous sweep from inductions → main nav → rn26
     ═══════════════════════════════════════════════════════════════════ */
  function navbarCinematic(baseDelay) {
    var pill      = document.querySelector('.spotlight-nav');
    var navLogo   = document.querySelector('.nav-logo img');
    var navLinks  = document.querySelectorAll('.nav-links');
    var inductions = document.getElementById('rn-inductions-pill');
    var rn26      = document.getElementById('rn26-pill');

    [pill, navLogo, inductions, rn26].forEach(function(el) {
      if (el) gsap.killTweensOf(el);
    });
    if (navLinks.length) gsap.killTweensOf(navLinks);

    var tl = gsap.timeline({ delay: baseDelay });

    /* ── 0: Logo drops in ── */
    if (navLogo) {
      gsap.set(navLogo, { opacity: 0, y: -10, scale: 1.08 });
      tl.to(navLogo, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'expo.out' }, 0);
    }

    /* ── 1: Inductions pill sweeps in (clip-path left → right) ── */
    if (inductions) {
      inductions.style.willChange = 'clip-path, opacity';
      gsap.set(inductions, { opacity: 1, clipPath: 'inset(0 100% 0 0 round 20px)' });
      tl.to(inductions, {
        clipPath: 'inset(0 0% 0 0 round 20px)',
        duration: 0.5,
        ease: 'expo.out'
      }, 0.1);
    }

    /* ── 2: Main nav continues the sweep (starts as inductions finishes) ── */
    if (pill) {
      pill.style.willChange = 'clip-path, opacity';
      gsap.set(navLinks, { opacity: 0, y: 6 });
      gsap.set(pill, { opacity: 1, clipPath: 'inset(0 100% 0 0 round 22px)' });

      var sweepStart = inductions ? 0.45 : 0.1;
      tl.to(pill, {
        clipPath: 'inset(0 0% 0 0 round 22px)',
        duration: 0.9,
        ease: 'expo.out'
      }, sweepStart);

      tl.to(navLinks, {
        opacity: 1, y: 0,
        duration: 0.5,
        ease: 'expo.out',
        stagger: 0.05
      }, sweepStart + 0.3);
    }

    /* ── 3: RN26 pill continues the sweep (if present) ── */
    if (rn26) {
      rn26.style.willChange = 'clip-path, opacity';
      gsap.set(rn26, { opacity: 1, clipPath: 'inset(0 100% 0 0 round 20px)' });
      var rn26Start = inductions ? 1.0 : 0.5;
      tl.to(rn26, {
        clipPath: 'inset(0 0% 0 0 round 20px)',
        duration: 0.5,
        ease: 'expo.out'
      }, rn26Start);
    }
  }


  /* ═══════════════════════════════════════════════════════════════════
     2 · PAGE TRANSITIONS
     ═══════════════════════════════════════════════════════════════════ */
  function pageTransitions() {
    var overlay = document.querySelector('.page-transition');
    if (!overlay) return;

    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
          href.startsWith('tel:') || link.target === '_blank' ||
          href.startsWith('http') || href.startsWith('//')) return;

      link.addEventListener('click', function (e) {
        e.preventDefault();
        overlay.style.display = 'block';
        gsap.to(overlay, {
          opacity: 1, duration: 0.35, ease: 'power2.in',
          onComplete: function () { window.location.href = href; }
        });
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════════
     3 · STATIC REVEALS  (elements already in DOM on load)
     ═══════════════════════════════════════════════════════════════════ */
  function staticReveals() {
    /* generic .reveal elements */
    document.querySelectorAll('.reveal').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });

    /* calendar container */
    var cal = document.querySelector('.calendar-container');
    if (cal) {
      gsap.fromTo(cal,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: cal, start: 'top 88%', once: true } }
      );
    }

    /* project cards — set visible; they're injected dynamically so
       dynamicWatchers handles the scroll-in animation */
    gsap.utils.toArray('.project-card').forEach(function (card) {
      gsap.set(card, { opacity: 1 });
    });
  }


  /* ═══════════════════════════════════════════════════════════════════
     4 · DYNAMIC WATCHERS  (MutationObserver for JS-injected content)
     ═══════════════════════════════════════════════════════════════════ */
  function dynamicWatchers() {
    var grid = document.getElementById('projects-grid');
    if (!grid) return;

    function animateCards(cards) {
      cards.forEach(function (card, i) {
        gsap.fromTo(card,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.7,
            ease: 'expo.out',
            delay: i * 0.07,
            scrollTrigger: { trigger: card, start: 'top 90%', once: true }
          }
        );
      });
    }

    /* animate any cards already present */
    var existing = grid.querySelectorAll('.project-card');
    if (existing.length) animateCards(Array.from(existing));

    /* watch for cards injected after load */
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        var newCards = Array.from(m.addedNodes).filter(function (n) {
          return n.nodeType === 1 && (n.classList.contains('project-card') || n.querySelector('.project-card'));
        });
        var cards = [];
        newCards.forEach(function (n) {
          if (n.classList.contains('project-card')) cards.push(n);
          else cards.push(...n.querySelectorAll('.project-card'));
        });
        if (cards.length) {
          ScrollTrigger.refresh();
          animateCards(cards);
        }
      });
    });

    observer.observe(grid, { childList: true, subtree: true });
  }


  /* ═══════════════════════════════════════════════════════════════════
     5 · DYNAMIC CARD HOVERS (3D Tilt)
     ═══════════════════════════════════════════════════════════════════ */
  function cardHovers() {
    var selector = '.project-card, .cert-card, .team-card';
    var supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    var boundCards = new WeakSet();

    function bindCard(card) {
      if (!card || boundCards.has(card)) return;
      boundCards.add(card);

      var image = card.querySelector('.project-image img, img');
      var maxTilt = card.classList.contains('team-card') ? 10 : 8;
      var liftY = card.classList.contains('team-card') ? -12 : -10;

      gsap.set(card, {
        transformPerspective: 1000,
        transformOrigin: 'center center'
      });

      var rotateXTo = gsap.quickTo(card, 'rotateX', { duration: 0.3, ease: 'power2.out' });
      var rotateYTo = gsap.quickTo(card, 'rotateY', { duration: 0.3, ease: 'power2.out' });
      var liftTo = gsap.quickTo(card, 'y', { duration: 0.3, ease: 'power2.out' });
      var imageXTo = image ? gsap.quickTo(image, 'x', { duration: 0.35, ease: 'power2.out' }) : null;
      var imageYTo = image ? gsap.quickTo(image, 'y', { duration: 0.35, ease: 'power2.out' }) : null;

      card.addEventListener('mousemove', function (e) {
        if (!supportsHover.matches) return;

        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var normalizedX = (px - 0.5) * 2;
        var normalizedY = (py - 0.5) * 2;

        rotateYTo(normalizedX * maxTilt);
        rotateXTo(-normalizedY * maxTilt);
        liftTo(liftY);

        if (imageXTo && imageYTo) {
          imageXTo(normalizedX * 8);
          imageYTo(normalizedY * 8);
        }
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          duration: 0.45,
          ease: 'power3.out'
        });

        if (image) {
          gsap.to(image, {
            x: 0,
            y: 0,
            duration: 0.45,
            ease: 'power3.out'
          });
        }
      });
    }

    function bindFromNode(node) {
      if (!node) return;

      if (node.matches && node.matches(selector)) {
        bindCard(node);
      }

      if (node.querySelectorAll) {
        node.querySelectorAll(selector).forEach(bindCard);
      }
    }

    bindFromNode(document);

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) bindFromNode(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

})();
