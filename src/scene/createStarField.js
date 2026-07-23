import * as THREE from 'three';
import { disposeObject3D, safeRemove } from '../utils/dispose.js';

export function createStarField(root, qualityPreset) {
  const group = new THREE.Group();
  group.name = 'FarStarField';
  root.add(group);

  const count = qualityPreset.farStars;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const nearColor = new THREE.Color('#f3d9ff');
  const farColor = new THREE.Color('#88b9ff');

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const radius = 90 + Math.random() * 130;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.cos(phi) * 0.65;
    positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const c = nearColor.clone().lerp(farColor, Math.random());
    colors[i3 + 0] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const stars = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.35,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
  );

  group.add(stars);

  const constellationGroup = new THREE.Group();
  constellationGroup.position.set(10, 6, -28);
  constellationGroup.rotation.set(0.16, 0.12, -0.06);
  constellationGroup.scale.set(2.1, 2.1, 2.1);
  group.add(constellationGroup);

  const lineColor = new THREE.Color('#8ad7ff');
  const starColor = new THREE.Color('#ff83d8');
  const pulseGroup = new THREE.Group();
  pulseGroup.position.copy(constellationGroup.position);
  pulseGroup.rotation.copy(constellationGroup.rotation);
  pulseGroup.scale.copy(constellationGroup.scale);
  group.add(pulseGroup);

  const letterDefs = [
    { points: [[0, 0, 0], [0.6, 1.05, 0], [1.2, 0, 0], [0.6, 0.5, 0]] },
    { points: [[1.8, 0, 0], [1.8, 1.2, 0], [2.4, 1.2, 0], [2.4, 0.5, 0], [2.9, 0, 0]] },
    { points: [[3.4, 0, 0], [3.4, 1.2, 0], [4.25, 0, 0]] },
    { points: [[4.8, 0, 0], [4.8, 1.2, 0], [5.55, 1.2, 0], [5.55, 0.58, 0], [5.55, 0, 0]] },
    { points: [[6.2, 0, 0], [6.2, 1.2, 0], [7.0, 0, 0], [7.0, 1.2, 0]] },
    { points: [[7.6, 0, 0], [7.6, 1.2, 0]] }
  ];

  letterDefs.forEach((letter) => {
    const linePositions = [];
    const starPositions = [];

    letter.points.forEach((point) => {
      linePositions.push(point[0], point[1], point[2]);
      starPositions.push(point[0], point[1], point[2]);
    });

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const line = new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      })
    );
    constellationGroup.add(line);

    const pulseLine = line.clone();
    pulseLine.material = pulseLine.material.clone();
    pulseLine.material.opacity = 0.22;
    pulseGroup.add(pulseLine);

    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starPositions), 3));
    const glyphStars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({
        size: 0.36,
        color: starColor,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    constellationGroup.add(glyphStars);

    const pulseStars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({
        size: 0.58,
        color: starColor,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    pulseGroup.add(pulseStars);
  });

  function update(delta) {
    group.rotation.y += delta * 0.004;
    constellationGroup.rotation.y += delta * 0.002;

    const pulse = 0.5 + Math.sin(Date.now() * 0.0014) * 0.5;
    pulseGroup.scale.setScalar(2.1 + pulse * 0.16);
    pulseGroup.children.forEach((child) => {
      if (child.material) {
        child.material.opacity = child.material.opacity === 0.22 ? 0.22 + pulse * 0.04 : 0.25 + pulse * 0.05;
      }
    });
  }

  return {
    group,
    update,
    dispose() {
      safeRemove(root, group);
      disposeObject3D(group);
    }
  };
}
