import * as THREE from 'three';
import galaxyVertexShader from '../shaders/galaxyVertex.glsl';
import galaxyFragmentShader from '../shaders/galaxyFragment.glsl';
import { disposeObject3D, safeRemove } from '../utils/dispose.js';

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGalaxy(root, config, qualityPreset) {
  const group = new THREE.Group();
  group.name = 'GalaxyGroup';
  root.add(group);

  const state = {
    points: null,
    dust: null,
    uniforms: null,
    dustUniforms: null,
    random: mulberry32(config.seed)
  };

  function randomAround(radius, power = 2) {
    const sign = state.random() > 0.5 ? 1 : -1;
    return Math.pow(state.random(), power) * sign * radius;
  }

  function build() {
    if (state.points) {
      safeRemove(group, state.points);
      disposeObject3D(state.points);
      state.points = null;
    }

    if (state.dust) {
      safeRemove(group, state.dust);
      disposeObject3D(state.dust);
      state.dust = null;
    }

    state.random = mulberry32(config.seed);

    const count = config.particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    const colorInner = new THREE.Color(config.colors.inner);
    const colorMid = new THREE.Color(config.colors.mid);
    const colorOuter = new THREE.Color(config.colors.outer);
    const colorAccent = new THREE.Color(config.colors.accent);

    const branches = Math.max(2, Math.floor(config.branches));
    const radius = config.radius;

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const distance = Math.pow(state.random(), 0.68) * radius;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = distance * config.spin;
      const randomX = randomAround(config.randomness * (radius - distance) / radius, config.randomnessPower);
      const randomY = randomAround(config.verticalSpread * (0.25 + (distance / radius) * 0.8), 1.7);
      const randomZ = randomAround(config.randomness * (radius - distance) / radius, config.randomnessPower);

      const angle = branchAngle + spinAngle;
      positions[i3 + 0] = Math.cos(angle) * distance + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(angle) * distance + randomZ;

      const mixMid = Math.min(1, distance / (radius * 0.65));
      const mixOuter = Math.min(1, distance / radius);
      const color = new THREE.Color();
      color.copy(colorInner).lerp(colorMid, mixMid).lerp(colorOuter, mixOuter * 0.75);
      if (state.random() > 0.965) {
        color.lerp(colorAccent, 0.7);
      }

      colors[i3 + 0] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      const centerBoost = 1 - distance / radius;
      sizes[i] = (0.4 + state.random() * 1.6 + centerBoost * 1.4);
      alphas[i] = 0.2 + state.random() * 0.8 + centerBoost * 0.2;
      phases[i] = state.random() * Math.PI * 2;
      speeds[i] = 0.7 + (1 - distance / radius) * 2.6 + state.random() * 0.25;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

    state.uniforms = {
      uTime: { value: 0 },
      uSize: { value: config.starSize },
      uRotationSpeed: { value: config.rotationSpeed },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, qualityPreset.maxPixelRatio) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: galaxyVertexShader,
      fragmentShader: galaxyFragmentShader,
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: state.uniforms
    });

    state.points = new THREE.Points(geometry, material);
    group.add(state.points);

    const dustCount = qualityPreset.dustParticles;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    const dustAlphas = new Float32Array(dustCount);
    const dustPhases = new Float32Array(dustCount);
    const dustSpeeds = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i += 1) {
      const i3 = i * 3;
      const distance = Math.pow(state.random(), 1.5) * config.accretionDiskSize * 5.4;
      const angle = state.random() * Math.PI * 2;
      dustPositions[i3 + 0] = Math.cos(angle) * distance + randomAround(0.4, 1.5);
      dustPositions[i3 + 1] = randomAround(config.verticalSpread * 0.35, 1.2);
      dustPositions[i3 + 2] = Math.sin(angle) * distance + randomAround(0.4, 1.5);

      const dustColor = new THREE.Color(config.colors.mid).lerp(new THREE.Color(config.colors.outer), state.random() * 0.6);
      dustColors[i3 + 0] = dustColor.r;
      dustColors[i3 + 1] = dustColor.g;
      dustColors[i3 + 2] = dustColor.b;

      dustSizes[i] = 0.5 + state.random() * 1.8;
      dustAlphas[i] = 0.12 + state.random() * 0.28;
      dustPhases[i] = state.random() * Math.PI * 2;
      dustSpeeds[i] = 1.8 + state.random() * 1.8;
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    dustGeometry.setAttribute('aSize', new THREE.BufferAttribute(dustSizes, 1));
    dustGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(dustAlphas, 1));
    dustGeometry.setAttribute('aPhase', new THREE.BufferAttribute(dustPhases, 1));
    dustGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(dustSpeeds, 1));

    state.dustUniforms = {
      uTime: { value: 0 },
      uSize: { value: config.starSize * 0.82 },
      uRotationSpeed: { value: config.rotationSpeed * 1.45 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, qualityPreset.maxPixelRatio) }
    };

    const dustMaterial = new THREE.ShaderMaterial({
      vertexShader: galaxyVertexShader,
      fragmentShader: galaxyFragmentShader,
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: state.dustUniforms
    });

    state.dust = new THREE.Points(dustGeometry, dustMaterial);
    group.add(state.dust);
  }

  function update(time) {
    if (state.uniforms) {
      state.uniforms.uTime.value = time;
      state.uniforms.uSize.value = config.starSize;
      state.uniforms.uRotationSpeed.value = config.rotationSpeed;
    }

    if (state.dustUniforms) {
      state.dustUniforms.uTime.value = time;
      state.dustUniforms.uSize.value = config.starSize * 0.82;
      state.dustUniforms.uRotationSpeed.value = config.rotationSpeed * 1.45;
    }

    group.rotation.y += 0.0001;
  }

  function setPixelRatio(maxPixelRatio) {
    const value = Math.min(window.devicePixelRatio, maxPixelRatio);
    if (state.uniforms) {
      state.uniforms.uPixelRatio.value = value;
    }
    if (state.dustUniforms) {
      state.dustUniforms.uPixelRatio.value = value;
    }
  }

  build();

  return {
    group,
    update,
    rebuild: build,
    setPixelRatio,
    dispose() {
      safeRemove(root, group);
      disposeObject3D(group);
    }
  };
}
