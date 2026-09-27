# Safety & Security

Scope note: v1 is a static, read-only, no-login site, so the attack surface is intentionally small. This document covers what still matters at that scale, plus what to add if the project grows (accounts, contributions, etc.).

## 1. Legal / Content Compliance (the biggest real risk here)
- **Do not re-host or rip audio/video.** Play everything strictly through YouTube's official IFrame Player API/embeds. Never scrape or proxy YouTube's media streams — that violates YouTube's Terms of Service and can get the project's domain/API access blocked, or invite a takedown.
- **Respect embedding restrictions.** Some videos disable embedding or are region-locked; detect playback errors from the IFrame API (`onError` event) and skip gracefully rather than trying to work around the restriction.
- **Attribution.** Show artist/uploader name pulled from your catalogue metadata for every track; don't imply original ownership of the music.
- **Takedown path.** Add a simple "Report a track" mailto/contact link so a rights holder can ask for a song to be removed from the catalogue quickly. Since PlayGarba is community-built, plan for this from day one even if the process is just "email Madhur."
- **Trademarks/branding.** Don't copy PlayGarba's exact name, logo, or copy verbatim — this should be an inspired, distinct product (their site's design/branding is their IP).

## 2. Web/App Security Basics
- **HTTPS everywhere** — default on Vercel/Netlify/Cloudflare Pages; don't disable it.
- **Content Security Policy (CSP)** header restricting script/frame sources to `self`, `https://www.youtube.com`, and `https://www.youtube-nocookie.com` (prefer the nocookie domain for embeds — reduces third-party tracking exposure for your users too).
- **No inline `eval`/unsanitized `innerHTML`** — when rendering search results or song titles from `catalogue.json`, use safe DOM APIs (`textContent`, or a templating approach that escapes by default) to avoid any stored-XSS risk if catalogue data ever becomes user-contributed.
- **Subresource Integrity (SRI)** on any third-party script/CSS you load from a CDN (e.g., Tailwind CDN build, if used) to prevent tampering if that CDN is ever compromised.
- **Dependency hygiene** — even a small `package.json` should get `npm audit` before deploy; keep the dependency count minimal (this is also a performance win, see tech stack).

## 3. Privacy
- **No accounts = no passwords to leak.** Simplest way to avoid a whole class of breach risk in v1.
- **Minimal/no cookies.** A static catalogue + player needs no session cookies; if you add analytics, prefer a cookie-less option (Plausible/Cloudflare Web Analytics) so you don't need a cookie consent banner.
- **No PII collection** in v1 (no forms beyond an optional "report a track" mailto link, which sends via the user's own mail client, not your server).

## 4. Availability / Resilience
- **Static hosting = high uptime by default** (CDN-backed, no server to crash).
- **Graceful degradation** if YouTube itself is slow/unreachable in a user's network: show a clear "playback unavailable, try again" state instead of a silent freeze.
- **Rate-limit nothing yet** — there's no write endpoint in v1, so there's nothing to abuse. Revisit if/when a contribution form or API is added.

## 5. Future-Proofing (only relevant once you go beyond v1 scope)
- If you ever add a contribution form (community-submitted songs): validate/sanitize all input server-side, moderate before publishing, rate-limit submissions per IP, and never accept raw HTML.
- If you ever add accounts: use a managed auth provider (e.g., Clerk/Auth0/Supabase Auth) rather than hand-rolling password storage; hash nothing yourself.
- If you ever add a backend API: put it behind HTTPS, validate all inputs, and add basic rate limiting (e.g., Cloudflare's built-in protections) before it's publicly reachable.

## 6. Pre-Launch Checklist
- [ ] All playback goes through the official YouTube IFrame API — no stream extraction.
- [ ] CSP header set and tested (embeds still play with it on).
- [ ] "Report a track" contact path visible in the UI footer.
- [ ] No catalogue data escaped incorrectly in the DOM (quick manual XSS smoke test with a song title containing `<script>`-like characters in a local test entry, then remove it).
- [ ] `npm audit` clean (or documented exceptions) before deploy.
- [ ] HTTPS confirmed on the final custom domain.
