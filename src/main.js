import './styles.css';

import * as THREE from 'three';
import { applyQualityToConfig, defaultConfig, QUALITY_PRESETS } from './config.js';
import { createScene } from './scene/createScene.js';
import { createGalaxy } from './scene/createGalaxy.js';
import { createBlackHole } from './scene/createBlackHole.js';
import { createStarField } from './scene/createStarField.js';
import { createPostProcessing } from './scene/createPostProcessing.js';
import { createCameraController } from './controls/cameraController.js';
import { createGuiController } from './controls/guiController.js';
import { createPerformanceMonitor } from './utils/performance.js';

const config = {
  ...defaultConfig,
  colors: { ...defaultConfig.colors },
  backgroundColor: defaultConfig.backgroundColor.clone()
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) {
  config.autoCamera = false;
}

const canvas = document.querySelector('#scene-canvas');
const loadingScreen = document.querySelector('#loading-screen');
const loadingFill = document.querySelector('#loading-fill');
const loadingText = document.querySelector('#loading-text');
const webglError = document.querySelector('#webgl-error');
const uiPanel = document.querySelector('#ui-panel');

const toggleSimButton = document.querySelector('#toggle-sim');
const resetCameraButton = document.querySelector('#reset-camera');
const fullscreenButton = document.querySelector('#toggle-fullscreen');
const toggleUiButton = document.querySelector('#toggle-ui');
const toggleGuiButton = document.querySelector('#toggle-gui');
const showUiFloatingButton = document.querySelector('#show-ui-floating');

function showWebGLError(details = '') {
  loadingScreen.hidden = true;
  webglError.hidden = false;
  const msgEl = webglError.querySelector('#webgl-error-msg');
  if (msgEl && details) {
    msgEl.textContent = details;
  }
  const retryBtn = document.querySelector('#retry-webgl');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      webglError.hidden = true;
      loadingScreen.hidden = false;
      init();
    }, { once: true });
  }
}

let qualityPreset = applyQualityToConfig(config);
let sceneContext = null;
let galaxySystem = null;
let blackHoleSystem = null;
let starFieldSystem = null;
let postProcessing = null;
let cameraController = null;
let guiController = null;
let frameHandle = 0;

const clock = new THREE.Clock();

function updateLoading(value, text) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  loadingFill.style.width = `${clamped}%`;
  loadingText.textContent = `${clamped}%`;
  if (text) {
    loadingText.textContent = `${clamped}% · ${text}`;
  }
}

function hideLoading() {
  loadingScreen.classList.add('loading-hidden');
  setTimeout(() => {
    loadingScreen.hidden = true;
  }, 550);
}

function makePlainRenderer() {
  return {
    enabled: false,
    render: () => sceneContext.renderer.render(sceneContext.scene, sceneContext.camera),
    resize: () => {},
    setGlow: () => {},
    dispose: () => {}
  };
}

function buildSystems() {
  console.log('[Singularity] buildSystems: creating galaxy...');
  galaxySystem = createGalaxy(sceneContext.root, config, qualityPreset);

  console.log('[Singularity] buildSystems: creating black hole...');
  blackHoleSystem = createBlackHole(sceneContext.root, config, qualityPreset);

  console.log('[Singularity] buildSystems: creating star field...');
  starFieldSystem = createStarField(sceneContext.root, qualityPreset);

  console.log('[Singularity] buildSystems: creating post-processing (bloom=' + qualityPreset.bloom + ')...');
  try {
    postProcessing = createPostProcessing(
      sceneContext.renderer,
      sceneContext.scene,
      sceneContext.camera,
      qualityPreset.bloom,
      config.glowIntensity
    );
  } catch (e) {
    console.warn('[Singularity] Post-processing failed, falling back to plain render:', e.message);
    postProcessing = makePlainRenderer();
  }

  console.log('[Singularity] buildSystems: done.');
  sceneContext.resize(qualityPreset.maxPixelRatio);
  galaxySystem.setPixelRatio(qualityPreset.maxPixelRatio);
}

function disposeSystems() {
  if (galaxySystem) {
    galaxySystem.dispose();
    galaxySystem = null;
  }
  if (blackHoleSystem) {
    blackHoleSystem.dispose();
    blackHoleSystem = null;
  }
  if (starFieldSystem) {
    starFieldSystem.dispose();
    starFieldSystem = null;
  }
  if (postProcessing) {
    postProcessing.dispose();
    postProcessing = null;
  }
}

