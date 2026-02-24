/**
 * Liquid Text Utilities
 * 
 * Helper classes for performance monitoring and adaptive quality management.
 * 
 * Validates: Requirements 9.1, 9.2, 9.5
 */

/**
 * FPSMonitor - Tracks frame rate over time
 * 
 * Records frame timestamps and calculates average FPS over a rolling 60-frame window.
 * Provides metrics interface for current, min, and max FPS values.
 * 
 * Validates: Requirements 9.1, 9.2
 */
class FPSMonitor {
  constructor() {
    this.frames = [];
    this.maxFrames = 60; // Rolling window of 60 frames
    this.lastTime = performance.now();
  }

  /**
   * Record a frame and calculate instantaneous FPS
   * @returns {number} Current FPS for this frame
   */
  recordFrame() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    // Calculate FPS from frame delta
    const fps = delta > 0 ? 1000 / delta : 60;
    
    // Add to rolling window
    this.frames.push(fps);
    
    // Maintain rolling window size
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
    
    return fps;
  }

  /**
   * Get average FPS over the rolling window
   * @returns {number} Average FPS
   */
  getAverageFPS() {
    if (this.frames.length === 0) {
      return 60; // Default to 60 if no frames recorded yet
    }
    
    const sum = this.frames.reduce((acc, fps) => acc + fps, 0);
    return sum / this.frames.length;
  }

  /**
   * Get comprehensive performance metrics
   * @returns {object} Metrics with average, min, and max FPS
   */
  getMetrics() {
    if (this.frames.length === 0) {
      return {
        average: 60,
        min: 60,
        max: 60,
        current: 60
      };
    }
    
    const average = this.getAverageFPS();
    const min = Math.min(...this.frames);
    const max = Math.max(...this.frames);
    const current = this.frames[this.frames.length - 1] || 60;
    
    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      current: Math.round(current * 10) / 10
    };
  }

  /**
   * Reset the FPS monitor
   */
  reset() {
    this.frames = [];
    this.lastTime = performance.now();
  }
}

// Export for browser environment
if (typeof window !== 'undefined') {
  window.FPSMonitor = FPSMonitor;
}

// Export for Node.js/CommonJS environment (for testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FPSMonitor };
}

/**
 * AdaptiveQuality - Manages rendering quality based on performance
 * 
 * Monitors FPS history and automatically reduces quality when performance drops.
 * Implements three quality levels:
 * - High: Full distortion effects (default)
 * - Medium: Reduced distortion strength and radius
 * - Low: Minimal distortion, lower render resolution
 * 
 * Validates: Requirements 9.2, 9.5
 */
class AdaptiveQuality {
  constructor(renderer) {
    this.renderer = renderer;
    this.fpsHistory = [];
    this.maxHistory = 60; // Track last 60 FPS readings
    this.qualityLevel = 'high'; // high | medium | low
    this.minSamplesBeforeEvaluation = 30; // Wait for 30 samples before evaluating
    
    // Store original quality settings
    this.originalSettings = {
      distortionStrength: renderer.options.distortionStrength,
      distortionRadius: renderer.options.distortionRadius,
      renderScale: 1.0
    };
  }

  /**
   * Record a frame's FPS and evaluate quality if needed
   * @param {number} fps - Current frame's FPS
   */
  recordFrame(fps) {
    this.fpsHistory.push(fps);
    
    // Maintain rolling window
    if (this.fpsHistory.length > this.maxHistory) {
      this.fpsHistory.shift();
    }
    
    // Only evaluate after collecting enough samples
    if (this.fpsHistory.length >= this.minSamplesBeforeEvaluation) {
      this.evaluateQuality();
    }
  }

  /**
   * Evaluate current performance and adjust quality if needed
   */
  evaluateQuality() {
    const avgFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    
    // Determine appropriate quality level based on average FPS
    if (avgFPS < 20 && this.qualityLevel !== 'low') {
      console.warn('Performance degradation detected (FPS < 20), switching to low quality', {
        fps: Math.round(avgFPS * 10) / 10,
        previousQuality: this.qualityLevel
      });
      this.qualityLevel = 'low';
      this.applyLowQuality();
    } else if (avgFPS < 30 && this.qualityLevel === 'high') {
      console.warn('Performance degradation detected (FPS < 30), switching to medium quality', {
        fps: Math.round(avgFPS * 10) / 10,
        previousQuality: this.qualityLevel
      });
      this.qualityLevel = 'medium';
      this.applyMediumQuality();
    }
  }

  /**
   * Apply medium quality settings
   * Reduces distortion complexity while maintaining visual appeal
   */
  applyMediumQuality() {
    // Reduce distortion strength and radius
    this.setDistortionStrength(0.1);
    this.setDistortionRadius(0.2);
    
    console.log('✨ Medium quality mode applied');
  }

  /**
   * Apply low quality settings
   * Minimal distortion and reduced render resolution for maximum performance
   */
  applyLowQuality() {
    // Minimal distortion
    this.setDistortionStrength(0.05);
    this.setDistortionRadius(0.15);
    
    // Reduce render resolution to 75%
    this.setRenderScale(0.75);
    
    console.log('✨ Low quality mode applied');
  }

  /**
   * Set distortion strength
   * @param {number} strength - Distortion strength value
   */
  setDistortionStrength(strength) {
    if (this.renderer && this.renderer.uniforms && this.renderer.gl) {
      this.renderer.options.distortionStrength = strength;
      this.renderer.gl.uniform1f(this.renderer.uniforms.uDistortionStrength, strength);
    }
  }

  /**
   * Set distortion radius
   * @param {number} radius - Distortion radius value
   */
  setDistortionRadius(radius) {
    if (this.renderer && this.renderer.uniforms && this.renderer.gl) {
      this.renderer.options.distortionRadius = radius;
      this.renderer.gl.uniform1f(this.renderer.uniforms.uDistortionRadius, radius);
    }
  }

  /**
   * Set render scale (resolution multiplier)
   * @param {number} scale - Scale factor (0.5 = 50% resolution, 1.0 = 100%)
   */
  setRenderScale(scale) {
    if (this.renderer && this.renderer.canvas) {
      const canvas = this.renderer.canvas;
      const dpr = (window.devicePixelRatio || 1) * scale;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      const width = Math.floor(displayWidth * dpr);
      const height = Math.floor(displayHeight * dpr);
      
      canvas.width = width;
      canvas.height = height;
      
      if (this.renderer.gl) {
        this.renderer.gl.viewport(0, 0, width, height);
        
        // Update resolution uniform
        if (this.renderer.uniforms && this.renderer.uniforms.uResolution) {
          this.renderer.gl.uniform2f(this.renderer.uniforms.uResolution, width, height);
        }
      }
    }
  }

  /**
   * Get current quality level
   * @returns {string} Current quality level (high | medium | low)
   */
  getQualityLevel() {
    return this.qualityLevel;
  }

  /**
   * Reset quality to high
   */
  reset() {
    this.fpsHistory = [];
    this.qualityLevel = 'high';
    
    // Restore original settings
    this.setDistortionStrength(this.originalSettings.distortionStrength);
    this.setDistortionRadius(this.originalSettings.distortionRadius);
    this.setRenderScale(this.originalSettings.renderScale);
  }
}

// Export for browser environment
if (typeof window !== 'undefined') {
  window.AdaptiveQuality = AdaptiveQuality;
}

// Export for Node.js/CommonJS environment (for testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports.AdaptiveQuality = AdaptiveQuality;
}
