let steps = 0;
let isActive = false;
let lastAcc = 0;
let lastStepTime = 0;

export function getStepCount(): number {
  return steps;
}

export function getCalorieEstimate(): number {
  return steps * 0.04;
}

export function initStepCounter(): void {
  if (isActive) return;
  
  const requestPerm = (DeviceMotionEvent as any).requestPermission;
  if (typeof requestPerm === 'function') {
    requestPerm().then((permissionState: string) => {
      if (permissionState === 'granted') {
        startListening();
      }
    }).catch(console.error);
  } else {
    startListening();
  }
}

function startListening() {
  if (typeof window === 'undefined' || !window.DeviceMotionEvent) return;
  
  const saved = sessionStorage.getItem('gw-session-steps');
  if (saved) {
    steps = parseInt(saved, 10) || 0;
  }
  
  window.addEventListener('devicemotion', (e) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
    
    const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    const now = Date.now();
    
    if (magnitude > 12 && magnitude - lastAcc > 2 && (now - lastStepTime) > 300) {
      steps++;
      lastStepTime = now;
      sessionStorage.setItem('gw-session-steps', steps.toString());
    }
    lastAcc = magnitude;
  });
  isActive = true;
}

export function mountStepCounterDisplay(el: HTMLElement): void {
  el.innerHTML = '';
  
  const container = document.createElement('div');
  container.className = 'px-3 py-1 rounded-full bg-surface-elevated text-theme-primary text-[11px] font-sans border border-theme-subtle cursor-pointer';
  
  const textSpan = document.createElement('span');
  
  if (typeof window.DeviceMotionEvent === 'undefined') {
    textSpan.textContent = '💃 Step counter available on mobile';
    container.appendChild(textSpan);
    el.appendChild(container);
    return;
  }

  const updateText = () => {
    textSpan.textContent = `💃 ~${steps.toLocaleString()} steps`;
  };
  updateText();
  
  setInterval(updateText, 5000);
  
  container.addEventListener('click', () => {
    showStatsModal();
  });
  
  container.appendChild(textSpan);
  el.appendChild(container);
}

function showStatsModal() {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4';
  
  const modal = document.createElement('div');
  modal.className = 'bg-surface-base w-full max-w-sm rounded-2xl p-6 border border-theme-subtle flex flex-col gap-4';
  
  const title = document.createElement('h2');
  title.className = 'text-xl font-display text-theme-primary';
  title.textContent = 'Dancing Stats';
  
  const stats = document.createElement('div');
  stats.className = 'flex flex-col gap-2 font-sans text-theme-secondary text-sm';
  
  const stepStat = document.createElement('p');
  stepStat.textContent = `Total Steps: ${steps.toLocaleString()}`;
  
  const calStat = document.createElement('p');
  calStat.textContent = `Estimated Calories: ${getCalorieEstimate().toFixed(1)} kcal`;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'mt-4 px-4 py-2 bg-surface-elevated text-theme-primary rounded-lg font-sans';
  closeBtn.textContent = 'Close';
  closeBtn.onclick = () => document.body.removeChild(overlay);
  
  stats.appendChild(stepStat);
  stats.appendChild(calStat);
  
  modal.appendChild(title);
  modal.appendChild(stats);
  modal.appendChild(closeBtn);
  overlay.appendChild(modal);
  
  document.body.appendChild(overlay);
}
