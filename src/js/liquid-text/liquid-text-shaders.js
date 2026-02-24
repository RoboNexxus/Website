/**
 * Liquid Text Shaders
 * 
 * Contains vertex and fragment shader source code for the liquid text effect.
 * Implements fluid distortion with wave effects and gradient coloring.
 */

// Vertex Shader - Applies 3D displacement based on hover position
const vertexShaderSource = `
attribute vec2 aPosition;
attribute vec2 aTexCoord;

uniform vec2 uHoverPosition;
uniform float uDistortionRadius;
uniform float uDistortionStrength;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vTexCoord;
varying float vDistortion;

// Easing function matching VengenceUI
float easeInOutCubic(float x) {
  return x < 0.5 
    ? 4.0 * x * x * x 
    : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
}

void main() {
  vTexCoord = aTexCoord;
  
  // Convert to normalized device coordinates
  vec2 position = aPosition;
  
  // Calculate distance from hover point
  vec2 diff = position - uHoverPosition;
  float dist = length(diff);
  
  // Apply distortion within radius
  float distortion = 0.0;
  if (dist < uDistortionRadius) {
    float normalizedDist = dist / uDistortionRadius;
    float easedDist = easeInOutCubic(1.0 - normalizedDist);
    distortion = easedDist * uDistortionStrength;
    
    // Add subtle wave motion
    distortion *= 1.0 + 0.2 * sin(uTime * 3.0 + dist * 10.0);
  }
  
  vDistortion = distortion;
  
  // Apply Z displacement for 3D effect
  vec3 displaced = vec3(position, distortion);
  
  gl_Position = vec4(displaced, 1.0);
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
  uv.x += sin(uv.y * 10.0 + uTime * 2.0) * vDistortion * 0.02;
  uv.y += cos(uv.x * 10.0 + uTime * 2.0) * vDistortion * 0.02;
  
  // Sample text texture
  vec4 texColor = texture2D(uTexture, uv);
  
  // Apply gradient based on vertical position
  vec3 gradient = mix(uGradientStart, uGradientEnd, vTexCoord.y);
  
  // Combine texture alpha with gradient color
  vec3 finalColor = gradient * texColor.a;
  
  // Add subtle glow effect based on distortion
  float glow = vDistortion * 0.3;
  finalColor += vec3(glow * 0.2, glow * 0.4, glow * 0.5);
  
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
