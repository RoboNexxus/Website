/**
 * Robo Nexus - Buttery Smooth Landing Intro v2
 * Rises from bottom -> Center -> Hero Position -> Page Reveal
 * Perfectly matches target size and handles background reveal.
 */

(function () {
  const intro = document.getElementById('landing-intro');
  const mainContent = document.getElementById('main-content');
  const introLogo = document.getElementById('intro-logo');
  
  if (!intro || !introLogo || !mainContent) return;

  // Skip intro if already seen this session
  if (sessionStorage.getItem('introSeen')) {
    intro.remove();
    mainContent.style.opacity = '1';
    return;
  }

  // Lock scroll during intro
  document.body.style.overflow = 'hidden';
  
  // Set initial black background to fade out later
  intro.style.backgroundColor = '#000000';

  // Wait for GSAP to be available
  function waitForGSAP(cb) {
    if (typeof gsap !== 'undefined') return cb();
    const check = setInterval(() => {
      if (typeof gsap !== 'undefined') {
        clearInterval(check);
        cb();
      }
    }, 50);
  }

  waitForGSAP(() => {
    const targetLogo = document.querySelector('.home-logo-img');
    
    // Preparation
    if (targetLogo) {
      targetLogo.classList.add('no-animation');
      gsap.set(targetLogo, { opacity: 0 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('introSeen', '1');
        document.body.style.overflow = '';
        intro.remove();
        window.dispatchEvent(new CustomEvent('introComplete'));
      }
    });

    // Phase 1: Logo rises from below screen to center
    // We start invisible and below
    gsap.set(introLogo, { opacity: 0, y: '100vh', scale: 0.8 });

    tl.to(introLogo, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 2,
      ease: "expo.out",
      delay: 0.5
    });

    // Phase 2: Fade background to reveal particles + Pulse
    tl.to(intro, {
      backgroundColor: 'rgba(0,0,0,0)',
      duration: 1.5,
      ease: "power2.inOut"
    }, "-=1");

    tl.to(introLogo, {
      filter: 'drop-shadow(0 0 60px rgba(71, 160, 184, 0.9))',
      scale: 1.05,
      duration: 1.2,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut"
    }, "-=0.5");

    // Phase 3: Glide to original position with precise resizing
    tl.add(() => {
      if (targetLogo) {
        const targetRect = targetLogo.getBoundingClientRect();
        const introRect = introLogo.getBoundingClientRect();
        
        // Calculate center-to-center delta
        const deltaX = (targetRect.left + targetRect.width / 2) - (window.innerWidth / 2);
        const deltaY = (targetRect.top + targetRect.height / 2) - (window.innerHeight / 2);
        
        // Final scale to match targetLogo size exactly
        // targetRect.width is the current width of the hero logo
        // introRect.width is the current width of the intro logo (which is at scale 1.05 due to pulse)
        const currentIntroWidth = introLogo.offsetWidth; // intrinsic width
        const targetScale = targetRect.width / currentIntroWidth;

        gsap.to(introLogo, {
          x: deltaX,
          y: deltaY,
          scale: targetScale,
          duration: 1.8,
          ease: "expo.inOut",
          onStart: () => {
            // Reveal page content as logo glides
            gsap.to(mainContent, {
              opacity: 1,
              duration: 1.5,
              ease: "power2.out"
            });
          },
          onComplete: () => {
            // Smooth swap
            gsap.set(targetLogo, { opacity: 1 });
            targetLogo.classList.remove('no-animation');
            gsap.to(introLogo, { opacity: 0, duration: 0.3 });
          }
        });
      } else {
        // Fallback
        gsap.to(intro, { opacity: 0, duration: 1 });
        gsap.to(mainContent, { opacity: 1, duration: 1 });
      }
    }, "+=0.1");

    // Timeline buffer
    tl.to({}, { duration: 2.5 });
  });
})();
