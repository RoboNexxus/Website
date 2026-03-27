/**
 * Robo Nexus — Animation System v2
 *
 * Philosophy: every element earns its reveal.
 * Directional clip-paths, purposeful easing, subtle 3-D tilt on hover.
 * No global cursor effects. Nothing gratuitous.
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

    const hasIntro = !!document.getElementById('landing-intro');

    /* inner-page fade-in (home uses the landing intro instead) */
    if (!hasIntro) {
      gsap.from('.page-content', {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out'
      });
    }

    /* navbar pill – trigger after intro on home, immediately elsewhere */
    if (hasIntro) {
      window.addEventListener('introComplete', () => navbarAnim(0.1), { once: true });
    } else {
      navbarAnim(0.28);
    }

    pageTransitions();
    staticReveals();
    dynamicWatchers();
    cardHovers();
  }

  boot();


  /* ═══════════════════════════════════════════════════════════════
     1 · NAVBAR PILL  — expands from the center like  ( )  opening
     ═══════════════════════════════════════════════════════════════ */
  function navbarAnim(d) {
    /* main pill: clip-path collapses to a thin vertical strip,
       then fans out left and right */
    const pill = document.querySelector('.spotlight-nav');
    if (pill) {
      gsap.set(pill, { clipPath: 'inset(0 49% 0 49% round 22px)', opacity: 1 });
      gsap.to(pill, {
        clipPath: 'inset(0 0% 0 0% round 22px)',
        duration: 0.84,
        delay: d,
        ease: 'expo.out',
        onComplete() {
          /* remove clip so hover overlays work normally */
          pill.style.removeProperty('clip-path');
        }
      });
    }

    /* logo: override script.js timing, synced with pill */
    gsap.killTweensOf('.nav-logo img');
    gsap.set('.nav-logo img', { scale: 0.7, opacity: 0 });
    gsap.to('.nav-logo img', {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      delay: d + 0.5,
      ease: 'back.out(1.7)'
    });

    /* RN26 secondary pill: clips in from left edge (appears as if
       it detaches/cuts itself off from the main pill's expansion) */
    const rn = document.getElementById('rn26-pill');
    if (rn) {
      gsap.set(rn, {
        clipPath: 'inset(0 0 0 100% round 20px)',
        opacity: 1
      });
      gsap.to(rn, {
        clipPath: 'inset(0 0 0 0% round 20px)',
        duration: 0.5,
        delay: d + 0.62,
        ease: 'expo.out',
        onComplete() {
          rn.style.removeProperty('clip-path');
        }
      });
    }
  }


  /* ═══════════════════════════════════════════════════════════════
     2 · PAGE TRANSITIONS  — smooth fade + slight lift
     ═══════════════════════════════════════════════════════════════ */
  function pageTransitions() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      const href = a.getAttribute('href');
      /* skip external, anchors, mailto, javascript: */
      if (!href || /^(https?:|#|mailto:|javascript:)/.test(href)) return;
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        const dest = href;
        gsap.to('.page-content', {
          opacity: 0,
          y: -8,
          duration: 0.22,
          ease: 'power2.in',
          onComplete() { window.location.href = dest; }
        });
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     3 · STATIC REVEALS  — every element type gets a unique entry
     ═══════════════════════════════════════════════════════════════ */
  function staticReveals() {

    /* Page hero title — scales in from slightly smaller */
    whenIn('.page-title', function (el) {
      gsap.from(el, { scale: 0.86, opacity: 0, duration: 0.65, ease: 'expo.out' });
    });

    /* ── CALENDAR: unfolds from the top-left corner outward ── */
    whenIn('.calendar-container', function (el) {
      gsap.set(el, { clipPath: 'inset(0 100% 100% 0 round 20px)' });
      gsap.to(el, {
        clipPath: 'inset(0 0% 0% 0 round 20px)',
        duration: 0.78,
        ease: 'expo.out'
      });
    }, 'top 80%');

    /* ── CONTACT: form sweeps in from left, card from right ── */
    whenIn('.contact-form-div', function (el) {
      gsap.set(el, { clipPath: 'inset(0 100% 0 0 round 20px)' });
      gsap.to(el, {
        clipPath: 'inset(0 0% 0 0 round 20px)',
        duration: 0.72,
        ease: 'expo.out'
      });
    });
    whenIn('.contact-right-card', function (el) {
      gsap.set(el, { clipPath: 'inset(0 0 0 100% round 20px)' });
      gsap.to(el, {
        clipPath: 'inset(0 0 0 0% round 20px)',
        duration: 0.72,
        delay: 0.08,
        ease: 'expo.out'
      });
    });

    /* ── REGISTER cards: clip in from bottom, one by one ── */
    document.querySelectorAll('.reg-card').forEach(function (el) {
      whenIn(el, function () {
        gsap.set(el, { clipPath: 'inset(0 0 100% 0 round 20px)' });
        gsap.to(el, {
          clipPath: 'inset(0 0 0% 0 round 20px)',
          duration: 0.66,
          ease: 'expo.out'
        });
      }, 'top 88%');
    });

    /* Register info sidebar cards — slide from right, staggered */
    document.querySelectorAll('.reg-info-card').forEach(function (el, i) {
      whenIn(el, function () {
        gsap.from(el, {
          x: 28,
          opacity: 0,
          duration: 0.52,
          delay: i * 0.07,
          ease: 'power3.out'
        });
      }, 'top 90%');
    });

    /* Grade chips — pop in with back-easing, staggered */
    batchPop('.grade-chip label', 'back.out(2.2)', 0.055);

    /* Event chips — pop in slightly springier */
    batchPop('.event-chip label', 'back.out(2.8)', 0.06);

    /* Submit button — scale up from slightly smaller */
    whenIn('.reg-submit-btn', function (el) {
      gsap.from(el, {
        scale: 0.88,
        opacity: 0,
        duration: 0.42,
        ease: 'back.out(1.8)'
      });
    }, 'top 96%');

    /* Filter buttons (projects page) — stagger slide-up */
    var filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length) {
      gsap.set(filterBtns, { y: 20, opacity: 0 });
      gsap.to(filterBtns, {
        y: 0,
        opacity: 1,
        duration: 0.42,
        delay: 0.2,
        stagger: 0.06,
        ease: 'power3.out'
      });
    }

    /* Events page column titles */
    whenIn('.events-upcoming-col h2', function (el) {
      gsap.from(el, { x: -24, opacity: 0, duration: 0.5, ease: 'power3.out' });
    });
    whenIn('.past-events-section h2', function (el) {
      gsap.from(el, { x: -24, opacity: 0, duration: 0.5, ease: 'power3.out' });
    });

    /* Member blocks on register page — slide up */
    var memberBlocks = document.querySelectorAll('.member-block');
    if (memberBlocks.length) {
      memberBlocks.forEach(function (el, i) {
        whenIn(el, function () {
          gsap.from(el, { y: 22, opacity: 0, duration: 0.48, delay: i * 0.09, ease: 'power3.out' });
        }, 'top 90%');
      });
    }

    /* About section details — slide from left */
    whenIn('.about-details', function (el) {
      /* only animate if script.js hasn't already (no reveal class or already played) */
      gsap.from(el.querySelector('.about-heading'), {
        x: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    });

    /* Footer — clip up from the very bottom */
    whenIn('.footer', function (el) {
      gsap.set(el, { clipPath: 'inset(100% 0 0 0)' });
      gsap.to(el, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 0.52,
        ease: 'power3.out'
      });
    }, 'top 97%');

    /* Reg hero text */
    var regHero = document.querySelector('.reg-hero');
    if (regHero) {
      var regHeroEls = regHero.querySelectorAll('.event-year, .page-title, .hero-subtitle');
      gsap.from(regHeroEls, {
        y: 18,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.15,
        ease: 'power3.out'
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
      var fromX = i % 2 === 0 ? -28 : 28;
      gsap.set(el, { x: fromX, opacity: 0 });
      whenIn(el, function () {
        gsap.to(el, {
          x: 0,
          opacity: 1,
          duration: 0.56,
          delay: (i % 4) * 0.065,
          ease: 'power3.out'
        });
      }, 'top 90%');
      tilt(el, 7);
    });
  }

  /* Alumni cards — scale up from below */
  function animateAlumni(c) {
    c.querySelectorAll('.alumni-card').forEach(function (el, i) {
      gsap.set(el, { y: 30, opacity: 0, scale: 0.96 });
      whenIn(el, function () {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.62,
          delay: i * 0.085,
          ease: 'power3.out'
        });
      }, 'top 90%');
    });
  }

  /* Project cards — clip down from top */
  function animateProjects(c) {
    c.querySelectorAll('.project-card').forEach(function (el, i) {
      gsap.set(el, { clipPath: 'inset(0 0 100% 0 round 20px)' });
      whenIn(el, function () {
        gsap.to(el, {
          clipPath: 'inset(0 0 0% 0 round 20px)',
          duration: 0.62,
          delay: (i % 3) * 0.09,
          ease: 'expo.out'
        });
      }, 'top 88%');
      tilt(el, 6);
    });
  }

  /* Upcoming event cards — slide from left */
  function animateUpcoming(c) {
    c.querySelectorAll('.event-list-card').forEach(function (el, i) {
      gsap.set(el, { x: -36, opacity: 0 });
      whenIn(el, function () {
        gsap.to(el, {
          x: 0,
          opacity: 1,
          duration: 0.55,
          delay: i * 0.1,
          ease: 'power3.out'
        });
      }, 'top 88%');
    });
  }

  /* Past event grid cards — pop up with subtle spring */
  function animatePast(c) {
    c.querySelectorAll('.past-event-grid-card').forEach(function (el, i) {
      gsap.set(el, { y: 24, opacity: 0, scale: 0.97 });
      whenIn(el, function () {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.46,
          delay: (i % 3) * 0.08,
          ease: 'back.out(1.5)'
        });
      }, 'top 90%');
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     5 · 3-D HOVER TILT  — subtle per-card depth on hover
         (element-relative, not a global cursor effect)
     ═══════════════════════════════════════════════════════════════ */
  function cardHovers() {
    /* Apply to static cards that exist at load time */
    ['.reg-info-card', '.alumni-card'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { tilt(el, 6); });
    });
    /* team / project cards are handled inside animateTeam / animateProjects */
  }

  /**
   * Add a gentle 3-D tilt response to mouse position over an element.
   * @param {Element} el
   * @param {number} strength  max rotation in degrees (default 7)
   */
  function tilt(el, strength) {
    strength = strength || 7;
    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width - 0.5) * strength;
      var y = ((e.clientY - r.top) / r.height - 0.5) * -strength;
      gsap.to(el, {
        rotationY: x,
        rotationX: y,
        transformPerspective: 900,
        duration: 0.35,
        ease: 'power2.out'
      });
    });
    el.addEventListener('mouseleave', function () {
      gsap.to(el, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.7,
        ease: 'expo.out'
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     UTILITIES
     ═══════════════════════════════════════════════════════════════ */

  /**
   * Fire cb(el) once when el enters the viewport.
   * @param {string|Element} target  CSS selector or element
   * @param {function} cb
   * @param {string} [start]  ScrollTrigger start string
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
   * Batch: set all matching elements to scale 0 / opacity 0,
   * then spring-pop them in together when the first enters view.
   */
  function batchPop(selector, ease, stagger, start) {
    start = start || 'top 90%';
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.set(els, { scale: 0, opacity: 0 });
    ScrollTrigger.create({
      trigger: els[0],
      start: start,
      once: true,
      onEnter: function () {
        gsap.to(els, {
          scale: 1,
          opacity: 1,
          duration: 0.38,
          stagger: stagger,
          ease: ease
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