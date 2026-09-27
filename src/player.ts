/**
 * player.ts — Thin wrapper around the YouTube IFrame Player API.
 *
 * Responsibilities:
 * - Own the <iframe> element (visually hidden, 1×1px, off-screen via CSS).
 * - Expose: load(youtubeId), play(), pause(), seek(seconds).
 * - Emit: onProgress (polling), onEnded, onError.
 * - On error → auto-skip to next queue item via state.nextTrack().
 *
 * Security note (04-safety-security.md):
 * - Embed domain: www.youtube-nocookie.com (reduces tracking exposure).
 * - No innerHTML used. The iframe is created via document.createElement.
 * - The IFrame API src is loaded from www.youtube.com (required for the API).
 *
 * Architecture reference: 05-architecture-methodology.md §2
 */

import {
  setIsPlaying,
  setProgress,
  setDuration,
  nextTrack,
  getState,
  subscribe,
} from './state';

// ─── YouTube IFrame API bootstrap ─────────────────────────────────────────────

// The YT global is injected by the YouTube IFrame API script.
// We augment it via @types/youtube.
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

let ytPlayer: YT.Player | null = null;
let pendingVideoId: string | null = null;
let progressTimer: ReturnType<typeof setInterval> | null = null;

/** Load the YouTube IFrame API script once. CSP-safe: only youtube.com scripts. */
function loadYouTubeAPI(): void {
  if (document.getElementById('yt-iframe-api')) return;
  const tag = document.createElement('script');
  tag.id = 'yt-iframe-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  // Append before first script tag (standard YouTube docs recommendation)
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(tag, firstScript);
}

/** Called by YouTube after the API script loads. */
window.onYouTubeIframeAPIReady = function () {
  // Create hidden player container
  const container = document.getElementById('yt-player-container');
  if (!container) return;

  ytPlayer = new YT.Player('yt-player-container', {
    width: '1',
    height: '1',
    // Start with a placeholder; real video is loaded via cueVideoById/loadVideoById
    videoId: pendingVideoId ?? '',
    playerVars: {
      // Use nocookie domain via origin but YT API itself must be youtube.com
      // Embedding is done via nocookie domain in the iframe src param
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,        // hide video annotations
      modestbranding: 1,
      rel: 0,
      origin: window.location.origin,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
};

function onPlayerReady(_evt: YT.PlayerEvent): void {
  if (pendingVideoId) {
    ytPlayer?.cueVideoById(pendingVideoId);
    pendingVideoId = null;
  }
}

function onPlayerStateChange(event: YT.OnStateChangeEvent): void {
  switch (event.data) {
    case YT.PlayerState.PLAYING:
      setIsPlaying(true);
      startProgressPolling();
      break;

    case YT.PlayerState.PAUSED:
      setIsPlaying(false);
      stopProgressPolling();
      break;

    case YT.PlayerState.ENDED:
      setIsPlaying(false);
      stopProgressPolling();
      handleEnded();
      break;

    case YT.PlayerState.BUFFERING:
      // Keep UI in "playing" state while buffering
      break;

    case YT.PlayerState.CUED:
      // Video is cued and ready; autoplay if state says isPlaying
      if (getState().isPlaying) {
        ytPlayer?.playVideo();
      }
      break;
  }
}

function onPlayerError(event: YT.OnErrorEvent): void {
  console.warn('[GarbaWave] YouTube player error:', event.data);
  showToast(`Track unavailable (err ${event.data}) — skipping…`);
  // Auto-skip: advance queue in state, player.ts will react via subscription
  const advanced = nextTrack();
  if (!advanced) setIsPlaying(false);
}

// ─── Progress polling ─────────────────────────────────────────────────────────

function startProgressPolling(): void {
  if (progressTimer) return;
  progressTimer = setInterval(() => {
    if (!ytPlayer) return;
    const elapsed = ytPlayer.getCurrentTime?.() ?? 0;
    const duration = ytPlayer.getDuration?.() ?? 0;
    const progress = duration > 0 ? elapsed / duration : 0;
    setProgress(progress, duration);
    if (duration > 0) setDuration(duration);
  }, 500);
}

function stopProgressPolling(): void {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

// ─── Auto-advance (onEnded) ───────────────────────────────────────────────────

function handleEnded(): void {
  // state.nextTrack() updates currentTrack; our subscription to 'currentTrack'
  // will call load() with the new youtubeId automatically.
  const advanced = nextTrack();
  if (advanced) {
    // Give state a tick to update before reading
    setTimeout(() => {
      const { currentTrack } = getState();
      if (currentTrack) {
        loadVideo(currentTrack.youtubeId, true);
      }
    }, 50);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Load (and optionally auto-play) a video by YouTube ID. */
function loadVideo(youtubeId: string, autoplay: boolean): void {
  if (!ytPlayer) {
    pendingVideoId = youtubeId;
    return;
  }
  if (autoplay) {
    ytPlayer.loadVideoById(youtubeId);
  } else {
    ytPlayer.cueVideoById(youtubeId);
  }
}

export const player = {
  /** Load a YouTube video. Pass autoplay=true to start immediately. */
  load(youtubeId: string, autoplay = false): void {
    loadVideo(youtubeId, autoplay);
  },

  play(): void {
    ytPlayer?.playVideo();
  },

  pause(): void {
    ytPlayer?.pauseVideo();
  },

  /** Seek to a position (0–1 fraction of total duration). */
  seek(fraction: number): void {
    const duration = ytPlayer?.getDuration() ?? 0;
    if (duration > 0) {
      ytPlayer?.seekTo(fraction * duration, true);
    }
  },

  /** Seek to an absolute second offset. */
  seekToSeconds(seconds: number): void {
    ytPlayer?.seekTo(seconds, true);
  },
};

// ─── React to state changes ───────────────────────────────────────────────────

// When currentTrack changes (from genre chip tap, Explore tap, or auto-advance),
// load the new video. isPlaying determines whether to autoplay.
subscribe('currentTrack', (s) => {
  if (!s.currentTrack) return;
  loadVideo(s.currentTrack.youtubeId, s.isPlaying);
});

// ─── Toast helper (non-blocking UI notification) ──────────────────────────────

function showToast(message: string): void {
  const existing = document.getElementById('gw-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'gw-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  // Use textContent (not innerHTML) for XSS safety — spec §2 04-safety-security.md
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1a1a1a',
    color: '#ff9800',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    zIndex: '9999',
    pointerEvents: 'none',
    opacity: '1',
    transition: 'opacity 0.4s',
  });

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

/** Call once after the DOM is ready. Creates the hidden player container. */
export function initPlayer(): void {
  // Create hidden container — aria-hidden so screen readers ignore it
  if (!document.getElementById('yt-player-container')) {
    const container = document.createElement('div');
    container.id = 'yt-player-container';
    container.setAttribute('aria-hidden', 'true');
    // Visually hidden, outside the viewport, 1×1 so the API is happy
    Object.assign(container.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      left: '-9999px',
      top: '-9999px',
    });
    document.body.appendChild(container);
  }

  loadYouTubeAPI();
}
