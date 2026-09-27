import { getState } from '../state';

let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let animationFrameId: number | null = null;
let modalContainer: HTMLElement | null = null;
let analyser: AnalyserNode | null = null;

let streak = 0;
let lastClapTime = 0;
let clapThreshold = 0.6; // Amplitude threshold > 0.6

export function initTaaliCoach(): void {
  modalContainer = document.createElement('div');
  modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 hidden pointer-events-none opacity-0 transition-opacity duration-300';
  document.body.appendChild(modalContainer);
}

export async function openTaaliCoachModal(): Promise<void> {
  if (!modalContainer) initTaaliCoach();
  
  const modal = modalContainer!;
  modal.innerHTML = '';
  modal.classList.remove('hidden', 'pointer-events-none');
  modal.classList.add('opacity-100');

  const content = document.createElement('div');
  content.className = 'bg-surface-elevated p-8 rounded-2xl flex flex-col items-center max-w-sm w-full mx-4 shadow-2xl relative border border-theme-subtle';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.className = 'absolute top-4 right-4 text-theme-muted hover:text-theme-primary text-xl font-sans cursor-pointer';
  closeBtn.onclick = stopTaaliCoach;

  const title = document.createElement('h2');
  title.textContent = 'Taali Coach';
  title.className = 'text-2xl font-display text-theme-primary mb-2';
  
  const statusEl = document.createElement('p');
  statusEl.textContent = '🎤 Listening...';
  statusEl.className = 'text-theme-secondary text-sm mb-6 flex items-center gap-2';

  const visualTarget = document.createElement('div');
  visualTarget.className = 'w-32 h-32 rounded-full border-4 border-theme-subtle flex items-center justify-center mb-6 transition-colors duration-150';
  const targetInner = document.createElement('div');
  targetInner.className = 'w-16 h-16 rounded-full bg-theme-accent transition-transform duration-100';
  visualTarget.appendChild(targetInner);

  const feedbackEl = document.createElement('div');
  feedbackEl.textContent = 'Clap to the beat!';
  feedbackEl.className = 'text-lg font-sans text-theme-primary mb-2 h-8';

  const streakEl = document.createElement('div');
  streakEl.textContent = 'Streak: 0';
  streakEl.className = 'text-theme-gold font-display text-xl';

  content.appendChild(closeBtn);
  content.appendChild(title);
  content.appendChild(statusEl);
  content.appendChild(visualTarget);
  content.appendChild(feedbackEl);
  content.appendChild(streakEl);
  modal.appendChild(content);

  streak = 0;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Support standard and webkit prefixes
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
    
    const source = audioContext.createMediaStreamSource(mediaStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.fftSize);

    const checkClap = () => {
      if (!analyser || !audioContext) return;
      analyser.getByteTimeDomainData(dataArray);

      let maxAmp = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = Math.abs(dataArray[i] - 128) / 128;
        if (val > maxAmp) maxAmp = val;
      }

      // Visual pulse
      targetInner.style.transform = `scale(${1 + maxAmp * 0.5})`;

      const now = audioContext.currentTime;
      if (maxAmp > clapThreshold && now - lastClapTime > 0.3) {
        lastClapTime = now;
        
        const state = getState();
        const bpm = state.currentTrack?.bpm || 120;
        const beatInterval = 60 / bpm;
        
        const remainder = now % beatInterval;
        let distance = remainder;
        let isEarly = true;
        
        if (remainder > beatInterval / 2) {
          distance = beatInterval - remainder;
          isEarly = false;
        }

        if (distance < 0.1) {
          feedbackEl.textContent = '✓ On beat!';
          feedbackEl.className = 'text-lg font-sans text-[#4caf50] mb-2 h-8 font-bold';
          visualTarget.classList.replace('border-theme-subtle', 'border-theme-gold');
          setTimeout(() => visualTarget.classList.replace('border-theme-gold', 'border-theme-subtle'), 150);
          streak++;
        } else {
          streak = 0;
          if (isEarly) {
            feedbackEl.textContent = `⚡ Early by ${distance.toFixed(2)}s`;
            feedbackEl.className = 'text-lg font-sans text-theme-accent mb-2 h-8';
          } else {
            feedbackEl.textContent = `⏱ Late by ${distance.toFixed(2)}s`;
            feedbackEl.className = 'text-lg font-sans text-theme-accent mb-2 h-8';
          }
        }
        streakEl.textContent = `Streak: ${streak}`;
      }

      animationFrameId = requestAnimationFrame(checkClap);
    };

    checkClap();

  } catch (err) {
    statusEl.textContent = 'Enable mic in browser settings to use Taali Coach';
    statusEl.className = 'text-theme-accent text-sm mb-6 font-bold';
    visualTarget.style.display = 'none';
  }
}

export function stopTaaliCoach(): void {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
  if (audioContext) {
    audioContext.close().catch(console.error);
    audioContext = null;
  }
  if (modalContainer) {
    modalContainer.classList.add('hidden', 'pointer-events-none');
    modalContainer.classList.remove('opacity-100');
  }
}
