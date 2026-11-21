# ZipperLock.net

Premium zipper lock screen studio — a Next.js static web app + installable PWA.
Users upload a photo, style a realistic metallic zipper, add a clock and text, test the unzip animation and download a wallpaper at their phone's native resolution. Everything runs in the browser; photos are never uploaded.

## Features

| Area | What's included |
|---|---|
| **Studio** (`/studio/`) | Photo upload (JPG/PNG/WebP, 20 MB), drag/pinch/scroll framing, zoom, rotate, brightness, contrast, saturation, blur, darken · 12 metals + custom colour · 17 teeth · 22 pullers · 18 procedural backgrounds · vertical/horizontal · size, position, tape · clock (5 fonts, metallic colours, 12/24h, English/Persian date, alignment) · name/text · layers (visibility, opacity, clock above/below zipper) · undo/redo (Ctrl+Z / Ctrl+Shift+Z) · test-unlock with sound · save projects (Ctrl+S) · shareable design links · PNG/JPEG export at 9 native device sizes · Share/Save to Photos |
| **Simulator** (`/simulator/`) | Drag-to-unzip with synthesised sound, vibration, full-screen, own photo |
| **Design library** (`/designs/`) | 240+ original procedural designs in 17 categories (love, sports, cats, dogs, birds, wildlife, anime-inspired, nature, fantasy, luxury, gaming, cars, dark, lifestyle, seasonal, art, basic) · search · category/colour/style/level filters · sort · live unzip preview · quick download · 17 SEO category pages |
| **Libraries** | `/styles/` (12 finishes, 17 teeth, 22 pullers — one card per distinct option), `/themes/` (18 distinct themes, 6 trending collections: love, luxury, cyber neon, kawaii cute, dark gothic, steel) |
| **Projects** (`/projects/`) | Saved in IndexedDB incl. photo: open, rename, duplicate, delete, export/import (`.zipperlock.json`), delete all, storage usage; auto-saved draft |
| **Tools** (`/tools/`) | Color Studio, Wallpaper Cropper, Resolution Converter, Background Effects, Background Remover, Sound Preview, Preset Generator, Device Preview (+ links to Studio tools) |
| **Content & SEO** | 6 original guides, About/Contact/Privacy/Terms/Disclaimer, canonical URLs, Open Graph, JSON-LD (Organization, WebSite, FAQPage, WebApplication, Article, Breadcrumb), `sitemap.xml`, `robots.txt` |
| **Monetisation/analytics** | GA4 + AdSense, both env-driven and loaded **only after cookie consent** |
| **PWA** | Manifest, icons (incl. maskable), service worker precaching every page, offline fallback, install button (Android/desktop prompt, iOS instructions) |

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/ + generated out/sw.js
npm run preview    # serve out/ on http://localhost:4173
```

Requires Node 18.18+ (tested on Node 22). TypeScript must stay on v5 for Next.js 15.

## Configuration

Copy `.env.example` to `.env.local` and fill in what you need, then rebuild. All values are optional:

- `NEXT_PUBLIC_SITE_URL` — canonical domain (sitemap, structured data)
- `NEXT_PUBLIC_CONTACT_EMAIL` — shown on Contact/Privacy/Terms
- `NEXT_PUBLIC_PHP_CONTACT=1` — show the contact form (needs PHP hosting, see below)
- `NEXT_PUBLIC_GA_ID` — Google Analytics 4 ID
- `NEXT_PUBLIC_GSC_VERIFICATION` — Search Console meta-tag code
- `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_HOME`, `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE` — AdSense

## Deploying to cPanel

1. `npm run build` locally.
2. In cPanel → File Manager, open `public_html` and upload the **contents** of `out/` (not the folder itself). Make sure hidden files are included — `.htaccess` matters.
3. Enable SSL (AutoSSL / Let's Encrypt), then uncomment the HTTPS redirect and HSTS lines in `.htaccess`.
4. Contact form (optional): `contact.php` is already in `out/`. Set the recipient by editing `$CONTACT_TO` in it (or the `ZL_CONTACT_TO` env var), rebuild with `NEXT_PUBLIC_PHP_CONTACT=1`.
5. AdSense: create `public/ads.txt` containing `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`, rebuild and upload.
6. Search Console: add the property, verify with `NEXT_PUBLIC_GSC_VERIFICATION`, then submit `https://your-domain/sitemap.xml`.

Any static host works too (Netlify, Vercel static, Cloudflare Pages, Nginx) — only `.htaccess` and `contact.php` are Apache/PHP-specific.

## Project structure

```
app/                 routes (App Router, statically exported)
  studio/ simulator/ styles/ themes/ projects/ tools/* guides/* …
  sitemap.ts robots.ts manifest.ts
components/          React UI (Studio, ZipperDemo, tools/*, Consent, AdSlot, Pwa…)
lib/
  zipper.ts          canvas zipper renderer (17 teeth, 22 pullers, 12 metals, opening curve)
  art.ts             procedural artwork: 60+ motifs, 22 scenes, 11 layouts
  library.ts         the 237-design catalogue, categories, colour/style tags
  shapes.ts          shared vector shapes   analytics.ts GA4 events (consent-gated)
  design.ts          design model, backgrounds, cover/clock renderer, compose()
  presets.ts         devices + themes      sound.ts   Web Audio zipper sounds
  projects.ts        IndexedDB projects     history.ts undo/redo
  image.ts           decode/validate/export helpers, design links
  guides.ts tools.ts site.ts
public/              icons, og.jpg, .htaccess, contact.php
scripts/             gen-sw.mjs + sw-template.js (post-build service worker)
docs/ARCHITECTURE.md technical documentation
```

See `docs/ARCHITECTURE.md` for how rendering, export, storage and the service worker work.
