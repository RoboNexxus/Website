/**
 * Robo Nexus — Animation System v3  (Cinematic Edition)
 *
 * Same style as landing-intro.js:
 *   - Multi-phase GSAP timelines with overlapping phases
 *   - Long expo.out / expo.inOut durations for that cinematic weight
 *   - Breathing glow pulses (sine.inOut + yoyo)
 *   - Everything GPU-only: transform + opacity + filter (no clip-path)
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
      gsap.set('.page-content', { opacity: 0, y: 16 });
      gsap.to('.page-content', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'expo.out'
      });
    }

    /* navbar: cinematic sequence */
    if (hasIntro) {
      window.addEventListener('introComplete', function () {
        navbarCinematic(0.1);
      }, { once: true });
    } else {
      navbarCinematic(0.3);
    }

    pageTransitions();
    staticReveals();
    dynamicWatchers();
    cardHovers();
  }

  boot();


  /* ═══════════════════════════════════════════════════════════════════
     1 · NAVBAR — CINEMATIC MULTI-PHASE TIMELINE
     ─────────────────────────────────────────────────────────────────
     Phase 1: Tiny pill drops from above          (expo.out, 1.2s)
     Phase 2: Pill expands left+right to full     (expo.inOut, 1.4s)
     Phase 3: Logo fades in + breathes glow       (sine.inOut, yoyo)
     Phase 4: Nav links stagger in                (power2.out, 0.8s)
     Phase 5: RN26 pill "cuts" out from right     (expo.out, 0.9s)
     ═══════════════════════════════════════════════════════════════════ */
  function navbarCinematic(baseDelay) {
    var pill = document.querySelector('.spotlight-nav');
    var navLogo = document.querySelector('.nav-logo img');
    var navLinks = document.querySelectorAll('.nav-links');
    var rn26 = document.getElementById('rn26-pill');

    /* kill any earlier script.js tweens on these */
    if (pill) gsap.killTweensOf(pill);
    if (navLogo) gsap.killTweensOf(navLogo);
    if (navLinks.length) gsap.killTweensOf(navLinks);

    var tl = gsap.timeline({ delay: baseDelay });

    /* ── Phase 1: pill drops in as a tiny dot from above ── */
    if (pill) {
      gsap.set(pill, {
        opacity: 0,
        y: -60,
        scaleX: 0.08,
        scaleY: 0.7,
        transformOrigin: 'center center'
      });
      /* hide nav link text during pill expansion */
      gsap.set(navLinks, { opacity: 0 });

      tl.to(pill, {
        opacity: 1,
        y: 0,
        scaleY: 1,
        duration: 1.2,
        ease: 'expo.out'
      });

      /* ── Phase 2: expand horizontally () → (          ) ── */
      tl.to(pill, {
        scaleX: 1,
        duration: 1.4,
        ease: 'expo.inOut'
      }, '-=0.3');
    }

    /* ── Phase 3: logo drops in + breathes with glow ── */
    if (navLogo) {
      gsap.set(navLogo, { opacity: 0, y: -30, scale: 0.6 });

      tl.to(navLogo, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'expo.out'
      }, '-=0.9');

      /* breathing glow pulse — same style as intro logo */
      tl.to(navLogo, {
        filter: 'drop-shadow(0 0 25px rgba(71, 160, 184, 0.8))',
        scale: 1.06,
        duration: 0.8,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut'
      }, '-=0.4');
    }

    /* ── Phase 4: nav links stagger in ── */
    if (navLinks.length) {
      tl.to(navLinks, {
        opacity: 1,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power2.out'
      }, '-=1.2');
    }

    /* ── Phase 5: RN26 pill cuts itself out from the right edge ── */
    if (rn26) {
      gsap.set(rn26, {
        opacity: 0,
        x: -20,
        scaleX: 0,
        transformOrigin: 'left center'
      });

      tl.to(rn26, {
        opacity: 1,
        x: 0,
        scaleX: 1,
        duration: 0.9,
        ease: 'expo.out'
      }, '-=0.6');

      /* tiny glow flash on the RN26 dot */
      var rn26Dot = rn26.querySelector('.rn26-dot');
      if (rn26Dot) {
        tl.fromTo(rn26Dot, {
          boxShadow: '0 0 0px rgba(71, 160, 184, 0)'
        }, {
          boxShadow: '0 0 14px rgba(71, 160, 184, 0.9)',
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut'
        }, '-=0.5');
      }
    }
  }


  /* ═══════════════════════════════════════════════════════════════════
     2 · PAGE TRANSITIONS — cinematic exit
     ═══════════════════════════════════════════════════════════════════ */
  function pageTransitions() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || /^(https?:|#|mailto:|javascript:)/.test(href)) return;
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        var dest = href;

        var exitTl = gsap.timeline({
          onComplete: function () { window.location.href = dest; }
        });

        /* navbar shrinks back */
        var pill = document.querySelector('.spotlight-nav');
        if (pill) {
          exitTl.to(pill, {
            scaleX: 0.08,
            opacity: 0,
            y: -30,
            duration: 0.5,
            ease: 'power2.in'
          }, 0);
        }

        /* page content fades + lifts */
        exitTl.to('.page-content', {
          opacity: 0,
          y: -20,
          duration: 0.5,
          ease: 'power2.in'
        }, 0);
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════════
     3 · STATIC REVEALS — cinematic scroll entrance animations
         Each section type gets its own multi-part reveal
     ═══════════════════════════════════════════════════════════════════ */
  function staticReveals() {

    /* ── Page hero title: rises + scales with glow pulse ── */
    whenIn('.page-hero', function (el) {
      var title = el.querySelector('.glitch-text, .page-title');
      var subtitle = el.querySelector('.hero-subtitle');
      var heroTl = gsap.timeline();

      if (title) {
        gsap.set(title, { opacity: 0, y: 40, scale: 0.9 });
        heroTl.to(title, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.4,
          ease: 'expo.out'
        });
      }
      if (subtitle) {
        gsap.set(subtitle, { opacity: 0, y: 20 });
        heroTl.to(subtitle, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out'
        }, '-=0.8');
      }
    }, 'top 90%');

    /* ── Calendar: rises with gentle rotation ── */
    whenIn('.calendar-container', function (el) {
      gsap.set(el, { opacity: 0, y: 60, rotationX: 8 });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        transformPerspective: 800,
        duration: 1.6,
        ease: 'expo.out'
      });
    }, 'top 80%');

    /* ── Contact: form sweeps from left, card from right ── */
    whenIn('.contact-form-div', function (el) {
      gsap.set(el, { opacity: 0, x: -60 });
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 1.4,
        ease: 'expo.out'
      });
    });
    whenIn('.contact-right-card', function (el) {
      gsap.set(el, { opacity: 0, x: 60 });
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 1.4,
        delay: 0.15,
        ease: 'expo.out'
      });
    });

    /* ── Register cards: rise up with stagger ── */
    document.querySelectorAll('.reg-card').forEach(function (el, i) {
      whenIn(el, function () {
        gsap.set(el, { opacity: 0, y: 60, rotationX: 5 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          transformPerspective: 800,
          duration: 1.2,
          delay: i * 0.1,
          ease: 'expo.out'
        });
      }, 'top 88%');
    });

    /* Register info sidebar cards ── */
    document.querySelectorAll('.reg-info-card').forEach(function (el, i) {
      whenIn(el, function () {
        gsap.set(el, { opacity: 0, x: 40 });
        gsap.to(el, {
          opacity: 1,
          x: 0,
          duration: 1,
          delay: i * 0.1,
          ease: 'expo.out'
        });
      }, 'top 90%');
    });

    /* Grade & event chips — scale up with spring feel */
    batchReveal('.grade-chip label', 0.06);
    batchReveal('.event-chip label', 0.07);

    /* Submit button */
    whenIn('.reg-submit-btn', function (el) {
      gsap.set(el, { opacity: 0, scale: 0.85 });
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'expo.out'
      });
    }, 'top 96%');

    /* Filter buttons (projects page) */
    var filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length) {
      gsap.set(filterBtns, { y: 30, opacity: 0 });
      gsap.to(filterBtns, {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.2,
        stagger: 0.08,
        ease: 'expo.out'
      });
    }

    /* Events page titles */
    whenIn('.events-upcoming-col h2', function (el) {
      gsap.set(el, { opacity: 0, x: -30 });
      gsap.to(el, { opacity: 1, x: 0, duration: 1.2, ease: 'expo.out' });
    });
    whenIn('.past-events-section h2', function (el) {
      gsap.set(el, { opacity: 0, x: -30 });
      gsap.to(el, { opacity: 1, x: 0, duration: 1.2, ease: 'expo.out' });
    });

    /* Member blocks on register page */
    document.querySelectorAll('.member-block').forEach(function (el, i) {
      whenIn(el, function () {
        gsap.set(el, { opacity: 0, y: 30 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: i * 0.12,
          ease: 'expo.out'
        });
      }, 'top 90%');
    });

    /* About section heading */
    whenIn('.about-details', function (el) {
      var heading = el.querySelector('.about-heading');
      if (heading) {
        gsap.set(heading, { opacity: 0, x: -30 });
        gsap.to(heading, {
          opacity: 1,
          x: 0,
          duration: 1.4,
          ease: 'expo.out'
        });
      }
    });

    /* Stats cards with glow flash */
    document.querySelectorAll('.stat-card').forEach(function (el, i) {
      whenIn(el, function () {
        var statTl = gsap.timeline();
        gsap.set(el, { opacity: 0, y: 40, scale: 0.95 });
        statTl.to(el, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          delay: i * 0.1,
          ease: 'expo.out'
        });
        /* brief glow pulse after landing */
        statTl.to(el, {
          boxShadow: '0 0 30px rgba(71, 160, 184, 0.4)',
          duration: 0.6,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut'
        }, '-=0.2');
      }, 'top 85%');
    });

    /* Footer — gentle rise */
    whenIn('.footer', function (el) {
      gsap.set(el, { opacity: 0, y: 20 });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out'
      });
    }, 'top 97%');

    /* Register hero text */
    var regHero = document.querySelector('.reg-hero');
    if (regHero) {
      var regEls = regHero.querySelectorAll('.event-year, .page-title, .hero-subtitle');
      gsap.set(regEls, { opacity: 0, y: 30 });
      gsap.to(regEls, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.15,
        delay: 0.2,
        ease: 'expo.out'
      });
    }
  }


  /* ═══════════════════════════════════════════════════════════════════
     4 · DYNAMIC CONTENT — cinematic entrances for injected content
     ═══════════════════════════════════════════════════════════════════ */
  function dynamicWatchers() {
    watch('#team-container', animateTeam);
    watch('#alumni-container', animateAlumni);
    watch('#projects-grid', animateProjects);
    watch('#upcoming-events', animateUpcoming);
    watch('#past-events', animatePast);
  }

  /* Team cards — alternate left / right slide with slow-mo feel */
  function animateTeam(c) {
    c.querySelectorAll('.team-card').forEach(function (el, i) {
      var fromX = i % 2 === 0 ? -50 : 50;
      gsap.set(el, { opacity: 0, x: fromX, rotationY: fromX > 0 ? -8 : 8 });
      whenIn(el, function () {
        gsap.to(el, {
          opacity: 1,
          x: 0,
          rotationY: 0,
          transformPerspective: 800,
          duration: 1.4,
          delay: (i % 4) * 0.08,
          ease: 'expo.out'
        });
      }, 'top 90%');
      tilt(el, 5);
    });
  }

  /* Alumni cards — rise with subtle 3D rotation */
  function animateAlumni(c) {
    c.querySelectorAll('.alumni-card').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 50, scale: 0.95 });
      whenIn(el, function () {
        var alTl = gsap.timeline();
        alTl.to(el, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          delay: i * 0.1,
          ease: 'expo.out'
        });
        /* subtle medal glow after card lands */
        var badge = el.querySelector('.alumni-badge');
        if (badge) {
          alTl.to(badge, {
            filter: 'drop-shadow(0 0 12px rgba(71, 160, 184, 0.8))',
            duration: 0.6,
            yoyo: true,
            repeat: 1,
            ease: 'sine.inOut'
          }, '-=0.3');
        }
      }, 'top 90%');
      tilt(el, 4);
    });
  }

  /* Project cards — slide up with 3D perspective tilt */
  function animateProjects(c) {
    c.querySelectorAll('.project-card').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 60, rotationX: 6 });
      whenIn(el, function () {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          transformPerspective: 800,
          duration: 1.4,
          delay: (i % 3) * 0.1,
          ease: 'expo.out'
        });
      }, 'top 88%');
      tilt(el, 5);
    });
  }

  /* Upcoming event cards — cinematic slide from left */
  function animateUpcoming(c) {
    c.querySelectorAll('.event-list-card').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, x: -50 });
      whenIn(el, function () {
        gsap.to(el, {
          opacity: 1,
          x: 0,
          duration: 1.2,
          delay: i * 0.12,
          ease: 'expo.out'
        });
      }, 'top 88%');
    });
  }

  /* Past event cards — pop up with glow */
  function animatePast(c) {
    c.querySelectorAll('.past-event-grid-card').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 40, scale: 0.96 });
      whenIn(el, function () {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          delay: (i % 3) * 0.1,
          ease: 'expo.out'
        });
      }, 'top 90%');
    });
  }


  /* ═══════════════════════════════════════════════════════════════════
     5 · 3-D HOVER TILT — rAF-throttled, silky smooth
     ═══════════════════════════════════════════════════════════════════ */
  function cardHovers() {
    ['.reg-info-card', '.stat-card'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { tilt(el, 4); });
    });
  }

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
            duration: 0.8,
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
        duration: 1.2,
        ease: 'expo.out'
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════════
     UTILITIES
     ═══════════════════════════════════════════════════════════════════ */

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

  function batchReveal(selector, stagger, start) {
    start = start || 'top 90%';
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.set(els, { scale: 0.7, opacity: 0 });
    ScrollTrigger.create({
      trigger: els[0],
      start: start,
      once: true,
      onEnter: function () {
        gsap.to(els, {
          scale: 1,
          opacity: 1,
          duration: 0.9,
          stagger: stagger,
          ease: 'expo.out'
        });
      }
    });
  }

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