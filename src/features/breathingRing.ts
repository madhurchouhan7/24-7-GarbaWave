import { subscribe, getState } from '../state';

let currentBpm = 120;
let ringContainer: HTMLElement | null = null;

export function updateBreathingBpm(bpm: number): void {
  currentBpm = bpm > 0 ? bpm : 120;
  if (ringContainer) {
    const duration = 60 / currentBpm;
    ringContainer.style.setProperty('--ring-duration', `${duration}s`);
  }
}

export function mountBreathingRing(el: HTMLElement): void {
  ringContainer = el;
  el.style.position = 'absolute';
  el.style.left = '50%';
  el.style.top = '50%';
  el.style.transform = 'translate(-50%, -50%)';
  el.style.width = '180px';
  el.style.height = '180px';
  el.style.zIndex = '0';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.pointerEvents = 'none';

  // Inject SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 180 180');
  svg.style.width = '100%';
  svg.style.height = '100%';
  
  // Style for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-ring-1 { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
    @keyframes pulse-ring-2 { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.35); } }
    @keyframes pulse-ring-3 { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.5); } }
    .ring {
      transform-origin: center;
      animation-iteration-count: infinite;
      animation-timing-function: ease-in-out;
      animation-play-state: paused;
    }
    .ring.playing { animation-play-state: running; }
    .ring-1 { animation-name: pulse-ring-1; animation-duration: var(--ring-duration, 0.5s); }
    .ring-2 { animation-name: pulse-ring-2; animation-duration: var(--ring-duration, 0.5s); }
    .ring-3 { animation-name: pulse-ring-3; animation-duration: var(--ring-duration, 0.5s); }
  `;
  el.appendChild(style);

  const createCircle = (className: string, r: number, color: string, opacity: number) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '90');
    circle.setAttribute('cy', '90');
    circle.setAttribute('r', r.toString());
    circle.setAttribute('fill', color);
    circle.setAttribute('fill-opacity', opacity.toString());
    circle.classList.add('ring', className);
    return circle;
  };

  const ring3 = createCircle('ring-3', 70, 'var(--accent-glow, rgba(255,255,255,0.5))', 0.3); // outer
  const ring2 = createCircle('ring-2', 60, 'var(--accent-gold, #FFD700)', 0.6); // middle
  const ring1 = createCircle('ring-1', 50, 'var(--accent-primary, #FF5722)', 1.0); // inner

  svg.appendChild(ring3);
  svg.appendChild(ring2);
  svg.appendChild(ring1);
  el.appendChild(svg);

  // Subscriptions
  subscribe('currentTrack', (state) => {
    const bpm = state.currentTrack?.bpm || 120;
    updateBreathingBpm(bpm);
  });

  subscribe('isPlaying', (state) => {
    const rings = el.querySelectorAll('.ring');
    rings.forEach(r => {
      if (state.isPlaying) r.classList.add('playing');
      else r.classList.remove('playing');
    });
  });

  // Init state
  const state = getState();
  updateBreathingBpm(state.currentTrack?.bpm || 120);
  if (state.isPlaying) {
    el.querySelectorAll('.ring').forEach(r => r.classList.add('playing'));
  }
}
