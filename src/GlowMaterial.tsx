import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const GlowMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uSize: new THREE.Vector2(1.0, 1.0),
    uIntensity: 0.5,
    uGain: 2.0,
    uContrast: 1.0, // NOVO
    uDistortionStr: 0.0,
    uFrequency: 3.0,
    uShapeMode: 0, 
    uRingRadius: 0.4,
    uRingWidth: 0.05,
    uRingOpacity: 0.5,
    uPixelCount: 1024.0, 
    uShowGrid: 0.0,
    uPoints: 4.0,
    uTwist: 0.0,
    uSeed: 0.0,
    uColor: new THREE.Color(1.0, 1.0, 1.0),
    
    // Translação/Escala
    uPosition: new THREE.Vector2(0, 0),
    uScale: new THREE.Vector2(1, 1),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    uniform float uTime;
    uniform vec2 uSize;
    uniform float uIntensity;
    uniform float uGain;
    uniform float uContrast; // NOVO
    uniform float uDistortionStr;
    uniform float uFrequency;
    uniform int uShapeMode;
    uniform float uRingRadius;
    uniform float uRingWidth;
    uniform float uRingOpacity;
    uniform float uPixelCount;
    uniform float uShowGrid;
    uniform float uPoints;
    uniform float uTwist;
    uniform float uSeed;
    uniform vec3 uColor;
    
    uniform vec2 uPosition;
    uniform vec2 uScale;

    varying vec2 vUv;

    float sdPolygon(vec2 p, float n) {
        float angle = atan(p.x, p.y) + 3.14159;
        float r = 6.28318 / n;
        float a = floor(0.5 + angle / r) * r - angle;
        return cos(a) * length(p);
    }

    void main() {
      vec2 uv = vUv;
      if (uPixelCount > 0.0 && uPixelCount < 4096.0) { 
         float p = uPixelCount; 
         uv = floor(uv * p) / p; 
      }
      
      vec2 centeredUV = uv - 0.5 - uPosition;

      // Twist
      float angle = atan(centeredUV.y, centeredUV.x);
      float len = length(centeredUV);
      angle += uTwist; 
      vec2 twistedUV = vec2(cos(angle) * len, sin(angle) * len);
      
      // Scale
      vec2 stretchedUv = vec2(twistedUV.x / uScale.x, twistedUV.y / uScale.y);

      // Noise
      float noiseVal = snoise(stretchedUv * uFrequency + vec2(uSeed + uTime * 0.2, uSeed - uTime * 0.1));
      vec2 distortedUv = stretchedUv + (noiseVal * uDistortionStr * 0.15);

      float dist = length(distortedUv);
      float phi = atan(distortedUv.y, distortedUv.x); 
      float brightness = 0.0;

      // --- SHAPES ---
      if (uShapeMode == 0) { // Center
          brightness = pow(0.02 / max(dist, 0.001), 1.2 / max(uIntensity, 0.01));
      } else if (uShapeMode == 1) { // Ring
          brightness = smoothstep(uRingWidth, uRingWidth * 0.2, abs(dist - uRingRadius));
          brightness *= uRingOpacity;
      } else if (uShapeMode == 2) { // Nebula
          float nebula = snoise(centeredUV * uFrequency * 2.0 + vec2(uTime * 0.2 + uSeed*10.0));
          brightness = (nebula * 0.5 + 0.5) * smoothstep(1.0, 0.0, dist);
          brightness *= uIntensity * 2.0;
      } else if (uShapeMode == 3) { // Star
          float angleVal = cos(phi * uPoints + uTime);
          float radiusBounds = mix(uRingRadius, 1.0, (angleVal * 0.5 + 0.5));
          float d = (dist * 0.5) / radiusBounds; 
          brightness = pow(0.02 / d, 1.5 - uIntensity);
          brightness *= smoothstep(1.0, 0.2, dist);
      } else if (uShapeMode == 4) { // Polygon
          float distPol = sdPolygon(distortedUv, uPoints);
          float border = smoothstep(uRingWidth, 0.0, abs(distPol - uRingRadius * 0.5));
          float fill = smoothstep(uRingRadius * 0.5, 0.0, distPol);
          brightness = max(border, fill * uRingOpacity);
          brightness += fill * uIntensity * 0.5;
      }

      // Edge mask
      brightness *= smoothstep(0.8, 0.5, dist);
      
      // --- BRIGHTNESS & CONTRAST ---
      // Apply Gain
      brightness *= uGain;
      // Apply Contrast (Power function)
      brightness = pow(brightness, uContrast);

      brightness = clamp(brightness, 0.0, 1.0);
      vec3 finalColor = uColor * brightness;
      
      // Grid
      if (uShowGrid > 0.5 && uPixelCount > 0.0 && uPixelCount < 600.0) {
          vec2 gridUV = vUv * uPixelCount;
          vec2 grid = step(0.95, fract(gridUV)) + step(0.05, 1.0 - fract(gridUV));
          if (max(grid.x, grid.y) > 1.5) {
             finalColor *= 0.5;
             brightness = max(brightness, 0.1); 
          }
      }

      gl_FragColor = vec4(finalColor, brightness);
    }
  `
);

extend({ GlowMaterial: GlowMaterialImpl });
export { GlowMaterialImpl as GlowMaterial };