function rebuildEverything() {
  disposeSystems();
  qualityPreset = QUALITY_PRESETS[config.quality];
  buildSystems();
}

function rebuildGalaxy() {
  galaxySystem.rebuild();
}

function rebuildBlackHole() {
  blackHoleSystem.rebuildDisk();
}

function setSimulationRunning(running) {
  config.isRunning = Boolean(running);
  toggleSimButton.textContent = config.isRunning ? 'Pause' : 'Start';
}

const performanceMonitor = createPerformanceMonitor({
  minFps: 28,
  sampleWindow: 180,
  onLowPerformance: () => {
    if (config.quality === 'high') {
      config.quality = 'medium';
    } else if (config.quality === 'medium') {
      config.quality = 'low';
    } else {
      return;
    }

    qualityPreset = applyQualityToConfig(config);
    rebuildEverything();
  }
});

function bindUiEvents() {
  toggleSimButton.addEventListener('click', () => {
    setSimulationRunning(!config.isRunning);
  });

  resetCameraButton.addEventListener('click', () => {
    cameraController.reset();
  });

  fullscreenButton.addEventListener('click', async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  });

  let uiVisible = true;
  const setUiVisible = (visible) => {
    uiVisible = visible;
    uiPanel.classList.toggle('panel-hidden', !uiVisible);
    toggleUiButton.textContent = uiVisible ? 'Hide UI' : 'Show UI';
    showUiFloatingButton.hidden = uiVisible;
  };

  toggleUiButton.addEventListener('click', () => {
    setUiVisible(!uiVisible);
  });

  showUiFloatingButton.addEventListener('click', () => setUiVisible(true));

  toggleGuiButton.addEventListener('click', () => {
    const visible = guiController.toggle();
    toggleGuiButton.textContent = visible ? 'Config' : 'Config Off';
  });

  window.addEventListener('keydown', (event) => {
    const targetTag = event.target?.tagName?.toLowerCase();
    if (targetTag === 'input' || targetTag === 'textarea') {
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      setSimulationRunning(!config.isRunning);
    } else if (event.key.toLowerCase() === 'r') {
      cameraController.reset();
    } else if (event.key.toLowerCase() === 'f') {
      fullscreenButton.click();
    } else if (event.key.toLowerCase() === 'h') {
      toggleUiButton.click();
    } else if (event.key.toLowerCase() === 'g') {
      toggleGuiButton.click();
    }
  });

  window.addEventListener('resize', () => {
    sceneContext.resize(qualityPreset.maxPixelRatio);
    galaxySystem.setPixelRatio(qualityPreset.maxPixelRatio);
    postProcessing.resize();
  });
}

function createGui() {
  guiController = createGuiController(config, {
    onQualityChange: () => {
      qualityPreset = applyQualityToConfig(config);
      rebuildEverything();
    },
    onRebuildGalaxy: () => {
      rebuildGalaxy();
    },
    onRebuildBlackHole: () => {
      rebuildBlackHole();
    },
    onVisualChange: () => {
      postProcessing.setGlow(config.glowIntensity);
    },
    onAutoCameraChange: (enabled) => {
      cameraController.setAutoCamera(enabled);
    },
    onRebuildEverything: () => {
      rebuildEverything();
    }
  });

  guiController.hide();
}

function animate() {
  frameHandle = requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  cameraController.update(delta, elapsed);

  if (config.isRunning) {
    galaxySystem.update(elapsed);
    blackHoleSystem.update(delta, elapsed);
    starFieldSystem.update(delta);
    performanceMonitor.update(delta);
  }

  postProcessing.render();
}

async function init() {
  try {
    updateLoading(12, 'Renderer');
    sceneContext = createScene(canvas, config, qualityPreset.maxPixelRatio);

    updateLoading(36, 'Galaxy system');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    buildSystems();

    updateLoading(58, 'Camera');
    cameraController = createCameraController(sceneContext.camera, canvas, config, { reducedMotion });

    updateLoading(76, 'Interface');
    createGui();
    bindUiEvents();

    updateLoading(100, 'Ready');
    hideLoading();
    animate();
  } catch (err) {
    const msg = err?.message || String(err) || 'Unknown error';
    console.error('[Singularity] Fatal init error:', err);
    showWebGLError(msg);
  }
}

// Catch unhandled errors and surface them in the UI
window.addEventListener('error', (event) => {
  console.error('[Singularity] Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Singularity] Unhandled promise rejection:', event.reason);
});

init();
