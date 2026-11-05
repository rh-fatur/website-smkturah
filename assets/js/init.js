/* ============================================================
   INIT
   Sembunyikan halaman sampai semuanya siap (CSS, font, gambar awal),
   lalu tampilkan sekaligus setelah jeda singkat.
   Kalau file ini gagal dimuat, kelas "is-loading" tidak pernah dipasang,
   jadi halaman tetap tampil normal.
   ============================================================ */

(function () {
    'use strict';

    var DELAY    = 450;   // jeda (ms) setelah semuanya siap, sebelum halaman tampil
    var MAX_WAIT = 5000;  // batas maksimal (ms) menunggu, supaya tidak nyangkut

    var root = document.documentElement;
    var revealed = false;

    root.classList.add('is-loading');

    function reveal() {
        if (revealed) return;
        revealed = true;
        root.classList.remove('is-loading');
        root.classList.add('is-ready');
    }

    var pageLoaded = new Promise(function (resolve) {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve, { once: true });
    });

    var fontsReady = (document.fonts && document.fonts.ready)
        ? document.fonts.ready
        : Promise.resolve();

    Promise.all([pageLoaded, fontsReady])
        .catch(function () {})
        .then(function () { setTimeout(reveal, DELAY); });

    setTimeout(reveal, MAX_WAIT);
})();
