/* ============================================================
   DATA GLOBAL
   ============================================================ */

// Wadah data yang diisi saat runtime / tidak punya file di assets/js/data
if (typeof PENDAFTARAN_DATA === 'undefined') window.PENDAFTARAN_DATA = [];
if (typeof AKADEMIK_DATA === 'undefined')    window.AKADEMIK_DATA = [];


/* ============================================================
   NAVBAR
   ============================================================ */

/* ============================================
   NAVBAR & NAVIGASI
   - Anchor scroll (SPA single-page scroll)
   - Nav pill animation
   - Scroll spy (deteksi section aktif)
   - Mobile menu toggle
   ============================================ */

const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-item');
const mobileMenu = document.getElementById('mobile-menu');
const navOverlay = document.getElementById('nav-overlay');

/* ------------------------------------------
   NAV PILL
   ------------------------------------------ */
function updateNavPill() {
    if (!navLinks) return;
    if (window.innerWidth <= 992) return;

    let pill = navLinks.querySelector('.nav-pill');
    if (!pill) {
        pill = document.createElement('span');
        pill.className = 'nav-pill';
        pill.setAttribute('aria-hidden', 'true');
        navLinks.prepend(pill);
    }

    const active = navLinks.querySelector('.nav-item.active');
    if (!active) {
        pill.classList.remove('is-ready');
        return;
    }

    requestAnimationFrame(() => {
        const left   = active.offsetLeft;
        const top    = active.offsetTop;
        const width  = active.offsetWidth;
        const height = active.offsetHeight;

        pill.style.transform = `translate(${left}px, ${top}px)`;
        pill.style.width  = width + 'px';
        pill.style.height = height + 'px';
        pill.classList.add('is-ready');
    });
}

/* ------------------------------------------
   ANCHOR SCROLL (smooth via Lenis)
   ------------------------------------------ */
function smoothScrollTo(targetId) {
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    const offset = 90; // tinggi navbar
    const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;

    if (window.lenis) {
        window.lenis.scrollTo(top, { duration: 1.2 });
    } else {
        window.scrollTo({ top: top, behavior: 'smooth' });
    }
}

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-page') || this.getAttribute('href')?.replace('#', '');
        if (!targetId) return;

        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        updateNavPill();
        smoothScrollTo(targetId);
        closeMobileMenu();
    });
});

/* ------------------------------------------
   SCROLL SPY
   Cuma deteksi section utama (bukan detail page)
   ------------------------------------------ */
function setupScrollSpy() {
    const sections = document.querySelectorAll('.page-section[id]:not(#detail-jurusan):not(#detail-ekskul)');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const matchingNav = document.querySelector(`.nav-item[data-page="${id}"]`);
                if (matchingNav) {
                    navItems.forEach(n => n.classList.remove('active'));
                    matchingNav.classList.add('active');
                    updateNavPill();
                }
            }
        });
    }, {
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));
}

/* ------------------------------------------
   MOBILE MENU
   ------------------------------------------ */
function closeMobileMenu() {
    if (navLinks) navLinks.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
}

if (mobileMenu) {
    mobileMenu.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        if (navOverlay) navOverlay.classList.toggle('active');
    });
}

if (navOverlay) {
    navOverlay.addEventListener('click', closeMobileMenu);
}

/* ------------------------------------------
   INIT
   ------------------------------------------ */
window.addEventListener('resize', updateNavPill);

window.addEventListener('load', () => {
    setTimeout(() => {
        updateNavPill();
        setupScrollSpy();
    }, 200);
});

if (document.fonts) {
    document.fonts.ready.then(() => {
        setTimeout(updateNavPill, 100);
    });
}


/* ============================================================
   SECTIONS
   ============================================================ */

