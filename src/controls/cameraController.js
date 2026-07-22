import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

export function createCameraController(camera, canvas, config, { reducedMotion = false } = {}) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 10;
  controls.maxDistance = 120;
  controls.target.set(0, 0, 0);

  let autoEnabled = config.autoCamera && !reducedMotion;
  let introProgress = reducedMotion ? 1 : 0;
  let userPauseTimer = 0;

  function suspendAutoTemporarily() {
    userPauseTimer = 5.5;
  }

  controls.addEventListener('start', suspendAutoTemporarily);

  function update(delta, elapsedTime) {
    if (userPauseTimer > 0) {
      userPauseTimer -= delta;
    }

    if (autoEnabled && userPauseTimer <= 0) {
      if (introProgress < 1) {
        introProgress = Math.min(1, introProgress + delta * 0.08);
      }

      const distance = THREE.MathUtils.lerp(70, 42, introProgress);
      const orbitSpeed = 0.06;
      const elev = THREE.MathUtils.lerp(14, 10, introProgress);
      const angle = elapsedTime * orbitSpeed;

      camera.position.x = Math.cos(angle) * distance;
      camera.position.z = Math.sin(angle) * distance;
      camera.position.y = elev + Math.sin(elapsedTime * 0.2) * 1.2;

      controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.06);
    }

    controls.update();
  }

  function reset() {
    introProgress = reducedMotion ? 1 : 0;
    camera.position.set(0, 14, 70);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  function setAutoCamera(enabled) {
    autoEnabled = Boolean(enabled) && !reducedMotion;
  }

  function dispose() {
    controls.removeEventListener('start', suspendAutoTemporarily);
    controls.dispose();
  }

  return {
    controls,
    update,
    reset,
    setAutoCamera,
    dispose
  };
}
