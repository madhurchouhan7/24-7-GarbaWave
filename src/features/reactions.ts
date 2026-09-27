/**
 * features/reactions.ts — Live Floating Reactions & Crowd Energy.
 *
 * Lets dancers send live celebration emojis (👏, 🪔, 💃, 🕺, ✨, 🥢)
 * that float up across the screen, synced across tabs via BroadcastChannel.
 */

import { getState } from '../state';

export const REACTION_EMOJIS = ['👏', '🪔', '💃', '🕺', '✨', '🥢'];
let reactionChannel: BroadcastChannel | null = null;

export function initLiveReactions(): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      reactionChannel = new BroadcastChannel('garbawave_reactions');
      reactionChannel.onmessage = (event) => {
        if (event.data?.type === 'REACTION_BURST' && typeof event.data.emoji === 'string') {
          spawnFloatingEmoji(event.data.emoji, event.data.originX);
        }
      };
    }
  } catch {
    // Fallback
  }

  // Periodic organic crowd excitement during active playback
  setInterval(() => {
    if (getState().isPlaying && Math.random() > 0.6) {
      const emoji = REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)];
      spawnFloatingEmoji(emoji, Math.random() * (window.innerWidth - 60) + 30);
    }
  }, 4500);
}

export function sendReaction(emoji: string, originX?: number): void {
  const x = originX ?? (window.innerWidth / 2 + (Math.random() - 0.5) * 120);
  spawnFloatingEmoji(emoji, x);

  // Trigger light mobile haptic
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([15, 20]);
    } catch {
      // Ignore
    }
  }

  if (reactionChannel) {
    reactionChannel.postMessage({ type: 'REACTION_BURST', emoji, originX: x });
  }
}

function spawnFloatingEmoji(emoji: string, originX: number): void {
  const el = document.createElement('div');
  el.className = 'floating-reaction-emoji';
  el.textContent = emoji;
  el.setAttribute('aria-hidden', 'true');

  const startX = Math.max(20, Math.min(window.innerWidth - 40, originX));
  const swayOffset = (Math.random() - 0.5) * 60;
  const duration = 2.4 + Math.random() * 0.8;
  const size = 24 + Math.floor(Math.random() * 16);

  Object.assign(el.style, {
    position: 'fixed',
    bottom: '80px',
    left: `${startX}px`,
    fontSize: `${size}px`,
    pointerEvents: 'none',
    zIndex: '9999',
    userSelect: 'none',
    willChange: 'transform, opacity',
    animation: `floatUpSway ${duration}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
    '--sway-x': `${swayOffset}px`,
  });

  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration * 1000 + 100);
}

/**
 * Mounts the Floating Reaction Bar toolbar into a container.
 */
export function mountReactionBar(container: HTMLElement): HTMLElement {
  const bar = document.createElement('div');
  bar.className = [
    'flex items-center justify-center gap-1.5 p-1.5 rounded-full',
    'bg-surface-card/90 backdrop-blur-md border border-theme-subtle shadow-lg',
  ].join(' ');

  REACTION_EMOJIS.forEach((emoji) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = [
      'w-8 h-8 rounded-full flex items-center justify-center text-sm',
      'hover:bg-surface-elevated active:scale-125 transition-transform duration-150',
      'cursor-pointer select-none',
    ].join(' ');
    btn.textContent = emoji;
    btn.title = `Send ${emoji} reaction`;

    btn.addEventListener('click', () => {
      const rect = btn.getBoundingClientRect();
      sendReaction(emoji, rect.left + rect.width / 2);
    });

    bar.appendChild(btn);
  });

  container.appendChild(bar);
  return bar;
}
