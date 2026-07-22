import * as THREE from 'three';

export const QUALITY_PRESETS = {
  low: {
    particles: 30000,
    farStars: 5000,
    blackHoleParticles: 900,
    dustParticles: 3000,
    bloom: false,
    maxPixelRatio: 1.2
  },
  medium: {
    particles: 55000,
    farStars: 9000,
    blackHoleParticles: 1800,
    dustParticles: 5500,
    bloom: true,
    maxPixelRatio: 1.5
  },
  high: {
    particles: 90000,
    farStars: 15000,
    blackHoleParticles: 2800,
    dustParticles: 9000,
    bloom: true,
    maxPixelRatio: 1.8
  }
};

export function detectInitialQuality() {
  const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const memory = typeof navigator !== 'undefined' ? navigator.deviceMemory || 4 : 4;
  const px = typeof window !== 'undefined' ? window.innerWidth * window.innerHeight : 1280 * 720;

  if (touch || cores <= 4 || memory <= 4 || px < 900000) {
    return 'low';
  }
  if (cores <= 8 || memory <= 8) {
    return 'medium';
  }
  return 'high';
}

export const defaultConfig = {
  seed: 1337,
  quality: detectInitialQuality(),
  particleCount: 55000,
  starSize: 14,
  branches: 5,
  spin: 1.35,
  randomness: 0.35,
  randomnessPower: 2.6,
  radius: 22,
  verticalSpread: 2.2,
  rotationSpeed: 0.09,
  glowIntensity: 1.05,
  eventHorizonRadius: 1.5,
  accretionDiskSize: 4.4,
  distortionIntensity: 0.75,
  showJets: false,
  autoCamera: true,
  isRunning: true,
  colors: {
    inner: '#ffffff',
    mid: '#ff4fb8',
    outer: '#7f3fff',
    accent: '#7bc6ff'
  },
  backgroundColor: new THREE.Color('#020106')
};

export function applyQualityToConfig(config) {
  const preset = QUALITY_PRESETS[config.quality];
  config.particleCount = preset.particles;
  return preset;
}
