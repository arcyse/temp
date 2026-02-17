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
    radius: 0.85,
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
  starCount: 300,
  minSize: 0.2,
  maxSize: 1.5,
  minOpacity: 0.3,
  maxOpacity: 1.0,
  rotationSpeed: 0.0003,
  twinkleSpeed: 0.02,
  parabolicScale: 0.8,
  fillHeight: 1.8,
  warpStrength: 900,
};

export function getWarpRadiusFactor() {
  return CONFIG.blob.radius + 0.50;
}

export const STRIPE_CONFIG = {
  stripeHeight: 8,        // Height in pixels
  quantization: 2.0,      // Horizontal band steps (higher = more stripes)
  detailX: 4.0,             // Horizontal detail/noise frequency
  rOffset: 0.05,            // Red channel chromatic offset
  bOffset: -0.05,           // Blue channel chromatic offset
  animSpeed: 0.5,           // Animation speed multiplier
  contrast: 1.3,            // Color contrast (1.0 to 2.0)
  power: 8.0,               // Stripe sharpness (4.0 to 12.0)
  smoothMin: 0.1,           // Smoothstep min (0.0 to 0.5)
  smoothMax: 1.0,           // Smoothstep max (0.5 to 1.0)
};
