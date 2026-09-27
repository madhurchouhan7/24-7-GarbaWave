/**
 * features/clapper.ts — Interactive 2-Taali, 3-Taali & Dodhiya Step Metronome.
 *
 * Provides a rhythmic visual and synthesized acoustic clap guide for dancers.
 * Modes:
 *  - 2-Taali: Step 1 ➔ Clap 2 (Classic rhythmic pair)
 *  - 3-Taali: Step 1 ➔ Step 2 ➔ Clap 3 (Traditional Gujarat Mandli tempo)
 *  - Dodhiya: 1-2-3-4-5-6 (Circular swirl step progression)
 */

import { getState, subscribe } from '../state';

export type TaaliMode = '2-taali' | '3-taali' | 'dodhiya';

let activeMode: TaaliMode = '2-taali';
let isClapperEnabled = false;
let isAudioEnabled = false;
let stepTimer: ReturnType<typeof setInterval> | null = null;
let currentStep = 0;
let audioCtx: AudioContext | null = null;

const MODE_STEPS: Record<TaaliMode, { total: number; clapIndices: number[]; label: string }> = {
  '2-taali': { total: 2, clapIndices: [1], label: '2-Taali (૨-તાળી)' },
  '3-taali': { total: 3, clapIndices: [2], label: '3-Taali (૩-તાળી)' },
  'dodhiya': { total: 6, clapIndices: [2, 5], label: 'Dodhiya (દોઢિયા ૬-સ્ટેપ)' },
};

function playSynthClap(): void {
  if (!isAudioEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Synthesize a warm Dandiya / Dholak woodblock click
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  } catch {
    // Ignore audio permission
  }
}

