# Design & Theme Specification — "Heavy Navratri, Time-Aware"

This supersedes the plain/minimal visual direction implied in earlier docs. The brief: the site should *look and feel* like Navratri — not a generic dark music app that happens to play Garba — and it should visually shift across the day the way an actual Navratri day does (quiet morning → build-up afternoon → peak-energy evening/night dancing).

This file is a spec for whoever implements it (Claude Code). It does not require new heavy assets — everything below is achievable with CSS, SVG, and a handful of small icon/pattern files, keeping the "lightweight" requirement from `03-tech-stack.md` intact.

---

## 1. Design Philosophy
- **Maximalist-but-fast.** Navratri visual language is rich: mirror-work (abhla), bandhani tie-dye dots, mandala/rangoli patterns, vibrant chaniya-choli colors, diya flames, dandiya sticks, peacock motifs. The current site is too flat/generic-dark-music-app. Lean into pattern, color, and motion — but implement it all in CSS/SVG so it stays light (no big raster textures).
- **Time is a first-class design input.** The site should never look "the same" twice in a day. Someone opening it at 7am vs. 9pm should feel a clearly different mood, matching how an actual Navratri day unfolds.
- **Still mobile-first and thumb-friendly.** More visual richness must not come at the cost of the responsive/lightweight goals in `03-tech-stack.md` — richness lives in color/pattern/motion, not in bloated asset weight.

## 2. Time-of-Day Theme System

Four themes, switched automatically by local device time, with a manual override toggle (sun/moon icon in header) for people who want a specific mood regardless of clock time.

| Theme | Time Window | Mood | Base Palette | Motif Emphasis |
|---|---|---|---|---|
| **Prabhat (Morning)** | ~5am–11am | Soft, devotional, calm — aligns with "Aarti mode" energy | Warm ivory/cream background, soft marigold-orange and turmeric-yellow accents, muted maroon text | Diya flame glow, soft rangoli line-art borders (thin, low-opacity), gentle upward particle drift |
| **Din (Afternoon)** | ~11am–5pm | Bright, build-up energy, prep-for-the-night feel | Warm sandstone/cream base, saffron + teal accent pair, brighter contrast than morning | Bandhani dot patterns as subtle background texture, sun-motif accents |
| **Sanj (Evening)** | ~5pm–9pm | Peak Garba energy — the "event is happening now" feeling | Deep magenta/maroon base transitioning to indigo, hot pink + gold accents, high saturation | Mirror-work (abhla) sparkle dots animated with a subtle twinkle, dandiya-stick crossed icon motif, mandala rotating slowly behind hero |
| **Raat (Night)** | ~9pm–5am | Deep, moody, "24/7 live" continuous-party feel | Near-black indigo/navy base, neon pink/purple/gold accents, high contrast for readability in dark rooms | Peacock-feather-inspired accent curves, glowing/pulsing genre chips synced loosely to playback, starfield particle background |

**Implementation approach:**
- Define each theme as a CSS custom-property set on `<html data-time-theme="...">` (e.g. `--bg, --bg-elevated, --text, --accent-primary, --accent-secondary, --motif-opacity`).
- A tiny `theme.ts` module computes the theme from `new Date().getHours()`, sets the `data-time-theme` attribute on load and re-checks every ~10 minutes (in case a session spans a boundary), and exposes a manual override stored in `localStorage`.
- Transition between themes with a CSS transition on `background`/`color` (not a hard cut) so if someone has the tab open across a boundary it fades rather than snaps.

