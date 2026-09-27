# Features Specification

Legend: 🟢 MVP (must ship in 2 days) · 🟡 Fast-follow (add if time remains day 2) · ⚪ Later (post-launch)

## 1. Player (Home)
- 🟢 Persistent bottom/sticky player bar with: play/pause, current song title, artist, progress bar with elapsed/duration.
- 🟢 Auto-loads a default "featured/live" track on landing (paused; one tap to start — autoplay-with-sound is blocked by browsers anyway).
- 🟢 "24/7 Live" badge presented as an auto-advancing curated queue (loops through a hand-picked playlist) — reads as continuous Garba.
- 🟢 Genre chip bar (Traditional · Dandiya · Devotional · Folk · Sanedo · Fusion …) — tapping a chip filters the active queue to that genre and starts playing the first track.
- 🟡 Next/Previous track controls.
- 🟡 Volume control (desktop) / mute toggle (mobile).
- ⚪ "Now Playing" swipeable queue view.
- ⚪ Background/lockscreen media controls via the Media Session API (artist/title/artwork on phone lock screen).
- ⚪ "Current Listners" view.

## 2. Explore / Catalogue
- 🟢 Full song list rendered from the catalogue data file.
- 🟢 Search box — instant client-side filter by title/artist/genre as you type.
- 🟢 Sort control: Playable first · Newest · Oldest.
- 🟢 Tapping a song row loads it into the persistent player and starts playback.
- 🟡 Genre filter chips duplicated on Explore (in addition to search).
- 🟡 "Playable" badge/indicator per song (i.e., the linked YouTube video is currently embeddable/available).
- ⚪ Pagination or virtualized list once catalogue exceeds ~300 songs (infinite scroll or "load more").
- ⚪ Related/similar songs on a song detail view.

## 3. Installability (PWA)
- 🟢 Web app manifest (name, short_name, icons, theme_color, display: standalone).
- 🟢 "Install" prompt/button surfaced in the UI (using the `beforeinstallprompt` event on supporting browsers; iOS gets an "Add to Home Screen" instructional hint since iOS doesn't fire that event).
- 🟢 App icons for standard sizes + Apple touch icon + browser config for Windows tiles.
- 🟡 Service worker caching the app shell (HTML/CSS/JS/icons) for instant repeat loads — **not** caching YouTube audio/video (that stays live-streamed, per YouTube ToS).
- ⚪ Offline "no connection" friendly state for the shell (catalogue browsing works offline from cache; playback requires connection).

## 4. Playback Engine (technical, cross-cutting)
- 🟢 YouTube IFrame Player API integration — video visually hidden (or minimized to a tiny artwork thumbnail), audio audible, controlled entirely by our custom UI.
- 🟢 Graceful handling of unavailable/region-blocked/removed videos (auto-skip to next track + non-blocking toast).
- 🟡 Preload/prime the next track's player instance to reduce transition gap.
- ⚪ Fallback provider (e.g., a second YouTube video ID) per song for resilience.

## 5. Visual / Brand
- 🟢 Dark theme by default (matches genre/mood; also cheapest on OLED battery).
- 🟢 Fully responsive: single-column mobile-first layout, expands to a 2–3 column catalogue grid + wider now-playing panel on tablet/desktop.
- 🟢 Lightweight iconography/typography — no heavy image carousels.
- 🟡 Subtle themed accents (e.g., a soft dandiya-stick or diya motif in the empty/loading states) — kept as inline SVG, not raster images, to stay lightweight.
- ⚪ Per-genre color accents.

## 6. Content/Data Management
- 🟢 Single structured catalogue file (`catalogue.json`) with fields: `id, title, artist, genre[], youtubeId, releaseDate, tags[], durationSeconds (optional), playable (bool)`.
- 🟡 Simple validation script (`npm run validate-catalogue`) that checks required fields and flags duplicate `youtubeId`s.
- ⚪ Move catalogue to a headless source (Google Sheet via API, or a tiny CMS) once the community starts contributing.

## 7. Explicitly Out of Scope for v1
- Accounts, login, likes/favorites persistence, comments, uploads by end users, ads, payments, native apps, server-side rendering with a database, real licensed 24/7 broadcast stream.
