import { CONFIG } from './config.js';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: CONFIG.renderer.antialias,
    alpha: false,
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, CONFIG.renderer.maxPixelRatio)
  );
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(CONFIG.renderer.clearColor);
  return renderer;
}

export function createCamera() {
  const { fov, near, far, position } = CONFIG.camera;
  const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    near,
    far
  );
  camera.position.set(position.x, position.y, position.z);
  return camera;
}

export function createMatcapTexture() {
  const matcapCanvas = document.createElement('canvas');
  matcapCanvas.width = 256;
  matcapCanvas.height = 256;
  const ctx = matcapCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#cccccc');
  grad.addColorStop(1, '#666666');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(matcapCanvas);
}

export function createRenderTarget() {
  return new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
}

export function handleResize(renderer, camera, rt, postMaterial) {
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    rt.setSize(w, h);
    postMaterial.uniforms.uResolution.value.set(w, h);
  }
  window.addEventListener('resize', onResize);
  onResize();
}
