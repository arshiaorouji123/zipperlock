# ZipperLock — Technical Documentation

## 1. Overview

ZipperLock is a **statically exported Next.js 15 app** (`output: 'export'`). There is no application server: every page is pre-rendered HTML, and all interactive work (image processing, rendering, storage) happens in the browser. This keeps hosting compatible with plain cPanel, keeps photos private, and makes offline use possible.

```
Browser
 ├─ React UI (components/)
 ├─ Canvas rendering (lib/zipper.ts, lib/design.ts)
 ├─ Web Audio (lib/sound.ts)
 ├─ IndexedDB / localStorage (lib/projects.ts)
 └─ Service worker (out/sw.js) → offline cache
Server: static files (+ optional contact.php)
```

## 2. Design model

`lib/design.ts` → `Design`

| Field | Purpose |
|---|---|
| `bg` | procedural background id (drawn at any resolution, seeded so it's deterministic) |
| `adj` | photo transform + filters: `zoom`, `x`, `y` (fractions of width/height), `rotate`, `brightness`, `contrast`, `saturation`, `blur`, `dim` |
| `zipper` | `ZipperOpts`: metal (or `custom` + `customColor`), teeth, puller, size, pos, rest, orientation, tape |
| `clock` | show, 12/24h, font, colour, size, y, align, date, locale (`en`/`fa`), text |
| `layers` | visibility + opacity for photo/clock/zipper, `clock.above` ordering |

All geometry is stored **relative to the canvas size**, so the same design renders identically in a 300 px preview and a 1440×3200 export. `normalizeDesign()` fills defaults for older saved data, so the model can grow without migrations.

## 3. Rendering pipeline

1. **Cover** — `renderCover()` draws background → photo (with filters) → darken → vignette → clock (when below the zipper) into an off-screen canvas.
2. **Compose** — `compose()` calls `drawScene()` (zipper) then the clock layer when it's above the zipper. Preview, thumbnails, simulator and export all use this one function, so what you see is what you download.
3. **Export** — `renderDesign()` creates fresh canvases at the device's native size and re-renders everything (not an upscale), then `canvas.toBlob()`.

### Zipper renderer (`lib/zipper.ts`)

- Works in a "frame" where the zipper always runs top→bottom; horizontal zippers rotate the context −90° and use a rotated copy of the cover.
- **Teeth**: one sprite per side is pre-rendered (metal gradient, specular highlight, scoop, edge, drop shadow) and cached by metal/size; teeth are stamped with `drawImage`, left and right offset by half a pitch so they interlock.
- **Opening**: half-spread above the slider is `s(d) = 0.5·d²/(d+L)` (d = distance above the slider). Its derivative gives each tooth's rotation, so teeth follow the V-shaped curve. The cover is split into horizontal strips, each half shifted by `s(y)` — the wallpaper peels apart and reveals the layer behind.
- **Metals**: four-stop ramps (highlight, light, base, dark) + edge. `metalFromColor()` builds a ramp from any hex colour by shifting HSL lightness/saturation.
- **Filters**: uses `ctx.filter` where supported, otherwise a fallback (downscale/upscale blur + per-pixel brightness/contrast/saturation) for older Safari.

## 4. Interaction

- Pointer Events for mouse, touch and pen. `hitPuller()` tests the slider+puller area; `progressFromFrameY()` converts a drag to 0–1 progress.
- Studio edit mode: drag puller = move zipper, drag elsewhere = pan photo, pinch/scroll = zoom. Test mode: drag puller = unzip; release past 55 % unlocks, otherwise springs back.
- Undo/redo (`lib/history.ts`) groups rapid changes (e.g. slider drags) into one step after 400 ms of stillness.

## 5. Storage

| Data | Where | Notes |
|---|---|---|
| Saved projects (design + original image Blob + JPEG thumbnail) | IndexedDB `zipperlock` / `projects` | device-only |
| Working draft (design only) | `localStorage zl:draft` | restored when Studio opens without URL params |
| Tool → Studio image hand-off | IndexedDB record `__handoff` | consumed once by `/studio/?handoff=1` |
| Cookie choice | `localStorage zl:consent` | |

Design links (`?d=`) contain base64url JSON of the design only — never images.

## 6. Sound

`lib/sound.ts` synthesises zipper audio: looped white noise → band-pass filter → gain modulated by a square-wave LFO whose rate follows drag speed (teeth passing the slider). Three profiles (metal, coil, chunky). The AudioContext is created on first user gesture, as browsers require.

## 7. PWA & offline

- `app/manifest.ts` → `manifest.webmanifest` (standalone, icons incl. maskable, shortcuts).
- `scripts/gen-sw.mjs` runs after `next build`, lists every exported file, hashes their contents for a version, and writes `out/sw.js` from `scripts/sw-template.js`.
- Strategy: precache everything on install; navigations are network-first → cache → `/offline/`; `/_next/` assets and icons cache-first; cross-origin requests (analytics/ads) are never intercepted; old caches are deleted on activate.
- Registration happens only in production builds (`components/Pwa.tsx`).

## 8. SEO

- Per-page `metadata` with canonical URLs; global Open Graph/Twitter image.
- JSON-LD: Organization + WebSite (layout), FAQPage (home), WebApplication (studio), Article + BreadcrumbList (guides).
- `sitemap.xml` and `robots.txt` generated at build time from `lib/guides.ts` and `lib/tools.ts`.

## 9. Privacy, consent, ads

- GA4 and AdSense scripts are injected by `components/Consent.tsx` **only after Accept**. Without env IDs no banner appears and nothing third-party loads.
- `AdSlot` reserves space (no layout shift) and is placed only in content areas (home, articles) — never inside the editor.

## 10. Security

- No server-side processing of user images; no credentials in frontend code.
- `.htaccess`: CSP, `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, optional HSTS/HTTPS redirect, immutable caching for hashed assets.
- `contact.php`: POST-only, same-origin check, honeypot, per-IP rate limit, email validation, header-injection protection.
- Uploads are validated by MIME type and size; very large images are downscaled to 4096 px to protect memory.

## 11. Accessibility

- All controls are native inputs/buttons with labels; tabs use `role="tablist"`; segmented controls use `role="radiogroup"`.
- Canvases have `role="img"` + descriptive labels; the simulator can be played with Enter/Space.
- Visible focus rings, skip link, `prefers-reduced-motion` respected, WCAG AA colour contrast (checked with axe-core).

## 12. Quality checks performed

- `next build` type-check on every phase.
- Playwright end-to-end: upload → edit → undo → layers → save → reopen project; unzip in hero/simulator; every tool incl. tool→Studio hand-off; export file verified at exact device resolution (e.g. 1320×2868).
- Offline: pages reload with the network disabled; uncached URLs show `/offline/`.
- axe-core WCAG 2 A/AA scan on key pages: no violations.
- Mobile 390 px: no horizontal scroll.

## 13. Extending

- **New metal**: add to `METALS` in `lib/zipper.ts`.
- **New teeth shape**: add to `TEETH` (pitch, height, lengths, radius); `toothSprite()` draws it.
- **New background**: add a `draw(ctx, W, H)` entry to `BACKGROUNDS` in `lib/design.ts`.
- **New theme**: add to `THEMES` in `lib/presets.ts`.
- **New device size**: add to `DEVICES` in `lib/presets.ts`.
- **New guide**: add to `GUIDES` in `lib/guides.ts` — page, sitemap and listings update automatically.

## 14. Design library & procedural artwork (Nov 2026)

- `lib/art.ts` draws original vector artwork on canvas: an `ArtSpec` = background scene (22 kinds: stadium, galaxy, neon grid, marble, waves, …) + up to 4 motif layers (60+ motifs: hearts, roses, sakura, cats, dogs, birds, balls, jerseys, cars, kawaii characters, lanterns, skulls, …) placed by one of 11 layouts. Each layer is drawn flat then composited once with its shadow/glow, so details stay crisp.
- All art is parameters, not bitmaps: it re-renders at any export size and every colour/amount/size/layout is editable in the Studio **Artwork** tab (labels come from each motif, e.g. "Fur colour", "Jersey colour").
- `lib/library.ts` holds 237 designs. Colour filter tags are computed from the actual colours; a build-time check (see QA) guarantees no two designs share the same composition (scene + motif set + teeth + puller).
- Original 12 themes are preserved unchanged as `theme-*` entries. The Styles page was de-duplicated from 36 near-identical cards to 34 distinct ones.
- Zipper engine extended: teeth `minimal, pixel, pearl, crystal, heart, star, neon`; pullers `heart, star, paw, ball, crown, gem, bolt, flower, skull`; metals `white, pink, ruby, emerald, sapphire, holo`; per-design `shadow`, `gloss`, `pullerScale`, `swing`.
- Export adds WebP (when the browser supports it) and custom dimensions (320–4096 px), always re-rendered rather than scaled.
- Honest limit: artwork is stylised vector illustration (levels 1–5 describe detail), not photorealistic 3D renders or licensed photos.
