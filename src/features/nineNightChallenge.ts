import { getState } from '../state';

export interface NightStatus {
  night: number;
  completed: boolean;
  minutesDanced: number;
  date: string;
}

const STORAGE_KEY = 'gw-nine-night';

function getStoredData(): NightStatus[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse 9-night challenge data', e);
  }

  // Default to 9 nights
  return Array.from({ length: 9 }, (_, i) => ({
    night: i + 1,
    completed: false,
    minutesDanced: 0,
    date: '',
  }));
}

function saveData(data: NightStatus[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save 9-night challenge data', e);
  }
}

let secondsAccumulated = 0;

export function initNineNightChallenge(): void {
  // Check playing state periodically
  setInterval(() => {


    const { isPlaying } = getState();
    if (isPlaying) {
      secondsAccumulated += 1;
      
      if (secondsAccumulated >= 30) {
        secondsAccumulated = 0;
        incrementPlayTime(0.5); // 30 seconds = 0.5 minutes
      }
    }
  }, 1000);
}

function incrementPlayTime(minutes: number) {
  const data = getStoredData();
  const today = new Date();
  // Simple heuristic for "Navratri night" based on date
  const nightIndex = (today.getDate() % 9) === 0 ? 8 : (today.getDate() % 9) - 1;
  const dateStr = today.toISOString().split('T')[0];
  
  const currentNight = data[nightIndex];
  if (currentNight.date !== dateStr && currentNight.minutesDanced > 0 && !currentNight.completed) {
    // New day, reset if not completed? Or just accumulate? Let's just accumulate for the night index.
    // If it's a completely new date for this night slot, we reset it.
    currentNight.minutesDanced = 0;
  }
  
  currentNight.date = dateStr;
  currentNight.minutesDanced += minutes;
  
  if (currentNight.minutesDanced >= 30 && !currentNight.completed) {
    currentNight.completed = true;
    checkAllCompleted(data);
  }
  
  saveData(data);
}

function checkAllCompleted(data: NightStatus[]) {
  const allComplete = data.every(n => n.completed);
  if (allComplete) {
    // Show celebration if modal is open, or we could trigger it directly.
  }
}

export function getChallengeProgress(): { completed: number; total: 9; nights: NightStatus[] } {
  const nights = getStoredData();
  const completed = nights.filter(n => n.completed).length;
  return { completed, total: 9, nights };
}

export function openChallengeModal(): void {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'bg-surface-card rounded-2xl p-6 w-full max-w-md border border-theme-subtle shadow-2xl relative flex flex-col items-center text-center';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'absolute top-4 right-4 text-theme-muted hover:text-theme-primary';
  closeBtn.textContent = '✕';
  closeBtn.onclick = () => modalOverlay.remove();
  modalContent.appendChild(closeBtn);
  
  const title = document.createElement('h2');
  title.className = 'text-2xl font-display font-bold text-theme-primary mb-1';
  title.textContent = '🏆 9-Night Navratri Challenge';
  
  const subtitle = document.createElement('p');
  subtitle.className = 'text-theme-secondary text-sm mb-6';
  subtitle.textContent = 'Dance 30+ min each of the 9 sacred nights';
  
  const progressData = getChallengeProgress();
  
  const nightsRow = document.createElement('div');
  nightsRow.className = 'flex gap-2 justify-center mb-6 flex-wrap';
  
  const todayNightIndex = (new Date().getDate() % 9) === 0 ? 8 : (new Date().getDate() % 9) - 1;
  
  progressData.nights.forEach((n, idx) => {
    const circle = document.createElement('div');
    circle.className = 'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300';
    
    if (n.completed) {
      circle.className += ' bg-theme-gold text-black';
      circle.textContent = '✓';
    } else if (idx === todayNightIndex) {
      circle.className += ' bg-theme-accent text-white animate-pulse shadow-[0_0_15px_rgba(var(--accent-primary),0.5)]';
      circle.textContent = String(n.night);
    } else {
      circle.className += ' border-2 border-theme-subtle text-theme-muted';
      circle.textContent = String(n.night);
    }
    
    nightsRow.appendChild(circle);
  });
  
  const progressText = document.createElement('p');
  progressText.className = 'font-bold text-lg text-theme-primary mb-6';
  progressText.textContent = `${progressData.completed}/9 nights complete`;
  
  modalContent.appendChild(title);
  modalContent.appendChild(subtitle);
  modalContent.appendChild(nightsRow);
  modalContent.appendChild(progressText);
  
  if (progressData.completed === 9) {
    const badge = document.createElement('div');
    badge.className = 'bg-gradient-to-r from-theme-gold to-yellow-500 text-black font-display font-bold py-2 px-6 rounded-full mb-4 shadow-lg transform scale-110';
    badge.textContent = 'Navratri Champion 🏆';
    
    const shareBtn = document.createElement('button');
    shareBtn.className = 'bg-theme-accent text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 active:scale-95 transition-all w-full';
    shareBtn.textContent = 'Share Achievement';
    shareBtn.onclick = () => {
      const text = 'I completed the 9-Night Navratri Challenge on GarbaWave! 🏆🪔 #GarbaWave #Navratri2024';
      if (navigator.share) {
        navigator.share({ title: 'Navratri Champion', text }).catch(console.error);
      } else {
        navigator.clipboard.writeText(text);
        shareBtn.textContent = 'Copied!';
        setTimeout(() => shareBtn.textContent = 'Share Achievement', 2000);
      }
    };
    
    modalContent.appendChild(badge);
    modalContent.appendChild(shareBtn);
    
    // Confetti effect
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 rounded-sm opacity-80 pointer-events-none';
      const colors = ['#fbc02d', '#388e3c', '#f57c00', '#d32f2f', '#1976d2', '#e91e63'];
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = '100%';
      const tx = (Math.random() - 0.5) * 200;
      const ty = -(Math.random() * 200 + 100);
      confetti.animate([
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ], {
        duration: 1000 + Math.random() * 1000,
        easing: 'ease-out',
        fill: 'forwards'
      });
      modalContent.appendChild(confetti);
    }
  }
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}
