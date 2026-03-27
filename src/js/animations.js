/**
 * Robo Nexus — Animation System v3  (Buttery Smooth Edition)
 *
 * Performance rules:
 *   1. ONLY animate transform + opacity (GPU-composited, never triggers layout/paint)
 *   2. NO clip-path animations (they repaint the entire element every frame)
 *   3. Longer durations + softer easings = perceived smoothness
 *   4. force3D: true on everything = dedicated GPU layer
 *   5. Throttle mousemove with rAF to prevent jank
 *
 * Requires GSAP + ScrollTrigger (already loaded on every page).
 * Load this as the LAST deferred script so it can override earlier tweens.
 */
(function RoboNexusAnim() {
  'use strict';

  /* ─── boot: wait for GSAP then run ─────────────────────────────── */
  function boot() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(boot, 40);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    /* global GSAP defaults for buttery feel */
    gsap.defaults({
      force3D: true,
      overwrite: 'auto'
    });

    var hasIntro = !!document.getElementById('landing-intro');

    /* inner-page fade-in (home uses the landing intro instead) */
    if (!hasIntro) {
      gsap.from('.page-content', {
        opacity: 0,
        y: 12,
        duration: 0.6,
        ease: 'power2.out'
      });
    }

    /* navbar pill – trigger after intro on home, immediately elsewhere */
    if (hasIntro) {
      window.addEventListener('introComplete', function () { navbarAnim(0.1); }, { once: true });
    } else {
      navbarAnim(0.3);
    }

    pageTransitions();
    staticReveals();
    dynamicWatchers();
    cardHovers();
  }

  boot();


  /* ═══════════════════════════════════════════════════════════════
     1 · NAVBAR PILL  — fades + scales in smoothly (no clip-path)
     ═══════════════════════════════════════════════════════════════ */
  function navbarAnim(d) {
    /* main pill: scale from narrow center → full width */
    var pill = document.querySelector('.spotlight-nav');
    if (pill) {
      gsap.set(pill, { scaleX: 0.3, opacity: 0 });
      gsap.to(pill, {
        scaleX: 1,
        opacity: 1,
        duration: 1,
        delay: d,
        ease: 'power2.out'
      });
    }

    /* logo: gentle scale in */
    gsap.killTweensOf('.nav-logo img');
    gsap.set('.nav-logo img', { scale: 0.8, opacity: 0 });
    gsap.to('.nav-logo img', {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      delay: d + 0.4,
      ease: 'power2.out'
    });

    /* RN26 secondary pill: slide from right */
    var rn = document.getElementById('rn26-pill');
    if (rn) {
      gsap.set(rn, { x: 30, opacity: 0 });
      gsap.to(rn, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        delay: d + 0.6,
        ease: 'power2.out'
      });
    }
  }


  /* ═══════════════════════════════════════════════════════════════
     2 · PAGE TRANSITIONS  — smooth fade + gentle lift
     ═══════════════════════════════════════════════════════════════ */
  function pageTransitions() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      /* skip external, anchors, mailto, javascript: */
      if (!href || /^(https?:|#|mailto:|javascript:)/.test(href)) return;
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        var dest = href;
        gsap.to('.page-content', {
          opacity: 0,
          y: -10,
          duration: 0.35,
          ease: 'power2.inOut',
          onComplete: function () { window.location.href = dest; }
        });
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     3 · STATIC REVEALS  — transform + opacity only (no clip-path)
     ═══════════════════════════════════════════════════════════════ */
  function staticReveals() {

    /* Page hero title — scales in gently */
    whenIn('.page-title', function (el) {
      gsap.from(el, {
        scale: 0.92,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out'
      });
    });

    /* ── CALENDAR: slides up smoothly ── */
    whenIn('.calendar-container', function (el) {
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      });
    }, 'top 80%');

    /* ── CONTACT: form from left, card from right ── */
    whenIn('.contact-form-div', function (el) {
      gsap.from(el, {
        x: -40,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      });
    });
    whenIn('.contact-right-card', function (el) {
      gsap.from(el, {
        x: 40,
        opacity: 0,
        duration: 1,
        delay: 0.1,
        ease: 'power2.out'
      });
    });

    /* ── REGISTER cards: slide up from below ── */
    document.querySelectorAll('.reg-card').forEach(function (el) {
      whenIn(el, function () {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out'
        });
      }, 'top 88%');
    });

    /* Register info sidebar cards — slide from right, staggered */
    document.querySelectorAll('.reg-info-card').forEach(function (el, i) {
      whenIn(el, function () {
        gsap.from(el, {
          x: 30,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.08,
          ease: 'power2.out'
        });
      }, 'top 90%');
    });

    /* Grade chips — gentle scale up, staggered */
    batchReveal('.grade-chip label', { scale: 0.8, opacity: 0 }, 0.05);

    /* Event chips — gentle scale up, staggered */
    batchReveal('.event-chip label', { scale: 0.8, opacity: 0 }, 0.06);

    /* Submit button — scale up gently */
    whenIn('.reg-submit-btn', function (el) {
      gsap.from(el, {
        scale: 0.9,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out'
      });
    }, 'top 96%');

    /* Filter buttons (projects page) — stagger slide-up */
    var filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length) {
      gsap.set(filterBtns, { y: 20, opacity: 0 });
      gsap.to(filterBtns, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        delay: 0.2,
        stagger: 0.07,
        ease: 'power2.out'
      });
    }

    /* Events page column titles */
    whenIn('.events-upcoming-col h2', function (el) {
      gsap.from(el, { x: -20, opacity: 0, duration: 0.8, ease: 'power2.out' });
    });
    whenIn('.past-events-section h2', function (el) {
      gsap.from(el, { x: -20, opacity: 0, duration: 0.8, ease: 'power2.out' });
    });

    /* Member blocks on register page — slide up */
    var memberBlocks = document.querySelectorAll('.member-block');
    if (memberBlocks.length) {
      memberBlocks.forEach(function (el, i) {
        whenIn(el, function () {
          gsap.from(el, { y: 24, opacity: 0, duration: 0.8, delay: i * 0.1, ease: 'power2.out' });
        }, 'top 90%');
      });
    }

    /* About section heading — slide from left */
    whenIn('.about-details', function (el) {
      var heading = el.querySelector('.about-heading');
      if (heading) {
        gsap.from(heading, {
          x: -20,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out'
        });
      }
    });

    /* Footer — slide up gently */
    whenIn('.footer', function (el) {
      gsap.from(el, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    }, 'top 97%');

    /* Reg hero text */
    var regHero = document.querySelector('.reg-hero');
    if (regHero) {
      var regHeroEls = regHero.querySelectorAll('.event-year, .page-title, .hero-subtitle');
      gsap.from(regHeroEls, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        delay: 0.15,
        ease: 'power2.out'
      });
    }
  }


  /* ═══════════════════════════════════════════════════════════════
     4 · DYNAMIC CONTENT  — watch containers, animate when injected
     ═══════════════════════════════════════════════════════════════ */
  function dynamicWatchers() {
    watch('#team-container', animateTeam);
    watch('#alumni-container', animateAlumni);
    watch('#projects-grid', animateProjects);
    watch('#upcoming-events', animateUpcoming);
    watch('#past-events', animatePast);
  }

  /* Team cards — alternate left / right slide */
  function animateTeam(c) {
    c.querySelectorAll('.team-card').forEach(function (el, i) {
      var fromX = i % 2 === 0 ? -30 : 30;
      gsap.set(el, { x: fromX, opacity: 0 });
      whenIn(el, function () {
        gsap.to(el, {
          x: 0,
          opacity: 1,
          duration: 0.9,
          delay: (i % 4) * 0.08,
          ease: 'power2.out'
        });
      }, 'top 90%');
      tilt(el, 5);
    });
  }

  /* Alumni cards — slide up */
  function animateAlumni(c) {
    c.querySelectorAll('.alumni-card').forEach(function (el, i) {
      gsap.set(el, { y: 30, opacity: 0 });
      whenIn(el, function () {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay: i * 0.1,
          ease: 'power2.out'
        });
      }, 'top 90%');
    });
  }

  /* Project cards — slide up (no clip-path) */
  function animateProjects(c) {
    c.querySelectorAll('.project-card').forEach(function (el, i) {
      gsap.set(el, { y: 50, opacity: 0 });
      whenIn(el, function () {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay: (i % 3) * 0.1,
          ease: 'power2.out'
        });
      }, 'top 88%');
      tilt(el, 4);
    });
  }

  /* Upcoming event cards — slide from left */
  function animateUpcoming(c) {
    c.querySelectorAll('.event-list-card').forEach(function (el, i) {
      gsap.set(el, { x: -30, opacity: 0 });
      whenIn(el, function () {
        gsap.to(el, {
          x: 0,
          opacity: 1,
          duration: 0.9,
          delay: i * 0.12,
          ease: 'power2.out'
        });
      }, 'top 88%');
    });
  }

  /* Past event grid cards — slide up */
  function animatePast(c) {
    c.querySelectorAll('.past-event-grid-card').forEach(function (el, i) {
      gsap.set(el, { y: 24, opacity: 0 });
      whenIn(el, function () {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: (i % 3) * 0.1,
          ease: 'power2.out'
        });
      }, 'top 90%');
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     5 · 3-D HOVER TILT  — subtle, rAF-throttled for smoothness
     ═══════════════════════════════════════════════════════════════ */
  function cardHovers() {
    /* Apply to static cards that exist at load time */
    ['.reg-info-card', '.alumni-card'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { tilt(el, 4); });
    });
    /* team / project cards are handled inside their dynamic animators */
  }

  /**
   * Add a gentle 3-D tilt with rAF-throttled mousemove.
   * @param {Element} el
   * @param {number} strength  max rotation in degrees (default 5)
   */
  function tilt(el, strength) {
    strength = strength || 5;
    el.style.willChange = 'transform';
    el.style.transformStyle = 'preserve-3d';

    var ticking = false;
    var lastX = 0;
    var lastY = 0;

    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      lastX = ((e.clientX - r.left) / r.width - 0.5) * strength;
      lastY = ((e.clientY - r.top) / r.height - 0.5) * -strength;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          gsap.to(el, {
            rotationY: lastX,
            rotationX: lastY,
            transformPerspective: 900,
            duration: 0.6,
            ease: 'power2.out'
          });
          ticking = false;
        });
      }
    });

    el.addEventListener('mouseleave', function () {
      gsap.to(el, {
        rotationY: 0,
        rotationX: 0,
        duration: 1,
        ease: 'power2.out'
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     UTILITIES
     ═══════════════════════════════════════════════════════════════ */

  /**
   * Fire cb(el) once when el enters the viewport.
   */
  function whenIn(target, cb, start) {
    start = start || 'top 85%';
    var el = typeof target === 'string'
      ? document.querySelector(target)
      : target;
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: start,
      once: true,
      onEnter: function () { cb(el); }
    });
  }

  /**
   * Batch: set all matching elements to from-state,
   * then smoothly reveal them together when the first enters view.
   */
  function batchReveal(selector, fromState, stagger, start) {
    start = start || 'top 90%';
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.set(els, fromState);
    ScrollTrigger.create({
      trigger: els[0],
      start: start,
      once: true,
      onEnter: function () {
        gsap.to(els, {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: stagger,
          ease: 'power2.out'
        });
      }
    });
  }

  /**
   * MutationObserver: call fn(el) once when children are injected.
   */
  function watch(selector, fn) {
    var el = document.querySelector(selector);
    if (!el) return;
    var obs = new MutationObserver(function (mutations) {
      if (mutations.some(function (m) { return m.addedNodes.length > 0; })) {
        obs.disconnect();
        requestAnimationFrame(function () { fn(el); });
      }
    });
    obs.observe(el, { childList: true });
  }

})();