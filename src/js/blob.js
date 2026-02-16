import { CONFIG } from './config.js';
import {
  createRenderer,
  createCamera,
  createMatcapTexture,
  createRenderTarget,
  handleResize,
} from './three-setup.js';
import { BLOB_VERT, BLOB_FRAG, POST_VERT, POST_FRAG } from './shaders.js';

export function initBlob() {
  const canvas = document.getElementById('main-canvas');
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = createCamera();
  const rt = createRenderTarget();

  const matcapTex = createMatcapTexture();

  const uniforms = {
    uTime:          { value: 0.0 },
    uNoiseScale:    { value: CONFIG.blob.noiseScale },
    uNoiseAmp:      { value: CONFIG.blob.noiseAmp },
    uMatcap:        { value: matcapTex },
    uBaseColor:     { value: new THREE.Color(0x000000) },
    uGradientScale: { value: CONFIG.blob.gradientScale },
    uFlowSpeed:     { value: CONFIG.blob.flowSpeed },
    uFlowAmount:    { value: CONFIG.blob.flowAmount },
    uGradientSpeed: { value: CONFIG.blob.gradientSpeed },
    uDetailX:       { value: CONFIG.blob.detailX },
    uBandScale:     { value: CONFIG.blob.bandScale },
  };

  const geometry = new THREE.SphereGeometry(
    CONFIG.blob.radius,
    CONFIG.blob.widthSegments,
    CONFIG.blob.heightSegments
  );
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: BLOB_VERT,
    fragmentShader: BLOB_FRAG,
    side: THREE.DoubleSide,
    transparent: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const postScene = new THREE.Scene();
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const postMaterial = new THREE.ShaderMaterial({
    vertexShader: POST_VERT,
    fragmentShader: POST_FRAG,
    uniforms: {
      tScene:      { value: rt.texture },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
  });
  const quad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2),
    postMaterial
  );
  postScene.add(quad);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    uniforms.uTime.value = t * uniforms.uGradientSpeed.value;
    mesh.rotation.y += 0.15 * clock.getDelta();

    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCamera);
  }

  animate();
  handleResize(renderer, camera, rt, postMaterial);
}
