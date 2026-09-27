/**
 * ui/motifs.ts — Pure CSS & inline SVG motif library for GarbaWave.
 *
 * All motifs are strictly inline SVG or pure CSS — zero raster image weight added!
 *
 * Library includes:
 *  - Mandala/Rangoli rotating backdrop & border
 *  - Abhla (mirror-work) sparkle dots with specular shine
 *  - Crossed Dandiya sticks icon (play/pause & decorative)
 *  - Clacking Dandiya spinner (loading state)
 *  - Diya flame animated lamp
 *  - Peacock feather curve flourish (Raat theme)
 *
 * Spec reference: docs/07-design-theme-spec.md §3
 */

/**
 * High-detail geometric Navratri Mandala / Rangoli (pure inline SVG).
 * Scales cleanly and rotates smoothly via CSS.
 */
export function getMandalaSVG(size = 480): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="${size}" height="${size}" aria-hidden="true" class="mandala-svg">
  <defs>
    <radialGradient id="mandalaGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="var(--accent-gold)" stop-opacity="0.9" />
      <stop offset="50%" stop-color="var(--accent-primary)" stop-opacity="0.6" />
      <stop offset="100%" stop-color="var(--accent-secondary)" stop-opacity="0" />
    </radialGradient>
    <g id="petal">
      <path d="M 250,250 C 240,160 210,120 250,50 C 290,120 260,160 250,250 Z" fill="none" stroke="currentColor" stroke-width="1.5" />
      <circle cx="250" cy="90" r="3.5" fill="currentColor" />
      <path d="M 245,150 Q 250,110 255,150" fill="none" stroke="currentColor" stroke-width="1" />
    </g>
    <g id="rangoliPoint">
      <polygon points="250,30 258,48 278,50 263,64 267,84 250,73 233,84 237,64 222,50 242,48" fill="none" stroke="currentColor" stroke-width="1" />
      <circle cx="250" cy="56" r="2" fill="var(--accent-gold)" />
    </g>
    <g id="diyaSmall">
      <path d="M 244,180 Q 250,170 256,180 Q 250,192 244,180 Z" fill="var(--accent-gold)" opacity="0.85" />
    </g>
  </defs>

  <!-- Outer concentric rings with dandiya rhythm tick marks -->
  <circle cx="250" cy="250" r="240" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.4" />
  <circle cx="250" cy="250" r="225" fill="none" stroke="currentColor" stroke-width="2" opacity="0.7" />
  <circle cx="250" cy="250" r="215" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3,9" opacity="0.5" />
  <circle cx="250" cy="250" r="170" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.6" />
  <circle cx="250" cy="250" r="115" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.8" />
  <circle cx="250" cy="250" r="60" fill="url(#mandalaGrad)" opacity="0.35" />
  <circle cx="250" cy="250" r="50" fill="none" stroke="currentColor" stroke-width="2" />
  <circle cx="250" cy="250" r="12" fill="var(--accent-gold)" opacity="0.9" />

  <!-- 12-fold Petal Symmetry (Garba circle) -->
  <g opacity="0.85">
    <use href="#petal" />
    <use href="#petal" transform="rotate(30 250 250)" />
    <use href="#petal" transform="rotate(60 250 250)" />
    <use href="#petal" transform="rotate(90 250 250)" />
    <use href="#petal" transform="rotate(120 250 250)" />
    <use href="#petal" transform="rotate(150 250 250)" />
    <use href="#petal" transform="rotate(180 250 250)" />
    <use href="#petal" transform="rotate(210 250 250)" />
    <use href="#petal" transform="rotate(240 250 250)" />
    <use href="#petal" transform="rotate(270 250 250)" />
    <use href="#petal" transform="rotate(300 250 250)" />
    <use href="#petal" transform="rotate(330 250 250)" />
  </g>

  <!-- 12-fold Outer Rangoli Star Points -->
  <g opacity="0.7">
    <use href="#rangoliPoint" />
    <use href="#rangoliPoint" transform="rotate(30 250 250)" />
    <use href="#rangoliPoint" transform="rotate(60 250 250)" />
    <use href="#rangoliPoint" transform="rotate(90 250 250)" />
    <use href="#rangoliPoint" transform="rotate(120 250 250)" />
    <use href="#rangoliPoint" transform="rotate(150 250 250)" />
    <use href="#rangoliPoint" transform="rotate(180 250 250)" />
    <use href="#rangoliPoint" transform="rotate(210 250 250)" />
    <use href="#rangoliPoint" transform="rotate(240 250 250)" />
    <use href="#rangoliPoint" transform="rotate(270 250 250)" />
    <use href="#rangoliPoint" transform="rotate(300 250 250)" />
    <use href="#rangoliPoint" transform="rotate(330 250 250)" />
  </g>

  <!-- Inner Diya Ring -->
  <g>
    <use href="#diyaSmall" />
    <use href="#diyaSmall" transform="rotate(45 250 250)" />
    <use href="#diyaSmall" transform="rotate(90 250 250)" />
    <use href="#diyaSmall" transform="rotate(135 250 250)" />
    <use href="#diyaSmall" transform="rotate(180 250 250)" />
    <use href="#diyaSmall" transform="rotate(225 250 250)" />
    <use href="#diyaSmall" transform="rotate(270 250 250)" />
    <use href="#diyaSmall" transform="rotate(315 250 250)" />
  </g>
