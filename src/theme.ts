/**
 * theme.ts — Time-of-day theme system for GarbaWave.
 *
 * Automatically shifts the visual mood across the 4 phases of a Navratri day:
 *  - Prabhat (Morning, ~5am–11am): Soft devotional cream & marigold/turmeric
 *  - Din (Afternoon, ~11am–5pm): Warm sandstone & saffron/teal
 *  - Sanj (Evening, ~5pm–9pm): Deep rani magenta & hot pink/gold peak energy
 *  - Raat (Night, ~9pm–5am): Midnight indigo & neon magenta/cyan 24/7 party
 *
 * Supports manual override in localStorage. Re-checks local time every 10 minutes.
 * Spec reference: docs/07-design-theme-spec.md §2
 */

export type TimeTheme = 'prabhat' | 'din' | 'sanj' | 'raat';

export interface ThemeMeta {
  id: TimeTheme;
  name: string;
  gujaratiName: string;
  timeRange: string;
  mood: string;
  icon: string;
  badgeLabel: string;
}

export const THEMES: Record<TimeTheme, ThemeMeta> = {
  prabhat: {
    id: 'prabhat',
    name: 'Prabhat',
    gujaratiName: 'પ્રભાત',
    timeRange: '5:00 AM – 11:00 AM',
    mood: 'Soft, devotional Aarti calm',
    icon: '🌅',
    badgeLabel: 'Aarti Mode',
  },
  din: {
    id: 'din',
    name: 'Din',
    gujaratiName: 'દિન',
    timeRange: '11:00 AM – 5:00 PM',
    mood: 'Warm midday festival prep',
    icon: '☀️',
    badgeLabel: 'Festival Prep',
  },
  sanj: {
    id: 'sanj',
    name: 'Sanj',
    gujaratiName: 'સાંજ',
    timeRange: '5:00 PM – 9:00 PM',
    mood: 'Peak Navratri dancing energy',
    icon: '🪔',
    badgeLabel: 'Peak Energy',
  },
  raat: {
    id: 'raat',
    name: 'Raat',
    gujaratiName: 'રાત',
    timeRange: '9:00 PM – 5:00 AM',
    mood: 'Midnight 24/7 Live Rasleela',
    icon: '🌙',
    badgeLabel: '24/7 Rasleela',
  },
};

const STORAGE_KEY = 'garbawave_theme_override';
const THEME_ORDER: TimeTheme[] = ['prabhat', 'din', 'sanj', 'raat'];

type ThemeListener = (current: TimeTheme, override: TimeTheme | 'auto') => void;
const listeners = new Set<ThemeListener>();

/** Compute theme from local device hour. */
export function getAutoTheme(): TimeTheme {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'prabhat';
  if (hour >= 11 && hour < 17) return 'din';
  if (hour >= 17 && hour < 21) return 'sanj';
  return 'raat';
}

/** Get user's manual override from localStorage, or 'auto'. */
export function getThemeOverride(): TimeTheme | 'auto' {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val && (val === 'auto' || val in THEMES)) {
      return val as TimeTheme | 'auto';
    }
  } catch {
    // localStorage not accessible
  }
  return 'auto';
}

/** Get the currently effective theme (override if set, else auto). */
export function getEffectiveTheme(): TimeTheme {
  const override = getThemeOverride();
  if (override !== 'auto' && override in THEMES) {
    return override;
  }
  return getAutoTheme();
}

/** Set or clear manual override. */
export function setThemeOverride(theme: TimeTheme | 'auto'): void {
  try {
    if (theme === 'auto') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  } catch {
    // Ignore storage write errors
  }
  applyTheme();
}

/** Cycle to next theme in loop: Auto -> Prabhat -> Din -> Sanj -> Raat -> Auto */
export function cycleTheme(): TimeTheme | 'auto' {
  const current = getThemeOverride();
  let next: TimeTheme | 'auto';
  if (current === 'auto') {
    next = 'prabhat';
  } else {
    const idx = THEME_ORDER.indexOf(current);
    if (idx === -1 || idx === THEME_ORDER.length - 1) {
      next = 'auto';
    } else {
      next = THEME_ORDER[idx + 1];
    }
  }
  setThemeOverride(next);
  return next;
}

/** Subscribe to theme changes. */
export function subscribeTheme(cb: ThemeListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Apply the effective theme to documentElement with data-time-theme attribute. */
export function applyTheme(): void {
  const effective = getEffectiveTheme();
  const override = getThemeOverride();
  document.documentElement.setAttribute('data-time-theme', effective);
  listeners.forEach((fn) => fn(effective, override));
}

/**
 * Initialize theme system on page load:
 *  - Applies theme immediately
 *  - Sets up 10-minute periodic check
 */
export function initThemeSystem(): void {
  applyTheme();

  // Re-check every 10 minutes (600,000 ms) in case of time window transition
  setInterval(() => {
    // Only re-apply if auto mode is active
    if (getThemeOverride() === 'auto') {
      applyTheme();
    }
  }, 10 * 60 * 1000);
}

/**
 * Mount the sun/moon/diya theme toggle button into a container.
 */
export function mountThemeToggle(container: HTMLElement): HTMLElement {
  const btn = document.createElement('button');
  btn.id = 'theme-toggle-btn';
  btn.type = 'button';
  btn.className = [
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium',
    'bg-surface-card hover:bg-surface-elevated text-theme-primary',
    'border border-theme-subtle shadow-sm',
    'transition-all duration-200 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-theme-accent',
  ].join(' ');

  const iconSpan = document.createElement('span');
  iconSpan.className = 'text-sm select-none';
  iconSpan.setAttribute('aria-hidden', 'true');

  const textSpan = document.createElement('span');
  textSpan.className = 'font-sans font-medium text-xs hidden sm:inline select-none';

  const modeBadge = document.createElement('span');
  modeBadge.className = 'text-[9px] px-1 rounded uppercase tracking-wider text-theme-muted opacity-80';

  btn.appendChild(iconSpan);
  btn.appendChild(textSpan);
  btn.appendChild(modeBadge);

  function updateButton(effective: TimeTheme, override: TimeTheme | 'auto') {
    const meta = THEMES[effective];
    iconSpan.textContent = meta.icon;
    textSpan.textContent = meta.name;
    modeBadge.textContent = override === 'auto' ? 'Auto' : 'Lock';
    btn.setAttribute(
      'aria-label',
      `Current theme: ${meta.name} (${override === 'auto' ? 'Auto Time' : 'Manual Lock'}). Click to switch mood.`,
    );
    btn.title = `${meta.name} (${meta.gujaratiName}): ${meta.mood} [Click to change]`;
  }

  updateButton(getEffectiveTheme(), getThemeOverride());
  subscribeTheme(updateButton);

  btn.addEventListener('click', () => {
    cycleTheme();
  });

  container.appendChild(btn);
  return btn;
}
