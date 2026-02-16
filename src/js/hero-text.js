export function initHeroText() {
  // Create hero container
  const heroContainer = document.createElement('div');
  heroContainer.className = 'hero-container';
  
  // Main hero text
  const heroText = document.createElement('div');
  heroText.className = 'hero-text';
  
  // Your text content - customize this!
  const mainText = 'Aurora';
  
  // Split text into words and chars for animation
  const words = mainText.split(' ');
  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    
    const chars = word.split('');
    chars.forEach((char, charIndex) => {
      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.textContent = char;
      charSpan.setAttribute('data-char', char); // For ::before pseudo-element
      charSpan.setAttribute('data-char-index', charIndex);
      charSpan.setAttribute('data-word-index', wordIndex);
      wordSpan.appendChild(charSpan);
    });
    
    heroText.appendChild(wordSpan);
    
    // Add space between words
    if (wordIndex < words.length - 1) {
      const space = document.createTextNode(' ');
      heroText.appendChild(space);
    }
  });
  
  // Subtitle
  const subtitle = document.createElement('div');
  subtitle.className = 'hero-subtitle';
  subtitle.textContent = 'LIQUID DREAMS';
  
  heroContainer.appendChild(heroText);
  heroContainer.appendChild(subtitle);
  document.body.appendChild(heroContainer);
  
  // Wait for GSAP to load
  if (typeof gsap === 'undefined') {
    console.error('GSAP not loaded! Make sure to include GSAP CDN in your HTML');
    return;
  }
  
  // Animate entrance and setup hover effects
  animateHeroText(heroText, subtitle);
}

function animateHeroText(heroText, subtitle) {
  const chars = heroText.querySelectorAll('.char');
  
  // Set initial state
  gsap.set(chars, {
    opacity: 0,
    y: 100,
    rotationX: -90,
    transformOrigin: 'center center',
  });
  
  gsap.set(subtitle, {
    opacity: 0,
    y: 50,
  });
  
  // Create main timeline for entrance
  const tl = gsap.timeline({
    defaults: {
      ease: 'power3.out',
    },
  });
  
  // Wave entrance animation
  tl.to(chars, {
    opacity: 1,
    y: 0,
    rotationX: 0,
    duration: 1.2,
    stagger: {
      each: 0.08,
      from: 'center',
      ease: 'power2.inOut',
    },
  });
  
  // Fade in subtitle
  tl.to(subtitle, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power2.out',
  }, '-=0.5');
  
  // Setup hover effects for breathing/ripple
  setupHoverEffects(chars, subtitle);
}

function setupHoverEffects(chars, subtitle) {
  // Hover on individual characters - breathing effect
  chars.forEach((char, index) => {
    char.addEventListener('mouseenter', () => {
      // Character breathes/scales slightly
      gsap.to(char, {
        scale: 1.15,
        y: -10,
        duration: 0.4,
        ease: 'power2.out',
      });
      
      // Create ripple effect to neighbors
      const neighborDistance = 3;
      chars.forEach((otherChar, otherIndex) => {
        const distance = Math.abs(otherIndex - index);
        if (distance > 0 && distance <= neighborDistance) {
          const strength = 1 - (distance / neighborDistance);
          gsap.to(otherChar, {
            y: -5 * strength,
            scale: 1 + (0.08 * strength),
            duration: 0.5,
            ease: 'power2.out',
          });
        }
      });
    });
    
    char.addEventListener('mouseleave', () => {
      // Return to normal
      gsap.to(char, {
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });
  
  // Global hover - all chars breathe together when hovering container
  const container = document.querySelector('.hero-container');
  let isHovering = false;
  
  container.addEventListener('mouseenter', () => {
    if (!isHovering) {
      isHovering = true;
      startBreathing(chars, subtitle);
    }
  });
  
  container.addEventListener('mouseleave', () => {
    isHovering = false;
    stopBreathing(chars, subtitle);
  });
}

function startBreathing(chars, subtitle) {
  // Gentle breathing animation - all chars move in waves
  chars.forEach((char, i) => {
    gsap.to(char, {
      y: 'random(-5, 5)',
      scale: 'random(0.98, 1.02)',
      duration: 'random(2, 3)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.05,
    });
  });
  
  // Subtitle breathing
  gsap.to(subtitle, {
    y: -3,
    scale: 1.02,
    duration: 2.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
}

function stopBreathing(chars, subtitle) {
  // Return all to normal position
  chars.forEach((char) => {
    gsap.killTweensOf(char);
    gsap.to(char, {
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out',
    });
  });
  
  gsap.killTweensOf(subtitle);
  gsap.to(subtitle, {
    y: 0,
    scale: 1,
    duration: 0.8,
    ease: 'power2.out',
  });
}