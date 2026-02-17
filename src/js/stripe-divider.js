import { STRIPE_CONFIG } from './config.js';

export function initStripeDivider() {
  const canvas = document.getElementById('stripe-divider');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  // Resize canvas
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = STRIPE_CONFIG.stripeHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  // Vertex shader
  const vertexShaderSource = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment shader - Chromatic RGB Stripes
  const fragmentShaderSource = `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    uniform float quantization;
    uniform float detailX;
    uniform float rOffset;
    uniform float bOffset;
    uniform float animSpeed;
    uniform float contrast;
    uniform float power;
    uniform float smoothMin;
    uniform float smoothMax;
    varying vec2 vUv;

    // 3D Ashima simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float snoise01(vec3 v) { return snoise(v) * 0.5 + 0.5; }

    void main() {
      vec2 uv = vUv;
      
      // ═══ CHROMATIC RGB STRIPE GENERATOR ═══
      float seed = 12.34;
      
      // Horizontal band quantization (creates the striped effect)
      float stepY = quantization * (ceil(uv.y * quantization) / quantization);
      
      // Generate RGB with chromatic aberration using simplex noise
      vec3 rgb = vec3(0.0);
      rgb.r = snoise01(vec3(uv.x * detailX - time * animSpeed + rOffset, stepY, seed + time * 0.1));
      rgb.g = snoise01(vec3(uv.x * detailX - time * animSpeed         , stepY, seed + time * 0.1));
      rgb.b = snoise01(vec3(uv.x * detailX - time * animSpeed + bOffset, stepY, seed + time * 0.1));
      
      // Post-processing for high contrast stripes
      rgb = pow(rgb * contrast, vec3(power));
      rgb = smoothstep(smoothMin, smoothMax, rgb);
      
      // Final output
      vec3 col = clamp(rgb, 0.0, 1.0);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // Compile shader
  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Create program
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  // Create geometry (full-screen quad)
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1,
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Get uniform locations
  const timeLocation = gl.getUniformLocation(program, 'time');
  const resolutionLocation = gl.getUniformLocation(program, 'resolution');
  const quantizationLocation = gl.getUniformLocation(program, 'quantization');
  const detailXLocation = gl.getUniformLocation(program, 'detailX');
  const rOffsetLocation = gl.getUniformLocation(program, 'rOffset');
  const bOffsetLocation = gl.getUniformLocation(program, 'bOffset');
  const animSpeedLocation = gl.getUniformLocation(program, 'animSpeed');
  const contrastLocation = gl.getUniformLocation(program, 'contrast');
  const powerLocation = gl.getUniformLocation(program, 'power');
  const smoothMinLocation = gl.getUniformLocation(program, 'smoothMin');
  const smoothMaxLocation = gl.getUniformLocation(program, 'smoothMax');

  // Animation loop
  let startTime = Date.now();

  function render() {
    const time = (Date.now() - startTime) * 0.001;

    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(quantizationLocation, STRIPE_CONFIG.quantization);
    gl.uniform1f(detailXLocation, STRIPE_CONFIG.detailX);
    gl.uniform1f(rOffsetLocation, STRIPE_CONFIG.rOffset);
    gl.uniform1f(bOffsetLocation, STRIPE_CONFIG.bOffset);
    gl.uniform1f(animSpeedLocation, STRIPE_CONFIG.animSpeed);
    gl.uniform1f(contrastLocation, STRIPE_CONFIG.contrast);
    gl.uniform1f(powerLocation, STRIPE_CONFIG.power);
    gl.uniform1f(smoothMinLocation, STRIPE_CONFIG.smoothMin);
    gl.uniform1f(smoothMaxLocation, STRIPE_CONFIG.smoothMax);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  render();
}