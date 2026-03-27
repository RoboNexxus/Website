/**
 * Robo Nexus — Animation System v3  (Cinematic Edition)
 *
 * Navbar: clip-path LEFT-TO-RIGHT expansion → cuts itself → RN26 pill appears.
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

    /* navbar cinematic sequence */
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
     1 · NAVBAR — LEFT-TO-RIGHT EXPANSION + CUT EFFECT
     ─────────────────────────────────────────────────────────────────
     Phase 1: Logo fades in softly
     Phase 2: Main pill expands LEFT → RIGHT via clip-path
              (pill is initially wider, covering the RN26 area too)
     Phase 3: Nav links fade in, staggered
     Phase 4: Pill "cuts" — shrinks from right to its real width,
              and simultaneously the RN26 pill appears at the cut point
     Phase 5: Logo gets a subtle breathing glow
     ═══════════════════════════════════════════════════════════════════ */
  function navbarCinematic(baseDelay) {
    var pill = document.querySelector('.spotlight-nav');
    var navContainer = document.querySelector('.spotlight-nav-container');
    var navLogo = document.querySelector('.nav-logo img');
    var navLinks = document.querySelectorAll('.nav-links');
    var rn26 = document.getElementById('rn26-pill');

    /* kill earlier script.js tweens */
    if (pill) gsap.killTweensOf(pill);
    if (navLogo) gsap.killTweensOf(navLogo);
    if (navLinks.length) gsap.killTweensOf(navLinks);

    var tl = gsap.timeline({ delay: baseDelay });

    /* ── Phase 1: Logo fades in ── */
    if (navLogo) {
      gsap.set(navLogo, { opacity: 0, scale: 0.7 });
      tl.to(navLogo, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'expo.out'
      });
    }

    /* ── Phase 2: Pill expands LEFT → RIGHT ── */
    if (pill) {
      pill.style.willChange = 'clip-path';

      /* hide links initially */
      gsap.set(navLinks, { opacity: 0 });
      /* ensure pill is visible but clipped from the right */
      gsap.set(pill, { opacity: 1 });

      /* If RN26 exists, temporarily hide it — it will appear from the "cut" */
      if (rn26) {
        gsap.set(rn26, { opacity: 0, scaleX: 0, transformOrigin: 'left center' });
      }

      /*
       * THE EXPANSION:
       * Start: only leftmost 2% visible (a tiny sliver)
       * End: expands rightward to 100%
       *
       * If an RN26 pill exists, the main pill briefly overshoots
       * to cover the RN26 area (we handle this with margin-right
       * manipulation), then retracts = the "cut".
       */
      gsap.set(pill, { clipPath: 'inset(0 100% 0 0 round 22px)' });

      tl.to(pill, {
        clipPath: 'inset(0 0% 0 0 round 22px)',
        duration: 1.6,
        ease: 'expo.inOut'
      }, '-=0.5');

      /* ── Phase 3: Nav links stagger in during expansion ── */
      tl.to(navLinks, {
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power2.out'
      }, '-=0.8');

      /* Clean up will-change after expansion completes */
      tl.add(function () {
        pill.style.willChange = 'auto';
        pill.style.clipPath = '';
      });
    }

    /* ── Phase 4: THE CUT — RN26 pill separates out ── */
    if (rn26) {
      tl.to(rn26, {
        opacity: 1,
        scaleX: 1,
        duration: 0.9,
        ease: 'expo.out'
      }, '-=0.3');

      /* Tiny glow flash on appearance */
      var rn26Dot = rn26.querySelector('.rn26-dot');
      if (rn26Dot) {
        tl.fromTo(rn26Dot, {
          boxShadow: '0 0 0px rgba(71, 160, 184, 0)'
        }, {
          boxShadow: '0 0 16px rgba(71, 160, 184, 0.9)',
          duration: 0.6,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut'
        }, '-=0.6');
      }
    }

    /* ── Phase 5: Logo breathes with glow ── */
    if (navLogo) {
      tl.to(navLogo, {
        filter: 'drop-shadow(0 0 20px rgba(71, 160, 184, 0.7))',
        scale: 1.04,
        duration: 0.8,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut'
      }, '-=1.2');
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

        /* pill clips back to the left */
        var pill = document.querySelector('.spotlight-nav');
        if (pill) {
          pill.style.willChange = 'clip-path';
          exitTl.to(pill, {
            clipPath: 'inset(0 100% 0 0 round 22px)',
            duration: 0.4,
            ease: 'power2.in'
          }, 0);
        }

        /* RN26 shrinks back */
        var rn26 = document.getElementById('rn26-pill');
        if (rn26) {
          exitTl.to(rn26, {
            scaleX: 0,
            opacity: 0,
            transformOrigin: 'left center',
            duration: 0.3,
            ease: 'power2.in'
          }, 0);
        }

        /* page content fades */
        exitTl.to('.page-content', {
          opacity: 0,
          y: -15,
          duration: 0.45,
          ease: 'power2.in'
        }, 0);
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════════
     3 · STATIC REVEALS — cinematic scroll entrances
     ═══════════════════════════════════════════════════════════════════ */
  function staticReveals() {

    /* Page hero title + subtitle */
    whenIn('.page-hero', function (el) {
      var title = el.querySelector('.glitch-text, .page-title');
      var subtitle = el.querySelector('.hero-subtitle');
      var heroTl = gsap.timeline();

      if (title) {
        gsap.set(title, { opacity: 0, y: 40, scale: 0.92 });
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

    /* Calendar */
    whenIn('.calendar-container', function (el) {
      gsap.set(el, { opacity: 0, y: 50, rotationX: 6 });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        transformPerspective: 800,
        duration: 1.6,
        ease: 'expo.out'
      });
    }, 'top 80%');

    /* Contact: form from left, card from right */
    whenIn('.contact-form-div', function (el) {
      gsap.set(el, { opacity: 0, x: -60 });
      gsap.to(el, { opacity: 1, x: 0, duration: 1.4, ease: 'expo.out' });
    });
    whenIn('.contact-right-card', function (el) {
      gsap.set(el, { opacity: 0, x: 60 });
      gsap.to(el, { opacity: 1, x: 0, duration: 1.4, delay: 0.15, ease: 'expo.out' });
    });

    /* Register cards */
    document.querySelectorAll('.reg-card').forEach(function (el, i) {
      whenIn(el, function () {
        gsap.set(el, { opacity: 0, y: 60, rotationX: 4 });
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

    /* Register info sidebar cards */
    document.querySelectorAll('.reg-info-card').forEach(function (el, i) {
      whenIn(el, function () {
        gsap.set(el, { opacity: 0, x: 40 });
        gsap.to(el, { opacity: 1, x: 0, duration: 1, delay: i * 0.1, ease: 'expo.out' });
      }, 'top 90%');
    });

    /* Chips */
    batchReveal('.grade-chip label', 0.06);
    batchReveal('.event-chip label', 0.07);

    /* Submit button */
    whenIn('.reg-submit-btn', function (el) {
      gsap.set(el, { opacity: 0, scale: 0.85 });
      gsap.to(el, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' });
    }, 'top 96%');

    /* Filter buttons */
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

    /* Event page titles */
    whenIn('.events-upcoming-col h2', function (el) {
      gsap.set(el, { opacity: 0, x: -30 });
      gsap.to(el, { opacity: 1, x: 0, duration: 1.2, ease: 'expo.out' });
    });
    whenIn('.past-events-section h2', function (el) {
      gsap.set(el, { opacity: 0, x: -30 });
      gsap.to(el, { opacity: 1, x: 0, duration: 1.2, ease: 'expo.out' });
    });

    /* Member blocks */
    document.querySelectorAll('.member-block').forEach(function (el, i) {
      whenIn(el, function () {
        gsap.set(el, { opacity: 0, y: 30 });
        gsap.to(el, { opacity: 1, y: 0, duration: 1, delay: i * 0.12, ease: 'expo.out' });
      }, 'top 90%');
    });

    /* About heading */
    whenIn('.about-details', function (el) {
      var heading = el.querySelector('.about-heading');
      if (heading) {
        gsap.set(heading, { opacity: 0, x: -30 });
        gsap.to(heading, { opacity: 1, x: 0, duration: 1.4, ease: 'expo.out' });
      }
    });

    /* Stats with glow pulse */
    document.querySelectorAll('.stat-card').forEach(function (el, i) {
      whenIn(el, function () {
        var stTl = gsap.timeline();
        gsap.set(el, { opacity: 0, y: 40, scale: 0.95 });
        stTl.to(el, {
          opacity: 1, y: 0, scale: 1,
          duration: 1, delay: i * 0.1, ease: 'expo.out'
        });
        stTl.to(el, {
          boxShadow: '0 0 30px rgba(71, 160, 184, 0.4)',
          duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut'
        }, '-=0.2');
      }, 'top 85%');
    });

    /* Footer */
    whenIn('.footer', function (el) {
      gsap.set(el, { opacity: 0, y: 20 });
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' });
    }, 'top 97%');

    /* Register hero */
    var regHero = document.querySelector('.reg-hero');
    if (regHero) {
      var regEls = regHero.querySelectorAll('.event-year, .page-title, .hero-subtitle');
      gsap.set(regEls, { opacity: 0, y: 30 });
      gsap.to(regEls, {
        opacity: 1, y: 0,
        duration: 1.2, stagger: 0.15, delay: 0.2, ease: 'expo.out'
      });
    }
  }


  /* ═══════════════════════════════════════════════════════════════════
     4 · DYNAMIC CONTENT
     ═══════════════════════════════════════════════════════════════════ */
  function dynamicWatchers() {
    watch('#team-container', animateTeam);
    watch('#alumni-container', animateAlumni);
    watch('#projects-grid', animateProjects);
    watch('#upcoming-events', animateUpcoming);
    watch('#past-events', animatePast);
  }

  function animateTeam(c) {
    c.querySelectorAll('.team-card').forEach(function (el, i) {
      var fromX = i % 2 === 0 ? -50 : 50;
      gsap.set(el, { opacity: 0, x: fromX, rotationY: fromX > 0 ? -6 : 6 });
      whenIn(el, function () {
        gsap.to(el, {
          opacity: 1, x: 0, rotationY: 0,
          transformPerspective: 800,
          duration: 1.4, delay: (i % 4) * 0.08, ease: 'expo.out'
        });
      }, 'top 90%');
      tilt(el, 5);
    });
  }

  function animateAlumni(c) {
    c.querySelectorAll('.alumni-card').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 50, scale: 0.95 });
      whenIn(el, function () {
        var alTl = gsap.timeline();
        alTl.to(el, {
          opacity: 1, y: 0, scale: 1,
          duration: 1.2, delay: i * 0.1, ease: 'expo.out'
        });
        var badge = el.querySelector('.alumni-badge');
        if (badge) {
          alTl.to(badge, {
            filter: 'drop-shadow(0 0 12px rgba(71, 160, 184, 0.8))',
            duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut'
          }, '-=0.3');
        }
      }, 'top 90%');
      tilt(el, 4);
    });
  }

  function animateProjects(c) {
    c.querySelectorAll('.project-card').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 60, rotationX: 5 });
      whenIn(el, function () {
        gsap.to(el, {
          opacity: 1, y: 0, rotationX: 0,
          transformPerspective: 800,
          duration: 1.4, delay: (i % 3) * 0.1, ease: 'expo.out'
        });
      }, 'top 88%');
      tilt(el, 5);
    });
  }

  function animateUpcoming(c) {
    c.querySelectorAll('.event-list-card').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, x: -50 });
      whenIn(el, function () {
        gsap.to(el, {
          opacity: 1, x: 0,
          duration: 1.2, delay: i * 0.12, ease: 'expo.out'
        });
      }, 'top 88%');
    });
  }

  function animatePast(c) {
    c.querySelectorAll('.past-event-grid-card').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 40, scale: 0.96 });
      whenIn(el, function () {
        gsap.to(el, {
          opacity: 1, y: 0, scale: 1,
          duration: 1, delay: (i % 3) * 0.1, ease: 'expo.out'
        });
      }, 'top 90%');
    });
  }


  /* ═══════════════════════════════════════════════════════════════════
     5 · 3-D HOVER TILT — rAF-throttled
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
          scale: 1, opacity: 1,
          duration: 0.9, stagger: stagger, ease: 'expo.out'
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