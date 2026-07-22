import * as THREE from 'three';

/**
 * Acquire a WebGL context using multiple fallback strategies.
 * Avoids powerPreference:'high-performance' which can fail on Apple Silicon
 * when the page is served from a non-localhost origin.
 */
function acquireContext(canvas) {
  const attempts = [
    ['webgl2',             { antialias: true,  powerPreference: 'default' }],
    ['webgl',              { antialias: true,  powerPreference: 'default' }],
    ['webgl2',             { antialias: false, powerPreference: 'default' }],
    ['webgl',              { antialias: false, powerPreference: 'default' }],
    ['experimental-webgl', { antialias: false }]
  ];

  for (const [type, attrs] of attempts) {
    try {
      const ctx = canvas.getContext(type, attrs);
      if (ctx) {
        return { ctx, type };
      }
    } catch { /* try next */ }
  }
  return null;
}

export function createScene(canvas, config, maxPixelRatio) {
  // Acquire the GL context ourselves before handing it to Three.js.
  // This lets us control power-preference and gives a clear error when
  // the browser blocks WebGL (e.g. Brave Shields, Firefox strict ETP).
  const acquired = acquireContext(canvas);
  if (!acquired) {
    throw new Error('WEBGL_UNAVAILABLE');
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(config.backgroundColor, 0.018);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 260);
  camera.position.set(0, 14, 70);

  // Pass the pre-created context so Three.js does not try to create its own.
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context: acquired.ctx,
    antialias: acquired.type !== 'experimental-webgl',
    alpha: false
  });

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
