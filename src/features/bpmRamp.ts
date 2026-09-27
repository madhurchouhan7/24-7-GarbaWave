import { subscribe } from '../state';
import type { Song } from '../types';

let currentUnsub: (() => void) | null = null;

export function mountBpmRamp(el: HTMLElement, song: Song | null): void {
  unmountBpmRamp();

  while (el.firstChild) { el.removeChild(el.firstChild); }

  if (!song) {
    const label = document.createElement('div');
    label.className = 'text-theme-muted text-sm font-sans';
    label.textContent = 'BPM: --';
    el.appendChild(label);
    return;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.width = '100%';
  svg.style.height = '60px';
  svg.setAttribute('preserveAspectRatio', 'none');
  
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.id = 'bpmGrad';
  grad.setAttribute('x1', '0%');
  grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%');
  grad.setAttribute('y2', '0%');

  const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  s1.setAttribute('offset', '0%');
  s1.setAttribute('stop-color', '#2196f3');

  const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  s2.setAttribute('offset', '50%');
  s2.setAttribute('stop-color', '#ff9800');

  const s3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  s3.setAttribute('offset', '100%');
  s3.setAttribute('stop-color', '#f44336');

  grad.appendChild(s1);
  grad.appendChild(s2);
  grad.appendChild(s3);
  defs.appendChild(grad);
  svg.appendChild(defs);

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', 'url(#bpmGrad)');
  polyline.setAttribute('stroke-width', '2');

  const points: string[] = [];
  for (let x = 0; x <= 100; x += 5) {
    const normalizedProgress = x / 100;
    const y = 50 - (normalizedProgress * 40); 
    points.push(`${x},${y}`);
  }
  polyline.setAttribute('points', points.join(' '));
  polyline.setAttribute('vector-effect', 'non-scaling-stroke');

  svg.setAttribute('viewBox', '0 0 100 60');
  svg.appendChild(polyline);

  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('r', '3');
  dot.setAttribute('fill', '#ffffff');
  dot.setAttribute('cx', '0');
  dot.setAttribute('cy', '50');
  svg.appendChild(dot);

  el.appendChild(svg);

  currentUnsub = subscribe('progress', (state) => {
    const p = state.progress; 
    const x = p * 100;
    const y = 50 - (p * 40);
    dot.setAttribute('cx', x.toString());
    dot.setAttribute('cy', y.toString());
  });
}

export function unmountBpmRamp(): void {
  if (currentUnsub) {
    currentUnsub();
    currentUnsub = null;
  }
}