export function openClapperModal(): void {
  const existing = document.getElementById('gw-clapper-modal');
  if (existing) {
    existing.classList.remove('hidden');
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.id = 'gw-clapper-modal';
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-label', 'Garba Step & Taali Rhythm Guide');

  const card = document.createElement('div');
  card.className = [
    'w-full max-w-md rounded-3xl p-6',
    'bg-surface-card border border-theme-subtle shadow-2xl space-y-5',
  ].join(' ');

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between border-b border-theme-subtle pb-3';
  header.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-2xl">👏</span>
      <div>
        <h3 class="font-display font-bold text-base text-theme-primary leading-tight">Garba Taali & Step Guide</h3>
        <p class="text-xs text-theme-secondary mt-0.5">Rhythm Metronome for 2-Taali, 3-Taali & Dodhiya</p>
      </div>
    </div>
  `;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'w-8 h-8 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary bg-surface-elevated text-sm';
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', () => {
    backdrop.classList.add('hidden');
    stopClapper();
  });
  header.appendChild(closeBtn);

  // Mode Selector Tabs
  const tabStrip = document.createElement('div');
  tabStrip.className = 'grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-surface-elevated border border-theme-subtle';

  (Object.keys(MODE_STEPS) as TaaliMode[]).forEach((mode) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = [
      'py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer',
      activeMode === mode
        ? 'bg-theme-accent text-white shadow-md'
        : 'text-theme-secondary hover:text-theme-primary',
    ].join(' ');
    btn.textContent = MODE_STEPS[mode].label;

    btn.addEventListener('click', () => {
      activeMode = mode;
      currentStep = 0;
      tabStrip.querySelectorAll('button').forEach((b, idx) => {
        const m = (Object.keys(MODE_STEPS) as TaaliMode[])[idx];
        b.className = [
          'py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer',
          activeMode === m
            ? 'bg-theme-accent text-white shadow-md'
            : 'text-theme-secondary hover:text-theme-primary',
        ].join(' ');
      });
      renderStepPills();
      restartClapperIfActive();
    });

    tabStrip.appendChild(btn);
  });

  // Visual Step Visualizer Box
  const visualBox = document.createElement('div');
  visualBox.className = 'p-6 rounded-2xl bg-surface-elevated border border-theme-subtle flex flex-col items-center justify-center gap-4 text-center';

  const beatIndicator = document.createElement('div');
  beatIndicator.id = 'clapper-beat-ring';
  beatIndicator.className = 'w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 border-theme-subtle transition-all duration-150 shadow-lg';
  beatIndicator.innerHTML = `<span class="text-3xl" id="clapper-icon">👏</span><span class="text-xs font-bold mt-1" id="clapper-count-text">Step 1</span>`;

  const pillsContainer = document.createElement('div');
  pillsContainer.id = 'clapper-pills-wrap';
  pillsContainer.className = 'flex items-center gap-2';

  function renderStepPills() {
    pillsContainer.innerHTML = '';
    const def = MODE_STEPS[activeMode];
    for (let i = 0; i < def.total; i++) {
      const pill = document.createElement('div');
      pill.className = `w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 ${
        i === currentStep
          ? 'bg-theme-accent text-white scale-125 ring-2 ring-theme-gold'
          : def.clapIndices.includes(i)
            ? 'bg-theme-gold/20 text-theme-gold border border-theme-gold'
            : 'bg-surface-card text-theme-muted border border-theme-subtle'
      }`;
      pill.textContent = def.clapIndices.includes(i) ? '👏' : String(i + 1);
      pillsContainer.appendChild(pill);
    }
  }

  renderStepPills();
  visualBox.appendChild(beatIndicator);
  visualBox.appendChild(pillsContainer);

  // Action Buttons: Toggle Clapper & Sound
  const actions = document.createElement('div');
  actions.className = 'flex items-center justify-between gap-3 pt-2';

  const toggleSoundBtn = document.createElement('button');
  toggleSoundBtn.type = 'button';
  toggleSoundBtn.className = 'flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-surface-elevated border border-theme-subtle text-theme-primary cursor-pointer';
  toggleSoundBtn.innerHTML = `<span>🔊</span><span>Sound: ${isAudioEnabled ? 'ON' : 'OFF'}</span>`;
  toggleSoundBtn.addEventListener('click', () => {
    isAudioEnabled = !isAudioEnabled;
    toggleSoundBtn.innerHTML = `<span>🔊</span><span>Sound: ${isAudioEnabled ? 'ON' : 'OFF'}</span>`;
  });

  const toggleClapperBtn = document.createElement('button');
  toggleClapperBtn.type = 'button';
  toggleClapperBtn.className = [
    'flex-1 py-2.5 px-4 rounded-xl font-display font-bold text-sm text-white',
    'bg-theme-accent hover:opacity-90 active:scale-95 shadow-lg shadow-theme-glow',
    'transition-all duration-200 cursor-pointer flex items-center justify-center gap-2',
  ].join(' ');
  toggleClapperBtn.textContent = isClapperEnabled ? '⏹ Stop Guide' : '▶ Start Step Guide';

  toggleClapperBtn.addEventListener('click', () => {
    isClapperEnabled = !isClapperEnabled;
    toggleClapperBtn.textContent = isClapperEnabled ? '⏹ Stop Guide' : '▶ Start Step Guide';
    if (isClapperEnabled) {
      startClapper();
    } else {
      stopClapper();
    }
  });

  actions.appendChild(toggleSoundBtn);
  actions.appendChild(toggleClapperBtn);

  card.appendChild(header);
  card.appendChild(tabStrip);
  card.appendChild(visualBox);
  card.appendChild(actions);
  backdrop.appendChild(card);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.classList.add('hidden');
      stopClapper();
    }
  });

  document.body.appendChild(backdrop);
}

function startClapper(): void {
  stopClapper();
  const bpm = getState().currentTrack?.bpm ?? 124;
  const intervalMs = (60 / bpm) * 1000;

  stepTimer = setInterval(() => {
    tickStep();
  }, intervalMs);
}

function stopClapper(): void {
  if (stepTimer) {
    clearInterval(stepTimer);
    stepTimer = null;
  }
}

function restartClapperIfActive(): void {
  if (isClapperEnabled) {
    startClapper();
  }
}

function tickStep(): void {
  const def = MODE_STEPS[activeMode];
  currentStep = (currentStep + 1) % def.total;
  const isClap = def.clapIndices.includes(currentStep);

  const ring = document.getElementById('clapper-beat-ring');
  const icon = document.getElementById('clapper-icon');
  const countText = document.getElementById('clapper-count-text');

  if (isClap) {
    playSynthClap();
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch {
        // Ignore
      }
    }
    if (ring) {
      ring.style.borderColor = 'var(--accent-gold)';
      ring.style.boxShadow = '0 0 20px var(--accent-gold)';
      ring.style.transform = 'scale(1.15)';
    }
    if (icon) icon.textContent = '👏';
    if (countText) countText.textContent = 'CLAP!';
  } else {
    if (ring) {
      ring.style.borderColor = 'var(--accent-primary)';
      ring.style.boxShadow = '0 0 10px var(--glow-primary)';
      ring.style.transform = 'scale(1.02)';
    }
    if (icon) icon.textContent = '🦶';
    if (countText) countText.textContent = `Step ${currentStep + 1}`;
  }

  setTimeout(() => {
    if (ring) ring.style.transform = 'scale(1)';
  }, 120);

  // Update pills
  const pillsWrap = document.getElementById('clapper-pills-wrap');
  if (pillsWrap) {
    const pills = pillsWrap.querySelectorAll('div');
    pills.forEach((p, idx) => {
      if (idx === currentStep) {
        p.className = 'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-theme-accent text-white scale-125 ring-2 ring-theme-gold';
      } else {
        p.className = `w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
          def.clapIndices.includes(idx)
            ? 'bg-theme-gold/20 text-theme-gold border border-theme-gold'
            : 'bg-surface-card text-theme-muted border border-theme-subtle'
        }`;
      }
    });
  }
}

// Automatically sync tempo when active track changes
subscribe('currentTrack', () => {
  restartClapperIfActive();
});
