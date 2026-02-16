// src/js/blob-shaders.js

export const BLOB_VERT = `
uniform float uTime;
uniform float uNoiseScale;
uniform float uNoiseAmp;

varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vPosition;
varying float vTime;

// ---- 3D simplex noise (classic Ashima implementation) ----
vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
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
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1),
                            dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3)));
}

void main() {
    vPosition = position;

    // apply noise displacement along the normal
    vec3 pos = position;
    float n = snoise(normal * uNoiseScale + vec3(uTime * 0.2));
    pos += normal * (n * uNoiseAmp);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = mv.xyz;
    vNormal = normalize(normalMatrix * normal);
    vTime = uTime;

    gl_Position = projectionMatrix * mv;
}
`;

export const BLOB_FRAG = `
precision mediump float;

uniform sampler2D uMatcap;
uniform vec3  uBaseColor;      // currently unused, reserved for tinting
uniform float uGradientScale;  // scale of world-space space used for bands
uniform float uFlowSpeed;      // noise evolution speed
uniform float uFlowAmount;     // how much flow warps band-space
uniform float uGradientSpeed;  // global time multiplier (set in JS)
uniform float uDetailX;        // how fine the band patterns are along X
uniform float uBandScale;      // band density

varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vPosition;
varying float vTime;

// --- simplex noise helpers (same code as in vertex, names suffixed) ---
vec3 mod289_f(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289_f(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 permute_f(vec4 x){return mod289_f(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt_f(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise_f(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289_f(i);
    vec4 p = permute_f(permute_f(permute_f(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt_f(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1),
                            dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3)));
}

float snoise01(vec3 v) { return snoise_f(v) * 0.5 + 0.5; }

// simple static hash noise in screen space
float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {
    vec3 N = normalize(vNormal);

    // ---------- LAVA-LAMP CHROMATIC BANDS ----------
    vec3 gc = vPosition * uGradientScale;
    float t = vTime * uFlowSpeed * 0.2;

    // layered flow noise field
    float f1 = snoise_f(gc * 0.7 + vec3(t, -t*0.7, t*0.5));
    float f2 = snoise_f(gc * 0.9 + vec3(-t*0.6, t*0.4, -t*0.3));
    float f3 = snoise_f(gc * 0.5 + vec3(t*0.2, t*0.3, t*0.1));

    float blobField = vPosition.y + uFlowAmount * (f1*0.4 + f2*0.35 + f3*0.25);
    float stepY = blobField * uBandScale + sin(t*0.5);

    // per-channel x-offsets to create chromatic separation
    float rDiff = 0.05;
    float bDiff = -0.05;

    vec3 rgb = vec3(0.0);
    rgb.r = snoise01(vec3(N.x * uDetailX - t + rDiff, stepY, 12.34 + t));
    rgb.g = snoise01(vec3(N.x * uDetailX - t       , stepY, 12.34 + t));
    rgb.b = snoise01(vec3(N.x * uDetailX - t + bDiff, stepY, 12.34 + t));

    // harden bands and clamp
    rgb = pow(rgb * 1.1, vec3(4.0));
    rgb = smoothstep(0.15, 0.95, rgb);
    vec3 col = clamp(rgb, 0.0, 1.0);

    // subtle fresnel brightening on rim
    float fresnel = pow(1.0 - max(dot(N, normalize(-vViewPos)), 0.0), 2.0);
    col += fresnel * 0.05;

    // ---------- FROSTED NOISE INLAID INTO GRADIENT ----------
    // big static cells in screen space (no time -> static grain)
    vec2 noiseCoord = gl_FragCoord.xy * 0.07;  // lower => bigger grain
    float gn1 = hash12(noiseCoord);
    float gn2 = hash12(noiseCoord + 123.45);
    float gnoise = (gn1 + gn2) * 0.5;          // 0..1

    // 1) phase jitter: warps band coordinate slightly
    float phaseJitter = (gnoise - 0.5) * 0.12; // how much bands wobble
    stepY += phaseJitter;

    // 2) brightness modulation: gentle film-grain-like variation
    float amp = 0.18;                          // overall grain strength
    float gain = 1.0 + (gnoise - 0.5) * amp;
    col *= gain;

    // ---------- SOFT EDGE MASK FOR POST BLUR ----------
    // 1 at center of blob, falls off near silhouette, 0 on background
    float viewDot = max(dot(N, normalize(-vViewPos)), 0.0);
    float edgeSoft = smoothstep(0.5, 0.95, viewDot);

    // alpha carries softness mask into render target
    gl_FragColor = vec4(col, edgeSoft);
}
`;

export const POST_VERT = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const POST_FRAG = `
precision mediump float;
varying vec2 vUv;

uniform sampler2D tScene;
uniform vec2 uResolution;

// small separable-ish Gaussian blur using 3x3 kernel
vec3 bloom(sampler2D tex, vec2 uv) {
    vec2 texel = 1.0 / uResolution;
    vec3 acc = vec3(0.0);
    float wSum = 0.0;
    float kernel[3];
    kernel[0] = 0.27901;
    kernel[1] = 0.44198;
    kernel[2] = 0.27901;
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            float w = kernel[abs(x)] * kernel[abs(y)];
            acc += texture2D(tex, uv + vec2(x,y) * texel * 2.0).rgb * w;
            wSum += w;
        }
    }
    return acc / wSum;
}

void main() {
    vec2 uv = vUv;

    // RGBA from blob pass: rgb = color, a = softness mask
    vec4 sceneSample = texture2D(tScene, uv);
    vec3 base = sceneSample.rgb;
    float mask = sceneSample.a;  // 1 center, ~0 background, 0<mask<1 near edge

    // Region factor controlling how much of soft band is considered "center"
    float edgeRegion = smoothstep(0.5, 0.9, mask);

    // ---- bloom on bright regions ----
    float luminance = dot(base, vec3(0.2126, 0.7152, 0.0722));
    float bloomMask = smoothstep(0.2, 0.7, luminance);
    vec3 blurredBloom = bloom(tScene, uv);
    vec3 bloomed = mix(base, base + blurredBloom * 0.2, bloomMask);

    // ---- edge blur around silhouette (set factor > 0 to enable) ----
    vec3 edgeBlur = bloom(tScene, uv);
    float edgeAmount = 1.0 - edgeRegion;  // 1 at edge, 0 center/background
    float edgeBlurStrength = 0.0;         // 0.0 = disabled, e.g. 0.6 to enable

    vec3 finalColor = mix(bloomed, edgeBlur, edgeAmount * edgeBlurStrength);
    float fade = smoothstep(0.0, 0.4, mask); // 0 at rim, 1 inside
    gl_FragColor = vec4(finalColor * fade, 1.0);
}
`;