</svg>`.trim();
}

/**
 * Crossed Dandiya Sticks SVG (used for Play/Pause, header, and player console).
 */
export function getCrossedDandiyaSVG(size = 24, className = ''): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" stroke="currentColor" class="${className}" aria-hidden="true">
  <!-- Stick 1 (Diagonal Top-Left to Bottom-Right) -->
  <g class="dandiya-stick-1">
    <!-- Stick body -->
    <path d="M 8,10 L 38,40" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
    <!-- Grip bands -->
    <path d="M 12,14 L 15,17" stroke="var(--accent-gold)" stroke-width="4.5" />
    <path d="M 17,19 L 20,22" stroke="var(--accent-primary)" stroke-width="4.5" />
    <!-- Pom-pom / Bell top -->
    <circle cx="8" cy="10" r="3" fill="var(--accent-gold)" stroke="none" />
    <path d="M 7,12 Q 5,16 6,18" stroke="var(--accent-gold)" stroke-width="1.2" />
  </g>

  <!-- Stick 2 (Diagonal Top-Right to Bottom-Left) -->
  <g class="dandiya-stick-2">
    <!-- Stick body -->
    <path d="M 40,10 L 10,40" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
    <!-- Grip bands -->
    <path d="M 36,14 L 33,17" stroke="var(--accent-gold)" stroke-width="4.5" />
    <path d="M 31,19 L 28,22" stroke="var(--accent-primary)" stroke-width="4.5" />
    <!-- Pom-pom / Bell top -->
    <circle cx="40" cy="10" r="3" fill="var(--accent-gold)" stroke="none" />
    <path d="M 41,12 Q 43,16 42,18" stroke="var(--accent-gold)" stroke-width="1.2" />
  </g>

  <!-- Center impact glint / sparkle -->
  <circle cx="24" cy="25" r="2.5" fill="var(--accent-gold)" />
</svg>`.trim();
}

/**
 * Animated Clacking Dandiya Spinner (used for loading states).
 */
export function getDandiyaSpinnerSVG(size = 36): string {
  return `
<div class="dandiya-spinner inline-flex items-center justify-center" style="width:${size}px; height:${size}px;" aria-label="Loading Garba track...">
  ${getCrossedDandiyaSVG(size, 'dandiya-clacking-animation')}
</div>`.trim();
}

/**
 * Animated Diya Lamp with flickering flame.
 */
export function getDiyaFlameSVG(size = 24, className = ''): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" class="${className}" aria-hidden="true">
  <!-- Diya clay base -->
  <path d="M 5,18 C 5,25 27,25 27,18 C 27,18 25,16 16,16 C 7,16 5,18 5,18 Z" fill="var(--accent-primary)" />
  <path d="M 8,19 Q 16,21 24,19" stroke="var(--accent-gold)" stroke-width="1.5" stroke-linecap="round" />
  <ellipse cx="16" cy="16.5" rx="8" ry="2" fill="var(--accent-gold)" opacity="0.6" />

  <!-- Diya animated flame -->
  <g class="diya-flame-flicker">
    <!-- Outer flame glow -->
    <path d="M 16,4 C 12,9 11,14 16,16 C 21,14 20,9 16,4 Z" fill="var(--accent-primary)" opacity="0.8" />
    <!-- Inner core flame -->
    <path d="M 16,7 C 14,10 13.5,13.5 16,15.5 C 18.5,13.5 18,10 16,7 Z" fill="var(--accent-gold)" />
    <!-- Wick -->
    <line x1="16" y1="16" x2="16" y2="13" stroke="#4a2c1d" stroke-width="1.2" stroke-linecap="round" />
  </g>
</svg>`.trim();
}

/**
 * Abhla (mirror-work) Sparkle Dot SVG.
 */
export function getAbhlaMirrorSVG(size = 14, className = ''): string {
  return `
<span class="abhla-mirror-dot inline-block ${className}" style="width:${size}px; height:${size}px;" aria-hidden="true">
  <svg viewBox="0 0 20 20" width="${size}" height="${size}" fill="none">
    <circle cx="10" cy="10" r="8" fill="var(--bg-card)" stroke="var(--accent-gold)" stroke-width="1.5" />
    <circle cx="10" cy="10" r="5" fill="var(--accent-secondary)" opacity="0.7" />
    <!-- Specular cross glint -->
    <path d="M 10,4 L 10,16 M 4,10 L 16,10" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.9" />
    <circle cx="10" cy="10" r="1.5" fill="#ffffff" />
  </svg>
