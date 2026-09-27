/**
 * features/visualizer.ts — BPM-Synced Beat & Dandiya Kinetic Visualizer (Features v2 §3).
 *
 * Lightweight HTML5 canvas visualizer that generates rhythmic dancing pulse rings
 * and Dandiya particles synced to the track's BPM.
 * Automatically stops RAF loop when paused or under prefers-reduced-motion.
 */

import { getState, subscribe } from '../state';

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let animFrameId: number | null = null;
let rings: { radius: number; maxRadius: number; opacity: number; color: string }[] = [];
let lastBeatTime = 0;

export function mountBeatVisualizer(container: HTMLElement): void {
  canvas = document.createElement('canvas');
  canvas.id = 'gw-beat-visualizer';
  canvas.className = 'absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-70';
  canvas.setAttribute('aria-hidden', 'true');

  container.appendChild(canvas);
  ctx = canvas.getContext('2d');

  function resize() {
    if (!canvas) return;
    canvas.width = canvas.parentElement?.clientWidth ?? 400;
    canvas.height = canvas.parentElement?.clientHeight ?? 300;
  }

  window.addEventListener('resize', resize);
  resize();

  subscribe('isPlaying', (s) => {
    if (s.isPlaying) {
      startLoop();
    } else {
      stopLoop();
    }
  });

  if (getState().isPlaying) {
    startLoop();
  }
}

function startLoop(): void {
  // Check reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  if (animFrameId !== null) return;
  loop(performance.now());
}

function stopLoop(): void {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  rings = [];
}

function loop(now: number): void {
  if (!ctx || !canvas) return;

  const state = getState();
  if (!state.isPlaying) {
    stopLoop();
    return;
  }

  const bpm = state.currentTrack?.bpm ?? 120;
  const beatInterval = (60 / bpm) * 1000;

  // Trigger new beat pulse ring on rhythm
  if (now - lastBeatTime >= beatInterval) {
    lastBeatTime = now;
    const colors = ['var(--accent-primary)', 'var(--accent-gold)', 'var(--accent-secondary)'];
    const color = colors[rings.length % colors.length];

    rings.push({
      radius: 10,
      maxRadius: Math.max(canvas.width, canvas.height) * 0.65,
      opacity: 0.6,
      color,
    });
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Render expanding rings
  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i];
    ring.radius += 1.8;
    ring.opacity = Math.max(0, 0.6 * (1 - ring.radius / ring.maxRadius));

    if (ring.opacity <= 0 || ring.radius >= ring.maxRadius) {
      rings.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = ring.color.startsWith('var') ? '#e91e63' : ring.color;
    ctx.globalAlpha = ring.opacity;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  animFrameId = requestAnimationFrame(loop);
}
