/**
 * Liquid Text Controller
 * 
 * Orchestrates the entire animation sequence using GSAP timelines.
 * Initializes the renderer, handles errors gracefully, and ensures
 * the animation never blocks the site for more than 10 seconds.
 * 
 * Validates: Requirements 3.1, 4.6, 8.3, 10.3, 10.4
 */

class LiquidTextController {
  constructor(options = {}) {
    // Configuration options with defaults
    this.options = {
      canvasSelector: options.canvasSelector || '.liquid-text-canvas',
      loadingScreenSelector: options.loadingScreenSelector || '.loading-screen',
      pageContentSelector: options.pageContentSelector || '.page-content',
      skipButtonSelector: options.skipButtonSelector || '.loading-screen-skip',
      maxDuration: options.maxDuration || 10000, // 10 second maximum
      ...options
    };
    
    // State management
    this.state = {
      phase: 'initializing', // initializing | animating | completing | transitioning | complete | error
      startTime: null,
      skipped: false,
      errorMessage: null
    };
    
    // Components
    this.renderer = null;
    this.masterTimeline = null;
    this.timeoutId = null;
    this.adaptiveQuality = null;
    this.performanceLogInterval = null;
    this.navigationCleanupHandler = null;
    
    // DOM elements
    this.canvas = null;
    this.loadingScreen = null;
    this.pageContent = null;
    this.skipButton = null;
  }

  /**
   * Initialize renderer and start animation sequence
   * @returns {boolean} Success status
   */
  init() {
    try {
      this.state.startTime = performance.now();
      this.state.phase = 'initializing';
      
      console.log('🚀 Initializing liquid text loading screen...');
      
      // Get DOM elements
      if (!this.getDOMElements()) {
        console.error('Failed to get required DOM elements');
        this.handleInitializationFailure();
        return false;
      }
      
      // Initialize renderer
      this.renderer = new window.LiquidTextRenderer(this.canvas, {
        textContent: "Robo Nexus",
        fontSize: 120,
        fontFamily: "Roboto",
        fontWeight: 900,
        gradient: {
          start: "#ffffff",
          end: "#47a0b8"
        },
        distortionStrength: 0.15,
        distortionRadius: 0.25,
        minFPS: 30
      });
      
      // Attempt to initialize WebGL
      const initSuccess = this.renderer.init();
      
      if (!initSuccess) {
        console.error('Renderer initialization failed');
        this.handleInitializationFailure();
        return false;
      }
      
      // Start render loop
      this.renderer.startRenderLoop();
      
      // Initialize adaptive quality system
      if (typeof window.AdaptiveQuality !== 'undefined') {
        this.adaptiveQuality = new window.AdaptiveQuality(this.renderer);
        console.log('✨ Adaptive quality system initialized');
        
        // Start performance monitoring and logging
        this.startPerformanceMonitoring();
      } else {
        console.warn('AdaptiveQuality not available, adaptive performance disabled');
      }
      
      // Initialize skip button
      this.initializeSkipButton();
      
      // Set up timeout safety mechanism
      this.setupTimeoutSafety();
      
      // Set up navigation cleanup
      this.setupNavigationCleanup();
      
      // Start animation sequence
      this.startAnimationSequence();
      
      console.log('✨ Liquid text loading screen initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Initialization error:', {
        message: error.message,
        stack: error.stack
      });
      this.handleInitializationFailure();
      return false;
    }
  }