</span>`.trim();
}

/**
 * Peacock Feather Curve Flourish (Raat theme corner accent).
 */
export function getPeacockCornerFlourishSVG(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="120" height="120" fill="none" class="peacock-corner-flourish" aria-hidden="true">
  <defs>
    <radialGradient id="peacockEyeGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00f0ff" />
      <stop offset="40%" stop-color="#ff2a85" />
      <stop offset="80%" stop-color="#181848" />
      <stop offset="100%" stop-color="#ffb700" />
    </radialGradient>
  </defs>

  <!-- Elegant feather stem curves -->
  <path d="M 0,0 C 40,20 110,60 140,140" stroke="var(--accent-primary)" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />
  <path d="M 0,0 C 30,35 70,80 90,150" stroke="var(--accent-secondary)" stroke-width="1.8" stroke-linecap="round" opacity="0.5" />

  <!-- Feather barbules -->
  <path d="M 50,28 Q 70,15 85,25" stroke="var(--accent-gold)" stroke-width="1.2" opacity="0.6" />
  <path d="M 75,45 Q 105,30 115,50" stroke="var(--accent-gold)" stroke-width="1.2" opacity="0.6" />
  <path d="M 100,68 Q 135,55 140,80" stroke="var(--accent-secondary)" stroke-width="1.2" opacity="0.6" />

  <!-- Iconic Peacock Eye Motif -->
  <g transform="translate(110, 110)">
    <ellipse cx="0" cy="0" rx="22" ry="16" transform="rotate(-35)" fill="url(#peacockEyeGrad)" stroke="var(--accent-gold)" stroke-width="2" />
    <ellipse cx="0" cy="0" rx="12" ry="8" transform="rotate(-35)" fill="#00f0ff" opacity="0.9" />
    <circle cx="0" cy="0" r="4.5" fill="#050518" />
    <circle cx="-1.5" cy="-1.5" r="1.5" fill="#ffffff" />
  </g>
</svg>`.trim();
}

/**
 * Scatter Abhla mirror sparkle dots across a hero container.
 */
export function injectHeroSparkles(container: HTMLElement, count = 12): void {
  const existing = container.querySelector('.hero-sparkles-wrap');
  if (existing) existing.remove();

  const wrap = document.createElement('div');
  wrap.className = 'hero-sparkles-wrap absolute inset-0 pointer-events-none overflow-hidden';
  wrap.setAttribute('aria-hidden', 'true');

  const positions = [
    { top: '12%', left: '8%', delay: '0s', size: 14 },
    { top: '18%', left: '88%', delay: '1.2s', size: 18 },
    { top: '35%', left: '4%', delay: '0.6s', size: 12 },
    { top: '42%', left: '92%', delay: '1.8s', size: 16 },
    { top: '65%', left: '10%', delay: '2.4s', size: 14 },
    { top: '70%', left: '86%', delay: '0.9s', size: 20 },
    { top: '85%', left: '22%', delay: '1.5s', size: 12 },
    { top: '80%', left: '76%', delay: '2.1s', size: 16 },
    { top: '25%', left: '25%', delay: '3.0s', size: 10 },
    { top: '28%', left: '72%', delay: '0.4s', size: 12 },
    { top: '55%', left: '18%', delay: '2.7s', size: 14 },
    { top: '50%', left: '80%', delay: '1.6s', size: 14 },
  ];

  positions.slice(0, count).forEach((pos) => {
    const dot = document.createElement('div');
    dot.className = 'absolute abhla-sparkle-pulse';
    dot.style.top = pos.top;
    dot.style.left = pos.left;
    dot.style.animationDelay = pos.delay;
    dot.innerHTML = getAbhlaMirrorSVG(pos.size);
    wrap.appendChild(dot);
  });

  container.insertBefore(wrap, container.firstChild);
}

/**
 * Toran / Bandhanwar Traditional Festive Doorway Garland SVG (Mango Leaves + Marigold Flowers).
 */
export function getToranGarlandSVG(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 40" width="100%" height="24" preserveAspectRatio="none" class="toran-garland-svg" aria-hidden="true">
  <defs>
    <!-- Mango Leaf Motif -->
    <g id="mangoLeaf">
      <path d="M 0,0 C 10,15 15,25 0,36 C -15,25 -10,15 0,0 Z" fill="#2e7d32" stroke="#1b5e20" stroke-width="0.8" />
      <line x1="0" y1="0" x2="0" y2="34" stroke="#81c784" stroke-width="0.8" />
    </g>
    <!-- Marigold Flower Motif -->
    <g id="marigold">
      <circle cx="0" cy="0" r="7" fill="var(--accent-gold)" />
      <circle cx="0" cy="0" r="4.5" fill="var(--accent-primary)" />
      <circle cx="0" cy="0" r="2" fill="#ffe082" />
    </g>
  </defs>

  <!-- Golden Garland String -->
  <line x1="0" y1="4" x2="1200" y2="4" stroke="var(--accent-gold)" stroke-width="2" stroke-dasharray="4,4" />

  <!-- Repeating Mango Leaves and Marigolds across 1200px width -->
  <g transform="translate(40, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(120, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(200, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(280, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(360, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(440, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(520, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(600, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(680, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(760, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(840, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(920, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(1000, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(1080, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
  <g transform="translate(1160, 4)"><use href="#mangoLeaf" /><use href="#marigold" transform="translate(0, 0)" /></g>
</svg>`.trim();
}