/* ============================================
   SECTION HELPER
   - Toggle "Baca Selengkapnya" (collapsible)
   - Auto count jurusan & ekskul di section-note
   ============================================ */

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-toggle-text');
    if (!btn) return;

    const wrapper = btn.parentElement;
    const textEl = wrapper.querySelector('.collapsible-text');
    if (!textEl) return;

    const expanded = textEl.classList.toggle('expanded');
    btn.innerHTML = expanded
        ? 'Tutup <i class="fas fa-chevron-up"></i>'
        : 'Baca Selengkapnya <i class="fas fa-chevron-down"></i>';
});

function setupAutoCount() {
    const jurusanCards = document.querySelectorAll('.section-jurusan .jurusan-card');
    const ekskulCards   = document.querySelectorAll('.section-ekskul .jurusan-card');

    const countJurusanEl = document.getElementById('count-jurusan');
    const countEkskulEl  = document.getElementById('count-ekskul');

    if (countJurusanEl) countJurusanEl.textContent = jurusanCards.length;
    if (countEkskulEl)  countEkskulEl.textContent  = ekskulCards.length;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoCount);
} else {
    setupAutoCount();
}


/* ============================================================
   PAGES
   ============================================================ */

/* ============================================
   DETAIL JURUSAN & EKSKUL — PAGE OVERLAY
   ============================================ */

const detailOverlay = document.getElementById('detail-overlay');
const detailOverlayContent = document.getElementById('detail-overlay-content');

/* ------------------------------------------
   BUKA OVERLAY
   ------------------------------------------ */
function openDetailOverlay(htmlContent) {
    detailOverlayContent.innerHTML = htmlContent;
    detailOverlay.classList.add('is-open');
    detailOverlay.scrollTop = 0;
    document.body.style.overflow = 'hidden';
}

/* ------------------------------------------
   TUTUP OVERLAY
   ------------------------------------------ */
function closeDetailOverlay() {
    detailOverlay.classList.remove('is-open');
    document.body.style.overflow = '';

    setTimeout(() => {
        if (!detailOverlay.classList.contains('is-open')) {
            detailOverlayContent.innerHTML = '';
        }
    }, 350);
}
window.goBackToBeranda = closeDetailOverlay;

/* ------------------------------------------
   ESC UNTUK TUTUP
   ------------------------------------------ */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailOverlay.classList.contains('is-open')) {
        closeDetailOverlay();
    }
});

/* ------------------------------------------
   AUTO-CLOSE KALAU NAV DIKLIK
   ------------------------------------------ */
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (detailOverlay.classList.contains('is-open')) {
            closeDetailOverlay();
        }
    });
});

/* ------------------------------------------
   RENDER GALERI FOTO 3 KOLOM
   ------------------------------------------ */
function renderGaleriFotos(photos, fallbackName) {
    if (!photos || !photos.length) return '';

    return `
        <h2><i class="fas fa-images"></i> Galeri Kegiatan</h2>
        <div class="detail-galeri-grid">
            ${photos.map(p => `
                <figure class="detail-galeri-item">
                    <img src="${p.src}" alt="${p.tag || fallbackName}" loading="lazy">
                    ${p.tag ? `<figcaption class="detail-galeri-tag">${p.tag}</figcaption>` : ''}
                </figure>
            `).join('')}
        </div>
    `;
}

/* ------------------------------------------
   RENDER DETAIL JURUSAN
   ------------------------------------------ */
