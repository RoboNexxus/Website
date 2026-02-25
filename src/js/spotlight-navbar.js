/**
 * Spotlight Navbar Module
 * Adds interactive spotlight and ambient glow effects to navbar
 * Based on VengenceUI SpotlightNavbar component
 */

/**
 * Simple spring animation utility
 * Mimics framer-motion's animate() with spring physics
 */
function animateSpring(from, to, options) {
  const { stiffness = 200, damping = 20, onUpdate } = options;
  
  let current = from;
  let velocity = 0;
  const mass = 1;
  let animationFrame;
  
  function step() {
    // Spring physics: F = -kx - cv
    const displacement = current - to;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * velocity;
    const acceleration = (springForce + dampingForce) / mass;
    
    velocity += acceleration * (1/60); // Assume 60fps
    current += velocity * (1/60);
    
    onUpdate(current);
    
    // Continue if not at rest
    if (Math.abs(displacement) > 0.01 || Math.abs(velocity) > 0.01) {
      animationFrame = requestAnimationFrame(step);
    }
  }
  
  animationFrame = requestAnimationFrame(step);
  
  return {
    stop: () => cancelAnimationFrame(animationFrame)
  };
}

/**
 * Initialize spotlight navbar effects
 */
function initSpotlightNavbar() {
  const spotlightNav = document.querySelector('.spotlight-nav');
  
  if (!spotlightNav) {
    console.warn('Spotlight navbar: .spotlight-nav element not found');
    return;
  }
  
  // Check if already initialized
  if (spotlightNav.classList.contains('spotlight-initialized')) {
    return;
  }
  
  spotlightNav.classList.add('spotlight-initialized');
  
  // Get nav links
  const navLinks = spotlightNav.querySelectorAll('.nav-links');
  
  if (navLinks.length === 0) {
    console.warn('Spotlight navbar: No nav links found');
    return;
  }
  
  // Get overlays
  const spotlightOverlay = spotlightNav.querySelector('.navbar-spotlight-overlay');
  const ambienceLine = spotlightNav.querySelector('.navbar-ambience-line');
  
  if (!spotlightOverlay || !ambienceLine) {
    console.warn('Spotlight navbar: Overlay elements not found');
    return;
  }
  
  // State
  let activeIndex = 0;
  let hoverX = null;
  let spotlightX = 0;
  let ambienceX = 0;
  let currentSpotlightAnimation = null;
  let currentAmbienceAnimation = null;
  
  // Determine active link based on current page
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';
  
  navLinks.forEach((link, index) => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    if (href) {
      const linkPage = href.split('/').pop();
      // Check if this is the current page
      if (linkPage === currentPage || 
          (currentPage === '' && linkPage === 'index.html') ||
          (currentPage === 'index.html' && href === '/index.html') ||
          // Alumni page should highlight Team link
          (currentPage === 'alumni.html' && linkPage === 'team.html')) {
        activeIndex = index;
        link.classList.add('active');
      }
    }
  });
  
  // Initialize ambience position immediately (no animation on page load)
  const activeLink = navLinks[activeIndex];
  if (activeLink) {
    const navRect = spotlightNav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    ambienceX = linkRect.left - navRect.left + linkRect.width / 2;
    ambienceLine.style.setProperty('--ambience-x', `${ambienceX}px`);
    spotlightX = ambienceX;
  }
  
  // Mouse move handler
  function handleMouseMove(e) {
    const rect = spotlightNav.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    hoverX = x;
    spotlightX = x;
    
    // Update spotlight position immediately (no spring for mouse tracking)
    spotlightOverlay.style.setProperty('--spotlight-x', `${x}px`);
    spotlightOverlay.style.opacity = '1';
  }
  
  // Mouse leave handler
  function handleMouseLeave() {
    hoverX = null;
    spotlightOverlay.style.opacity = '0';
    
    // Spring spotlight back to active item
    const activeLink = navLinks[activeIndex];
    if (activeLink) {
      const navRect = spotlightNav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const targetX = linkRect.left - navRect.left + linkRect.width / 2;
      
      if (currentSpotlightAnimation) {
        currentSpotlightAnimation.stop();
      }
      
      currentSpotlightAnimation = animateSpring(spotlightX, targetX, {
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          spotlightX = v;
          spotlightOverlay.style.setProperty('--spotlight-x', `${v}px`);
        }
      });
    }
  }
  
  // Update ambience position
  function updateAmbiencePosition(index, immediate = false) {
    const activeLink = navLinks[index];
    if (!activeLink) return;
    
    const navRect = spotlightNav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const targetX = linkRect.left - navRect.left + linkRect.width / 2;
    
    if (immediate) {
      // Set immediately without animation
      ambienceX = targetX;
      ambienceLine.style.setProperty('--ambience-x', `${targetX}px`);
    } else {
      // Animate with spring
      if (currentAmbienceAnimation) {
        currentAmbienceAnimation.stop();
      }
      
      currentAmbienceAnimation = animateSpring(ambienceX, targetX, {
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          ambienceX = v;
          ambienceLine.style.setProperty('--ambience-x', `${v}px`);
        }
      });
    }
  }
  
  // Click handlers for nav links
  navLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      // Don't prevent default - allow navigation
      
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');
      activeIndex = index;
      
      // Update ambience position with animation
      updateAmbiencePosition(index, false);
    });
  });
  
  // Attach event listeners
  spotlightNav.addEventListener('mousemove', handleMouseMove);
  spotlightNav.addEventListener('mouseleave', handleMouseLeave);
  
  console.log('✨ Spotlight navbar initialized');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initSpotlightNavbar);

console.log('✨ Spotlight navbar module loaded');