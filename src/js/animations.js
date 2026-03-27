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

    /* navbar cinematic sequence ONLY on landing page */
    if (hasIntro) {
      /* start animation the exact moment the landing logo begins gliding */
      window.addEventListener('introGlideStart', function () {
        navbarCinematic(0);
      }, { once: true });
    } else {
      /* inner pages: no animation, just make sure navbar is visible immediately */
      gsap.set('.spotlight-nav', { opacity: 1 });
      gsap.set('.nav-links', { opacity: 1, y: 0 });
      gsap.set('.nav-logo img', { opacity: 1, y: 0, scale: 1 });
      if (document.getElementById('rn26-pill')) {
        gsap.set('#rn26-pill', { opacity: 1, scaleX: 1, x: 0 });
      }
    }

    pageTransitions();
    staticReveals();
    dynamicWatchers();
    cardHovers();
  }

  boot();


  /* ═══════════════════════════════════════════════════════════════════
     1 · NAVBAR — ORGANIC, LIVING ANIMATION
     ─────────────────────────────────────────────────────────────────
     Nothing moves in a straight line. Everything wobbles, overshoots,
     breathes, and settles — like the landing intro logo.
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

    /* ── LOGO: on landing page, logo is handled mostly by landing-intro.js 
       but we add the final breathing effect here ── */
    if (navLogo) {
      /* overshoot settle to catch the logo right as landing-intro finishes */
      tl.fromTo(navLogo, { y: -4, scale: 1.07 }, {
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'sine.inOut'
      }, 1.2); /* starts near the end of the glide */
    }

    /* ── PILL: left-to-right clip expansion WITH y-wobble ── */
    if (pill) {
      pill.style.willChange = 'clip-path, transform';

      /* hide links initially — they'll slide in later */
      gsap.set(navLinks, { opacity: 0, y: 8 });
      gsap.set(pill, { opacity: 1, y: -15 });

      if (rn26) {
        gsap.set(rn26, { opacity: 0, x: -15, scaleX: 0, transformOrigin: 'left center' });
      }

      gsap.set(pill, { clipPath: 'inset(0 100% 0 0 round 22px)' });

      /* pill drops down to position while expanding — starts immediately */
      tl.to(pill, {
        y: 0,
        duration: 0.8,
        ease: 'expo.out'
      }, 0);

      /* THE EXPANSION: left → right, long and cinematic */
      tl.to(pill, {
        clipPath: 'inset(0 0% 0 0 round 22px)',
        duration: 2,
        ease: 'expo.inOut'
      }, '-=0.8');

      /* WOBBLE during expansion — pill breathes on Y axis
         (small drift up, then back, like it's floating into place) */
      tl.to(pill, {
        y: -3,
        duration: 0.6,
        ease: 'sine.inOut'
      }, '-=1.6');
      tl.to(pill, {
        y: 2,
        duration: 0.5,
        ease: 'sine.inOut'
      }, '-=1.0');
      tl.to(pill, {
        y: 0,
        duration: 0.7,
        ease: 'sine.inOut'
      }, '-=0.5');

      /* ── NAV LINKS: slide up from below + fade, staggered ── */
      tl.to(navLinks, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.06,
        ease: 'expo.out'
      }, '-=1.2');

      /* pill STRETCHES past its width — rubber band effect */
      tl.to(pill, {
        scaleX: 1.07,
        duration: 0.35,
        ease: 'sine.out'
      }, '-=0.4');
      /* BOUNCE BACK — snaps to rest like a rubber band */
      tl.to(pill, {
        scaleX: 0.99,
        duration: 0.25,
        ease: 'sine.in'
      });
      tl.to(pill, {
        scaleX: 1.02,
        duration: 0.2,
        ease: 'sine.out'
      });
      tl.to(pill, {
        scaleX: 1,
        duration: 0.4,
        ease: 'sine.inOut'
      });

      /* clean up */
      tl.add(function () {
        pill.style.willChange = 'auto';
        pill.style.clipPath = '';
      });
    }

    /* ── THE CUT: RN26 separates out with recoil ── */
    if (rn26) {
      /* slides out from the pill's right edge */
      tl.to(rn26, {
        opacity: 1,
        x: 0,
        scaleX: 1,
        duration: 1.2,
        ease: 'expo.out'
      }, '-=0.8');

      /* RECOIL: overshoots to the right, then settles back */
      tl.to(rn26, {
        x: 6,
        duration: 0.35,
        ease: 'sine.out'
      }, '-=0.3');
      tl.to(rn26, {
        x: 0,
        duration: 0.6,
        ease: 'sine.inOut'
      });

      /* RN26 dot glow pulse — breathes twice */
      var rn26Dot = rn26.querySelector('.rn26-dot');
      if (rn26Dot) {
        tl.fromTo(rn26Dot, {
          boxShadow: '0 0 0px rgba(71, 160, 184, 0)'
        }, {
          boxShadow: '0 0 18px rgba(71, 160, 184, 0.9)',
          duration: 0.7,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut'
        }, '-=1');
      }

      /* whole RN26 pill does a tiny breathe after settling */
      tl.to(rn26, {
        scale: 1.02,
        duration: 0.3,
        ease: 'sine.out'
      }, '-=0.3');
      tl.to(rn26, {
        scale: 1,
        duration: 0.5,
        ease: 'sine.inOut'
      });
    }

    /* ── LOGO: breathing glow just like landing-intro ── */
    if (navLogo) {
      tl.to(navLogo, {
        filter: 'drop-shadow(0 0 25px rgba(71, 160, 184, 0.8))',
        scale: 1.06,
        duration: 1,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut'
      }, '-=1.8');

      /* final settle — logo drifts to perfect rest */
      tl.to(navLogo, {
        filter: 'drop-shadow(0 0 0px rgba(71, 160, 184, 0))',
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: 'sine.inOut'
      });
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

    /* Calendar: Expand from top-left to bottom-right + 3D drop + rubber band bounce */
    whenIn('.calendar-container', function (el) {
      el.style.willChange = 'clip-path, transform, opacity';
      var calTl = gsap.timeline();
      
      /* Start: zero size at top-left, pushed back in 3D, and slightly rotated */
      gsap.set(el, { 
        clipPath: 'inset(0% 100% 100% 0% round 24px)',
        opacity: 0, 
        y: -30, 
        scale: 0.9,
        rotationX: -10,
        transformOrigin: 'top left',
        transformPerspective: 1000
      });

      /* Phase 1: fade in and drop down while expanding diagonally towards bottom-right */
      calTl.to(el, {
        opacity: 1,
        y: 10, // overshoot Y
        clipPath: 'inset(0% 40% 40% 0% round 24px)',
        duration: 1.2,
        ease: 'expo.out'
      });

      /* Phase 2: Full expansion to bottom-right + snap to 3D rest */
      calTl.to(el, {
        clipPath: 'inset(0% 0% 0% 0% round 24px)',
        rotationX: 0,
        y: 0,
        duration: 1.6,
        ease: 'expo.inOut'
      }, '-=0.8');

      /* Phase 3: STRETCH past 100% — rubber band effect anchored at top-left */
      calTl.to(el, {
        scale: 1.04,
        duration: 0.35,
        ease: 'sine.out'
      }, '-=0.4');
      
      /* BOUNCE BACK — snaps back */
      calTl.to(el, {
        scale: 0.98,
        duration: 0.25,
        ease: 'sine.in'
      });
      calTl.to(el, {
        scale: 1.01,
        duration: 0.2,
        ease: 'sine.out'
      });
      calTl.to(el, {
        scale: 1,
        duration: 0.4,
        ease: 'sine.inOut',
        onComplete: function() { 
          el.style.willChange = 'auto'; 
          el.style.clipPath = '';
          el.style.transformOrigin = '';
        }
      });
    }, 'top 85%');

    /* Contact: form from left (clip expand), card from right (clip expand) */
    whenIn('.contact-form-div', function (el) {
      el.style.willChange = 'clip-path, transform';
      gsap.set(el, { opacity: 0, x: -40, clipPath: 'inset(0% 100% 0% 0%)' });
      var tl = gsap.timeline();
      tl.to(el, { opacity: 1, x: 5, duration: 1, ease: 'expo.out' });
      tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, '-=0.8');
      tl.to(el, { x: 0, duration: 0.6, ease: 'sine.inOut' }, '-=0.6');
    }, 'top 85%');

    whenIn('.contact-right-card', function (el) {
      el.style.willChange = 'clip-path, transform';
      gsap.set(el, { opacity: 0, x: 40, clipPath: 'inset(0% 0% 0% 100%)' });
      var tl = gsap.timeline({ delay: 0.2 });
      tl.to(el, { opacity: 1, x: -5, duration: 1, ease: 'expo.out' });
      tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, '-=0.8');
      tl.to(el, { x: 0, duration: 0.6, ease: 'sine.inOut' }, '-=0.6');
    }, 'top 85%');

    /* Register cards: 3D drop + vertical peel reveal */
    document.querySelectorAll('.reg-card').forEach(function (el, i) {
      whenIn(el, function () {
        el.style.willChange = 'clip-path, transform';
        var tl = gsap.timeline({ delay: i * 0.15 });
        gsap.set(el, { 
          opacity: 0, 
          y: -40, 
          rotationX: -15, 
          transformPerspective: 1000,
          clipPath: 'inset(0% 50% 100% 50% round 16px)'
        });
        
        tl.to(el, {
          opacity: 1,
          y: 10,
          rotationX: 0,
          clipPath: 'inset(0% 5% 5% 5% round 16px)',
          duration: 1.2,
          ease: 'expo.out'
        });
        tl.to(el, {
          y: 0,
          clipPath: 'inset(0% 0% 0% 0% round 16px)',
          duration: 1.4,
          ease: 'expo.inOut'
        }, '-=0.6');
        tl.to(el, {
          scale: 1.02,
          duration: 0.3,
          ease: 'sine.out'
        }, '-=0.3');
        tl.to(el, {
          scale: 1,
          duration: 0.6,
          ease: 'sine.inOut'
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

    /* Stats with glow pulse + clip reveal */
    document.querySelectorAll('.stat-card').forEach(function (el, i) {
      whenIn(el, function () {
        el.style.willChange = 'clip-path, transform, box-shadow';
        var stTl = gsap.timeline({ delay: i * 0.15 });
        gsap.set(el, { opacity: 0, y: 20, scale: 0.8, clipPath: 'circle(0% at center)' });
        
        stTl.to(el, {
          opacity: 1, 
          y: -5, 
          scale: 1.05,
          clipPath: 'circle(100% at center)',
          duration: 1.4, 
          ease: 'expo.out'
        });
        stTl.to(el, {
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'sine.inOut'
        }, '-=0.6');
        stTl.to(el, {
          boxShadow: '0 0 35px rgba(71, 160, 184, 0.5)',
          duration: 0.8, 
          yoyo: true, 
          repeat: 1, 
          ease: 'sine.inOut'
        }, '-=0.4');
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
      el.style.willChange = 'clip-path, transform, opacity';
      var fromLeft = i % 2 === 0;
      
      /* Start: heavily clipped to the incoming side, pushed back out of focus */
      gsap.set(el, { 
        opacity: 0, 
        x: fromLeft ? -40 : 40, 
        rotationY: fromLeft ? -10 : 10,
        clipPath: fromLeft ? 'inset(0% 100% 0% 0% round 16px)' : 'inset(0% 0% 0% 100% round 16px)',
        transformPerspective: 1000
      });

      whenIn(el, function () {
        var tl = gsap.timeline({ delay: (i % 4) * 0.1 });
        
        /* Phase 1: Slide in + fade while clip path expands across */
        tl.to(el, {
          opacity: 1, 
          x: fromLeft ? 5 : -5, // overshoot
          clipPath: 'inset(0% 0% 0% 0% round 16px)',
          rotationY: 0,
          duration: 1.4, 
          ease: 'expo.inOut'
        });
        
        /* Phase 2: Settle X and add a tiny scale bounce */
        tl.to(el, {
          x: 0,
          scale: 1.02,
          duration: 0.3,
          ease: 'sine.out'
        }, '-=0.4');
        tl.to(el, {
          scale: 1,
          duration: 0.6,
          ease: 'sine.inOut'
        });
      }, 'top 90%');
      tilt(el, 5);
    });
  }

  function animateAlumni(c) {
    c.querySelectorAll('.alumni-card').forEach(function (el, i) {
      el.style.willChange = 'clip-path, transform, opacity';
      
      /* Start: small circle clip in center, pushed down */
      gsap.set(el, { 
        opacity: 0, 
        y: 40, 
        scale: 0.9,
        clipPath: 'circle(10% at 50% 50%)'
      });
      
      whenIn(el, function () {
        var alTl = gsap.timeline({ delay: i * 0.1 });
        
        /* Expand circle clip while floating up */
        alTl.to(el, {
          opacity: 1, 
          y: -5, 
          scale: 1.03,
          clipPath: 'circle(100% at 50% 50%)',
          duration: 1.4, 
          ease: 'expo.inOut'
        });
        
        /* Settle and bounce */
        alTl.to(el, {
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'sine.inOut'
        }, '-=0.4');
        
        var badge = el.querySelector('.alumni-badge');
        if (badge) {
          alTl.fromTo(badge, { scale: 0.5, opacity: 0 }, {
            scale: 1.1, opacity: 1, duration: 0.6, ease: 'back.out(2)'
          }, '-=1');
          alTl.to(badge, {
            filter: 'drop-shadow(0 0 15px rgba(71, 160, 184, 0.9))',
            scale: 1,
            duration: 0.8, 
            yoyo: true, 
            repeat: 1, 
            ease: 'sine.inOut'
          }, '-=0.4');
        }
      }, 'top 90%');
      tilt(el, 4);
    });
  }

  function animateProjects(c) {
    c.querySelectorAll('.project-card').forEach(function (el, i) {
      el.style.willChange = 'clip-path, transform, opacity';
      
      /* Start: diagonally clipped from top-left, rotated down */
      gsap.set(el, { 
        opacity: 0, 
        y: 40, 
        rotationX: 10,
        clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)', // zero area top-left
        transformPerspective: 1000
      });
      
      whenIn(el, function () {
        var pTl = gsap.timeline({ delay: (i % 3) * 0.12 });
        
        pTl.to(el, {
          opacity: 1, 
          y: -8, 
          rotationX: 0,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', // full expand
          duration: 1.4, 
          ease: 'expo.inOut'
        });
        
        pTl.to(el, {
          y: 0,
          scale: 1.02,
          duration: 0.4,
          ease: 'sine.out'
        }, '-=0.4');
        pTl.to(el, {
          scale: 1,
          duration: 0.6,
          ease: 'sine.inOut'
        });
      }, 'top 88%');
      tilt(el, 5);
    });
  }

  function animateUpcoming(c) {
    c.querySelectorAll('.event-list-card').forEach(function (el, i) {
      el.style.willChange = 'clip-path, transform, opacity';
      
      /* Start: heavily clipped from the left */
      gsap.set(el, { 
        opacity: 0, 
        x: -40,
        clipPath: 'inset(0% 100% 0% 0% round 12px)'
      });
      
      whenIn(el, function () {
        var uTl = gsap.timeline({ delay: i * 0.1 });
        
        uTl.to(el, {
          opacity: 1, 
          x: 5,
          clipPath: 'inset(0% 0% 0% 0% round 12px)',
          duration: 1.4, 
          ease: 'expo.inOut'
        });
        
        uTl.to(el, {
          x: 0,
          duration: 0.6,
          ease: 'sine.inOut'
        }, '-=0.4');
      }, 'top 88%');
    });
  }

  function animatePast(c) {
    c.querySelectorAll('.past-event-grid-card').forEach(function (el, i) {
      el.style.willChange = 'clip-path, transform, opacity';
      
      /* Start: clipped from bottom up */
      gsap.set(el, { 
        opacity: 0, 
        y: 30, 
        scale: 0.96,
        clipPath: 'inset(100% 0% 0% 0% round 12px)'
      });
      
      whenIn(el, function () {
        var pTl = gsap.timeline({ delay: (i % 3) * 0.1 });
        
        pTl.to(el, {
          opacity: 1, 
          y: -4, 
          scale: 1.02,
          clipPath: 'inset(0% 0% 0% 0% round 12px)',
          duration: 1.2, 
          ease: 'expo.inOut'
        });
        
        pTl.to(el, {
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'sine.inOut'
        }, '-=0.3');
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