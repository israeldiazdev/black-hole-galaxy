import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as THREE from 'three';

export function createPostProcessing(renderer, scene, camera, enabled, glowIntensity) {
  if (!enabled) {
    return {
      enabled: false,
      render: () => renderer.render(scene, camera),
      resize: () => {},
      setGlow: () => {},
      dispose: () => {}
    };
  }

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.85, 0.45, 0.75);
  bloomPass.strength = 0.5 * glowIntensity;
  bloomPass.radius = 0.42;
  bloomPass.threshold = 0.12;

  composer.addPass(renderPass);
  composer.addPass(bloomPass);

  return {
    enabled: true,
    render: () => composer.render(),
    resize: () => composer.setSize(window.innerWidth, window.innerHeight),
    setGlow: (value) => {
      bloomPass.strength = 0.5 * value;
    },
    dispose: () => {
      composer.passes.length = 0;
    }
  };
}
