# Features v2 (Post-Launch Roadmap)

These are **not part of the 2-day MVP build**. This file captures everything queued up for v2+ once GarbaWave is live and stable. Nothing here should block or scope-creep the initial launch in `02-features.md`.

Legend: 🟡 Fast-follow (good early v2 candidate) · ⚪ Later (bigger lift / needs more infra)

---

## 1. Live Listener Count 🟡
**What:** Show a real-time count of how many people currently have the site open and are actively playing Garba (e.g., "🔥 214 dancing right now").

**Why it matters:** This is the single most "alive" feature you can add — it turns a solo listening experience into a felt-community one, which is very on-brand for a Navratri/Garba product (the whole point of Garba is dancing *together*).

**⚠️ Architectural note:** This is the **first feature that requires a backend**. Everything in v1 is static + client-side; a live count needs some server-side shared state. Options, cheapest to most capable:
- **Cloudflare Durable Objects** or a tiny **Supabase Realtime** channel — client "checks in" (heartbeat every ~15s while `isPlaying === true`) and subscribes to a broadcast count. Free tier is generous for this scale.
- **Ably / Pusher** presence channels — purpose-built for exactly this ("who's online now"), minimal code, free tier fine for launch scale.
- Avoid rolling your own WebSocket server unless you want to manage infra — defeats the "zero backend cost" advantage from v1.

**Design details to figure out at build time:**
- Count only listeners who are actively *playing* (not just page-open-but-paused) — matches the feature name.
- Debounce/heartbeat so a flaky connection doesn't cause visible flicker in the number.
- Decide whether it's a raw global count or split by genre/room (e.g., "89 in Dandiya, 40 in Aarti mode") — global count is simpler and better for v2.1.
- Graceful fallback: if the realtime service is down, hide the counter rather than showing "0" or an error.

---

## 2. Genuinely Novel to Garba/Navratri (not in the original)

### BPM/Tempo Tagging + Set Builder 🟡
Tag each song with tempo (slow aarti → medium dandiya → peak-energy fusion). Let organizers auto-build a timed setlist that arcs through a night the way a real Garba event does (warm-up → peak → cooldown). The single most useful feature for actual event organizers.

### Navratri Day-Awareness 🟡
Each of the 9 Navratri nights has a traditional color. Show "today's color" and auto-surface songs/playlists themed to that day. Turns the app from "a player" into "something that knows what night it is."

### Lyrics with Transliteration + English Meaning Toggle 🟡
Huge for diaspora kids/non-Gujarati-readers who want to sing along but can't read the script. Gujarati script → Roman transliteration → English gloss, toggle-able.

### Regional Style Tags ⚪
Kutchi, Kathiawadi, Saurashtra, Ahmedabadi styles as a secondary tag beyond genre. Niche but nobody else does this.

### "Aarti Mode" 🟡
A distinct calmer visual theme + playlist for the devotional portion of the evening, auto-suggested at the right point in a set.

---

## 3. Technical/UX Differentiators

### Chromecast/AirPlay Casting ⚪
Lets someone run the app on their phone but throw audio to a hall's speaker system. Genuinely valuable for small event organizers who currently just plug a phone into an aux cable.

### Simple Audio-Reactive Visualizer 🟡
Web Audio API analyser driving a lightweight animated background (color pulses, dandiya-stick motif) synced to the beat. Cheap to build, high perceived polish.

### Resume-the-Night 🟡
localStorage remembers queue position, so reopening mid-event picks up where you left off instead of restarting.

### Offline Emergency Fallback ⚪
Garba grounds often have terrible connectivity. Consider licensing/hosting 2–3 short tracks locally as an offline-safe fallback queue when YouTube can't load, rather than relying on YouTube for 100% of playback.

---

## 4. Community/Growth (bigger lift, later)

### Song Request/Vote-to-Add Form ⚪
Community submits songs, others upvote, top-voted get added to the official catalogue by you. Needs basic moderation + spam protection (see `04-safety-security.md` §5 for the pattern to follow when this ships).

### Shareable "Now Playing" Card ⚪
Generates a small share-card (song + artist + your branding) for WhatsApp status, since that's how this content actually spreads in the target community.

### Artist Support Links 🟡
Link out to the original artist's channel/socials under each song — both goodwill and a soft compliance signal (reinforces that GarbaWave isn't claiming ownership of the music).

---

## Suggested v2 Build Order
A rough priority pass, balancing impact vs. effort:

1. **Live listener count** — highest "wow, this feels alive" impact, moderate effort (one realtime service integration).
2. **Resume-the-night** — trivial effort, real quality-of-life win.
3. **Artist support links** — trivial effort, good for goodwill/compliance.
4. **BPM/tempo tagging + set builder** — high value to organizers, mostly a data-modeling + UI task (no new infra).
5. **Navratri day-awareness** — small, delightful, no new infra (just a date lookup table).
6. **Audio-reactive visualizer** — pure polish, no dependency on anything else.
7. **Aarti mode** — depends on having enough devotional-tagged songs in the catalogue first.
8. **Lyrics/transliteration** — valuable but data-heavy (needs lyrics sourced/verified per song) — budget real time for this.
9. **Regional style tags** — cheap to add once catalogue is bigger; low urgency at small scale.
10. **Casting, offline fallback, request/vote form, share cards** — larger lifts, revisit once the live count + core polish above are shipped and you have real usage data to justify them.
