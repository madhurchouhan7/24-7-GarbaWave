# Architecture & Methodology

## 1. High-Level Architecture
```
┌─────────────────────────────────────────────────────┐
│                     Browser (client)                  │
│                                                         │
│  ┌───────────┐   ┌───────────────┐   ┌──────────────┐ │
│  │ Home page │   │ Explore page  │   │ Service       │ │
│  │ (player + │   │ (search/sort/ │   │ Worker        │ │
│  │  chips)   │   │  full list)   │   │ (shell cache) │ │
│  └─────┬─────┘   └───────┬───────┘   └──────────────┘ │
│        │                 │                             │
│        └────────┬────────┘                             │
│                  ▼                                     │
│        ┌───────────────────┐                           │
│        │  Shared player     │  (state.ts: currentTrack, │
│        │  state (pub/sub)   │   queue, isPlaying)       │
│        └─────────┬─────────┘                           │
│                  ▼                                     │
│        ┌───────────────────┐        ┌─────────────────┐│
│        │  YouTube IFrame   │◄──────►│ catalogue.json  ││
│        │  Player API       │        │ (static data)   ││
│        │  wrapper          │        └─────────────────┘│
│        └─────────┬─────────┘                           │
└──────────────────┼──────────────────────────────────────┘
                    ▼
          ┌───────────────────┐
          │  YouTube (audio/   │   ← external, not our infra
          │  video streaming)  │
          └───────────────────┘

         Hosting: static files served from
         Vercel / Netlify / Cloudflare Pages CDN
```

There is **no application backend** in v1. The only "server" involved is the static host's CDN and YouTube's own infrastructure for media playback. This is the core architectural decision that makes a 2-day build realistic.

## 2. Core Modules & Responsibilities
| Module | Responsibility |
|---|---|
| `catalogue.ts` | Load `catalogue.json` once at startup; expose `search(query)`, `filterByGenre(genre)`, `sort(mode)`. Pure functions over an in-memory array — no network calls after initial load. |
| `player.ts` | Thin wrapper around the YouTube IFrame Player API: `load(youtubeId)`, `play()`, `pause()`, `seek(seconds)`, emits `onProgress`, `onEnded`, `onError` events. Nothing else in the app talks to YouTube's API directly. |
| `state.ts` | Single shared object `{ currentTrack, queue, queueIndex, isPlaying, progress }` + a tiny publish/subscribe so the player bar, chip bar, and Explore list can all react to changes without a full framework. |
| `ui/*` | Renders DOM from state; dispatches user actions (tap song → `state.setQueue([...]); player.load(...)`). |
| `service-worker.js` | Caches only the static app shell (HTML/CSS/JS/icons/manifest) using a cache-first strategy; never intercepts YouTube requests. |

## 3. Data Flow (example: user taps a song in Explore)
1. User taps a row → UI calls `state.playTrack(song)`.
2. `state.ts` updates `currentTrack`/`queue` and publishes a change event.
3. `player.ts` subscriber receives the event, calls the YouTube IFrame API to load and play that `youtubeId`.
4. Player bar UI (subscribed to the same state) re-renders title/artist/progress bar.
5. `onEnded` from the player fires → `state.ts` advances `queueIndex` → step 2 repeats automatically (this is what makes the "24/7 Live" feel continuous).

## 4. Responsive Strategy
- **Mobile-first CSS.** Base styles target a single-column, thumb-reachable layout (~360–430px width); the sticky player bar sits at the bottom within safe-area insets.
- **Breakpoints** (Tailwind defaults are fine): `sm` unchanged from mobile, `md` (~768px) introduces a 2-column Explore grid, `lg`/`xl` (~1024px+) introduces a persistent sidebar (genre chips as a vertical list) + wider now-playing panel, closer to a desktop "app" feel.
- **One codebase, one CSS file** — no separate mobile/desktop templates; everything is responsive via CSS, keeping the bundle small and avoiding logic duplication.

## 5. Build Methodology (2-Day Plan)

### Day 1 — Core experience
1. Scaffold Vite project, Tailwind, base HTML shell (home + explore as two static entry pages).
2. Define `catalogue.json` schema and seed with an initial hand-picked song list (even 30–50 songs is enough for launch).
3. Build `player.ts` (YouTube IFrame API wrapper) and wire up the home page: default track loads, play/pause works, progress bar updates.
4. Build genre chip bar → filters the active queue and starts playback on tap.
5. Responsive pass on the home page (mobile first, then verify desktop).
6. **Checkpoint:** by end of Day 1, the home page alone should be demoable — Garba plays, genres switch what plays.

### Day 2 — Catalogue, installability, polish, ship
1. Build Explore page: render full catalogue, wire search box (debounced input → `catalogue.search()`), sort dropdown.
2. Tapping a song in Explore hands off to the same shared player state → confirms the "one player, two entry points" architecture works.
3. Add `manifest.webmanifest`, icons, and the install button/prompt handling (`beforeinstallprompt` + iOS instructional fallback).
4. Add minimal service worker for shell caching; verify a second load is near-instant.
5. Cross-device smoke test: one real Android phone, one iPhone (Safari PWA install differs), one desktop browser.
6. Set up hosting project (Vercel/Netlify/Cloudflare Pages), connect custom domain, deploy.
7. Run Lighthouse; fix any easy wins (image sizes, unused CSS, missing alt text).
8. Ship. Keep the safety/security pre-launch checklist (`04-safety-security.md`) as the final gate before going live.

## 6. Why This Architecture Fits a 2-Day Timeline
- No backend to build, deploy, secure, or pay for.
- No database migrations or ORM setup.
- No auth flow to implement.
- Catalogue changes are a JSON edit + redeploy — no admin UI needed at launch.
- YouTube absorbs all media bandwidth/storage cost and complexity (transcoding, CDN, DRM concerns are all theirs).
- The entire "hard problem" is reduced to: one shared player state object, one thin API wrapper, and responsive CSS — all things a solo developer can realistically finish in two focused days.