function renderJurusanDetail(jurusanId) {
    const data = window.JURUSAN_DATA.find(item => item.id === jurusanId);
    if (!data) return;

    let photos = data.photos || [];
    if (!photos.length && window.AKADEMIK_DATA) {
        const akad = window.AKADEMIK_DATA.find(a => a.id === jurusanId);
        if (akad && akad.photos) photos = akad.photos;
    }

    const html = `
        <div class="detail-jurusan-wrapper">
            <button class="btn-back" onclick="goBackToBeranda()">
                <i class="fas fa-arrow-left"></i> Kembali
            </button>

            <div class="detail-hero">
                <div class="detail-hero-media">
                    <span class="badge-jurusan">${data.badge || 'Program Keahlian'}</span>
                    <img src="${data.image}" alt="${data.name}" class="detail-hero-img">
                </div>
                <div class="detail-hero-content">
                    <h1>${data.name}</h1>
                    <p class="detail-hero-desc">${data.fullDesc || data.shortDesc || data.description || ''}</p>
                </div>
            </div>

            <div class="detail-content">
                <h2><i class="fas fa-book-open"></i> Materi Utama yang Dipelajari</h2>
                <div class="kegiatan-grid">
                    ${(data.materi || []).map((item, i) => `
                        <div class="kegiatan-card">
                            <span class="kegiatan-num">${String(i + 1).padStart(2, '0')}</span>
                            <p>${item}</p>
                        </div>
                    `).join('')}
                </div>

                <h2><i class="fas fa-briefcase"></i> Prospek Kerja Alumni</h2>
                <div class="kegiatan-grid">
                    ${(data.prospekKerja || data.prospek || []).map((item, i) => `
                        <div class="kegiatan-card">
                            <span class="kegiatan-num">${String(i + 1).padStart(2, '0')}</span>
                            <p>${item}</p>
                        </div>
                    `).join('')}
                </div>

                ${renderGaleriFotos(photos, data.name)}
            </div>
        </div>
    `;

    openDetailOverlay(html);
}

/* ------------------------------------------
   RENDER DETAIL EKSKUL
   ------------------------------------------ */
function renderEkskulDetail(ekskulId) {
    const data = window.EKSKUL_DATA.find(item => item.id === ekskulId);
    if (!data) return;

    let photos = data.photos || [];
    if (!photos.length && window.EKSKUL_DETAIL_DATA) {
        const eks = window.EKSKUL_DETAIL_DATA.find(a => a.id === ekskulId);
        if (eks && eks.photos) photos = eks.photos;
    }

    const html = `
        <div class="detail-jurusan-wrapper">
            <button class="btn-back" onclick="goBackToBeranda()">
                <i class="fas fa-arrow-left"></i> Kembali
            </button>

            <div class="detail-hero">
                <div class="detail-hero-media">
                    <span class="badge-jurusan">${data.badge || 'Ekstrakurikuler'}</span>
                    <img src="${data.image}" alt="${data.name}" class="detail-hero-img">
                </div>
                <div class="detail-hero-content">
                    <h1>${data.name}</h1>
                    <p class="detail-hero-desc">${data.fullDesc || data.shortDesc || data.description || ''}</p>

                    <div class="detail-hero-meta">
                        <div class="meta-chip">
                            <i class="far fa-clock"></i>
                            <div class="meta-chip-text">
                                <span class="meta-label">Jadwal Latihan</span>
                                <span class="meta-value">${data.jadwal || 'Akan diinfokan'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="detail-content">
                <h2><i class="fas fa-list-check"></i> Kegiatan Utama</h2>
                <div class="kegiatan-grid">
                    ${(data.kegiatan || []).map((item, i) => `
                        <div class="kegiatan-card">
                            <span class="kegiatan-num">${String(i + 1).padStart(2, '0')}</span>
                            <p>${item}</p>
                        </div>
                    `).join('')}
                </div>

                ${renderGaleriFotos(photos, data.name)}
            </div>
        </div>
    `;

    openDetailOverlay(html);
}

/* ------------------------------------------
   EVENT LISTENER GLOBAL
   ------------------------------------------ */
document.addEventListener('click', function(e) {
    const btnJurusan = e.target.closest('.btn-detail');
    if (btnJurusan) {
        e.preventDefault();
        renderJurusanDetail(btnJurusan.getAttribute('data-jurusan'));
        return;
    }

    const btnEkskul = e.target.closest('.btn-ekskul-detail');
    if (btnEkskul) {
        e.preventDefault();
        renderEkskulDetail(btnEkskul.getAttribute('data-ekskul'));
        return;
    }
});


/* ============================================================
   PRESTASI
   ============================================================ */

