# The Wrong Door Club

A blazing-fast one-page site that lets visitors run a solo micro-adventure in CDMX, then funnels them to in-person meetups. Built with Vite + React + TypeScript, Tailwind, framer-motion, and a tiny PWA shell.

## Quick start

```bash
pnpm i
pnpm dev
```

Build:

```bash
pnpm build
pnpm preview
```

## Deploy to Vercel

1. Push this folder to a Git repo.
2. Create a new Vercel project, framework: **Vite**.
3. Build command: `pnpm build`
4. Output dir: `dist`
5. Set `NODE_VERSION` to 18+ if needed.

Service worker registers automatically in production builds. Camera input requires HTTPS which Vercel provides.

## Editing content

* Copy strings in `src/copy.ts`.
* Theme tokens in `src/theme.ts`.
* Quests in `src/data/quests.ts` (seed pool and expansion packs).
* Venues in `src/data/venues.ts`.
* Sponsors in `src/data/sponsors.ts`.

### Add a sponsor

Edit `src/data/sponsors.ts`. The featured slot reads `featuredSponsor`. Change `name`, `url`, and `blurb`.

### Add a pack

In `src/data/quests.ts`, add a new pack in `EXPANSION_PACKS`. It will appear in the Expansion Packs drawer and can be toggled into the active pool.

### Toggle membership teaser

In `src/theme.ts`, set `FEATURE_FLAGS.membershipTeaser` to `true` or `false`.

## PWA

* Manifest at `public/manifest.webmanifest`.
* Offline app shell via `src/sw.ts` caches root, assets, and data modules.
* Respect `prefers-reduced-motion`.

## Lighthouse tips

* Test mobile with throttling (e.g., “Slow 4G”, 4x CPU).
* Run:

  * Chrome DevTools Lighthouse on `/`
  * Ensure no other tabs are heavy
* Expect 95+ on mobile if images remain local and minimal.

## Acceptance checks

* `pnpm dev` and `pnpm build` run with no errors.
* UI optimized for 390×844.
* Camera attach works on HTTPS. If blocked, the UI shows a hint and file picker fallback.
* Timer persists in background using wall-clock deltas.
* No em dashes in UI copy.