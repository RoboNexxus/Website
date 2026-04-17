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

      /* start animation when intro glide has begun and subnav pills exist */
      window.addEventListener('introGlideStart', function () {
        window.__rnIntroGlideStarted = true;
        tryStartNavbarCinematic();
      });

      window.addEventListener('subnavReady', function () {
        window.__rnSubnavReady = true;
        tryStartNavbarCinematic();
      });

      // Handle the case where events fired before this script attached listeners.
      tryStartNavbarCinematic();
    } else {
      /* inner pages: no animation, just make sure navbar is visible immediately */
      gsap.set('.spotlight-nav', { opacity: 1, y: 0, scaleX: 1, x: 0, clipPath: 'inset(0 0% 0 0 round 22px)' });
      gsap.set('.nav-links', { opacity: 1, y: 0 });
      gsap.set('.nav-logo img', { opacity: 1, y: 0, scale: 1 });
      if (document.getElementById('rn-inductions-pill')) {
        gsap.set('#rn-inductions-pill', { opacity: 1, scaleX: 1, x: 0, y: 0 });
      }
      if (document.getElementById('rn26-pill')) {
        gsap.set('#rn26-pill', { opacity: 1, scaleX: 1, x: 0, y: 0 });
      }
    }

    pageTransitions();
    staticReveals();
    dynamicWatchers();
    cardHovers();
    
    // Refresh ScrollTrigger after all animations are set up
    // This ensures all triggers are calculated correctly
    requestAnimationFrame(function () {
      ScrollTrigger.refresh();
    });
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
    var navLogo = document.querySelector('.nav-logo img');
    var navLinks = document.querySelectorAll('.nav-links');
    var apply = document.getElementById('rn-apply-pill');
    var inductions = document.getElementById('rn-inductions-pill');
    var rn26 = document.getElementById('rn26-pill');

    /* kill earlier script.js tweens */
    if (pill) gsap.killTweensOf(pill);
    if (navLogo) gsap.killTweensOf(navLogo);
    if (navLinks.length) gsap.killTweensOf(navLinks);
    if (apply) gsap.killTweensOf(apply);
    if (inductions) gsap.killTweensOf(inductions);
    if (rn26) gsap.killTweensOf(rn26);

    var tl = gsap.timeline({ delay: baseDelay });

    /* ── LOGO ── */
    if (navLogo) {
      tl.fromTo(navLogo, { y: -4, scale: 1.07 }, {
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'sine.inOut'
      }, 1.2);
    }

    /* ── STEP 1: LEFT PILLS (Apply & Inductions) ── */
    var leftPills = [apply, inductions].filter(Boolean);
    if (leftPills.length > 0) {
      leftPills.forEach(p => { p.style.willChange = 'transform, opacity'; });

      gsap.set(leftPills, {
        opacity: 0,
        x: -22,
        y: -6,
        scaleX: 0.84,
        transformOrigin: 'right center'
      });

      tl.to(leftPills, {
        opacity: 1,
        x: 0,
        y: 0,
        scaleX: 1,
        duration: 0.85,
        ease: 'expo.out',
        stagger: 0.15
      }, 0);

      tl.to(leftPills, {
        x: 2,
        duration: 0.22,
        ease: 'sine.out',
        stagger: 0.15
      }, '-=0.15');

      tl.to(leftPills, {
        x: 0,
        duration: 0.38,
        ease: 'sine.inOut',
        stagger: 0.15
      });
    }

    /* ── STEP 2: MAIN NAV ── */
    if (pill) {
      var mainStart = leftPills.length > 0 ? 0.35 : 0;
      pill.style.willChange = 'clip-path, transform';
      gsap.set(navLinks, { opacity: 0, y: 8 });
      gsap.set(pill, { opacity: 1, y: -15, clipPath: 'inset(0 100% 0 0 round 22px)' });

      tl.to(pill, { y: 0, duration: 0.8, ease: 'expo.out' }, mainStart);
      tl.to(pill, { clipPath: 'inset(0 0% 0 0 round 22px)', duration: 1.8, ease: 'expo.inOut' }, mainStart + 0.05);
      
      // Wobble
      tl.to(pill, { y: -3, duration: 0.55, ease: 'sine.inOut' }, mainStart + 0.25);
      tl.to(pill, { y: 2, duration: 0.45, ease: 'sine.inOut' }, mainStart + 0.8);
      tl.to(pill, { y: 0, duration: 0.6, ease: 'sine.inOut' }, mainStart + 1.25);

      // Fade in links
      tl.to(navLinks, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, mainStart + 0.6);
    }

    /* ── STEP 3: REGISTER PILL ── */
    if (rn26) {
      var registerStart = leftPills.length > 0 ? 0.55 : 0.2;
      rn26.style.willChange = 'transform, opacity';
      gsap.set(rn26, { opacity: 0, x: 22, y: -6, scaleX: 0.84, transformOrigin: 'left center' });

      tl.to(rn26, { opacity: 1, x: 0, y: 0, scaleX: 1, duration: 0.85, ease: 'expo.out' }, registerStart);
      tl.to(rn26, { x: -2, duration: 0.22, ease: 'sine.out' }, registerStart + 0.7);
      tl.to(rn26, { x: 0, duration: 0.38, ease: 'sine.inOut' });
    }
}
```