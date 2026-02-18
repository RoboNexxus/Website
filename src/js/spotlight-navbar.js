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
  const navbar = document.querySelector('.navbar');
  
  if (!navbar) {
    console.warn('Spotlight navbar: Navbar element not found');
    return;
  }
  
  // Check if already initialized
  if (navbar.classList.contains('spotlight-initialized')) {
    return;
  }
  
  navbar.classList.add('spotlight-initialized');
  
  // Get nav links
  const navLinks = navbar.querySelectorAll('.nav-links');
  
  if (navLinks.length === 0) {
    console.warn('Spotlight navbar: No nav links found');
    return;
  }
  
  // State
  let activeIndex = 0;
  let hoverX = null;
  let spotlightX = 0;
  let ambienceX = 0;
  let currentAnimation = null;
  
  // Create spotlight overlay
  const spotlightOverlay = document.createElement('div');
  spotlightOverlay.className = 'navbar-spotlight-overlay';
  navbar.appendChild(spotlightOverlay);
  
  // Create ambience line
  const ambienceLine = document.createElement('div');
  ambienceLine.className = 'navbar-ambience-line';
  navbar.appendChild(ambienceLine);
  
  // Determine active link based on current page
  const currentPath = window.location.pathname;
  navLinks.forEach((link, index) => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href.replace('.html', ''))) {
      activeIndex = index;
      link.classList.add('active');
    }
  });
  
  // Initialize ambience position
  updateAmbiencePosition(activeIndex);
  
  // Mouse move handler
  function handleMouseMove(e) {
    const rect = navbar.getBoundingClientRect();
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
      const navRect = navbar.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const targetX = linkRect.left - navRect.left + linkRect.width / 2;
      
      if (currentAnimation) {
        currentAnimation.stop();
      }
      
      currentAnimation = animateSpring(spotlightX, targetX, {
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
  function updateAmbiencePosition(index) {
    const activeLink = navLinks[index];
    if (!activeLink) return;
    
    const navRect = navbar.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const targetX = linkRect.left - navRect.left + linkRect.width / 2;
    
    if (currentAnimation) {
      currentAnimation.stop();
    }
    
    currentAnimation = animateSpring(ambienceX, targetX, {
      stiffness: 200,
      damping: 20,
      onUpdate: (v) => {
        ambienceX = v;
        ambienceLine.style.setProperty('--ambience-x', `${v}px`);
      }
    });
  }
  
  // Click handlers for nav links
  navLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');
      activeIndex = index;
      
      // Update ambience position
      updateAmbiencePosition(index);
    });
  });
  
  // Attach event listeners
  navbar.addEventListener('mousemove', handleMouseMove);
  navbar.addEventListener('mouseleave', handleMouseLeave);
  
  console.log('✨ Spotlight navbar initialized');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initSpotlightNavbar);

console.log('✨ Spotlight navbar module loaded');
