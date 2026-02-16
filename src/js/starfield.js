import { STAR_CONFIG } from './config.js';

export function initStarfield() {
  const starCanvas = document.getElementById('starfield');
  const starCtx = starCanvas.getContext('2d');
  let starW, starH;

  function resizeStarfield() {
    starW = starCanvas.width = window.innerWidth;
    starH = starCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeStarfield);
  resizeStarfield();

  const blobCenterX = () => starW / 2;
  const blobCenterY = () => starH / 2;

  // Approximate blob screen radius from viewport and 3D radius.
  // For your setup, radius scales roughly with min(width, height).
  function getWarpRadius() {
    const minDim = Math.min(starW, starH);
    const baseRadius = minDim * 0.25; // tweak: ~25% of min dimension
    return baseRadius * STAR_CONFIG.warpRadiusFactor;
  }

  class Star {
    constructor() {
      this.reset();
    }

    reset() {
      this.t = Math.random() * 2 - 1;
      this.offset =
        (Math.random() - 0.5) * starH * STAR_CONFIG.fillHeight;
      this.size =
        STAR_CONFIG.minSize +
        Math.random() * (STAR_CONFIG.maxSize - STAR_CONFIG.minSize);
      this.twinklePhase = Math.random() * Math.PI * 2.0;
      this.twinkleSpeed =
        STAR_CONFIG.twinkleSpeed + Math.random() * 0.01;
    }

    update() {

      const warpRadius = getWarpRadius();
      
      const baseX = (this.t + 1.0) * starW * 0.5;
      const parabola_y =
        this.t * this.t * starH * STAR_CONFIG.parabolicScale;
      const baseY = parabola_y + this.offset;

      const dx = baseX - blobCenterX();
      const dy = baseY - blobCenterY();
      const dist = Math.sqrt(dx * dx + dy * dy);

      const innerSpeed = 0.001;
      const outerSpeed = 0.0003;
      const inWarp = dist < warpRadius;
      const speed = inWarp ? innerSpeed : outerSpeed;

      this.t += speed * 2.0;
      if (this.t > 1.0) this.t = -1.0;

      this.twinklePhase += this.twinkleSpeed;

      const baseX2 = (this.t + 1.0) * starW * 0.5;
      const parabola_y2 =
        this.t * this.t * starH * STAR_CONFIG.parabolicScale;
      const baseY2 = parabola_y2 + this.offset;

      const dx2 = baseX2 - blobCenterX();
      const dy2 = baseY2 - blobCenterY();
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

      if (dist2 < warpRadius && dist2 > 0.0) {
        const norm = 1.0 - dist2 / warpRadius;
        const warpFactor = STAR_CONFIG.warpStrength * norm * norm;
        const angle = Math.atan2(dy2, dx2);
        const spiralAngle = angle + warpFactor * 0.012;
        const warpDist = dist2 + warpFactor * 0.35;
        this.x = blobCenterX() + Math.cos(spiralAngle) * warpDist;
        this.y = blobCenterY() + Math.sin(spiralAngle) * warpDist;
      } else {
        this.x = baseX2;
        this.y = baseY2;
      }

      const fadeDist = dist2 / warpRadius;
      const fadeMultiplier = Math.min(1.0, fadeDist * 1.6);

      this.opacity =
        (STAR_CONFIG.minOpacity +
          ((Math.sin(this.twinklePhase) + 1.0) * 0.5) *
            (STAR_CONFIG.maxOpacity - STAR_CONFIG.minOpacity)) *
        fadeMultiplier;
    }

    draw() {
      starCtx.beginPath();
      starCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      starCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2.0);
      starCtx.fill();
    }
  }

  const stars = Array.from(
    { length: STAR_CONFIG.starCount },
    () => new Star()
  );

  function animateStarfield() {
    starCtx.clearRect(0, 0, starW, starH);
    for (const star of stars) {
      star.update();
      star.draw();
    }
    requestAnimationFrame(animateStarfield);
  }

  animateStarfield();
}