  /**
   * Initialize skip button with event handlers
   * Shows button after 1 second and adds click/keyboard handlers
   *
   * Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.6
   */
  initializeSkipButton() {
    if (!this.skipButton) {
      console.warn('Skip button not found, skip functionality disabled');
      return;
    }

    // Show skip button after 1 second using GSAP
    gsap.to(this.skipButton, {
      opacity: 1,
      delay: 1.0,
      duration: 0.3,
      ease: "power2.out"
    });

    // Add click event handler
    this.skipButton.addEventListener('click', () => {
      console.log('Skip button clicked');
      this.skip();
    });

    // Add keyboard event handlers for Enter and Space keys
    this.skipButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent default space scrolling
        console.log('Skip button activated via keyboard:', e.key);
        this.skip();
      }
    });

    console.log('✨ Skip button initialized');
  }

  /**
   * Start performance monitoring
   * Records FPS and evaluates quality adjustments
   * Logs performance metrics periodically for debugging
   * 
   * Validates: Requirements 9.1, 9.5
   */
  startPerformanceMonitoring() {
    // Monitor performance every 100ms
    this.performanceLogInterval = setInterval(() => {
      if (!this.renderer || !this.adaptiveQuality) {
        return;
      }
      
      // Get current FPS metrics
      const metrics = this.renderer.getPerformanceMetrics();
      
      // Record frame for adaptive quality evaluation
      this.adaptiveQuality.recordFrame(metrics.current);
      
    }, 100);
    
    // Log performance metrics every 2 seconds for debugging
    setInterval(() => {
      if (!this.renderer) {
        return;
      }
      
      const metrics = this.renderer.getPerformanceMetrics();
      const qualityLevel = this.adaptiveQuality ? this.adaptiveQuality.getQualityLevel() : 'unknown';
      
      console.log('📊 Performance metrics:', {
        fps: metrics.average,
        min: metrics.min,
        max: metrics.max,
        quality: qualityLevel
      });
    }, 2000);
    
    console.log('✨ Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopPerformanceMonitoring() {
    if (this.performanceLogInterval) {
      clearInterval(this.performanceLogInterval);
      this.performanceLogInterval = null;
    }
  }


  /**
   * Get required DOM elements
   * @returns {boolean} Success status
   */
  getDOMElements() {
    this.canvas = document.querySelector(this.options.canvasSelector);
    this.loadingScreen = document.querySelector(this.options.loadingScreenSelector);
    this.pageContent = document.querySelector(this.options.pageContentSelector);
    this.skipButton = document.querySelector(this.options.skipButtonSelector);
    
    if (!this.canvas) {
      console.error('Canvas element not found:', this.options.canvasSelector);
      return false;
    }
    
    if (!this.loadingScreen) {
      console.error('Loading screen element not found:', this.options.loadingScreenSelector);
      return false;
    }
    
    if (!this.pageContent) {
      console.error('Page content element not found:', this.options.pageContentSelector);
      return false;
    }
    
    return true;
  }

  /**
   * Set up timeout safety mechanism (10 second maximum)
   */
  setupTimeoutSafety() {
    this.timeoutId = setTimeout(() => {
      const elapsedTime = performance.now() - this.state.startTime;
      console.error('Animation timeout exceeded', {
        elapsedTime: elapsedTime,
        currentPhase: this.state.phase,
        action: 'forcing transition'
      });
      this.forceTransition();
    }, this.options.maxDuration);
  }
  /**
   * Set up navigation cleanup listeners
   * Listens for beforeunload and pagehide events to clean up resources
   * when user navigates away during animation
   *
   * Validates: Requirements 10.5
   */
  setupNavigationCleanup() {
    // Handler function for cleanup
    const cleanupHandler = () => {
      console.log('🧹 Navigation detected, cleaning up resources');

      // Cancel all animations
      if (this.masterTimeline) {
        this.masterTimeline.kill();
        this.masterTimeline = null;
      }

      // Stop performance monitoring
      this.stopPerformanceMonitoring();

      // Clean up renderer resources
      if (this.renderer) {
        this.renderer.stopRenderLoop();
        this.renderer.dispose();
        this.renderer = null;
      }

      // Clear timeout
      this.clearTimeoutSafety();

      console.log('✅ Resources cleaned up on navigation');
    };

    // Listen for beforeunload event (user navigating away)
    window.addEventListener('beforeunload', cleanupHandler);

    // Listen for pagehide event (page being hidden/unloaded)
    window.addEventListener('pagehide', cleanupHandler);

    // Store handler reference for potential removal
    this.navigationCleanupHandler = cleanupHandler;

    console.log('✨ Navigation cleanup listeners initialized');
  }

  /**
   * Clear timeout safety mechanism
   */
  clearTimeoutSafety() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Create auto-hover path animation timeline
   * Moves the hover position through predetermined waypoints
   * @returns {gsap.core.Timeline} GSAP timeline for auto-hover
   */
  createAutoHoverAnimation() {
    // Define predetermined hover path with waypoints
    // Path showcases liquid effect: left → top → right → bottom → center
    const path = [
      { x: 0.2, y: 0.5, duration: 0.8, ease: "power2.inOut" },  // Start left
      { x: 0.5, y: 0.3, duration: 0.7, ease: "power2.inOut" },  // Move to center-top
      { x: 0.8, y: 0.5, duration: 0.8, ease: "power2.inOut" },  // Move to right
      { x: 0.5, y: 0.7, duration: 0.7, ease: "power2.inOut" },  // Move to center-bottom
      { x: 0.5, y: 0.5, duration: 0.5, ease: "power2.out" }     // Return to center
    ];
    
    // Create timeline for auto-hover sequence
    const tl = gsap.timeline();
    
    // Track current position for interpolation
    const hoverState = { x: 0.5, y: 0.5 };
    
    // Add each waypoint to timeline
    path.forEach((point, index) => {
      tl.to(hoverState, {
        x: point.x,
        y: point.y,
        duration: point.duration,
        ease: point.ease,
        onUpdate: () => {
          // Update renderer hover position during animation
          if (this.renderer) {
            this.renderer.setHoverPosition(hoverState.x, hoverState.y);
          }
        }
      }, index === 0 ? 0 : ">"); // Start first immediately, others after previous
    });
    
    return tl;
  }

  /**
   * Start the animation sequence
   * Creates master GSAP timeline with all animation phases:
   * - Phase 1: Fade in loading screen (0.0s - 0.5s)
   * - Phase 2: Fade in liquid text (0.5s - 1.0s)
   * - Phase 3: Auto-hover animation (1.0s - 4.5s)
   * - Phase 4: Return to center (4.5s - 5.0s)
   * - Phase 5: Completion animations (5.0s - 5.8s)
   * 
   * Validates: Requirements 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.6, 6.3
   */
  startAnimationSequence() {
    this.state.phase = 'animating';
    console.log('🎬 Animation sequence started');
    
    // Create master timeline that orchestrates all animation phases
    const masterTl = gsap.timeline({
      onComplete: () => {
        console.log('✅ Animation sequence complete');
        this.state.phase = 'completing';
        
        // Clear timeout safety mechanism
        this.clearTimeoutSafety();
        
        // Transition to main page after completion animations
        this.transitionToMainPage();
      }
    });
    
    // Phase 1: Fade in loading screen (0.0s - 0.5s)
    masterTl.to(this.loadingScreen, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    }, 0);
    
    // Phase 2: Fade in liquid text canvas (0.5s - 1.0s)
    masterTl.to(this.canvas, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    }, 0.5);
    
    // Phase 3: Auto-hover animation (1.0s - 4.5s)
    const autoHoverTl = this.createAutoHoverAnimation();
    masterTl.add(autoHoverTl, 1.0);
    
    // Phase 4: Return to center (4.5s - 5.0s)
    // Create a dummy object to animate for timing, update hover position in onUpdate
    const returnState = { progress: 0 };
    masterTl.to(returnState, {
      progress: 1,
      duration: 0.5,
      ease: "power2.inOut",
      onUpdate: () => {
        // Ensure hover position stays at center during return phase
        if (this.renderer) {
          this.renderer.setHoverPosition(0.5, 0.5);
        }
      }
    }, 4.5);
    
    // Phase 5: Completion animations (5.0s - 5.8s)
    // Scale up and fade out simultaneously
    masterTl.to(this.canvas, {
      scale: 1.2,
      opacity: 0,
      duration: 0.8,
      ease: "power2.in"
    }, 5.0);
    
    // Store reference for pause/resume/skip functionality
    this.masterTimeline = masterTl;
    
    // Play the timeline
    masterTl.play();
    
    console.log('✨ Master timeline created with all animation phases');
  }

  /**
   * Handle renderer initialization failure
   * Falls back to immediate transition to main page
   */
  handleInitializationFailure() {
    this.state.phase = 'error';
    this.state.errorMessage = 'Renderer initialization failed';
    
    console.log('⚠️ Falling back to immediate transition');
    
    // Clear timeout if set
    this.clearTimeoutSafety();
    
    // Transition to main page immediately
    this.transitionToMainPage();
  }

  /**
   * Force transition to main page (called on timeout)
   */
  forceTransition() {
    console.log('⚡ Forcing transition to main page');
    
    // Stop performance monitoring
    this.stopPerformanceMonitoring();
    
    // Cancel any active animations
    if (this.masterTimeline) {
      this.masterTimeline.kill();
      this.masterTimeline = null;
    }
    
    // Clean up renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    
    // Clear timeout
    this.clearTimeoutSafety();
    
    // Transition immediately
    this.transitionToMainPage();
  }

  /**
   * Transition to main page
   * Uses GSAP for smooth cross-fade transitions (5.8s - 6.5s)
   * Removes loading screen from DOM after transition
   * 
   * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.6
   */
  transitionToMainPage() {
    this.state.phase = 'transitioning';
    console.log('🔄 Transitioning to main page');
    
    // Stop performance monitoring
    this.stopPerformanceMonitoring();
    
    // Create transition timeline for cross-fade
    const transitionTl = gsap.timeline({
      onComplete: () => {
        // Remove loading screen from DOM after transition
        if (this.loadingScreen && this.loadingScreen.parentNode) {
          this.loadingScreen.parentNode.removeChild(this.loadingScreen);
        }
        
        this.state.phase = 'complete';
        console.log('✅ Transition complete');
        
        // Initialize main page animations after transition completes
        this.initializeMainPageAnimations();
      }
    });
    
    // Fade out loading screen (5.8s - 6.5s = 0.7s duration)
    transitionTl.to(this.loadingScreen, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.inOut"
    }, 0);
    
    // Fade in main page content (5.8s - 6.5s = 0.7s duration)
    transitionTl.to(this.pageContent, {
      opacity: 1,
      duration: 0.7,
      ease: "power2.inOut"
    }, 0);
    
    // Play the transition timeline
    transitionTl.play();
  }

  /**
   * Initialize main page animations
   * Triggers existing animation modules after transition completes
   * Coordinates timing so animations don't overlap with transition
   * 
   * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
   */
  initializeMainPageAnimations() {
    console.log('🎬 Initializing main page animations');
    
    // Call existing spotlight-navbar.js initialization
    // The module checks if already initialized, so safe to call
    if (typeof window.initSpotlightNavbar === 'function') {
      window.initSpotlightNavbar();
      console.log('✨ Navbar animation initialized');
    } else {
      console.warn('initSpotlightNavbar function not found');
    }
    
    // Call existing flip-text-animation.js initialization
    // The module checks if already initialized, so safe to call
    if (typeof window.initFlipAnimation === 'function') {
      window.initFlipAnimation();
      console.log('✨ Flip text animation initialized');
    } else {
      console.warn('initFlipAnimation function not found');
    }
    
    // Ensure particle canvas becomes visible
    // Particles.js initializes automatically on load, just ensure canvas is visible
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
      particleCanvas.style.opacity = '1';
      console.log('✨ Particle canvas visible');
    } else {
      console.warn('Particle canvas not found');
    }
    
    console.log('✅ Main page animations initialized');
  }

  /**
   * Skip animation and transition immediately
   * Called by skip button or keyboard shortcut
   */
  skip() {
    if (this.state.skipped || this.state.phase === 'complete') {
      return;
    }
    
    this.state.skipped = true;
    console.log('⏭️ Animation skipped by user');
    
    this.forceTransition();
  }

  /**
   * Pause animation
   */
  pause() {
    if (this.masterTimeline) {
      this.masterTimeline.pause();
    }
    if (this.renderer) {
      this.renderer.stopRenderLoop();
    }
  }

  /**
   * Resume animation
   */
  resume() {
    if (this.masterTimeline) {
      this.masterTimeline.resume();
    }
    if (this.renderer) {
      this.renderer.startRenderLoop();
    }
  }

  /**
   * Get current animation state
   * @returns {object} Current state
   */
  getState() {
    return {
      ...this.state,
      elapsedTime: this.state.startTime ? performance.now() - this.state.startTime : 0
    };
  }
}