/* ============================================
   PRESTASI — Toggle "Lihat Selengkapnya"
   Klik tombol -> buka 3 card tambahan (smooth).
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-prestasi-toggle');
    const extra = document.getElementById('prestasi-extra');
    if (!btn || !extra) return;

    btn.addEventListener('click', () => {
        const isOpen = extra.classList.toggle('is-open');
        btn.classList.toggle('is-open', isOpen);

        btn.innerHTML = isOpen
            ? 'Tutup <i class="fas fa-chevron-up"></i>'
            : 'Lihat Selengkapnya <i class="fas fa-chevron-down"></i>';
    });
});


/* ============================================================
   PROFIL
   ============================================================ */

/* ============================================
   PROFIL — Render Guru & Kepala Sekolah
   ============================================ */

function handleFotoGuruError(imgEl) {
    const icon = document.createElement('i');
    icon.className = 'fas fa-user-circle feature-icon';
    imgEl.replaceWith(icon);
}
window.handleFotoGuruError = handleFotoGuruError;

function renderGuruCards() {
    const guruGrid = document.getElementById('guru-grid');
    const kepsekContainer = document.getElementById('kepsek-container');
    if (!guruGrid || !window.GURU_DATA) return;

    const kepsekList = window.GURU_DATA.filter(g =>
        (g.jabatan || '').toLowerCase().includes('kepala sekolah')
    );
    const guruLain = window.GURU_DATA.filter(g =>
        !(g.jabatan || '').toLowerCase().includes('kepala sekolah')
    );

    if (kepsekContainer) {
        kepsekContainer.innerHTML = kepsekList.map(g => `
            <div class="feature-card feature-card--kepsek">
                <img src="${g.foto}" alt="${g.nama}" class="feature-photo" onerror="handleFotoGuruError(this)">
                <h3>${g.nama}${g.gelar ? ', ' + g.gelar : ''}</h3>
                <span class="guru-jabatan">${g.jabatan || ''}</span>
                <p>${g.keterangan || ''}</p>
            </div>
        `).join('');
    }

    guruGrid.innerHTML = guruLain.map(g => `
        <div class="feature-card">
            <img src="${g.foto}" alt="${g.nama}" class="feature-photo" onerror="handleFotoGuruError(this)">
            <h3>${g.nama}${g.gelar ? ', ' + g.gelar : ''}</h3>
            <span class="guru-jabatan">${g.jabatan || ''}</span>
            <p>${g.keterangan || ''}</p>
        </div>
    `).join('');
}

renderGuruCards();


/* ============================================================
   BERITA
   ============================================================ */

/* ============================================
   BERITA TERKINI
   - Render kartu dari window.BERITA_DATA
   - Toggle "Baca Selengkapnya"
   - Navigasi carousel prev/next
   ============================================ */

function renderBeritaCards() {
    const track = document.getElementById('berita-track');
    const template = document.getElementById('berita-card-template');
    if (!track || !template || !window.BERITA_DATA) return;

    track.innerHTML = '';

    window.BERITA_DATA.forEach(b => {
        const node = template.content.cloneNode(true);

        const img = node.querySelector('.berita-banner');
        img.src = b.image;
        img.alt = b.title;

        node.querySelector('.berita-date-text').textContent = b.date;
        node.querySelector('.berita-title').textContent = b.title;

        const contentInner = node.querySelector('.berita-full-content-inner');
        if (contentInner) {
            const contentArr = b.content && b.content.length
                ? b.content
                : [b.shortDesc || 'Konten berita belum tersedia.'];
            contentInner.innerHTML = contentArr.map(p => `<p>${p}</p>`).join('');
        }

        const btn = node.querySelector('.berita-readmore');
        if (btn) btn.setAttribute('data-berita-id', b.id);

        track.appendChild(node);
    });

    setupBeritaNav();
    setupBeritaToggle();

    if (typeof window.reinitAnimations === 'function') {
        window.reinitAnimations();
    }
}

