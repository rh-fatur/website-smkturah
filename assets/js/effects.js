/* ============================================================
   ENGINE
   ============================================================ */

/* ============================================
   ANIMATIONS ENGINE
   ============================================ */

window.ANIMATION_CONFIG = window.ANIMATION_CONFIG || [];

(function () {
    'use strict';

    // ---------- 1. APPLY CONFIG ----------
    function applyConfig(config) {
        const els = document.querySelectorAll(config.selector);
        if (!els.length) return;

        els.forEach((el, i) => {
            if (el.hasAttribute('data-anim') && !config.force) return;

            el.setAttribute('data-anim', config.type || 'fade-up');

            const baseDelay = config.delay || 0;
            const stagger = config.stagger || 0;
            const totalDelay = baseDelay + stagger * i;

            if (totalDelay > 0) {
                el.style.setProperty('--anim-delay', totalDelay + 'ms');
            }

            if (config.duration) {
                el.style.transitionDuration = config.duration + 'ms';
            }
        });
    }

    // ---------- 2. COUNTER SETUP ----------
    // Scan elemen dan set data-counter dari textContent-nya
    function setupCounters() {
        // Hero stat (contoh: "80%")
        const heroStat = document.querySelector('.stat-box h3');
        if (heroStat && !heroStat.dataset.counter) {
            const txt = heroStat.textContent.trim();
            const match = txt.match(/^(\d+(?:\.\d+)?)(.*)$/);
            if (match) {
                heroStat.dataset.counter = match[1];
                heroStat.dataset.counterSuffix = match[2] || '';
                heroStat.textContent = '0' + (match[2] || '');
            }
        }

        // Dark stat items (di Profil: "30%", "95%")
        document.querySelectorAll('.dark-stat-item h4').forEach(el => {
            if (el.dataset.counter) return;
            const txt = el.textContent.trim();
            const match = txt.match(/^(\d+(?:\.\d+)?)(.*)$/);
            if (match) {
                el.dataset.counter = match[1];
                el.dataset.counterSuffix = match[2] || '';
                el.textContent = '0' + (match[2] || '');
            }
        });
    }

    // ---------- 3. COUNTER LOGIC ----------
    function startCounter(el) {
        if (el.dataset.counterDone === 'true') return;
        el.dataset.counterDone = 'true';

        const target = parseFloat(el.dataset.counter);
        const suffix = el.dataset.counterSuffix || '';
        const duration = parseInt(el.dataset.counterDuration || '1400', 10);
        const startTime = performance.now();

        el.classList.add('counter-anim');

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;

            el.textContent = (Number.isInteger(target)
                ? Math.round(value)
                : value.toFixed(1)) + suffix;

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = (Number.isInteger(target)
                    ? target
                    : target.toFixed(1)) + suffix;
            }
        }

        requestAnimationFrame(tick);
    }

    // ---------- 4. INTERSECTION OBSERVER ----------
    let observer;

    function setupObserver() {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');

                    if (entry.target.dataset.counter) {
                        startCounter(entry.target);
                    }

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -60px 0px'
        });

        document.querySelectorAll('[data-anim], [data-counter]').forEach(el => {
            observer.observe(el);
        });
    }

    // ---------- 5. NAVBAR SHRINK ----------
    function setupNavbar() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        let lastState = false;
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 30;
            if (scrolled !== lastState) {
                navbar.classList.toggle('is-scrolled', scrolled);
                lastState = scrolled;
            }
        }, { passive: true });
    }

    // ---------- 6. INIT ----------
    function init() {
        window.ANIMATION_CONFIG.forEach(applyConfig);
        setupCounters();          // ← SEBELUM observer, biar counter ke-detect
        setupObserver();
        setupNavbar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose re-init
    window.reinitAnimations = function () {
        window.ANIMATION_CONFIG.forEach(applyConfig);
        setupCounters();
        if (observer) {
            document.querySelectorAll('[data-anim]:not(.is-visible)').forEach(el => {
                observer.observe(el);
            });
        }
    };
})();


/* ============================================================
   SCROLL EFFECTS
   ============================================================ */

