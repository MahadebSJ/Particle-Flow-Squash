import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, gestureState } from '../store/useStore';

const PARTICLE_COUNT = 15000;

// Helper to generate text points
const generateTextPoints = (text: string, count: number): Float32Array => {
  const canvas = document.createElement('canvas');
  const size = 256; 
  canvas.width = size * 4; 
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Float32Array(count * 3);
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = 'bold 180px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const points: number[] = [];
  
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const i = (y * canvas.width + x) * 4;
      if (data[i] > 128) { 
        const px = (x / canvas.width - 0.5) * 20;
        const py = -(y / canvas.height - 0.5) * 5;
        points.push(px, py, 0);
      }
    }
  }
  
  const array = new Float32Array(count * 3);
  if (points.length === 0) return array;

  for (let i = 0; i < count; i++) {
    const rndIndex = Math.floor(Math.random() * (points.length / 3)) * 3;
    array[i * 3] = points[rndIndex];
    array[i * 3 + 1] = points[rndIndex + 1];
    array[i * 3 + 2] = points[rndIndex + 2];
  }
  return array;
};

// Shader code
const vertexShader = `
  uniform float uTime;
  uniform float uOpenness; 
  uniform float uScale;
  
  attribute vec3 positionSphere;
  attribute vec3 positionCube;
  attribute vec3 positionSpiral;
  attribute vec3 positionRandom;
  attribute vec3 positionHeart;
  attribute vec3 positionText;
  attribute vec3 positionRing;
  attribute vec3 positionWave;
  attribute vec3 positionFuckYou;
  
  uniform float uMixSphere;
  uniform float uMixCube;
  uniform float uMixSpiral;
  uniform float uMixRandom;
  uniform float uMixHeart;
  uniform float uMixText;
  uniform float uMixRing;
  uniform float uMixWave;
  uniform float uMixFuckYou;

  varying float vAlpha;

  void main() {
    vec3 pos = positionSphere * uMixSphere + 
               positionCube * uMixCube + 
               positionSpiral * uMixSpiral + 
               positionRandom * uMixRandom +
               positionHeart * uMixHeart +
               positionText * uMixText +
               positionRing * uMixRing +
               positionWave * uMixWave +
               positionFuckYou * uMixFuckYou;

    float pulse = sin(uTime * 2.0) * 0.05 + 1.0;
    
    float isSpecial = uMixHeart + uMixText;
    float expansion = mix(mix(0.3, 2.5, uOpenness), 1.0, isSpecial); 
    
    float noise = sin(pos.x * 10.0 + uTime) * cos(pos.y * 10.0 + uTime) * 0.1 * uOpenness;
    noise *= (1.0 - isSpecial * 0.8);
    
    vec3 finalPos = pos * expansion * pulse + (normalize(pos) * noise);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    gl_PointSize = (4.0 * uScale + (uOpenness * 2.0)) * (10.0 / -mvPosition.z);
    
    vAlpha = 0.6 + 0.4 * uOpenness;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.3, dist) * vAlpha;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const ParticleSystem: React.FC = () => {
  const meshRef = useRef<THREE.Points>(null);
  const { pattern, color, customName } = useStore();
  
  const attributes = useMemo(() => {
    const sphere = new Float32Array(PARTICLE_COUNT * 3);
    const cube = new Float32Array(PARTICLE_COUNT * 3);
    const spiral = new Float32Array(PARTICLE_COUNT * 3);
    const random = new Float32Array(PARTICLE_COUNT * 3);
    const heart = new Float32Array(PARTICLE_COUNT * 3);
    // Fuck You (Middle Finger Emoji Pattern)
    const fuckYou = generateTextPoints('🖕', PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

      // Sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 2 + Math.random() * 0.5;
      sphere[i3] = r * Math.sin(phi) * Math.cos(theta);
      sphere[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      sphere[i3 + 2] = r * Math.cos(phi);

      // Cube
      const s = 3;
      cube[i3] = (Math.random() - 0.5) * s;
      cube[i3 + 1] = (Math.random() - 0.5) * s;
      cube[i3 + 2] = (Math.random() - 0.5) * s;

      // Spiral
      const t = i / PARTICLE_COUNT * 20;
      const rad = i / PARTICLE_COUNT * 4;
      spiral[i3] = rad * Math.cos(t);
      spiral[i3 + 1] = (i / PARTICLE_COUNT - 0.5) * 5;
      spiral[i3 + 2] = rad * Math.sin(t);

      // Random
      random[i3] = (Math.random() - 0.5) * 8;
      random[i3 + 1] = (Math.random() - 0.5) * 8;
      random[i3 + 2] = (Math.random() - 0.5) * 8;

      // Heart
      const ht = Math.random() * Math.PI * 2;
      const hScale = 0.15 * (0.8 + Math.random() * 0.2); 
      const hx = 16 * Math.pow(Math.sin(ht), 3);
      const hy = 13 * Math.cos(ht) - 5 * Math.cos(2*ht) - 2 * Math.cos(3*ht) - Math.cos(4*ht);
      
      heart[i3] = hx * hScale;
      heart[i3 + 1] = hy * hScale;
      heart[i3 + 2] = (Math.random() - 0.5) * 2;
    }
    
    // Ring (Torus)
    const ring = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const R = 3.5; // Main radius
        const r = 0.8; // Tube radius
        
        ring[i*3] = (R + r * Math.cos(phi)) * Math.cos(theta);
        ring[i*3+1] = (R + r * Math.cos(phi)) * Math.sin(theta);
        ring[i*3+2] = r * Math.sin(phi);
    }

    // Wave (Sinewave Plane)
    const wave = new Float32Array(PARTICLE_COUNT * 3);
    const size = 8;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = (Math.random() - 0.5) * size;
        const z = (Math.random() - 0.5) * size;
        const y = Math.sin(x * 2.0) * 0.5 + Math.cos(z * 2.0) * 0.5;
        wave[i*3] = x;
        wave[i*3+1] = y * 1.5;
        wave[i*3+2] = z;
    }

    return { sphere, cube, spiral, random, heart, ring, wave, fuckYou };
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const textPoints = generateTextPoints(`I Love You\n${customName}`, PARTICLE_COUNT);
    
    const geometry = meshRef.current.geometry;
    geometry.setAttribute('positionText', new THREE.BufferAttribute(textPoints, 3));
    geometry.attributes.positionText.needsUpdate = true;
  }, [customName]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uOpenness: { value: 0.5 },
    uScale: { value: 1.0 },
    uMixSphere: { value: 1.0 },
    uMixCube: { value: 0.0 },
    uMixSpiral: { value: 0.0 },
    uMixRandom: { value: 0.0 },
    uMixHeart: { value: 0.0 },
    uMixText: { value: 0.0 },
    uMixFuckYou: { value: 0.0 },
    uMixRing: { value: 0.0 },
    uMixWave: { value: 0.0 },
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uColor.value.set(color);
    
    const targetOpenness = gestureState.value;
    material.uniforms.uOpenness.value += (targetOpenness - material.uniforms.uOpenness.value) * 0.1;
    
    let tSphere = 0, tCube = 0, tSpiral = 0, tRandom = 0, tHeart = 0, tText = 0, tFuckYou = 0, tRing = 0, tWave = 0;

    // Gesture overrides
    if (gestureState.type === 'heart') {
      tHeart = 1;
    } else if (gestureState.type === 'victory') {
      tText = 1;
      // We rely on the useEffect below to update text geometry for 'customName'
    } else if (gestureState.type === 'middle_finger') {
      tFuckYou = 1;
    } else {
      if (pattern === 'sphere') tSphere = 1;
      else if (pattern === 'cube') tCube = 1;
      else if (pattern === 'spiral') tSpiral = 1;
      else if (pattern === 'random') tRandom = 1;
      else if (pattern === 'ring') tRing = 1;
      else if (pattern === 'wave') tWave = 1;
    }
    
    const lerpSpeed = 0.08;
    const u = material.uniforms;
    u.uMixSphere.value += (tSphere - u.uMixSphere.value) * lerpSpeed;
    u.uMixCube.value += (tCube - u.uMixCube.value) * lerpSpeed;
    u.uMixSpiral.value += (tSpiral - u.uMixSpiral.value) * lerpSpeed;
    u.uMixRandom.value += (tRandom - u.uMixRandom.value) * lerpSpeed;
    u.uMixRing.value += (tRing - u.uMixRing.value) * lerpSpeed;
    u.uMixWave.value += (tWave - u.uMixWave.value) * lerpSpeed;
    u.uMixHeart.value += (tHeart - u.uMixHeart.value) * lerpSpeed;
    u.uMixText.value += (tText - u.uMixText.value) * lerpSpeed;
    u.uMixFuckYou.value += (tFuckYou - u.uMixFuckYou.value) * lerpSpeed;
    
    // Apply Gesture Rotation
    // Invert X rotation for natural feel (Hand Up -> Rotate Up/Back)
    // Invert Y rotation (Hand Right -> Rotate Right)
    // Note: gestureState.rotation.x is mapped from Hand Y (0 top, 1 bottom)
    // gestureState.rotation.y is mapped from Hand X (0 left, 1 right)
    
    meshRef.current.rotation.x = gestureState.rotation.x * 0.5; // Scale down a bit
    meshRef.current.rotation.y = -gestureState.rotation.y * 0.5; // Mirror Y for natural feel
    
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={attributes.sphere} itemSize={3} />
        <bufferAttribute attach="attributes-positionSphere" count={PARTICLE_COUNT} array={attributes.sphere} itemSize={3} />
        <bufferAttribute attach="attributes-positionCube" count={PARTICLE_COUNT} array={attributes.cube} itemSize={3} />
        <bufferAttribute attach="attributes-positionSpiral" count={PARTICLE_COUNT} array={attributes.spiral} itemSize={3} />
        <bufferAttribute attach="attributes-positionRandom" count={PARTICLE_COUNT} array={attributes.random} itemSize={3} />
        <bufferAttribute attach="attributes-positionHeart" count={PARTICLE_COUNT} array={attributes.heart} itemSize={3} />
        <bufferAttribute attach="attributes-positionRing" count={PARTICLE_COUNT} array={attributes.ring} itemSize={3} />
        <bufferAttribute attach="attributes-positionWave" count={PARTICLE_COUNT} array={attributes.wave} itemSize={3} />
        <bufferAttribute attach="attributes-positionFuckYou" count={PARTICLE_COUNT} array={attributes.fuckYou} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleSystem;
