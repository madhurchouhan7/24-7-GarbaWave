# Tech Stack

Chosen for a **2-day solo build**, **lightweight** output, and **zero/near-zero hosting cost**. Every choice below optimizes for "ship fast, stay small" over "maximally scalable."

## Frontend
| Layer | Choice | Why |
|---|---|---|
| Framework | **Vite + vanilla TypeScript** (or Vite + Preact if you want componentization) | No SSR complexity, no framework tax, sub-second dev rebuilds, tiny production bundle. React/Next is overkill for a catalogue + player in 2 days. |
| Styling | **Tailwind CSS (CDN or Vite plugin)** | Utility classes = fast responsive layout without hand-rolling breakpoints; purge unused CSS at build time keeps CSS tiny. |
| State | Plain module-level JS state + a tiny pub/sub (no Redux/Zustand needed at this scale) | One shared "player state" object (currentTrack, queue, isPlaying) read by the player bar, genre chips, and Explore list. |
| Icons | Inline SVG (hand-picked minimal set) or `lucide` static SVGs | Avoids icon-font weight and extra HTTP requests. |
| Search/Filter | Plain `Array.prototype.filter` over the in-memory catalogue JSON | Catalogue is small (hundreds, not millions, of rows) — no need for a search index/service like Algolia at v1. |

## Audio/Video Playback
| Layer | Choice | Why |
|---|---|---|
| Source | **YouTube IFrame Player API** | Free, legal, no storage/bandwidth cost for audio; matches how PlayGarba itself streams ("Streaming via YouTube"). |
| Presentation | IFrame rendered at minimal/hidden size (e.g., 1×1 or behind an artwork placeholder), custom-built play/pause/seek UI on top calling the IFrame API's `playVideo()/pauseVideo()/seekTo()` | Keeps the visual brand consistent instead of showing YouTube's native chrome. |
| Lockscreen controls | Media Session API (`navigator.mediaSession`) | Free, native-feeling background control on mobile without any extra dependency. |

## Data / Catalogue
| Layer | Choice | Why |
|---|---|---|
| v1 storage | Static `catalogue.json` committed to the repo | No database needed for a read-only, hand-curated list at launch. |
| Later ("later" file, not v1) | Google Sheet (via published CSV/JSON endpoint) or a headless CMS (e.g., a simple Cloudflare KV + small edit form) | Only once non-technical contributors need to add songs. |

## PWA / Installability
- Web App Manifest (`manifest.webmanifest`) — name, icons, theme colors, `display: "standalone"`.
- Minimal Service Worker (Workbox or hand-written) — caches the app shell (HTML/CSS/JS/icons) only. Deliberately **does not** cache YouTube media (keeps you compliant with YouTube's ToS and avoids massive cache sizes).
- Icon set generated once (e.g., via `pwa-asset-generator` or a manual export) for iOS/Android/Windows tile sizes.

## Build & Tooling
- **Vite** for dev server + production bundling (esbuild-based → very fast builds, well under any 2-day time budget).
- **TypeScript** (optional but recommended even for a 2-day build — catches catalogue schema typos before they become runtime bugs).
- **ESLint + Prettier** minimal config — not a blocker, just consistency.

## Hosting / Deployment
| Layer | Choice | Why |
|---|---|---|
| Host | **Vercel**, **Netlify**, or **Cloudflare Pages** (pick one; all three are free-tier friendly and deploy static Vite output in minutes) | Push-to-deploy from Git, free HTTPS + CDN, custom domain support, zero server to manage. |
| Domain | Any registrar → point to host via CNAME/A record | Matches the "host in 2 days" goal — DNS propagation is the main non-code time risk, so set this up on Day 1, not Day 2. |
| Analytics (optional, lightweight) | Plausible or Cloudflare Web Analytics | Privacy-friendly, no cookie banner needed, tiny script. Skip entirely if time-constrained. |

## Explicitly Avoided (for v1)
- Any backend server/API framework (Express/Django/etc.) — not needed for a static catalogue + client-side player.
- Any database (Postgres/Mongo/Firebase) — JSON file is enough at launch scale.
- Any heavy UI framework (Next.js, Angular, full React + router + state library stack) — adds build complexity disproportionate to a 2-day timeline.
- Self-hosted audio/video files — cost, storage, and licensing risk; YouTube already solves this.

## Suggested Repo Structure
```
/
├─ index.html
├─ explore/
│  └─ index.html
├─ src/
│  ├─ main.ts
│  ├─ player.ts        (YouTube IFrame API wrapper)
│  ├─ catalogue.ts      (load + search/filter/sort logic)
│  ├─ state.ts          (shared player state + pub/sub)
│  └─ ui/               (chip bar, player bar, song list components)
├─ data/
│  └─ catalogue.json
├─ public/
│  ├─ manifest.webmanifest
│  ├─ service-worker.js
│  └─ icons/
├─ 01-PRD.md
├─ 02-features.md
├─ 03-tech-stack.md
├─ 04-safety-security.md
├─ 05-architecture-methodology.md
└─ README.md
```
