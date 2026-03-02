/* ===============================
   LANDING INTRO — Clean & Minimal
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

  const letters = document.querySelectorAll('.intro-letter');
  const divider = document.getElementById('intro-divider');
  const tagline = document.getElementById('intro-tagline');
  const mainContent = document.getElementById('main-content');

  const tl = gsap.timeline({
    onComplete: () => {
      sessionStorage.setItem('introSeen', '1');
      document.body.style.overflow = '';
      intro.remove();
    },
  });

  // 1. Letters fade up one by one with slight stagger
  tl.to(letters, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
    stagger: 0.06,
  });

  // 2. Divider line expands
  tl.to(divider, {
    opacity: 1,
    width: '60px',
    duration: 0.5,
    ease: 'power2.inOut',
  }, '-=0.2');

  // 3. Tagline fades in
  tl.to(tagline, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
  }, '-=0.2');

  // 4. Hold for a moment
  tl.to({}, { duration: 0.8 });

  // 5. Everything fades out and slides up, reveal main content
  tl.to(intro, {
    opacity: 0,
    duration: 0.6,
    ease: 'power2.inOut',
  });

  tl.to(mainContent, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out',
  }, '-=0.3');

})();