/* ============================================
   SCROLL EFFECTS
   - Smooth scroll (Lenis)
   - Scroll progress bar
   - Hero parallax + zoom-out (auto-reset setelah hero lewat)
   ============================================ */

(function () {
    'use strict';

    // ============================================
    // 1. SMOOTH SCROLL (Lenis)
    // ============================================
    let lenis = null;

    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
            infinite: false
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        const nativeScrollTo = window.scrollTo.bind(window);
        window.scrollTo = function (opts, y) {
            if (typeof opts === 'object' && opts !== null && lenis) {
                if (typeof opts.top === 'number') {
                    lenis.scrollTo(opts.top, {
                        duration: 1.0,
                        easing: (t) => 1 - Math.pow(1 - t, 3)
                    });
                    return;
                }
            }
            nativeScrollTo(opts, y);
        };

        window.lenis = lenis;
        window.smoothScrollTo = (target, opts = {}) =>
            lenis.scrollTo(target, { duration: 1.0, ...opts });
    }

    // ============================================
    // 2. SCROLL PROGRESS BAR
    // ============================================
    const progressBar = document.getElementById('scroll-progress');

    function updateProgress() {
        if (!progressBar) return;
        const h = document.documentElement;
        const scrollTop = h.scrollTop || document.body.scrollTop;
        const scrollHeight = h.scrollHeight - h.clientHeight;
        const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
    }

    // ============================================
    // 3. HERO PARALLAX + ZOOM-OUT
    // Cuma aktif saat hero masih kelihatan.
    // Begitu hero lewat, transform-nya di-reset.
    // ============================================
    const heroSection = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-image-container');
    const heroText = document.querySelector('.hero-text');

    function resetHeroTransform() {
        if (heroImage) heroImage.style.transform = '';
        if (heroText) {
            heroText.style.transform = '';
            heroText.style.opacity = '';
        }
    }

    function updateHeroParallax() {
        // Cuma di desktop
        if (window.innerWidth < 993) return;
        if (!heroSection || (!heroImage && !heroText)) return;

        const rect = heroSection.getBoundingClientRect();

        // Kalau hero udah lewat (scroll melebihi tinggi hero), reset dan skip
        if (rect.bottom < 0) {
            resetHeroTransform();
            return;
        }

        const scrolled = window.scrollY;
        const vh = window.innerHeight;
        const progress = Math.min(scrolled / vh, 1); // 0..1

        if (heroImage) {
            const ty = scrolled * 0.28;
            const scale = 1 + progress * 0.08;
            heroImage.style.transform = `translate3d(0, ${ty}px, 0) scale(${scale})`;
        }

        if (heroText) {
            const ty = -scrolled * 0.18;
            const opacity = Math.max(1 - progress * 1.3, 0);
            heroText.style.transform = `translate3d(0, ${ty}px, 0)`;
            heroText.style.opacity = opacity;
        }
    }

    // ============================================
    // 4. MASTER RAF LOOP
    // ============================================
    let ticking = false;

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateProgress();
            updateHeroParallax();
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    if (lenis) {
        lenis.on('scroll', () => {
            updateProgress();
            updateHeroParallax();
        });
    }

    onScroll();
})();


/* ============================================================
   HERO (ANIMASI)
   ============================================================ */

// Hero udah auto-animate via CSS (lihat animations.css),
// di sini kita daftarkan elemen2 lain di dalam hero
window.ANIMATION_CONFIG.push(
    {
        selector: '.dark-section',
        type: 'fade-up',
        duration: 700
    }
);


/* ============================================================
   GENERAL (ANIMASI)
   ============================================================ */

// Section headers & elemen umum
window.ANIMATION_CONFIG.push(
    { selector: '.section-header', type: 'fade-up' },
    { selector: '.feature-grid .feature-card', type: 'fade-up', stagger: 100 },
    { selector: '.dark-content', type: 'fade-right' },
    { selector: '.dark-image-box', type: 'fade-left' }
);


/* ============================================================
   BERITA (ANIMASI)
   ============================================================ */

// Berita dirender dinamis oleh script.js, jadi kita pakai hook
// yang dipanggil ulang setelah render berita selesai.
window.ANIMATION_CONFIG.push({
    selector: '.berita-card',
    type: 'fade-up',
    stagger: 120,
    duration: 700
});


