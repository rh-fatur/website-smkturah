# AGENTS.md

## What this project is

**SMK Turah 01 Bogor** is a **fictional** vocational high school (SMK) website, built as a **web development coursework project**. The school, its staff, achievements, testimonials, and news are all made up for educational purposes. Any resemblance to real people or institutions is coincidental.

- Never add real personal data (real names, emails, phone numbers, photos of real people).
- Never present the school as real.
- All user-facing text is in **Indonesian**. Keep it that way. Code, comments in new code, and this file are in English.

## Hard constraints

- Pure **HTML + CSS + vanilla JS (ES6+)**. No frameworks, bundlers, package managers, or build steps.
- No ES modules (`import`/`export`). Everything is a classic `<script>` sharing the global scope.
- External resources are CDN-only: Lenis 1.1.18 (unpkg), Font Awesome 6.4.0 (cdnjs), Google Fonts (Plus Jakarta Sans, Sora). Do not add more.
- The site must run by opening `index.html` directly (no dev server).
- There are no CSS variables (`:root`) and no `@import` in the stylesheet. Don't introduce them unless asked.

## File map

```
index.html
assets/
├── css/style.css
├── js/
│   ├── init.js
│   ├── data/{jurusan,ekskul,berita,guru,ulasan}.js
│   ├── effects.js
│   └── script.js
└── pictures/
```

The code is deliberately consolidated: **1 CSS file, 3 JS code files, 5 data files**. Do not split them into many small modules again.

### Load order (do not change)

`init.js` (in `<head>`) → `style.css` → Lenis, Font Awesome → `data/*.js` → `effects.js` → `script.js`

`script.js` reads the data globals when it runs, so data files must come first. All scripts share one global scope, so a duplicate top-level `const`/`let`/`class` name across files throws a SyntaxError.

## Data files (`assets/js/data/`)

Each file declares its global with `window.X = window.X || [];` and then calls `window.X.push({...})` once per item. **To add or edit content, change only these files.** Copy an existing object and keep the exact field names. Array order is the display order.

### `jurusan.js` → `JURUSAN_DATA` (4 items: tkj, rpl, dkv, pspt)

| Field | Type | Notes |
|---|---|---|
| `id` | string | lowercase slug, used in `data-jurusan="..."` |
| `name` | string | full name, e.g. "Teknisi Komputer & Jaringan (TKJ)" |
| `badge` | string | category label on the card |
| `hide` | boolean | `true` removes it from the slider (`renderJurusanSlider` filters on it) |
| `image` | string | card/banner image path |
| `shortDesc` | string | card text |
| `fullDesc` | string | detail page text |
| `photos` | array of `{src, tag}` | detail page gallery |
| `materi` | array of string | learning materials list |
| `prospekKerja` | array of string | career prospects list |

### `ekskul.js` → two arrays

`EKSKUL_DATA` (6 items: jic, pramuka, paskibra, pmr, karate, tahsin), for the slider card and the detail page header:
`id`, `name`, `badge`, `image`, `shortDesc`, `fullDesc`, `kegiatan` (array of string), `jadwal` (string). An optional `hide: true` is also honored.

`EKSKUL_DETAIL_DATA` (same 6 ids), used by the extracurricular detail page:
`id` (must match `EKSKUL_DATA`), `number` (string like `'01'`), `title`, `description`, `photos` (array of `{src, tag}`).

When adding an extracurricular, add an object to **both** arrays with the same `id`.

### `berita.js` → `BERITA_DATA` (5 items)
`id`, `image`, `date` (string), `title`, `link`, `content` (array of string, one entry per paragraph).

### `guru.js` → `GURU_DATA` (13 items)
`id`, `nama`, `gelar`, `jabatan`, `keterangan`, `foto`. The item whose `jabatan` is "Kepala Sekolah" is rendered as the principal; the rest go into the teacher grid (`renderGuruCards`). Photo load errors are handled by `window.handleFotoGuruError`.

### `ulasan.js` → `ULASAN_DATA` (6 seed items)
`nama`, `email`, `rating` (number 1-5), `pesan`, `tanggal` (ISO date string, e.g. `2026-09-10`). There is no `id`. New reviews submitted through the form are appended at runtime (not persisted) and the list is sorted by date.

