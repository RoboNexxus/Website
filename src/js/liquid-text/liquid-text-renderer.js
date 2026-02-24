/**
 * Liquid Text Renderer
 * 
 * Handles WebGL initialization, shader compilation, text texture generation,
 * and render loop for the liquid text effect.
 * 
 * Validates: Requirements 2.2, 8.1, 8.6, 10.1, 10.2, 10.4
 */

class LiquidTextRenderer {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.gl = null;
    this.program = null;
    this.vertexShader = null;
    this.fragmentShader = null;
    this.texture = null;
    this.vertexBuffer = null;
    this.texCoordBuffer = null;
    this.animationFrameId = null;
    this.startTime = performance.now();
    
    // Configuration options with defaults
    this.options = {
      textContent: options.textContent || "Robo Nexus",
      fontSize: options.fontSize || 120,
      fontFamily: options.fontFamily || "Roboto",
      fontWeight: options.fontWeight || 900,
      gradient: options.gradient || {
        start: "#ffffff",
        end: "#47a0b8"
      },
      distortionStrength: options.distortionStrength || 0.15,
      distortionRadius: options.distortionRadius || 0.25,
      minFPS: options.minFPS || 30
    };
    
    // State
    this.hoverPosition = { x: 0.5, y: 0.5 };
    this.isInitialized = false;
    
