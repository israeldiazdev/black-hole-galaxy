import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

function plainRenderer(renderer, scene, camera) {
  return {
    enabled: false,
    render: () => renderer.render(scene, camera),
    resize: () => {},
    setGlow: () => {},
    dispose: () => {}
  };
}

export function createPostProcessing(renderer, scene, camera, enabled, glowIntensity) {
  if (!enabled) {
    return plainRenderer(renderer, scene, camera);
  }

  try {
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5 * glowIntensity,
      0.42,
      0.12
    );

    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    return {
      enabled: true,
      render: () => composer.render(),
      resize: () => composer.setSize(window.innerWidth, window.innerHeight),
      setGlow: (value) => { bloomPass.strength = 0.5 * value; },
      dispose: () => { composer.passes.length = 0; }
    };
  } catch (e) {
    console.warn('[Singularity] Bloom composer failed, using plain renderer:', e.message);
    return plainRenderer(renderer, scene, camera);
  }
}
