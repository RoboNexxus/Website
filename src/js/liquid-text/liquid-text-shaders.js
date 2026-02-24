/**
 * Liquid Text Shaders
 * 
 * Contains vertex and fragment shader source code for the liquid text effect.
 * Implements fluid distortion with wave effects and gradient coloring.
 */

// Vertex Shader - Calculates distortion and passes to fragment shader
const vertexShaderSource = `
precision mediump float;

attribute vec2 aPosition;
attribute vec2 aTexCoord;

uniform vec2 uHoverPosition;
uniform float uDistortionRadius;
uniform float uDistortionStrength;
uniform float uTime;

varying vec2 vTexCoord;
varying float vDistortion;

void main() {
  vTexCoord = aTexCoord;
  
  // Calculate distance from hover point
  vec2 diff = aPosition - uHoverPosition;
  float dist = length(diff);
  
  // Apply simple distortion within radius
  float distortion = 0.0;
  if (dist < uDistortionRadius) {
    float normalizedDist = dist / uDistortionRadius;
    // Simple smooth falloff: (1 - x)^2
    float falloff = 1.0 - normalizedDist;
    distortion = falloff * falloff * uDistortionStrength;
    
    // Add subtle wave motion
    distortion *= 1.0 + 0.2 * sin(uTime * 3.0 + dist * 10.0);
  }
  
  vDistortion = distortion;
  
  // Output position directly to clip space (2D)
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Fragment Shader - Samples text texture with wave distortion and applies gradient
const fragmentShaderSource = `
precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uGradientStart;
uniform vec3 uGradientEnd;
uniform float uTime;

varying vec2 vTexCoord;
varying float vDistortion;

void main() {
  // Apply wave distortion to UV coordinates
  vec2 uv = vTexCoord;
  float wave = vDistortion * 0.02;
  uv.x += sin(uv.y * 10.0 + uTime * 2.0) * wave;
  uv.y += cos(uv.x * 10.0 + uTime * 2.0) * wave;
  
  // Sample text texture
  vec4 texColor = texture2D(uTexture, uv);
  
  // Apply gradient based on vertical position
  vec3 gradient = mix(uGradientStart, uGradientEnd, vTexCoord.y);
  
  // Combine texture alpha with gradient color
  vec3 finalColor = gradient * texColor.a;
  
  // Add subtle glow effect based on distortion
  float glow = vDistortion * 0.1;
  finalColor += glow * vec3(0.2, 0.4, 0.5);
  
  gl_FragColor = vec4(finalColor, texColor.a);
}
`;

// Export shader sources
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/CommonJS environment
  module.exports = {
    vertexShaderSource,
    fragmentShaderSource
  };
} else {
  // Browser environment - attach to window
  window.LiquidTextShaders = {
    vertexShaderSource,
    fragmentShaderSource
  };
}
