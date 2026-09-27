# Product Requirements Document (PRD)
**Project (working title):** GarbaWave — "All the Garba in the world"
**Reference:** playgarba.com (clone-inspired, not a copy of their code/assets)
**Timeline:** 2-day build → launch
**Owner:** Madhur

---

## 1. Problem & Opportunity
Gujarati Garba/Raas/Dandiya music is scattered across YouTube, WhatsApp forwards, and random playlists. There's no single, fast, mobile-first place to just open the site and have Garba playing — browse by genre, search a song, and let a 24/7 stream run in the background. PlayGarba proved the demand pattern: a lean single-purpose music catalogue + player, installable as a PWA, dark themed, YouTube-backed (no hosting cost for audio).

## 2. Goal
Ship a lightweight, installable, mobile-and-desktop Garba music player + catalogue in 2 days that:
- Plays a continuous "24/7 Live" style Garba stream by default.
- Lets users explore/search/filter a song catalogue by genre (Traditional, Dandiya, Devotional, Folk, Sanedo, Fusion, etc.).
- Feels instant — near-zero load time, no login wall, no bloat.

## 3. Target Users
- Gujarati diaspora / Navratri celebrants wanting background Garba music.
- Garba/Raas class instructors and event organizers needing quick genre-sorted playback.
- Casual browsers discovering Garba music who land via search/social.

## 4. Non-Goals (for v1 / 2-day build)
- No user accounts, profiles, or social features.
- No original audio hosting/licensing — audio is streamed via YouTube (their infra, their ToS).
- No native iOS/Android app — PWA install only.
- No admin CMS UI — catalogue managed via a JSON/YAML file or lightweight headless sheet in v1.
- No monetization/ads in v1.

## 5. Key User Stories
1. As a visitor, I land on the homepage and Garba is already loaded (paused, tap-to-play) so I can start listening in one tap.
2. As a visitor, I can browse by genre chips (Traditional, Dandiya, Devotional, Folk, Sanedo, Fusion) to change what plays.
3. As a visitor, I can go to "Explore" and search/filter/sort the full song catalogue (Playable first, Newest, Oldest).
4. As a visitor, I can tap any song in Explore and it starts playing immediately in the persistent bottom player.
5. As a mobile visitor, I can "Install" the site as an app icon on my home screen (PWA).
6. As a returning visitor, the site loads fast even on slow mobile data (lightweight bundle, cached shell).

## 6. Success Metrics (informal, since this is a personal/community project)
- Time-to-first-audio on 4G mobile: **< 2.5s** after tap.
- Lighthouse Performance + PWA score: **> 90**.
- Works fully on a single-hand mobile session (thumb-reachable player controls).
- Zero backend cost at launch (fully static + YouTube for audio).

## 7. Scope for the 2-Day Build
**Day 1:** Data model + catalogue JSON, homepage player shell, genre chips, YouTube playback engine, base responsive layout.
**Day 2:** Explore page (search/filter/sort), PWA manifest + install prompt + service worker shell caching, polish, deploy, smoke test on real devices.

See `02-features.md` for the exact feature cut (MVP vs later).

## 8. Constraints
- 2 days, solo build.
- Must be cheap/free to host (static hosting).
- Must respect YouTube's Terms of Service — playback only via official embed/IFrame API, no stream ripping or re-hosting audio files.
- Content (songs/artists) is community-sourced metadata pointing at existing YouTube videos, not redistributed media.

## 9. Open Questions (flag before/while building)
- Final product name and domain.
- Initial catalogue size and who curates it for launch day (Madhur, manually, via JSON to start).
- Whether "24/7 Live" is a real live YouTube stream or an auto-playing curated queue that *feels* continuous (recommended for v1: curated queue, since a real 24/7 stream needs a licensed broadcast source).
