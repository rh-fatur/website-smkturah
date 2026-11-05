# SMK Turah 01 Bogor — Modern Campus Website

A fictional vocational high school (SMK) profile website built as a web development coursework project. The site is designed around a **data-driven architecture** and **modular file organization**, demonstrating separation of concerns between content, logic, styling, and assets.

> ⚠️ **Disclaimer:** SMK Turah 01 Bogor is a fictional institution. All data — including staff members, achievements, testimonials, and news articles — is entirely fictional and created solely for educational purposes. Any resemblance to real institutions is coincidental.

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Architecture Philosophy](#-architecture-philosophy)
6. [Getting Started](#-getting-started)
7. [Adding New Content](#-adding-new-content)
8. [Customization](#-customization)
9. [Development Notes](#-development-notes)
10. [License](#-license)

---

## 🎯 Overview

This project is a single-page application (SPA) that presents a fictional vocational high school's digital presence. It showcases four main pages — **Beranda** (Home), **Profil** (Profile), **Akademik** (Academics), and **Galeri** (Gallery) — alongside dynamic features like an online registration modal, an interactive review system, and multiple content carousels.

The core principle throughout the codebase is **data-driven rendering**: content is stored separately from the logic that renders it, so updating information never requires touching the code that displays it. This approach mirrors how modern CMS-driven websites operate, adapted to a vanilla JavaScript environment without any build tools or frameworks.

The site is intentionally built without dependencies like React, Vue, or Tailwind. Everything runs on **pure HTML, CSS, and JavaScript**, with Lenis as the only external runtime library for smooth scrolling. This constraint was chosen deliberately to demonstrate a deep understanding of foundational web technologies rather than relying on abstraction layers.

---

## ✨ Features

### Core Navigation
- **Single Page Application (SPA)** behavior — switching between Beranda, Profil, Akademik, and Galeri happens instantly, without page reloads.
- **Animated navigation pill** that smoothly transitions between active menu items.
- **Mobile-responsive menu** with overlay for small screens.
- **Scroll progress bar** at the top of the viewport indicating reading position.

### Hero Section
- **Full-screen hero** with a background image that uses CSS Masking to create a dynamic fade effect on the left and bottom edges.
- The fade is **attached to the image itself**, not to a static overlay — so it moves naturally with the parallax and zoom animations without leaving a visible seam.
- Secondary CTA buttons ("Jelajahi Akademik" and "Lihat Profil") that programmatically switch pages.

### Dynamic Content Sections
- **Berita Terkini (Latest News)** — horizontal carousel with expandable articles. Each card can be toggled to reveal its full content.
- **Prestasi (Achievements)** — grid layout showcasing school achievements with hover animations.
- **Kenapa Pilih Kami (Why Choose Us)** — image-based feature cards with subtle zoom effects on hover.
- **Daftar Jurusan (Study Programs)** — horizontally scrollable slider with four programs: TKJ, RPL, DKV, and PSPT.
- **Kegiatan Ekstrakurikuler (Extracurriculars)** — similar slider for six activities including JIC, Pramuka, Paskibra, PMR, Karate, and Tahsin.
- **Auto-count summary notes** — the "jumlah jurusan" and "jumlah ekskul" numbers are computed from the DOM at runtime, not hardcoded.

### Detail Pages
- **Program detail pages** rendered dynamically from `window.JURUSAN_DATA` — each with its own banner, description, learning materials list, and career prospects.
- **Extracurricular detail pages** rendered from `window.EKSKUL_DATA` — with schedule information and core activities.

### Profile Page
- **Dark thematic section** with parallax scrolling for the school profile overview.
- **Visi & Misi** cards with iconography.
- **Sejarah Sekolah (School History)** with a collapsible text block and an animated vertical timeline.
- **Kepala Sekolah & Dewan Guru** rendered from `window.GURU_DATA`, with automatic separation between the principal and regular teaching staff.

### Interactive Features
- **Review & Rating System** — users can submit reviews with a star rating. The overall rating is recalculated dynamically. New reviews are appended to the live list and sorted by date.
- **Registration Modal (PPDB)** — a modal dialog for prospective students, with form validation, a success state, and Escape-key support.
- **Smooth scroll via Lenis** — integrated throughout, with proper handling for modal open/close to prevent scroll bleed.

### Animations
- **Scroll-triggered reveal animations** for sections entering the viewport.
- **Parallax effects** on select elements.
- **Floating animation** on the hero image (desktop only).
- **Progress-based animations** tied to scroll position.
- All animations are re-initialized after dynamic content renders, ensuring new elements are properly animated.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Markup | HTML5 | Semantic structure, `<template>` elements for dynamic rendering |
| Styling | CSS3 | Flexbox, Grid, CSS Custom Properties, CSS Masking, transitions |
| Logic | Vanilla JavaScript (ES6+) | Data rendering, DOM manipulation, event handling, state management |
| Smooth Scroll | [Lenis 1.1.18](https://github.com/darkroomengineering/lenis) | Inertial smooth scrolling |
| Icons | [Font Awesome 6.4.0](https://fontawesome.com/) | UI icons throughout the interface |
| Typography | Plus Jakarta Sans, Sora | Via Google Fonts |

**No frameworks. No build tools. No package managers.** The entire project runs by opening `index.html` in a browser.

---

## 📁 Project Structure


```
smk-turah/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── style.css          ← seluruh styling (dibagi per bagian lewat komentar)
    ├── js/
    │   ├── init.js            ← sembunyikan halaman sampai CSS/font/gambar siap, lalu tampilkan
    │   ├── data/              ← konten (data-driven), satu file per kategori
    │   │   ├── jurusan.js
    │   │   ├── ekskul.js      ← EKSKUL_DATA (kartu) + EKSKUL_DETAIL_DATA (halaman detail)
    │   │   ├── berita.js
    │   │   ├── guru.js
    │   │   └── ulasan.js
    │   ├── effects.js         ← engine animasi, scroll effects, dan config animasi per section
    │   └── script.js          ← logika: navbar, halaman, berita, akademik, profil, ulasan, pendaftaran
    └── pictures/              ← semua foto
        ├── logo-smk.png
        ├── halaman-depan.jpg
        ├── halaman-depan-sekolah.jpg
        ├── halaman-sekolah.jpg
        ├── suasana-sekolah.jpg
        ├── banner/ (jurusan, ekskul)
        ├── akademik/
        ├── berita/
        ├── galeri/
        ├── guru/
        ├── kegiatan/
        ├── kegiatan-praktik/
        ├── kpk/
        └── prestasi/
```

### Urutan load

1. `init.js` (di `<head>`) — halaman disembunyikan sebentar.
2. `style.css`
3. `data/*.js` — mengisi `JURUSAN_DATA`, `EKSKUL_DATA`, `EKSKUL_DETAIL_DATA`, `BERITA_DATA`, `GURU_DATA`, `ULASAN_DATA`.
4. `effects.js`
5. `script.js` — membaca data di atas lalu merender halaman.

Data harus dimuat sebelum `script.js`. Menambah konten = menambah satu objek di array pada file kategorinya.

### Menampilkan halaman

`init.js` menunggu `window.load` dan `document.fonts.ready`, lalu memberi jeda 450 ms sebelum halaman fade-in. Ada batas maksimal 5 detik supaya halaman tetap terbuka walau ada resource (misalnya CDN) yang lambat. Kedua angka ini ada di bagian atas `init.js`.
