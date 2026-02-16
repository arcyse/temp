export const CONFIG = {
  renderer: {
    clearColor: 0x000000,
    maxPixelRatio: 5,
    antialias: true,
  },
  camera: {
    fov: 45,
    near: 0.1,
    far: 100,
    position: { x: 0, y: 0, z: 3 },
  },
  blob: {
    radius: 0.75,
    widthSegments: 128,
    heightSegments: 128,
    noiseScale: 0.5,
    noiseAmp: 0.0,
    gradientScale: 0.3,
    flowSpeed: 0.55,
    flowAmount: 1.3,
    bandScale: 1.0,
    gradientSpeed: 1.0,
    detailX: 0.5,
  },
  post: {
    bloomEnabled: true,
    bloomIntensity: 0.02,
    edgeBlurStrength: 2.0,
  },
};

export const STAR_CONFIG = {
  starCount: 350,
  minSize: 0.2,
  maxSize: 1.5,
  minOpacity: 0.3,
  maxOpacity: 1.0,
  rotationSpeed: 0.0003,
  twinkleSpeed: 0.02,
  parabolicScale: 0.8,
  fillHeight: 1.8,
  warpStrength: 900,
  warpRadiusFactor: 1.3   // 1.0 = exactly blob radius, >1 = extend beyond
};
