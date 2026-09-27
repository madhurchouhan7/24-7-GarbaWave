export function isAartiTime(): boolean {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  
  const currentMinutes = h * 60 + m;
  const morningAarti = 7 * 60 + 30; // 7:30 AM
  const eveningAarti = 18 * 60 + 30; // 6:30 PM

  return Math.abs(currentMinutes - morningAarti) <= 30 || Math.abs(currentMinutes - eveningAarti) <= 30;
}

export function mountAartiClock(el: HTMLElement, onAartiTrigger?: () => void): void {
  while (el.firstChild) { el.removeChild(el.firstChild); }

  const pill = document.createElement('button');
  pill.className = 'rounded-full text-[11px] border bg-surface-card px-3 py-1 flex items-center justify-center transition-all duration-300 pointer-events-auto';
  
  const textNode = document.createTextNode('');
  pill.appendChild(textNode);
  el.appendChild(pill);

  let intervalId: any;

  const update = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const currentMins = h * 60 + m;
    const morningAarti = 7 * 60 + 30;
    const eveningAarti = 18 * 60 + 30;

    let targetMins = morningAarti;
    let targetLabel = '7:30 AM';
    
    if (currentMins >= morningAarti + 30 && currentMins < eveningAarti + 30) {
      targetMins = eveningAarti;
      targetLabel = '6:30 PM';
    } else if (currentMins >= eveningAarti + 30) {
      targetMins = morningAarti + 24 * 60; // Next day
      targetLabel = '7:30 AM';
    }

    const diff = targetMins - currentMins;

    if (diff <= 10 && diff > 0) {
      textNode.textContent = `🪔 Aarti in ${diff} min`;
      pill.className = 'rounded-full text-[11px] border border-theme-gold bg-surface-card px-3 py-1 animate-pulse';
      pill.onclick = null;
    } else if (isAartiTime()) {
      textNode.textContent = '🙏 Aarti time! Switch to devotional';
      pill.className = 'rounded-full text-[11px] border-2 border-theme-gold bg-[#ffeb3b]/10 text-theme-primary px-3 py-1 animate-pulse font-bold cursor-pointer';
      pill.onclick = () => {
        if (onAartiTrigger) onAartiTrigger();
      };
    } else {
      textNode.textContent = `🪔 Next Aarti: ${targetLabel}`;
      pill.className = 'rounded-full text-[11px] border border-theme-subtle bg-surface-card px-3 py-1 text-theme-muted';
      pill.onclick = null;
    }
  };

  update();
  intervalId = setInterval(update, 60000);

  // Store cleanup on element
  (el as any)._cleanupAartiClock = () => clearInterval(intervalId);
}
