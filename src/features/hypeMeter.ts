export interface HypeLevelData {
  level: number;
  label: string;
  emoji: string;
}

const HYPE_LEVELS = [
  { max: 0, label: 'Cold', emoji: '❄️' },
  { max: 5, label: 'Warming Up', emoji: '🔥' },
  { max: 15, label: 'Heating Up', emoji: '🔥🔥' },
  { max: 30, label: 'ON FIRE', emoji: '🔥🔥🔥' },
  { max: Infinity, label: 'PEAK CIRCLE!', emoji: '💥' }
];

let reactionTimestamps: number[] = [];
const FIVE_MINUTES_MS = 5 * 60 * 1000;

let hypeChannel: BroadcastChannel | null = null;
let reactionsChannel: BroadcastChannel | null = null;

export function initHypeMeter(): void {
  try {
    hypeChannel = new BroadcastChannel('gw-hype-events');
    hypeChannel.onmessage = (e) => {
      if (e.data === 'reaction') {
        addTimestamp(Date.now());
      }
    };
    
    reactionsChannel = new BroadcastChannel('gw-reactions');
    reactionsChannel.onmessage = (_e) => {
      // Any reaction event on the general channel counts
      addTimestamp(Date.now());
    };

  } catch (err) {
    console.error('BroadcastChannel not supported', err);
  }
  
  // Cleanup old timestamps periodically
  setInterval(() => {
    cleanOldTimestamps();
  }, 10000);
}

function addTimestamp(ts: number) {
  reactionTimestamps.push(ts);
  cleanOldTimestamps();
}

function cleanOldTimestamps() {
  const cutoff = Date.now() - FIVE_MINUTES_MS;
  reactionTimestamps = reactionTimestamps.filter(ts => ts > cutoff);
}

export function recordHypeEvent(): void {
  addTimestamp(Date.now());
  try {
    hypeChannel?.postMessage('reaction');
  } catch (e) {
    // Ignore
  }
}

export function getHypeLevel(): HypeLevelData {
  cleanOldTimestamps();
  const count = reactionTimestamps.length;
  
  let level = 0;
  for (let i = 0; i < HYPE_LEVELS.length; i++) {
    if (count <= HYPE_LEVELS[i].max) {
      level = i;
      break;
    }
  }
  
  return {
    level,
    label: HYPE_LEVELS[level].label,
    emoji: HYPE_LEVELS[level].emoji,
  };
}

export function mountHypeMeter(el: HTMLElement): void {
  const container = document.createElement('div');
  container.className = 'w-full py-2 flex flex-col gap-1';
  
  const labelRow = document.createElement('div');
  labelRow.className = 'flex justify-between items-center text-xs font-bold font-sans';
  
  const titleSpan = document.createElement('span');
  titleSpan.className = 'text-theme-primary';
  
  const countSpan = document.createElement('span');
  countSpan.className = 'text-theme-muted text-[10px]';
  
  labelRow.appendChild(titleSpan);
  labelRow.appendChild(countSpan);
  
  const track = document.createElement('div');
  track.className = 'w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden';
  
  const fill = document.createElement('div');
  fill.className = 'h-full transition-all duration-1000 ease-in-out';
  track.appendChild(fill);
  
  container.appendChild(labelRow);
  container.appendChild(track);
  el.appendChild(container);
  
  function update() {
    const data = getHypeLevel();
    const count = reactionTimestamps.length;
    
    titleSpan.textContent = `${data.emoji} ${data.label}`;
    countSpan.textContent = `${count} reactions / 5m`;
    
    let percent = (count / 35) * 100;
    if (percent > 100) percent = 100;
    
    fill.style.width = `${percent}%`;
    
    if (data.level === 0) fill.style.backgroundColor = '#78909c'; // grey
    else if (data.level === 1) fill.style.backgroundColor = '#29b6f6'; // blue
    else if (data.level === 2) fill.style.backgroundColor = '#ffa726'; // orange
    else if (data.level === 3) fill.style.backgroundColor = '#f44336'; // red
    else fill.style.backgroundColor = '#e91e63'; // pink/peak
  }
  
  update();
  setInterval(update, 10000);
}