function setupBeritaToggle() {
    const track = document.getElementById('berita-track');
    if (!track || track.dataset.toggleReady === 'true') return;

    track.dataset.toggleReady = 'true';

    track.addEventListener('click', (e) => {
        const btn = e.target.closest('.berita-readmore');
        if (!btn) return;

        e.preventDefault();

        const card = btn.closest('.berita-card');
        if (!card) return;

        const isExpanded = card.classList.toggle('is-expanded');

        btn.innerHTML = isExpanded
            ? 'Tutup <span class="arrow">&uarr;</span>'
            : 'Baca Selengkapnya <span class="arrow">&rarr;</span>';

        const wrapper = document.querySelector('.berita-track-wrapper');
        const prevBtn = document.querySelector('.berita-nav-prev');
        const nextBtn = document.querySelector('.berita-nav-next');
        if (wrapper && prevBtn && nextBtn) {
            const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
            prevBtn.disabled = wrapper.scrollLeft <= 4;
            nextBtn.disabled = wrapper.scrollLeft >= maxScroll - 4;
        }
    });
}

function setupBeritaNav() {
    const wrapper = document.querySelector('.berita-track-wrapper');
    const prevBtn = document.querySelector('.berita-nav-prev');
    const nextBtn = document.querySelector('.berita-nav-next');
    if (!wrapper || !prevBtn || !nextBtn) return;

    const step = () => {
        const card = wrapper.querySelector('.berita-card');
        if (!card) return wrapper.clientWidth;
        const track = wrapper.querySelector('.berita-track');
        const gap = parseFloat(getComputedStyle(track).gap) || 24;
        return card.offsetWidth + gap;
    };

    const updateBtns = () => {
        const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
        prevBtn.disabled = wrapper.scrollLeft <= 4;
        nextBtn.disabled = wrapper.scrollLeft >= maxScroll - 4;
    };

    prevBtn.addEventListener('click', () => {
        wrapper.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
        wrapper.scrollBy({ left: step(), behavior: 'smooth' });
    });

    wrapper.addEventListener('scroll', updateBtns, { passive: true });
    window.addEventListener('resize', updateBtns);
    updateBtns();
}

renderBeritaCards();


/* ============================================================
   AKADEMIK
   ============================================================ */

/* ============================================
   AKADEMIK — Render Slider Card Jurusan & Ekskul
   Card di-render dari JURUSAN_DATA & EKSKUL_DATA.
   ============================================ */

/* ------------------------------------------
   TEMPLATE CARD
   ------------------------------------------ */
function buatCardJurusan(data) {
    const nama = data.name || data.nama || '';
    const desc = data.shortDesc || data.description || '';

    return `
        <div class="jurusan-card">
            <img src="${data.image}" alt="${nama}" class="jurusan-banner">
            <div class="jurusan-body">
                <h3>${nama}</h3>
                <p>${desc}</p>
                <button class="btn-readmore btn-detail" data-jurusan="${data.id}">
                    Selengkapnya &rarr;
                </button>
            </div>
        </div>
    `;
}

function buatCardEkskul(data) {
    const nama = data.name || data.nama || '';
    const desc = data.shortDesc || data.description || '';

    return `
        <div class="jurusan-card">
            <img src="${data.image}" alt="${nama}" class="jurusan-banner">
            <div class="jurusan-body">
                <h3>${nama}</h3>
                <p>${desc}</p>
                <button class="btn-readmore btn-ekskul-detail" data-ekskul="${data.id}">
                    Selengkapnya &rarr;
                </button>
            </div>
        </div>
    `;
}

/* ------------------------------------------
   RENDER JURUSAN SLIDER
   ------------------------------------------ */
function renderJurusanSlider() {
    const slider = document.getElementById('jurusan-slider');
    if (!slider || !window.JURUSAN_DATA) return;

    slider.innerHTML = window.JURUSAN_DATA
        .filter(item => !item.hide)
        .map(buatCardJurusan)
        .join('');
}

/* ------------------------------------------
   RENDER EKSKUL SLIDER
   ------------------------------------------ */
