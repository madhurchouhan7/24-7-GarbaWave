// ─── Core domain types ───────────────────────────────────────────────────────

export type Genre =
  | 'Traditional'
  | 'Dandiya'
  | 'Devotional'
  | 'Folk'
  | 'Sanedo'
  | 'Fusion';

export type TempoCategory = 'slow' | 'medium' | 'fast' | 'peak';

export type RegionalStyle =
  | 'Kathiawadi'
  | 'Kutchi'
  | 'Ahmedabadi'
  | 'Saurashtra'
  | 'Fusion';

export interface LyricsData {
  gujarati: string[];
  englishPhonetic: string[];
  meaning: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: Genre[];
  youtubeId: string;
  releaseDate: string;       // ISO date string "YYYY-MM-DD"
  tags: string[];
  durationSeconds?: number;
  playable: boolean;
  bpm?: number;
  tempo?: TempoCategory;
  regionalStyle?: RegionalStyle;
  artistUrl?: string;
  lyrics?: LyricsData;
}

export type SortMode = 'playable-first' | 'newest' | 'oldest' | 'bpm-asc' | 'bpm-desc';

// ─── Player state types ───────────────────────────────────────────────────────

export interface PlayerState {
  currentTrack: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  progress: number;          // 0–1 fraction
  durationSeconds: number;   // current track duration in seconds
}

// ─── Navratri Day Types (Features v2) ─────────────────────────────────────────

export interface NavratriDayInfo {
  dayNumber: number;
  title: string;
  goddess: string;
  colorName: string;
  colorHex: string;
  significance: string;
  recommendedGenres: Genre[];
}

// ─── Setlist Arc Types (Features v2) ──────────────────────────────────────────

export interface SetlistPhase {
  name: string;
  bpmRange: string;
  description: string;
  songs: Song[];
}
