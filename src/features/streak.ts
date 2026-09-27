// streak.ts — Garba Streak Counter (no state subscription needed)


// ─── Constants & Types ────────────────────────────────────────────────────────

const STORAGE_KEY_COUNT = 'gw-streak-count';
const STORAGE_KEY_DATE = 'gw-last-play-date';
const MAX_STREAK = 9;

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Exported Functions ───────────────────────────────────────────────────────

export function initStreak(): void {
  try {
    const today = getTodayString();
    const lastDate = localStorage.getItem(STORAGE_KEY_DATE);
    
    if (lastDate === today) {
      // Already played today, no change
      return;
    }

    let count = getStreak();
    
    if (lastDate) {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Continuous streak
        count = Math.min(count + 1, MAX_STREAK);
      } else if (diffDays > 1) {
        // Streak broken
        count = 1;
      }
    } else {
      // First play
      count = 1;
    }
    
    localStorage.setItem(STORAGE_KEY_COUNT, count.toString());
    localStorage.setItem(STORAGE_KEY_DATE, today);
  } catch (err) {
    console.error('Failed to init streak:', err);
  }
}

export function getStreak(): number {
  try {
    const countStr = localStorage.getItem(STORAGE_KEY_COUNT);
    return countStr ? parseInt(countStr, 10) : 0;
  } catch {
    return 0;
  }
}

export function mountStreakBadge(el: HTMLElement): void {
  const streak = getStreak();
  if (streak === 0) return;
  
  el.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-theme-primary bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-theme-subtle animate-pulse shadow-[0_0_8px_rgba(255,165,0,0.3)]';
  
  const textNode = document.createElement('span');
  if (streak >= MAX_STREAK) {
    textNode.textContent = '🏆 Full Navratri!';
  } else {
    textNode.textContent = `🔥 ${streak} Night Streak!`;
  }
  
  el.innerHTML = '';
  el.appendChild(textNode);
}