function renderEkskulSlider() {
    const slider = document.getElementById('ekskul-slider');
    if (!slider || !window.EKSKUL_DATA) return;

    slider.innerHTML = window.EKSKUL_DATA
        .filter(item => !item.hide)
        .map(buatCardEkskul)
        .join('');
}

/* ------------------------------------------
   INIT
   ------------------------------------------ */
renderJurusanSlider();
renderEkskulSlider();


/* ============================================================
   ULASAN
   ============================================================ */

/* ============================================
   ULASAN & TESTIMONI
   - Render daftar ulasan
   - Overall rating
   - Input rating bintang
   - Form submit
   ============================================ */

let ratingTerpilih = 0;

function formatTanggalUlasan(isoDate) {
    try {
        const d = new Date(isoDate);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(d);
    } catch (e) {
        return isoDate;
    }
}

function getInisial(nama) {
    return nama
        .split(' ')
        .slice(0, 2)
        .map(w => w.charAt(0).toUpperCase())
        .join('');
}

function buatBintangHTML(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            html += '<i class="fas fa-star"></i>';
        } else {
            html += '<i class="fas fa-star empty"></i>';
        }
    }
    return html;
}

function renderUlasan() {
    const listEl = document.getElementById('ulasan-list');
    const template = document.getElementById('ulasan-card-template');
    if (!listEl || !template || !window.ULASAN_DATA) return;

    const sorted = [...window.ULASAN_DATA].sort(
        (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
    );

    listEl.innerHTML = '';

    if (sorted.length === 0) {
        listEl.innerHTML = '<div class="ulasan-empty">Belum ada ulasan. Jadilah yang pertama! ✨</div>';
    } else {
        sorted.forEach(u => {
            const node = template.content.cloneNode(true);

            node.querySelector('.ulasan-avatar').textContent = getInisial(u.nama);
            node.querySelector('.ulasan-nama').textContent = u.nama;
            node.querySelector('.ulasan-email').textContent = u.email;
            node.querySelector('.ulasan-stars').innerHTML = buatBintangHTML(u.rating);
            node.querySelector('.ulasan-pesan').textContent = u.pesan;
            node.querySelector('.ulasan-date-text').textContent = formatTanggalUlasan(u.tanggal);

            listEl.appendChild(node);
        });
    }

    updateOverallRating();

    if (typeof window.reinitAnimations === 'function') {
        window.reinitAnimations();
    }
}

function updateOverallRating() {
    const numberEl = document.getElementById('overall-number');
    const starsEl = document.getElementById('overall-stars');
    const totalEl = document.getElementById('overall-total');
    if (!numberEl || !starsEl || !totalEl) return;

    const total = window.ULASAN_DATA.length;

    if (total === 0) {
        numberEl.textContent = '0.0';
        starsEl.innerHTML = buatBintangHTML(0);
        totalEl.textContent = 'Belum ada ulasan';
        return;
    }

    const sum = window.ULASAN_DATA.reduce((acc, u) => acc + (u.rating || 0), 0);
    const avg = sum / total;
    const roundedAvg = Math.round(avg);

    numberEl.textContent = avg.toFixed(1);
    starsEl.innerHTML = buatBintangHTML(roundedAvg);
    totalEl.textContent = `Berdasarkan ${total} ulasan`;
}

function setupRatingInput() {
    const ratingInput = document.getElementById('rating-input');
    const hint = document.getElementById('rating-hint');
    if (!ratingInput) return;

    const stars = ratingInput.querySelectorAll('i');

    const paint = (max) => {
        stars.forEach(s => {
            const val = parseInt(s.getAttribute('data-value'), 10);
            if (val <= max) {
                s.classList.remove('far');
                s.classList.add('fas', 'active');
            } else {
                s.classList.remove('fas', 'active');
                s.classList.add('far');
            }
        });
    };

    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.getAttribute('data-value'), 10);
            paint(val);
        });

        star.addEventListener('click', () => {
            ratingTerpilih = parseInt(star.getAttribute('data-value'), 10);
            paint(ratingTerpilih);
            if (hint) hint.textContent = `Kamu memberi ${ratingTerpilih} bintang ⭐`;
        });
    });

    ratingInput.addEventListener('mouseleave', () => {
        paint(ratingTerpilih);
    });
}

