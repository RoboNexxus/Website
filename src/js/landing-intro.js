/**
 * Robo Nexus - Buttery Smooth Landing Intro
 * Rises from bottom -> Center -> Hero Position -> Page Reveal
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
    // Hide the real hero logo initially to avoid double logos
    const targetLogo = document.querySelector('.home-logo-img');
    if (targetLogo) {
      targetLogo.classList.add('no-animation');
      gsap.set(targetLogo, { opacity: 0, scale: 0.8 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('introSeen', '1');
        document.body.style.overflow = '';
        intro.remove();
        // Trigger other animations if needed
        window.dispatchEvent(new CustomEvent('introComplete'));
      }
    });

    // Phase 1: Logo rises from below the screen to the center
    tl.to(introLogo, {
      opacity: 1,
      y: 0,
      duration: 1.8,
      ease: "expo.out",
      delay: 0.5
    });

    // Phase 2: Subtle pulse/glow while in center
    tl.to(introLogo, {
      filter: 'drop-shadow(0 0 50px rgba(71, 160, 184, 0.8))',
      scale: 1.05,
      duration: 1,
      ease: "sine.inOut"
    });

    // Phase 3: Move to original position
    tl.add(() => {
      // Calculate target position
      if (targetLogo) {
        const rect = targetLogo.getBoundingClientRect();
        const introRect = introLogo.getBoundingClientRect();
        
        // Calculate center-to-center delta
        const deltaX = (rect.left + rect.width / 2) - (window.innerWidth / 2);
        const deltaY = (rect.top + rect.height / 2) - (window.innerHeight / 2);
        
        // Final scale based on target size vs intro size
        const targetScale = rect.width / introRect.width;

        gsap.to(introLogo, {
          x: deltaX,
          y: deltaY,
          scale: targetScale,
          duration: 1.5,
          ease: "expo.inOut",
          onStart: () => {
            // Start revealing the page as the logo moves
            gsap.to(mainContent, {
              opacity: 1,
              duration: 1.2,
              ease: "power2.out"
            });
            // Fade out the black intro background
            gsap.to(intro, {
              backgroundColor: 'rgba(0,0,0,0)',
              duration: 1.2,
              ease: "power2.out"
            });
          },
          onComplete: () => {
            // Swap intro logo for real hero logo
            targetLogo.classList.remove('no-animation');
            gsap.set(targetLogo, { opacity: 1, scale: 1 });
            gsap.to(introLogo, { opacity: 0, duration: 0.2 });
          }
        });
      } else {
        // Fallback if no hero logo (e.g. inner pages, though intro only runs on home)
        gsap.to(intro, { opacity: 0, duration: 1 });
        gsap.to(mainContent, { opacity: 1, duration: 1 });
      }
    }, "+=0.2");

    // Add a small buffer to the timeline to wait for the dynamic animation
    tl.to({}, { duration: 2.5 });
  });
})();
