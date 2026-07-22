import GUI from 'lil-gui';

export function createGuiController(config, handlers) {
  const gui = new GUI({ title: 'Singularity Controls' });
  gui.close();

  const simFolder = gui.addFolder('Simulation');
  simFolder.add(config, 'quality', ['low', 'medium', 'high']).name('Quality').onFinishChange(handlers.onQualityChange);
  simFolder.add(config, 'seed', 1, 999999, 1).name('Seed').onFinishChange(handlers.onRebuildGalaxy);
  simFolder.add(config, 'particleCount', 30000, 100000, 1000).name('Particles').onFinishChange(handlers.onRebuildGalaxy);
  simFolder.add(config, 'branches', 2, 8, 1).name('Arms').onFinishChange(handlers.onRebuildGalaxy);
  simFolder.add(config, 'starSize', 6, 28, 1).name('Star Size').onChange(handlers.onVisualChange);
  simFolder.add(config, 'rotationSpeed', 0.02, 0.3, 0.01).name('Rotation').onChange(handlers.onVisualChange);
  simFolder.add(config, 'autoCamera').name('Auto Camera').onChange(handlers.onAutoCameraChange);

  const blackHoleFolder = gui.addFolder('Black Hole');
  blackHoleFolder.add(config, 'eventHorizonRadius', 0.8, 3.2, 0.05).name('Horizon Radius').onFinishChange(handlers.onRebuildBlackHole);
  blackHoleFolder.add(config, 'accretionDiskSize', 2.4, 7.2, 0.1).name('Disk Size').onFinishChange(handlers.onRebuildBlackHole);
  blackHoleFolder.add(config, 'glowIntensity', 0.35, 2.2, 0.01).name('Glow Intensity').onChange(handlers.onVisualChange);
  blackHoleFolder.add(config, 'distortionIntensity', 0.0, 1.8, 0.01).name('Distortion').onChange(handlers.onVisualChange);
  blackHoleFolder.add(config, 'showJets').name('Energy Jets').onChange(handlers.onVisualChange);

  const colorFolder = gui.addFolder('Colors');
  colorFolder.addColor(config.colors, 'inner').name('Inner');
  colorFolder.addColor(config.colors, 'mid').name('Mid').onChange(handlers.onRebuildEverything);
  colorFolder.addColor(config.colors, 'outer').name('Outer').onChange(handlers.onRebuildGalaxy);
  colorFolder.addColor(config.colors, 'accent').name('Accent').onChange(handlers.onRebuildEverything);

  let visible = true;

  function toggle() {
    visible = !visible;
    gui.domElement.style.display = visible ? '' : 'none';
    return visible;
  }

  function hide() {
    visible = false;
    gui.domElement.style.display = 'none';
  }

  return {
    gui,
    toggle,
    hide,
    destroy() {
      gui.destroy();
    }
  };
}
