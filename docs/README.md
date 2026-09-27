# GarbaWave

> All the Garba in the world — a lightweight, installable Gujarati Garba/Raas/Dandiya music catalogue and player.

Inspired by [playgarba.com](https://playgarba.com)'s product pattern (24/7-feeling Garba playback + a searchable genre-tagged catalogue, installable as a PWA), built independently as a lean, static, YouTube-backed web app.

## What This Is
A single-page-feeling site with two views:
- **Home** — a persistent music player, a default "24/7 Live"-style Garba queue, and genre chips (Traditional, Dandiya, Devotional, Folk, Sanedo, Fusion, …) to change what's playing.
- **Explore** — the full song catalogue, searchable and sortable (Playable first / Newest / Oldest), where tapping any song starts it in the same persistent player.

Installable to a phone home screen or desktop as a PWA. No accounts, no backend, no ads — just fast Garba.

## Docs in This Project
| File | Purpose |
|---|---|
| `01-PRD.md` | Product Requirements — problem, goals, user stories, scope, timeline. |
| `02-features.md` | Full feature list, split into MVP / fast-follow / later. |
| `03-tech-stack.md` | Exact tech choices and why, plus suggested repo structure. |
| `04-safety-security.md` | Legal/content compliance (YouTube ToS), web security basics, privacy, pre-launch checklist. |
| `05-architecture-methodology.md` | System architecture diagram, module responsibilities, data flow, and the day-by-day 2-day build plan. |

Read them in that order if you're new to the project — PRD → features → tech stack → architecture → security — then use `05` as your literal day-by-day build checklist.

## Quick Start (once code exists)
```bash
npm install
npm run dev        # local dev server (Vite)
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

Catalogue lives at `data/catalogue.json`. Add a song by adding an object:
```json
{
  "id": "unique-slug",
  "title": "Song Title",
  "artist": "Artist Name",
  "genre": ["Dandiya"],
  "youtubeId": "XXXXXXXXXXX",
  "releaseDate": "2026-09-01",
  "tags": ["nonstop", "live"],
  "playable": true
}
```

## Deployment
Push to your connected Git repo → auto-deploys via Vercel/Netlify/Cloudflare Pages (pick one; see `03-tech-stack.md`). Point your domain's DNS at the host, confirm HTTPS, done.

## Content & Legal Note
This project only streams music via YouTube's official embed/IFrame API — it does not host, rip, or redistribute any audio/video files. See `04-safety-security.md` for the full compliance checklist before every deploy. If you're a rights holder and want a track removed, use the "Report a track" link in the site footer.

## Status
🚧 Pre-build — this repo currently contains planning docs only. See `05-architecture-methodology.md` §5 for the Day 1 / Day 2 build plan.

## License
Choose a license for your code (e.g., MIT) before making the repo public. Song metadata (titles/artists/YouTube links) is factual catalogue information, not redistributed media — the underlying songs remain the property of their respective rights holders.