    // Performance monitoring
    this.fpsMonitor = null;
  }

  /**
   * Initialize WebGL context, compile shaders, and set up rendering
   * @returns {boolean} Success status
   */
  init() {
    try {
      // Create WebGL context with fallback detection
      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      
      if (!this.gl) {
        console.error('WebGL not supported', {
          userAgent: navigator.userAgent,
          webglSupport: !!window.WebGLRenderingContext
        });
        return false;
      }
      
      // Check if context is lost
      if (this.gl.isContextLost()) {
        console.error('WebGL context lost', {
          userAgent: navigator.userAgent
        });
        return false;
      }
      
      // Set canvas size to match display size
      this.resizeCanvas();
      
      // Compile and link shaders
      if (!this.initShaders()) {
        console.error('Shader initialization failed');
        return false;
      }
      
      // Create text texture
      if (!this.createTextTexture()) {
        console.error('Text texture creation failed');
        return false;
      }
      
      // Set up geometry buffers
      this.setupGeometry();
      
      // Set up uniforms
      this.setupUniforms();
      
      // Configure WebGL state
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
      
      // Initialize FPS monitor
      if (typeof window.FPSMonitor !== 'undefined') {
        this.fpsMonitor = new window.FPSMonitor();
        console.log('✨ FPS monitor initialized');
      } else {
        console.warn('FPSMonitor not available, performance monitoring disabled');
      }
      
      this.isInitialized = true;
      console.log('✨ Liquid text renderer initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Initialization error:', {
        message: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Compile and link vertex and fragment shaders
   * @returns {boolean} Success status
   */
  initShaders() {
    try {
      // Get shader sources from global object
      const shaders = window.LiquidTextShaders;
      if (!shaders) {
        console.error('Shader sources not found. Ensure liquid-text-shaders.js is loaded.');
        return false;
      }
      
      // Compile vertex shader
      this.vertexShader = this.compileShader(
        shaders.vertexShaderSource,
        this.gl.VERTEX_SHADER
      );
      
      if (!this.vertexShader) {
        return false;
      }
      
      // Compile fragment shader
      this.fragmentShader = this.compileShader(
        shaders.fragmentShaderSource,
        this.gl.FRAGMENT_SHADER
      );
      
      if (!this.fragmentShader) {
        return false;
      }
      
      // Create and link program
      this.program = this.gl.createProgram();
      this.gl.attachShader(this.program, this.vertexShader);
      this.gl.attachShader(this.program, this.fragmentShader);
      this.gl.linkProgram(this.program);
      
      // Check linking status
      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        const error = this.gl.getProgramInfoLog(this.program);
        console.error('Shader program linking failed:', {
          error: error
        });
        return false;
      }
      
      this.gl.useProgram(this.program);
      return true;
      
    } catch (error) {
      console.error('Shader initialization error:', {
        message: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Compile a shader from source
   * @param {string} source - Shader source code
   * @param {number} type - Shader type (VERTEX_SHADER or FRAGMENT_SHADER)
   * @returns {WebGLShader|null} Compiled shader or null on failure
   */
  compileShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    // Check compilation status
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      const shaderType = type === this.gl.VERTEX_SHADER ? 'vertex' : 'fragment';
      console.error('Shader compilation failed:', {
        shaderType: shaderType,
        error: error,
        source: source
      });
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  /**
   * Resize canvas to match display size with device pixel ratio
   */
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    
    const width = Math.floor(displayWidth * dpr);
    const height = Math.floor(displayHeight * dpr);
    
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      
      if (this.gl) {
        this.gl.viewport(0, 0, width, height);
      }
    }
  }

  /**
   * Create text texture from canvas 2D rendering
   * @returns {boolean} Success status
   */
  createTextTexture() {
    try {
      // Create offscreen canvas for text rendering
      const textCanvas = document.createElement('canvas');
      const ctx = textCanvas.getContext('2d');
      
      if (!ctx) {
        console.error('Failed to create 2D context for text texture');
        return false;
      }
      
      // Set high resolution for crisp text
      const dpr = window.devicePixelRatio || 1;
      const width = 1024;
      const height = 512;
      textCanvas.width = width * dpr;
      textCanvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      // Configure text rendering
      ctx.font = `${this.options.fontWeight} ${this.options.fontSize}px ${this.options.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      
      // Enable anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw text
      ctx.fillText(this.options.textContent, width / 2, height / 2);
      
      // Create WebGL texture
      this.texture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      
      // Set texture parameters
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      
      // Upload texture
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        textCanvas
      );
      
      return true;
      
    } catch (error) {
      console.error('Text texture creation error:', {
        message: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Set up vertex and texture coordinate buffers
   */
  setupGeometry() {
    // Full-screen quad vertices (normalized device coordinates)
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0
    ]);
    
    // Texture coordinates
    const texCoords = new Float32Array([
      0.0, 1.0,
      1.0, 1.0,
      0.0, 0.0,
      1.0, 0.0
    ]);
    
    // Create and bind vertex buffer
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
    const aPosition = this.gl.getAttribLocation(this.program, 'aPosition');
    this.gl.enableVertexAttribArray(aPosition);
    this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);
    
    // Create and bind texture coordinate buffer
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
    
    const aTexCoord = this.gl.getAttribLocation(this.program, 'aTexCoord');
    this.gl.enableVertexAttribArray(aTexCoord);
    this.gl.vertexAttribPointer(aTexCoord, 2, this.gl.FLOAT, false, 0, 0);
  }

  /**
   * Set up shader uniforms
   */
  setupUniforms() {
    // Get uniform locations
    this.uniforms = {
      uHoverPosition: this.gl.getUniformLocation(this.program, 'uHoverPosition'),
      uDistortionRadius: this.gl.getUniformLocation(this.program, 'uDistortionRadius'),
      uDistortionStrength: this.gl.getUniformLocation(this.program, 'uDistortionStrength'),
      uTime: this.gl.getUniformLocation(this.program, 'uTime'),
      uResolution: this.gl.getUniformLocation(this.program, 'uResolution'),
      uTexture: this.gl.getUniformLocation(this.program, 'uTexture'),
      uGradientStart: this.gl.getUniformLocation(this.program, 'uGradientStart'),
      uGradientEnd: this.gl.getUniformLocation(this.program, 'uGradientEnd')
    };
    
    // Set static uniforms
    this.gl.uniform1f(this.uniforms.uDistortionRadius, this.options.distortionRadius);
    this.gl.uniform1f(this.uniforms.uDistortionStrength, this.options.distortionStrength);
    this.gl.uniform2f(this.uniforms.uResolution, this.canvas.width, this.canvas.height);
    this.gl.uniform1i(this.uniforms.uTexture, 0);
    
    // Set gradient colors
    const startColor = this.hexToRgb(this.options.gradient.start);
    const endColor = this.hexToRgb(this.options.gradient.end);
    this.gl.uniform3f(this.uniforms.uGradientStart, startColor.r, startColor.g, startColor.b);
    this.gl.uniform3f(this.uniforms.uGradientEnd, endColor.r, endColor.g, endColor.b);
  }

  /**
   * Convert hex color to normalized RGB
   * @param {string} hex - Hex color string
   * @returns {object} RGB values normalized to 0-1
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 1, b: 1 };
  }

  /**
   * Set hover position for distortion effect
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  setHoverPosition(x, y) {
    this.hoverPosition.x = x;
    this.hoverPosition.y = y;
  }

  /**
   * Render a single frame
   */
  render() {
    if (!this.isInitialized || !this.gl) {
      return;
    }
    
    // Record frame for FPS monitoring
    if (this.fpsMonitor) {
      this.fpsMonitor.recordFrame();
    }
    
    // Clear canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    // Update time uniform
    const currentTime = (performance.now() - this.startTime) / 1000;
    this.gl.uniform1f(this.uniforms.uTime, currentTime);
    
    // Update hover position uniform
    // Convert from normalized (0-1) to NDC (-1 to 1)
    const ndcX = this.hoverPosition.x * 2.0 - 1.0;
    const ndcY = -(this.hoverPosition.y * 2.0 - 1.0); // Flip Y for screen coordinates
    this.gl.uniform2f(this.uniforms.uHoverPosition, ndcX, ndcY);
    
    // Bind texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    
    // Draw quad
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  /**
   * Start the render loop
   */
  startRenderLoop() {
    if (!this.isInitialized) {
      console.warn('Cannot start render loop: renderer not initialized');
      return;
    }
    
    const renderFrame = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(renderFrame);
    };
    
    renderFrame();
  }

  /**
   * Stop the render loop
   */
  stopRenderLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Get performance metrics
   * @returns {object} Performance metrics
   */
  getPerformanceMetrics() {
    if (this.fpsMonitor) {
      return this.fpsMonitor.getMetrics();
    }
    
    // Fallback if FPS monitor not available
    return {
      average: 60,
      min: 60,
      max: 60,
      current: 60
    };
  }

  /**
   * Clean up all resources
   */
  dispose() {
    // Stop render loop
    this.stopRenderLoop();
    
    // Delete WebGL resources
    if (this.gl) {
      if (this.program) {
        this.gl.deleteProgram(this.program);
      }
      if (this.vertexShader) {
        this.gl.deleteShader(this.vertexShader);
      }
      if (this.fragmentShader) {
        this.gl.deleteShader(this.fragmentShader);
      }
      if (this.texture) {
        this.gl.deleteTexture(this.texture);
      }
      if (this.vertexBuffer) {
        this.gl.deleteBuffer(this.vertexBuffer);
      }
      if (this.texCoordBuffer) {
        this.gl.deleteBuffer(this.texCoordBuffer);
      }
      
      // Lose context to free GPU memory
      const loseContext = this.gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    }
    
    // Clear canvas
    if (this.canvas) {
      this.canvas.width = 0;
      this.canvas.height = 0;
    }
    
    this.isInitialized = false;
    console.log('✨ Liquid text renderer disposed');
  }
}

// Export for browser environment
if (typeof window !== 'undefined') {
  window.LiquidTextRenderer = LiquidTextRenderer;
}

// Export for Node.js/CommonJS environment (for testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiquidTextRenderer;
}