function setupUlasanForm() {
    const form = document.getElementById('ulasan-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nama = document.getElementById('ulasan-nama').value.trim();
        const email = document.getElementById('ulasan-email').value.trim();
        const pesan = document.getElementById('ulasan-pesan').value.trim();

        if (!nama || !email || !pesan) {
            alert('Mohon isi semua kolom ya!');
            return;
        }

        if (ratingTerpilih === 0) {
            alert('Jangan lupa kasih rating bintang dulu ya! ⭐');
            return;
        }

        window.ULASAN_DATA.push({
            nama: nama,
            email: email,
            rating: ratingTerpilih,
            pesan: pesan,
            tanggal: new Date().toISOString().split('T')[0]
        });

        form.reset();
        ratingTerpilih = 0;

        const ratingInput = document.getElementById('rating-input');
        if (ratingInput) {
            ratingInput.querySelectorAll('i').forEach(s => {
                s.classList.remove('fas', 'active');
                s.classList.add('far');
            });
        }
        const hint = document.getElementById('rating-hint');
        if (hint) hint.textContent = 'Klik bintang untuk memberi rating';

        renderUlasan();
    });
}

renderUlasan();
setupRatingInput();
setupUlasanForm();


/* ============================================================
   DAFTAR
   ============================================================ */

/* ============================================
   MODAL PENDAFTARAN (PPDB)
   - Buka/tutup modal
   - Submit form
   - Tampilkan halaman sukses
   ============================================ */

function setupDaftarModal() {
    const overlay = document.getElementById('daftar-modal-overlay');
    const daftarBtn = document.getElementById('daftar-btn');
    const closeBtn = document.getElementById('daftar-modal-close');
    const successClose = document.getElementById('btn-success-close');
    const form = document.getElementById('daftar-form');
    const formWrapper = document.getElementById('daftar-form-wrapper');
    const successWrapper = document.getElementById('daftar-success-wrapper');
    const successNama = document.getElementById('daftar-success-nama');

    if (!overlay || !daftarBtn) return;

    function openModal() {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (window.lenis) window.lenis.stop();

        if (formWrapper) formWrapper.style.display = '';
        if (successWrapper) successWrapper.style.display = 'none';
        if (form) form.reset();

        setTimeout(() => {
            const firstInput = document.getElementById('daftar-nama');
            if (firstInput) firstInput.focus();
        }, 350);
    }

    function closeModal() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';

        if (window.lenis) window.lenis.start();
    }

    daftarBtn.addEventListener('click', openModal);

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (successClose) successClose.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeModal();
        }
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nama = document.getElementById('daftar-nama').value.trim();
            const email = document.getElementById('daftar-email').value.trim();
            const wa = document.getElementById('daftar-wa').value.trim();
            const jurusan = document.getElementById('daftar-jurusan').value;
            const pesan = document.getElementById('daftar-pesan').value.trim();

            if (!nama || !email || !wa || !jurusan) {
                alert('Mohon lengkapi semua kolom bertanda * ya!');
                return;
            }

            window.PENDAFTARAN_DATA.push({
                nama, email, wa, jurusan, pesan,
                tanggal: new Date().toISOString()
            });

            console.log('📝 Pendaftaran baru:', { nama, email, wa, jurusan, pesan });
            console.log('📊 Total pendaftar:', window.PENDAFTARAN_DATA.length);

            if (successNama) successNama.textContent = nama;
            if (formWrapper) formWrapper.style.display = 'none';
            if (successWrapper) successWrapper.style.display = '';
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDaftarModal);
} else {
    setupDaftarModal();
}
