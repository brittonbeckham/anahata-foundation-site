// Anahata Foundation — site behavior
// Nav drawer, email-banner, parallax, carousels.

(function () {
  'use strict';

  // ---- Nav drawer ----
  function initNav() {
    var nav = document.querySelector('[data-nav]');
    if (!nav) return;
    var toggle = nav.querySelector('[data-nav-toggle]');
    var links = nav.querySelector('[data-nav-links]');
    var bars = nav.querySelectorAll('.nav-toggle-bar');
    var closers = nav.querySelectorAll('[data-nav-close]');
    var open = false;

    function setOpen(v) {
      open = v;
      if (v) {
        nav.classList.add('is-open');
        links.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
        bars[0] && bars[0].classList.add('a');
        bars[1] && bars[1].classList.add('b');
        document.body.style.overflow = 'hidden';
      } else {
        nav.classList.remove('is-open');
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        bars[0] && bars[0].classList.remove('a');
        bars[1] && bars[1].classList.remove('b');
        document.body.style.overflow = '';
      }
    }

    toggle.addEventListener('click', function () { setOpen(!open); });
    closers.forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  // ---- Email banner ----
  function initEmailBanner() {
    var form = document.querySelector('[data-email-form]');
    if (!form) return;
    var input = form.querySelector('[data-email-input]');
    var submit = form.querySelector('[data-email-submit]');
    var thanks = document.querySelector('[data-email-thanks]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      if (!v || !/.+@.+\..+/.test(v)) return;
      submit.disabled = true;
      submit.textContent = 'Sending…';
      try {
        var list = JSON.parse(localStorage.getItem('anahata.followers') || '[]');
        list.push({ email: v, ts: Date.now() });
        localStorage.setItem('anahata.followers', JSON.stringify(list));
      } catch (_) {}
      setTimeout(function () {
        form.hidden = true;
        if (thanks) thanks.hidden = false;
      }, 350);
    });
  }

  // ---- Parallax ----
  function initParallax() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var rafPending = false;
    function update() {
      rafPending = false;
      var vh = window.innerHeight;
      var hero = document.querySelector('.hero-img');
      if (hero && hero.parentElement) {
        var rect = hero.parentElement.getBoundingClientRect();
        var progress = -rect.top / (rect.height || 1);
        var y = Math.max(-80, Math.min(80, progress * 90));
        hero.style.transform = 'translate3d(0,' + y + 'px,0) scale(1.08)';
      }
      document.querySelectorAll('.bleed-image').forEach(function (el) {
        var img = el.querySelector('img');
        if (!img) return;
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var p = (vh - rect.top) / (vh + rect.height);
        var y = (p - 0.5) * 120;
        img.style.transform = 'translate3d(0,' + y + 'px,0)';
      });
      var ch = document.querySelector('.closing-hero-img');
      if (ch && ch.parentElement) {
        var pr = ch.parentElement.getBoundingClientRect();
        if (pr.bottom > 0 && pr.top < vh) {
          var p2 = (vh - pr.top) / (vh + pr.height);
          var y2 = (p2 - 0.5) * 90;
          ch.style.transform = 'translate3d(0,' + y2 + 'px,0)';
        }
      }
    }
    function onScroll() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', update);
    setTimeout(update, 100);
  }

  // ---- Land carousel ----
  function initLandCarousel() {
    var root = document.querySelector('[data-land-carousel]');
    if (!root) return;
    var track = root.querySelector('[data-land-track]');
    var slides = Array.prototype.slice.call(track.children);
    var dots = root.querySelectorAll('[data-land-dot]');
    var captionEl = root.querySelector('[data-land-caption]');
    var currentEl = root.querySelector('[data-land-current]');
    var totalEl = root.querySelector('[data-land-total]');
    var prevBtn = root.querySelector('[data-land-prev]');
    var nextBtn = root.querySelector('[data-land-next]');

    var idx = 0;
    var total = slides.length;
    if (totalEl) totalEl.textContent = String(total).padStart(2, '0');

    function pad(n) { return String(n).padStart(2, '0'); }
    function go(n) {
      idx = ((n % total) + total) % total;
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === idx);
        s.setAttribute('aria-hidden', i !== idx);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
        d.setAttribute('aria-selected', i === idx);
      });
      var slide = slides[idx];
      if (slide) {
        track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
      }
      if (captionEl) captionEl.textContent = slide.dataset.caption || '';
      if (currentEl) currentEl.textContent = pad(idx + 1);
    }

    prevBtn && prevBtn.addEventListener('click', function () { go(idx - 1); });
    nextBtn && nextBtn.addEventListener('click', function () { go(idx + 1); });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { go(i); });
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
    });

    go(0);
  }

  // ---- Installations carousel ----
  function initInstallationsCarousel() {
    var root = document.querySelector('[data-installations-carousel]');
    if (!root) return;
    var dataEl = root.querySelector('[data-installations-data]');
    if (!dataEl) return;
    var INSTALLATIONS;
    try { INSTALLATIONS = JSON.parse(dataEl.textContent); } catch (_) { return; }
    var total = INSTALLATIONS.length;

    var catEl = root.querySelector('[data-ic-cat]');
    var sizeEl = root.querySelector('[data-ic-size]');
    var nameEl = root.querySelector('[data-ic-name]');
    var bodyEl = root.querySelector('[data-ic-body]');
    var figureEl = root.querySelector('[data-ic-figure]');
    var imgEl = root.querySelector('[data-ic-img]');
    var capEl = root.querySelector('[data-ic-figcaption]');
    var prevBtn = root.querySelector('[data-ic-prev]');
    var nextBtn = root.querySelector('[data-ic-next]');
    var currentEl = root.querySelector('[data-ic-current]');
    var totalEl = root.querySelector('[data-ic-total]');
    var dotWrap = root.querySelector('[data-ic-dots]');

    if (totalEl) totalEl.textContent = String(total).padStart(2, '0');

    // Build group dots
    var groups = [];
    var cur = null;
    INSTALLATIONS.forEach(function (it, i) {
      if (!cur || cur.cat !== it.category) {
        cur = { cat: it.category, indices: [i] };
        groups.push(cur);
      } else {
        cur.indices.push(i);
      }
    });
    if (dotWrap) {
      groups.forEach(function (g) {
        var grp = document.createElement('div');
        grp.className = 'ic-group';
        var lbl = document.createElement('div');
        lbl.className = 'ic-group-label';
        lbl.textContent = g.cat;
        var dots = document.createElement('div');
        dots.className = 'ic-dots';
        g.indices.forEach(function (i) {
          var b = document.createElement('button');
          b.className = 'ic-dot';
          b.setAttribute('role', 'tab');
          b.setAttribute('aria-label', 'Go to ' + INSTALLATIONS[i].name);
          b.title = INSTALLATIONS[i].name;
          b.dataset.i = i;
          b.addEventListener('click', function () { go(i); });
          dots.appendChild(b);
        });
        grp.appendChild(lbl);
        grp.appendChild(dots);
        dotWrap.appendChild(grp);
      });
    }

    var idx = 0;

    function setFigureState(state) {
      if (!figureEl) return;
      figureEl.classList.remove('ic-figure-loading', 'ic-figure-loaded', 'ic-figure-error');
      figureEl.classList.add('ic-figure-' + state);
      if (imgEl) imgEl.style.display = state === 'loaded' ? 'block' : 'none';
    }

    function go(n) {
      idx = ((n % total) + total) % total;
      var item = INSTALLATIONS[idx];
      if (catEl) catEl.textContent = item.category;
      if (sizeEl) sizeEl.textContent = item.size;
      if (nameEl) nameEl.textContent = item.name;
      if (bodyEl) bodyEl.textContent = item.body;
      if (capEl) capEl.textContent = item.name;
      setFigureState('loading');
      if (imgEl) {
        imgEl.alt = '';
        imgEl.src = item.image;
      }
      if (currentEl) currentEl.textContent = String(idx + 1).padStart(2, '0');
      var allDots = root.querySelectorAll('.ic-dot');
      allDots.forEach(function (d) {
        var di = parseInt(d.dataset.i, 10);
        d.classList.toggle('is-active', di === idx);
        d.setAttribute('aria-selected', di === idx);
      });
    }

    if (imgEl) {
      imgEl.addEventListener('load', function () { setFigureState('loaded'); });
      imgEl.addEventListener('error', function () { setFigureState('error'); });
    }
    prevBtn && prevBtn.addEventListener('click', function () { go(idx - 1); });
    nextBtn && nextBtn.addEventListener('click', function () { go(idx + 1); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
    });
    go(0);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initNav();
    initEmailBanner();
    initParallax();
    initLandCarousel();
    initInstallationsCarousel();
  });
})();
