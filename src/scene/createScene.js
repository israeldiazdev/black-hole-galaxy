import * as THREE from 'three';

export function createScene(canvas, config, maxPixelRatio) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(config.backgroundColor, 0.018);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 260);
  camera.position.set(0, 14, 70);

  let renderer;
  try {
    // Try with antialias first (no powerPreference to avoid Apple Silicon issues)
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false
    });
    console.log('[Singularity] Renderer created with antialias');
  } catch (e1) {
    console.warn('[Singularity] High-quality renderer failed:', e1.message);
    try {
      // Fallback: no antialias
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false
      });
      console.log('[Singularity] Renderer created without antialias');
    } catch (e2) {
      console.error('[Singularity] All renderer attempts failed:', e2.message);
      throw new Error('WEBGL_UNAVAILABLE');
    }
  }

  renderer.setClearColor(config.backgroundColor, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const root = new THREE.Group();
  scene.add(root);

  function resize(newMaxPixelRatio = maxPixelRatio) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, newMaxPixelRatio));
  }

  return {
    scene,
    camera,
    renderer,
    root,
    resize
  };
}