// Export for browser environment
if (typeof window !== 'undefined') {
  window.LiquidTextController = LiquidTextController;
}

// Export for Node.js/CommonJS environment (for testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiquidTextController;
}

// ===============================
// INITIALIZATION
// ===============================

/**
 * Initialize controller on DOMContentLoaded
 * Creates LiquidTextController instance and starts animation sequence
 * Handles initialization errors gracefully
 * 
 * Validates: Requirements 11.6
 */
if (typeof window !== 'undefined') {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLiquidText);
  } else {
    // DOM already loaded, initialize immediately
    initializeLiquidText();
  }
}

function initializeLiquidText() {
  try {
    console.log('🎨 Initializing liquid text loading screen on DOMContentLoaded');
    
    // Create controller instance
    const controller = new LiquidTextController();
    
    // Initialize and start animation sequence
    const success = controller.init();
    
    if (success) {
      console.log('✅ Liquid text loading screen initialized successfully');
    } else {
      console.error('❌ Liquid text loading screen initialization failed');
      // Controller handles fallback internally
    }
    
    // Store controller reference globally for debugging
    window.liquidTextController = controller;
    
  } catch (error) {
    console.error('❌ Fatal error during liquid text initialization:', {
      message: error.message,
      stack: error.stack
    });
    
    // Ensure main page becomes visible even if initialization fails completely
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
      pageContent.style.opacity = '1';
    }
    
    // Remove loading screen if it exists
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen && loadingScreen.parentNode) {
      loadingScreen.parentNode.removeChild(loadingScreen);
    }
  }
}