## 3. Visual Motif Library (all CSS/SVG, no heavy images)
- **Mandala/rangoli border** — a repeating inline SVG pattern used sparingly as a top-of-hero or section-divider accent, opacity varies by theme (barely-there in Prabhat, vivid in Sanj/Raat).
- **Abhla (mirror-work) sparkle dots** — small circular SVG "mirror" dots with a subtle CSS `box-shadow`/gradient to fake a glint; scattered as a background layer behind the hero player, animated with a slow staggered opacity pulse (cheap on CPU, high visual payoff).
- **Bandhani dot texture** — a small repeating SVG/CSS radial-gradient pattern used as a subtle background fill on cards (genre chips, song rows) instead of flat color — keeps texture without images.
- **Dandiya sticks (crossed)** — a simple two-line SVG icon used as: the play/pause icon replacement, a section divider, or a loading-state spinner (two sticks "clacking" — a small rotate animation).
- **Diya flame** — a small animated SVG flame (flicker via CSS keyframes) used near the Prabhat/Aarti-mode player state, and as a subtle "currently playing" indicator glow.
- **Peacock feather curve** — a single decorative SVG accent (not a full feather illustration — just the eye/curve motif) used as a corner flourish in Raat theme headers.

**Rule of thumb:** every motif above must be inline SVG or pure CSS — zero new raster image weight added to the bundle.

## 4. Typography
- **Display/heading font:** something with visual character reminiscent of festival signage — e.g. a rounded-ethnic or slightly decorative Google Font (evaluate `Baloo 2`, `Rajdhani`, or `Yatra One` for a Gujarati-festival-poster feel) — used only for the site name, hero song title, and section headers.
- **Body/UI font:** a clean, highly legible sans (`Inter`, `Poppins`, or system font stack) for song lists, search, and anything read at speed — richness lives in color/motif, not in illegible body text.
- Keep to 2 font families total (1 Google Font + 1 system/CDN sans) to protect load performance — matches the CSP-approved font host already defined in `04-safety-security.md`.

## 5. Layout/Component Direction
- **Hero (Home) section:** the current flat player bar becomes a fuller "stage" — animated mandala/rangoli backdrop behind the album-art-equivalent (use YouTube thumbnail if available, or a generated motif card if not), theme-colored glow behind the play button.
- **Genre chips:** restyle from plain pill buttons to look like small bandhani-patterned patches/badges; active chip gets a mirror-sparkle highlight animation on tap (ties into "chip tap ripple like a garba clap" — a quick radiating ring animation on click, themed per time-of-day accent color).
- **Player bar:** progress bar rendered as a stylized "dandiya stick" fill instead of a generic flat bar (two thin stick-shapes at each end, fill animates between them).
- **Explore/song rows:** each row gets a thin left-edge accent in the theme's accent color, replacing flat gray rows; a subtle mirror-dot appears next to "Playable" songs instead of a plain badge.
- **Header:** sun/moon manual theme-override toggle sits next to the (future) Install button.

## 6. Motion Principles
- Motion should feel like **dance, not decoration** — favor rhythmic, slightly bouncy easing (`cubic-bezier` with slight overshoot) over linear/ease-in-out, to evoke garba's circular, rhythmic movement.
- Respect `prefers-reduced-motion` — every animation above (sparkle pulse, chip ripple, mandala rotation, flame flicker) must have a static fallback for that media query, per accessibility basics.
- Keep animations CSS-driven (transform/opacity only) — no JS-driven layout animation — to protect the performance budget from `03-tech-stack.md`.

## 7. Explicit Non-Goals (don't over-scope this)
- No new raster images/photos — the "heavy" feeling comes from color, pattern density, and motion, not photographic assets.
- No separate visual codebase per theme — all four themes share one component set, differing only via CSS custom properties.
- No blocking the manual theme toggle behind login/settings — it's a simple header button.

## 8. Acceptance Checklist for This Redesign
- [ ] Loading the site at four different times of day (or via manual override) produces visibly distinct palettes/motifs, not just an accent-color swap.
- [ ] All motifs are inline SVG/CSS — `npm run build` bundle size does not meaningfully increase from image assets.
- [ ] Lighthouse Performance score stays ≥ 85 despite the added visual richness (down from the ≥90 target in `01-PRD.md` only if truly necessary — push back if it drops further).
- [ ] `prefers-reduced-motion` respected across every new animation.
- [ ] Genre chips, player bar, and song rows all visibly read as "Navratri-themed," not generic dark-music-app styling.
