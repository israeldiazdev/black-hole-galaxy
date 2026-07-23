import * as THREE from 'three';
import accretionVertexShader from '../shaders/accretionVertex.glsl?raw';
import accretionFragmentShader from '../shaders/accretionFragment.glsl?raw';
import { disposeObject3D, safeRemove } from '../utils/dispose.js';

function createGradientTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 5, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.35, 'rgba(255,120,220,0.35)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createBlackHole(root, config, qualityPreset) {
  const group = new THREE.Group();
  group.name = 'BlackHoleGroup';
  root.add(group);

  const horizon = new THREE.Mesh(
    new THREE.SphereGeometry(config.eventHorizonRadius, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  group.add(horizon);

  const diskGeometry = new THREE.RingGeometry(config.eventHorizonRadius * 1.05, config.accretionDiskSize, 128, 1);
  const diskMaterial = new THREE.ShaderMaterial({
    vertexShader: accretionVertexShader,
    fragmentShader: accretionFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uGlow: { value: config.glowIntensity },
      uDistortion: { value: config.distortionIntensity },
      uHotColor: { value: new THREE.Color('#fff4e3') },
      uCoolColor: { value: new THREE.Color(config.colors.mid) }
    }
  });

  const disk = new THREE.Mesh(diskGeometry, diskMaterial);
  disk.rotation.x = -Math.PI * 0.5;
  group.add(disk);

  const glowTexture = createGradientTexture();
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: new THREE.Color(config.colors.mid),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.75
    })
  );
  glow.scale.set(config.accretionDiskSize * 4.2, config.accretionDiskSize * 4.2, 1);
  group.add(glow);

  const lensRing = new THREE.Mesh(
    new THREE.TorusGeometry(config.accretionDiskSize * 0.96, 0.16, 24, 96),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.colors.accent),
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  lensRing.rotation.x = Math.PI * 0.5;
  group.add(lensRing);

  const streamCount = qualityPreset.blackHoleParticles;
  const streamPositions = new Float32Array(streamCount * 3);
  const streamColors = new Float32Array(streamCount * 3);
  const streamSizes = new Float32Array(streamCount);

  const streamData = [];
  const tempColorA = new THREE.Color(config.colors.mid);
  const tempColorB = new THREE.Color('#ffffff');

  for (let i = 0; i < streamCount; i += 1) {
    const radius = config.eventHorizonRadius * 1.8 + Math.random() * config.accretionDiskSize * 2.6;
    const angle = Math.random() * Math.PI * 2;
    const vertical = (Math.random() - 0.5) * 0.55;
    const speed = 0.8 + Math.random() * 2.4;

    streamData.push({
      radius,
      angle,
      vertical,
      speed,
      infall: Math.random() > 0.66,
      infallVelocity: 0.015 + Math.random() * 0.035
    });

    const i3 = i * 3;
    streamPositions[i3 + 0] = Math.cos(angle) * radius;
    streamPositions[i3 + 1] = vertical;
    streamPositions[i3 + 2] = Math.sin(angle) * radius;

    const c = tempColorA.clone().lerp(tempColorB, Math.random() * 0.55);
    streamColors[i3 + 0] = c.r;
    streamColors[i3 + 1] = c.g;
    streamColors[i3 + 2] = c.b;

    streamSizes[i] = 1.8 + Math.random() * 2.6;
  }

  const streamGeometry = new THREE.BufferGeometry();
  streamGeometry.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
  streamGeometry.setAttribute('color', new THREE.BufferAttribute(streamColors, 3));
  streamGeometry.setAttribute('size', new THREE.BufferAttribute(streamSizes, 1));

  const streamMaterial = new THREE.PointsMaterial({
    size: 0.05,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  const streams = new THREE.Points(streamGeometry, streamMaterial);
  group.add(streams);

  const signatureStrokeDefs = [
    [[0.0, 0.0], [0.32, 1.0]], [[0.32, 1.0], [0.64, 0.0]], [[0.16, 0.5], [0.48, 0.5]],
    [[0.95, 0.0], [0.95, 1.0]], [[0.95, 1.0], [1.5, 1.0]], [[0.95, 0.5], [1.37, 0.5]], [[0.95, 0.0], [1.55, 0.0]],
    [[1.82, 1.0], [1.82, 0.0]], [[1.82, 0.0], [2.45, 0.0]],
    [[2.72, 0.0], [2.72, 1.0]], [[2.72, 1.0], [3.34, 1.0]], [[2.72, 0.5], [3.2, 0.5]], [[2.72, 0.0], [3.34, 0.0]],
    [[3.6, 0.0], [3.6, 1.0]], [[3.6, 1.0], [4.15, 0.0]], [[4.15, 0.0], [4.15, 1.0]],
    [[4.44, 1.0], [4.44, 0.0]], [[4.44, 1.0], [5.02, 1.0]]
  ];

  const signatureGlyph = [];
  const signatureStep = 0.11;
  signatureStrokeDefs.forEach(([from, to]) => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const length = Math.hypot(dx, dy);
    const steps = Math.max(2, Math.ceil(length / signatureStep));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      signatureGlyph.push([from[0] + dx * t, from[1] + dy * t]);
    }
  });

  const signaturePositions = new Float32Array(signatureGlyph.length * 3);
  const signatureColors = new Float32Array(signatureGlyph.length * 3);
  const signatureColor = new THREE.Color('#f7f0ff');
  for (let i = 0; i < signatureGlyph.length; i += 1) {
    const i3 = i * 3;
    signatureColors[i3 + 0] = signatureColor.r;
    signatureColors[i3 + 1] = signatureColor.g;
    signatureColors[i3 + 2] = signatureColor.b;
  }

  const signatureGeometry = new THREE.BufferGeometry();
  signatureGeometry.setAttribute('position', new THREE.BufferAttribute(signaturePositions, 3));
  signatureGeometry.setAttribute('color', new THREE.BufferAttribute(signatureColors, 3));

  const signatureMaterial = new THREE.PointsMaterial({
    size: 0.13,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.98,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  const signaturePoints = new THREE.Points(signatureGeometry, signatureMaterial);
  group.add(signaturePoints);

  const signatureHalo = new THREE.Points(
    signatureGeometry,
    new THREE.PointsMaterial({
      size: 0.24,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
  );
  group.add(signatureHalo);

  const signatureAnchor = {
    angle: 1.18,
    speed: 0.85,
    radiusScale: 2.15,
    vertical: 0.34,
    xScale: 0.5,
    yScale: 0.48
  };

  const jetCount = 360;
  const jetPositions = new Float32Array(jetCount * 3);
  const jetColors = new Float32Array(jetCount * 3);
  const jetColor = new THREE.Color('#ff76c8');

  for (let i = 0; i < jetCount; i += 1) {
    const i3 = i * 3;
    const sign = i % 2 === 0 ? 1 : -1;
    const h = (Math.random() * 9 + 2) * sign;
    const r = Math.random() * 0.25;
    const a = Math.random() * Math.PI * 2;
    jetPositions[i3 + 0] = Math.cos(a) * r;
    jetPositions[i3 + 1] = h;
    jetPositions[i3 + 2] = Math.sin(a) * r;

    jetColors[i3 + 0] = jetColor.r;
    jetColors[i3 + 1] = jetColor.g;
    jetColors[i3 + 2] = jetColor.b;
  }

  const jetGeometry = new THREE.BufferGeometry();
  jetGeometry.setAttribute('position', new THREE.BufferAttribute(jetPositions, 3));
  jetGeometry.setAttribute('color', new THREE.BufferAttribute(jetColors, 3));

  const jets = new THREE.Points(
    jetGeometry,
    new THREE.PointsMaterial({
      size: 0.08,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    })
  );
  jets.visible = config.showJets;
  group.add(jets);

  function rebuildDisk() {
    disk.geometry.dispose();
    disk.geometry = new THREE.RingGeometry(config.eventHorizonRadius * 1.05, config.accretionDiskSize, 128, 1);

    horizon.geometry.dispose();
    horizon.geometry = new THREE.SphereGeometry(config.eventHorizonRadius, 64, 64);

    lensRing.geometry.dispose();
    lensRing.geometry = new THREE.TorusGeometry(config.accretionDiskSize * 0.96, 0.16, 24, 96);

    glow.scale.set(config.accretionDiskSize * 4.2, config.accretionDiskSize * 4.2, 1);
  }

  function respawnParticle(particle) {
    particle.radius = config.eventHorizonRadius * 2.4 + Math.random() * config.accretionDiskSize * 2.8;
    particle.angle = Math.random() * Math.PI * 2;
    particle.vertical = (Math.random() - 0.5) * 0.55;
    particle.speed = 0.8 + Math.random() * 2.4;
    particle.infall = Math.random() > 0.66;
    particle.infallVelocity = 0.015 + Math.random() * 0.035;
  }

  function updateSignature(elapsed, delta) {
    const positions = signaturePoints.geometry.attributes.position.array;
    const baseRadius = config.eventHorizonRadius * signatureAnchor.radiusScale;
    const glyphCenterX = 2.5;
    const glyphCenterY = 0.5;
    const radial = new THREE.Vector3(Math.cos(signatureAnchor.angle), 0, Math.sin(signatureAnchor.angle));
    const tangent = new THREE.Vector3(-Math.sin(signatureAnchor.angle), 0, Math.cos(signatureAnchor.angle));
    const center = radial.clone().multiplyScalar(baseRadius);
    center.y = signatureAnchor.vertical;

    signatureAnchor.angle += delta * signatureAnchor.speed * (2.2 / Math.max(0.8, baseRadius));

    for (let i = 0; i < signatureGlyph.length; i += 1) {
      const i3 = i * 3;
      const [gx, gy] = signatureGlyph[i];
      const localX = (gx - glyphCenterX) * signatureAnchor.xScale;
      const localY = (gy - glyphCenterY) * signatureAnchor.yScale;
      const wobble = Math.sin(elapsed * 1.8 + i * 0.11) * 0.01;

      positions[i3 + 0] = center.x + tangent.x * localX + radial.x * wobble;
      positions[i3 + 1] = center.y + localY;
      positions[i3 + 2] = center.z + tangent.z * localX + radial.z * wobble;
    }

    signaturePoints.geometry.attributes.position.needsUpdate = true;
    signaturePoints.material.opacity = 0.84 + Math.sin(elapsed * 2.1) * 0.14;
    signatureHalo.material.opacity = 0.18 + Math.sin(elapsed * 2.1) * 0.08;
  }

  function update(delta, elapsed) {
    disk.rotation.z += delta * 0.24;
    disk.material.uniforms.uTime.value = elapsed;
    disk.material.uniforms.uGlow.value = config.glowIntensity;
    disk.material.uniforms.uDistortion.value = config.distortionIntensity;
    disk.material.uniforms.uCoolColor.value.set(config.colors.mid);

    glow.material.color.set(config.colors.mid);
    glow.material.opacity = 0.5 + config.glowIntensity * 0.28;

    lensRing.material.opacity = 0.1 + config.distortionIntensity * 0.15;
    lensRing.material.color.set(config.colors.accent);

    const positions = streams.geometry.attributes.position.array;

    for (let i = 0; i < streamData.length; i += 1) {
      const particle = streamData[i];
      particle.angle += delta * particle.speed * (1.8 / Math.max(0.5, particle.radius));

      if (particle.infall) {
        particle.infallVelocity += delta * 0.03;
        particle.radius -= particle.infallVelocity;
      }

      if (particle.radius <= config.eventHorizonRadius * 0.98) {
        respawnParticle(particle);
      }

      const i3 = i * 3;
      positions[i3 + 0] = Math.cos(particle.angle) * particle.radius;
      positions[i3 + 1] = particle.vertical + Math.sin(elapsed * 1.2 + i * 0.002) * 0.04;
      positions[i3 + 2] = Math.sin(particle.angle) * particle.radius;
    }

    streams.geometry.attributes.position.needsUpdate = true;

    updateSignature(elapsed, delta);

    jets.visible = config.showJets;
    jets.rotation.y += delta * 0.3;
  }

  return {
    group,
    update,
    rebuildDisk,
    dispose() {
      safeRemove(root, group);
      disposeObject3D(group);
    }
  };
}