### Not data-driven (edit in `index.html`)
- **Prestasi** (6 `.prestasi-card` elements, plus `#prestasi-extra` toggled by `#btn-prestasi-toggle`)
- **Galeri** section photos
- **Hero**, **Visi & Misi**, **Sejarah** timeline, **Kenapa Pilih Kami** cards
- The `<option>` list in `#daftar-jurusan`. It is hardcoded (TKJ, RPL, DKV, PSPT), so update it by hand if you add or remove a jurusan.

## `script.js` (logic) — what lives where

Sections are separated by comment banners, in this order: DATA GLOBAL, NAVBAR, SECTIONS, PAGES, PRESTASI, PROFIL, BERITA, AKADEMIK, ULASAN, DAFTAR.

- **DATA GLOBAL**: initializes `PENDAFTARAN_DATA` (filled at runtime by the registration form, only logged to console, never sent anywhere) and `AKADEMIK_DATA` (optional fallback photos for `renderJurusanDetail`).
- **Navbar**: `updateNavPill`, `smoothScrollTo`, `setupScrollSpy`, `closeMobileMenu`. Nav items use `.nav-item[data-page="<section id>"]`. Sections are `#beranda`, `#profil`, `#berita`, `#akademik`, `#galeri`, `#ulasan` (all `.page-section`).
- **Detail overlay**: `openDetailOverlay(html)` / `closeDetailOverlay()` render into `#detail-overlay` / `#detail-overlay-content`. `renderJurusanDetail(id)` and `renderEkskulDetail(id)` build the HTML. They are triggered by delegated clicks on buttons with `data-jurusan="<id>"` or `data-ekskul="<id>"`. `window.goBackToBeranda` is an alias of `closeDetailOverlay` and is used by inline handlers.
- **Cards and sliders**: `buatCardJurusan`, `buatCardEkskul`, `renderJurusanSlider` (`#jurusan-slider`), `renderEkskulSlider` (`#ekskul-slider`), `setupAutoCount` (fills `#count-jurusan` and `#count-ekskul` from the DOM).
- **Berita**: `renderBeritaCards` (uses `<template id="berita-card-template">`, renders into `#berita-track`), `setupBeritaToggle`, `setupBeritaNav`.
- **Profil**: `renderGuruCards` renders into `#guru-grid`.
- **Ulasan**: `renderUlasan` (uses `<template id="ulasan-card-template">`, renders into `#ulasan-list`), `updateOverallRating`, `setupRatingInput` (`#rating-input`), `setupUlasanForm` (`#ulasan-form`).
- **Daftar (PPDB modal)**: `setupDaftarModal`, with `#daftar-modal-overlay`, `#daftar-form`, `#daftar-success-wrapper`. Escape closes it. It calls `lenis.stop()` on open and `lenis.start()` on close.

## `effects.js` (animations and scroll)

1. **Animation engine** (IIFE). Reads `window.ANIMATION_CONFIG`, an array of `{ selector, type, delay?, stagger?, duration?, force? }`:
   - `type` is written to `data-anim` on matching elements (e.g. `fade-up`, `fade-left`, `fade-right`, `zoom-in`). The CSS for each type lives in the ANIMATIONS section of `style.css`.
   - `stagger` multiplies by the element index and is applied through the `--anim-delay` CSS variable.
   - `duration` sets `transitionDuration` inline.
   - Elements that already have `data-anim` are skipped unless `force: true`.
   - An `IntersectionObserver` adds `.is-visible` when the element enters the viewport. Counters use `data-counter` and are set up by `setupCounters`.
2. **Scroll effects** (IIFE, `'use strict'`). Lenis setup (exposes `window.lenis`, wraps `window.scrollTo` to use Lenis), the `#scroll-progress` bar, and hero parallax.
3. **Per-section animation config**: banners HERO, GENERAL, BERITA, PRESTASI, AKADEMIK, GALERI, PROFIL, ULASAN. Each only calls `window.ANIMATION_CONFIG.push(...)`.

**Important:** content rendered after page load (berita, ulasan, etc.) is invisible to the animation engine until `window.reinitAnimations()` runs. Any new render function that creates animated elements must call it at the end, guarded like the existing code: `if (typeof window.reinitAnimations === 'function') window.reinitAnimations();`.