/* ============================================================
   PRESTASI (ANIMASI)
   ============================================================ */

window.ANIMATION_CONFIG.push(
    {
        selector: '.prestasi-card',
        type: 'zoom-in',
        stagger: 130,
        duration: 700
    },
    {
        selector: '.section-prestasi > h2',
        type: 'fade-up'
    },
    {
        selector: '.section-prestasi > p',
        type: 'fade-up',
        delay: 100
    }
);


/* ============================================================
   AKADEMIK (ANIMASI)
   ============================================================ */

window.ANIMATION_CONFIG.push(
    // Heading & subteks section Jurusan
    {
        selector: '.section-jurusan .section-header h2',
        type: 'fade-up'
    },
    {
        selector: '.section-jurusan .section-header p',
        type: 'fade-up',
        delay: 100
    },

    // Heading & subteks section Ekskul
    {
        selector: '.section-ekskul .section-header h2',
        type: 'fade-up'
    },
    {
        selector: '.section-ekskul .section-header p',
        type: 'fade-up',
        delay: 100
    },

    // Card jurusan & ekskul (di-render dari JS)
    {
        selector: '.jurusan-card',
        type: 'fade-up',
        stagger: 110,
        duration: 700
    },

    // Section note hijau
    {
        selector: '.section-note',
        type: 'fade-up',
        duration: 600
    }
);


/* ============================================================
   GALERI (ANIMASI)
   ============================================================ */

window.ANIMATION_CONFIG.push(
    // Heading utama section Galeri
    {
        selector: '.section-galeri > h2',
        type: 'fade-up'
    },
    {
        selector: '.section-galeri > p',
        type: 'fade-up',
        delay: 100
    },

    // Header tiap kategori (01, 02, 03)
    {
        selector: '.galeri-kategori-header',
        type: 'fade-up',
        stagger: 120,
        duration: 600
    },

    // Kategori 01 — Masonry
    {
        selector: '.galeri-item',
        type: 'zoom-in',
        stagger: 140,
        duration: 800
    },

    // Kategori 02 — Featured (main + mini)
    {
        selector: '.galeri-featured-main',
        type: 'zoom-in',
        duration: 800
    },
    {
        selector: '.galeri-featured-mini',
        type: 'fade-up',
        stagger: 120,
        duration: 700
    },

    // Kategori 03 — Editorial
    {
        selector: '.galeri-editorial-item',
        type: 'fade-up',
        stagger: 140,
        duration: 700
    }
);


/* ============================================================
   PROFIL (ANIMASI)
   ============================================================ */

window.ANIMATION_CONFIG.push(
    // Visi & Misi
    {
        selector: '.visi-misi-section > h2',
        type: 'fade-up'
    },
    {
        selector: '.visi-misi-card',
        type: 'fade-up',
        stagger: 150
    },
    // Sejarah
    {
        selector: '.sejarah-section > h2',
        type: 'fade-up'
    },
    {
        selector: '.sejarah-card',
        type: 'fade-up',
        delay: 100
    },
    {
        selector: '.timeline li',
        type: 'fade-left',
        stagger: 90
    },
    // Dewan Guru
    {
        selector: '.guru-section > h2',
        type: 'fade-up'
    },
    {
        selector: '.guru-section > p',
        type: 'fade-up',
        delay: 100
    },
    {
        selector: '.guru-section .feature-card',
        type: 'fade-up',
        stagger: 80
    }
);


/* ============================================================
   ULASAN (ANIMASI)
   ============================================================ */

window.ANIMATION_CONFIG.push(
    {
        selector: '.ulasan-section > h2',
        type: 'fade-up'
    },
    {
        selector: '.ulasan-section > p',
        type: 'fade-up',
        delay: 100
    },
    {
        selector: '.ulasan-overall',
        type: 'fade-up',
        delay: 150
    },
    {
        selector: '.ulasan-form-card',
        type: 'fade-right',
        delay: 200
    },
    {
        selector: '.ulasan-list-wrapper',
        type: 'fade-left',
        delay: 200
    }
);
