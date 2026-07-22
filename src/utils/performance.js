export function createPerformanceMonitor({ minFps = 28, sampleWindow = 120, onLowPerformance }) {
  const frameTimes = [];
  let lowFrames = 0;
  let cooldown = 0;

  function update(delta) {
    const fps = delta > 0 ? 1 / delta : 60;

    frameTimes.push(fps);
    if (frameTimes.length > sampleWindow) {
      frameTimes.shift();
    }

    const average = frameTimes.reduce((sum, value) => sum + value, 0) / frameTimes.length;

    if (average < minFps) {
      lowFrames += 1;
    } else {
      lowFrames = Math.max(0, lowFrames - 2);
    }

    if (cooldown > 0) {
      cooldown -= 1;
      return average;
    }

    if (lowFrames > sampleWindow * 0.65) {
      lowFrames = 0;
      cooldown = sampleWindow;
      if (typeof onLowPerformance === 'function') {
        onLowPerformance({ averageFps: average });
      }
    }

    return average;
  }

  return { update };
}
