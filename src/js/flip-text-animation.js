/**
 * Flip Text Animation Module
 * Adds 3D flip animation effect to hero text characters
 * Based on VengenceUI FlipFadeText component
 */

// Animation configuration (matching VengenceUI defaults)
const LETTER_DURATION = 0.6; // seconds per character
const STAGGER_DELAY = 0.1; // seconds between characters
const PERSPECTIVE = 1000; // pixels for 3D depth

/**
 * Initialize flip text animation on page load
 */
function initFlipAnimation() {
  // Select hero text elements
  const roboElement = document.querySelector('.home-text-main');
  const nexusElement = document.querySelector('.home-text-sub');
  
  // Check if elements exist
  if (!roboElement || !nexusElement) {
    console.warn('Flip animation: Hero text elements not found');
    return;
  }
  
  // Check if already initialized
  if (roboElement.querySelector('.flip-char') || nexusElement.querySelector('.flip-char')) {
    return; // Already initialized
  }
  
  // Remove existing glow animation
  removeGlowAnimation(roboElement);
  removeGlowAnimation(nexusElement);
  
  // Wrap characters in both elements
  const roboChars = wrapCharacters(roboElement);
  const nexusChars = wrapCharacters(nexusElement);
  
  // Calculate start delays (start after navbar animation)
  const roboDelay = 0.5;
  const nexusDelay = roboDelay + (roboChars.length * STAGGER_DELAY);
  
  // Apply flip animations
  applyFlipAnimation(roboChars, roboDelay);
  applyFlipAnimation(nexusChars, nexusDelay);
}

/**
 * Wrap each character in a text element with a span
 * @param {HTMLElement} element - The text element to process
 * @returns {HTMLElement[]} Array of character wrapper elements
 */
function wrapCharacters(element) {
  const text = element.textContent.trim();
  
  // Handle empty text
  if (text.length === 0) {
    return [];
  }
  
  // Clear element content
  element.textContent = '';
  
  // Set perspective on parent for 3D effect
  element.style.perspective = `${PERSPECTIVE}px`;
  
  const characters = [];
  
  // Create wrapper for each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'flip-char';
    span.style.display = 'inline-block';
    span.style.transformStyle = 'preserve-3d';
    // Inherit gradient from parent
    span.style.background = 'inherit';
    span.style.webkitBackgroundClip = 'text';
    span.style.backgroundClip = 'text';
    span.style.webkitTextFillColor = 'transparent';
    
    element.appendChild(span);
    characters.push(span);
  }
  
  return characters;
}

/**
 * Apply flip animation with staggered delays
 * Uses cubic-bezier easing matching VengenceUI: [0.2, 0.65, 0.3, 0.9]
 * @param {HTMLElement[]} characters - Array of character elements
 * @param {number} startDelay - Base delay before animation starts
 */
function applyFlipAnimation(characters, startDelay) {
  characters.forEach((char, index) => {
    const delay = startDelay + (index * STAGGER_DELAY);
    // Using cubic-bezier to match VengenceUI's ease: [0.2, 0.65, 0.3, 0.9]
    char.style.animation = `flipIn ${LETTER_DURATION}s cubic-bezier(0.2, 0.65, 0.3, 0.9) ${delay}s forwards`;
    // Set initial state to hidden
    char.style.transform = 'rotateX(90deg) translateY(20px)';
    char.style.opacity = '0';
    char.style.filter = 'blur(8px)';
  });
}

/**
 * Remove the existing glow animation from element
 * @param {HTMLElement} element - The element to modify
 */
function removeGlowAnimation(element) {
  element.style.animation = 'none';
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initFlipAnimation);

console.log('🎬 Flip text animation module loaded');
