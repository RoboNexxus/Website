/**
 * Liquid Text Shaders
 * 
 * Apple-style liquid glass distortion effect with continuous automatic animation.
 * Features flowing organic distortion using multi-octave noise for depth and complexity.
 */

// Vertex Shader - Simple passthrough for 2D rendering
const vertexShaderSource = `
precision mediump float;

attribute vec2 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Fragment Shader - Liquid glass refraction with multi-layered noise
const fragmentShaderSource = `
precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uGradientStart;
uniform vec3 uGradientEnd;
uniform float uTime;

varying vec2 vTexCoord;

// Simplex-style noise approximation for organic movement
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Multi-octave noise for complex liquid movement
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  // Layer 3 octaves of noise
  for(int i = 0; i < 3; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

void main() {
  vec2 uv = vTexCoord;
  
  // Create flowing liquid glass distortion
  float time = uTime * 0.3;
  
  // Primary flow direction (diagonal sweep)
  vec2 flow1 = vec2(time * 0.5, time * 0.3);
  vec2 flow2 = vec2(-time * 0.4, time * 0.6);
  
  // Multi-layered noise for depth
  float noise1 = fbm(uv * 3.0 + flow1);
  float noise2 = fbm(uv * 2.5 + flow2);
  float noise3 = fbm(uv * 4.0 + flow1 * 1.5);
  
  // Combine noise layers for complex distortion
  vec2 distortion = vec2(
    noise1 * 0.015 + noise2 * 0.01,
    noise2 * 0.015 + noise3 * 0.008
  );
  
  // Add swirling motion
  float angle = noise1 * 0.5;
  float s = sin(angle);
  float c = cos(angle);
  distortion = vec2(
    distortion.x * c - distortion.y * s,
    distortion.x * s + distortion.y * c
  );
  
  // Apply liquid glass refraction
  vec2 distortedUV = uv + distortion;
  
  // Sample text texture with distortion
  vec4 texColor = texture2D(uTexture, distortedUV);
  
  // Apply gradient based on vertical position
  vec3 gradient = mix(uGradientStart, uGradientEnd, vTexCoord.y);
  
  // Combine texture alpha with gradient color
  vec3 finalColor = gradient * texColor.a;
  
  // Add subtle chromatic-like shimmer based on distortion
  float shimmer = (noise1 + noise2) * 0.05;
  finalColor += shimmer * vec3(0.15, 0.25, 0.35) * texColor.a;
  
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