If Lenis fails to load from the CDN, the site should still work without smooth scroll. Always guard with `if (window.lenis)`.

## `init.js` (page reveal)

Adds `is-loading` to `<html>`. A small inline `<style>` in `index.html` hides `<body>` while that class is present. Waits for `window.load` + `document.fonts.ready`, then `DELAY` (450 ms), then swaps `is-loading` for `is-ready` and the body fades in. `MAX_WAIT` (5000 ms) guarantees the page opens even if something hangs. If `init.js` itself fails, the class is never added and the page shows normally. Keep `init.js` and the inline `<style>` in `index.html` consistent.

## CSS (`assets/css/style.css`)

Sections are separated by banners, in this exact order (it mirrors the old per-file load order, so **do not reorder** because of the cascade):

`CORE / BASE` → `LAYOUT / NAVBAR` → `LAYOUT / HERO` → `LAYOUT / FOOTER` → `COMPONENTS / CARDS` → `COMPONENTS / SECTIONS` → `COMPONENTS / DIVIDERS` → `FEATURES / PAGES` → `FEATURES / BERITA` → `FEATURES / PRESTASI` → `FEATURES / AKADEMIK` → `FEATURES / GALERI` → `FEATURES / PROFIL` → `FEATURES / ULASAN` → `FEATURES / DAFTAR` → `EFFECTS / ANIMATIONS` → `EFFECTS / SCROLL-EFFECTS` → `CORE / FONT-DISPLAY`

`FONT-DISPLAY` is intentionally last and overrides font rules from earlier sections. Put new styles in the section that matches the feature. Class names are plain, descriptive and unprefixed (e.g. `.berita-card`, `.jurusan-card`, `.prestasi-card`); reuse the existing naming style.

## Images (`assets/pictures/`)

- Paths are written as `assets/pictures/<folder>/<file>` inside data files and `index.html`.
- Top-level folders: `banner/` (`jurusan/`, `ekskul/`), `akademik/`, `berita/`, `galeri/`, `guru/`, `kegiatan/`, `kegiatan-praktik/`, `kpk/`, `prestasi/`. Loose files in the root: `logo-smk.png`, `halaman-depan.jpg`, `halaman-depan-sekolah.jpg`, `halaman-sekolah.jpg`, `suasana-sekolah.jpg`.
- The photos are large and are **not committed**, so broken images are expected in a fresh checkout. Don't "fix" this by changing paths or adding placeholders.
- If you rename or move an image, update every reference in `index.html` and `assets/js/data/*.js`.

## Common tasks

- **Add a teacher**: add an object to `guru.js`. Add the photo to `pictures/guru/`.
- **Add a news article**: add an object to `berita.js` (`content` is an array of paragraphs).
- **Add a jurusan**: add an object to `jurusan.js`, add a banner to `pictures/banner/jurusan/`, and add an `<option>` to `#daftar-jurusan` in `index.html`.
- **Add an extracurricular**: add matching objects (same `id`) to `EKSKUL_DATA` and `EKSKUL_DETAIL_DATA` in `ekskul.js`.
- **Add an animation**: push `{ selector, type, ... }` into the matching section in `effects.js`.
- **Add a restyle**: edit the matching section in `style.css`.

## Verifying changes

There is no test suite or build. After a change:

1. Open `index.html` in a browser at desktop width and a ~380px mobile width. Check the console for errors.
2. Click through every nav item, a jurusan detail, an ekskul detail, the berita carousel and its toggle, the prestasi toggle, the review form (including star rating), and the PPDB modal (validation, success state, Escape to close).
3. Confirm animations still trigger on dynamically rendered content (see `reinitAnimations` above).
4. If Node is available, `node --check assets/js/<file>.js` is a quick syntax check.

## Do not

- Do not add frameworks, dependencies, build tooling, or ES modules.
- Do not split `style.css`, `effects.js`, or `script.js` into many files, or merge the five data files into one.
- Do not reorder CSS sections or script tags.
- Do not hardcode content in `script.js` that belongs in `assets/js/data/`.
- Do not add real personal information, or imply that SMK Turah 01 Bogor is a real institution.
