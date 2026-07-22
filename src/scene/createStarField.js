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

  function update(delta) {
    group.rotation.y += delta * 0.004;
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
