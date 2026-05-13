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
        bars[1] && bars[1].classList.add('fade');
        bars[2] && bars[2].classList.add('b');
        document.body.style.overflow = 'hidden';
      } else {
        nav.classList.remove('is-open');
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        bars[0] && bars[0].classList.remove('a');
        bars[1] && bars[1].classList.remove('fade');
        bars[2] && bars[2].classList.remove('b');
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
      document.querySelectorAll('.bleed-image:not(.bleed-image-fixed)').forEach(function (el) {
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

  // ---- Photo carousel ----
  // Markup is just <div class="photo-carousel" data-photo-carousel> containing
  // <img alt="..."> elements. JS builds all the chrome (track/figures,
  // arrows, dots, meta), reads each img's alt attribute as its caption.
  function initPhotoCarousels() {
    var roots = document.querySelectorAll('[data-photo-carousel]');
    roots.forEach(buildPhotoCarousel);
  }

  function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function pad2(n) { return String(n).padStart(2, '0'); }

  function buildPhotoCarousel(root) {
    if (root.dataset.photoInit === 'true') return;
    var imgs = Array.prototype.slice.call(root.querySelectorAll(':scope > img, :scope > figure > img'));
    if (!imgs.length) return;

    var slides = imgs.map(function (img) {
      return {
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || ''
      };
    });
    var total = slides.length;

    var html = '';
    html += '<div class="photo-carousel-frame">';
    html += '<div class="photo-carousel-track" data-photo-track>';
    slides.forEach(function (s, i) {
      var loading = i === 0 ? 'eager' : 'lazy';
      html += '<figure class="photo-slide" data-caption="' + escAttr(s.alt) + '">' +
                '<img src="' + escAttr(s.src) + '" alt="' + escAttr(s.alt) + '" loading="' + loading + '" />' +
              '</figure>';
    });
    html += '</div>';
    html += '<button class="photo-arrow photo-arrow-prev" type="button" aria-label="Previous photo" data-photo-prev>' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18 L9 12 L15 6"/></svg>' +
            '</button>';
    html += '<button class="photo-arrow photo-arrow-next" type="button" aria-label="Next photo" data-photo-next>' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 L15 12 L9 18"/></svg>' +
            '</button>';
    html += '</div>';
    html += '<div class="photo-carousel-meta">' +
              '<div class="photo-caption" data-photo-caption></div>' +
              '<div class="photo-counter">' +
                '<span class="photo-counter-current" data-photo-current>01</span>' +
                '<span class="photo-counter-sep"> / </span>' +
                '<span class="photo-counter-total" data-photo-total>' + pad2(total) + '</span>' +
              '</div>' +
            '</div>';
    html += '<div class="photo-dots" role="tablist" aria-label="Photo selector">';
    slides.forEach(function (s, i) {
      html += '<button class="photo-dot" type="button" role="tab" aria-label="Go to photo ' + (i + 1) + '" data-photo-dot></button>';
    });
    html += '</div>';

    root.innerHTML = html;
    if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '0');
    if (!root.hasAttribute('aria-roledescription')) root.setAttribute('aria-roledescription', 'carousel');
    root.dataset.photoInit = 'true';

    wirePhotoCarousel(root);
  }

  function wirePhotoCarousel(root) {
    var track = root.querySelector('[data-photo-track]');
    if (!track) return;
    var figures = Array.prototype.slice.call(track.children);
    var dots = root.querySelectorAll('[data-photo-dot]');
    var captionEl = root.querySelector('[data-photo-caption]');
    var currentEl = root.querySelector('[data-photo-current]');
    var prevBtn = root.querySelector('[data-photo-prev]');
    var nextBtn = root.querySelector('[data-photo-next]');

    var idx = 0;
    var total = figures.length;

    function go(n) {
      idx = ((n % total) + total) % total;
      figures.forEach(function (s, i) {
        s.classList.toggle('is-active', i === idx);
        s.setAttribute('aria-hidden', i !== idx);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
        d.setAttribute('aria-selected', i === idx);
      });
      var slide = figures[idx];
      if (slide) {
        track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
      }
      if (captionEl) captionEl.textContent = slide.dataset.caption || '';
      if (currentEl) currentEl.textContent = pad2(idx + 1);
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

    // Drag-to-follow swipe — track follows the pointer in real time
    // during the gesture; on release, snap to the nearest slide.
    var isDragging = false;
    var dragStartX = 0;
    var dragStartScroll = 0;
    var dragMoved = false;
    var DRAG_THRESHOLD = 4;

    track.addEventListener('dragstart', function (e) { e.preventDefault(); });

    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartScroll = track.scrollLeft;
      try { track.setPointerCapture(e.pointerId); } catch (_) {}
    });

    track.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      if (!dragMoved && Math.abs(dx) > DRAG_THRESHOLD) {
        dragMoved = true;
        track.classList.add('is-dragging');
      }
      if (dragMoved) {
        if (e.cancelable) e.preventDefault();
        track.scrollLeft = dragStartScroll - dx;
      }
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('is-dragging');
      try { track.releasePointerCapture(e.pointerId); } catch (_) {}
      if (!dragMoved) return;
      // Match the installations carousel sensitivity: any drag past ~15%
      // of a slide width counts as an advance. Long drags can skip
      // multiple slides at once.
      var slideWidth = figures[0] ? figures[0].offsetWidth : track.offsetWidth;
      var dx = track.scrollLeft - dragStartScroll;
      var ratio = dx / slideWidth;
      var THRESHOLD = 0.15;
      var step = 0;
      if (Math.abs(ratio) >= THRESHOLD) {
        var dir = ratio > 0 ? 1 : -1;
        step = dir * Math.max(1, Math.round(Math.abs(ratio)));
      }
      go(idx + step);
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    // Suppress click events fired immediately after a drag (so accidental
    // taps on the image don't get reinterpreted).
    track.addEventListener('click', function (e) {
      if (dragMoved) {
        e.preventDefault();
        e.stopPropagation();
        dragMoved = false;
      }
    }, true);

    go(0);
  }

  // ---- Installations carousel ----
  // Peek-style carousel: cards in a flex track, active card centered
  // in the viewport via translateX. Drag/swipe updates the translate
  // directly so motion is visible during the gesture; on release the
  // track animates to the nearest card.
  function initInstallationsCarousel() {
    var root = document.querySelector('[data-installations-carousel]');
    if (!root) return;
    var dataEl = root.querySelector('[data-installations-data]');
    if (!dataEl) return;
    var INSTALLATIONS;
    try { INSTALLATIONS = JSON.parse(dataEl.textContent); } catch (_) { return; }

    var viewport = root.querySelector('[data-ic-viewport]');
    var track = root.querySelector('[data-ic-track]');
    var dotWrap = root.querySelector('[data-ic-dots]');
    if (!viewport || !track) return;

    function escAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
    function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    // Render cards
    INSTALLATIONS.forEach(function (it, i) {
      var card = document.createElement('li');
      card.className = 'ic-card';
      card.setAttribute('data-i', i);
      card.innerHTML =
        '<figure class="ic-figure ic-figure-loading">' +
          '<img class="no-shadow" alt="" draggable="false" loading="lazy" src="' + escAttr(it.image) + '" />' +
        '</figure>' +
        '<div class="ic-text">' +
          '<div class="ic-eyebrow">' +
            '<span class="ic-cat">' + escHtml(it.category) + '</span>' +
            '<span class="ic-size">' + escHtml(it.size) + '</span>' +
          '</div>' +
          '<h3 class="ic-name">' + escHtml(it.name) + '</h3>' +
          '<p class="ic-body">' + escHtml(it.body) + '</p>' +
        '</div>';
      var imgEl = card.querySelector('img');
      var figEl = card.querySelector('.ic-figure');
      if (it.position) imgEl.style.objectPosition = it.position;
      imgEl.addEventListener('load', function () {
        figEl.classList.remove('ic-figure-loading', 'ic-figure-error');
        figEl.classList.add('ic-figure-loaded');
      });
      imgEl.addEventListener('error', function () {
        figEl.classList.remove('ic-figure-loading', 'ic-figure-loaded');
        figEl.classList.add('ic-figure-error');
      });
      track.appendChild(card);
    });

    var cards = track.querySelectorAll('.ic-card');
    var total = cards.length;
    var idx = 0;

    // Build grouped dots
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
          b.addEventListener('click', function () { go(i, true); });
          dots.appendChild(b);
        });
        grp.appendChild(lbl);
        grp.appendChild(dots);
        dotWrap.appendChild(grp);
      });
    }

    function offsetForIdx(i) {
      var card = cards[i];
      if (!card) return 0;
      var cardCenter = card.offsetLeft + card.offsetWidth / 2;
      var viewportCenter = viewport.offsetWidth / 2;
      return viewportCenter - cardCenter;
    }

    function setTranslate(x, animate) {
      track.style.transition = animate
        ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
        : 'none';
      track.style.transform = 'translate3d(' + x + 'px, 0, 0)';
    }

    function getCurrentTranslate() {
      var t = track.style.transform;
      var m = t.match(/translate3d\((-?\d+\.?\d*)px/);
      return m ? parseFloat(m[1]) : 0;
    }

    function setActiveClasses(i) {
      cards.forEach(function (c, j) {
        c.classList.toggle('is-active', j === i);
      });
      var allDots = root.querySelectorAll('.ic-dot');
      allDots.forEach(function (d) {
        var di = parseInt(d.dataset.i, 10);
        d.classList.toggle('is-active', di === i);
        d.setAttribute('aria-selected', di === i);
      });
      if (prevBtn) prevBtn.disabled = (i <= 0);
      if (nextBtn) nextBtn.disabled = (i >= total - 1);
    }

    function go(n, animate) {
      idx = Math.max(0, Math.min(total - 1, n));
      setTranslate(offsetForIdx(idx), animate !== false);
      setActiveClasses(idx);
    }

    // Drag handling — desktop pointer + touch via pointer events
    var dragging = false;
    var dragStartX = 0;
    var dragStartTranslate = 0;
    var dragMoved = false;
    var DRAG_THRESHOLD = 4;

    // Block native image drag from hijacking the gesture
    viewport.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // Wire up the floating prev/next nav buttons
    var prevBtn = root.querySelector('[data-ic-prev]');
    var nextBtn = root.querySelector('[data-ic-next]');
    if (prevBtn) prevBtn.addEventListener('click', function () { go(idx - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(idx + 1, true); });

    viewport.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.ic-dot')) return;
      if (e.target.closest('.ic-nav')) return;
      dragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartTranslate = getCurrentTranslate();
      track.style.transition = 'none';
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      if (!dragMoved && Math.abs(dx) > DRAG_THRESHOLD) {
        dragMoved = true;
        viewport.classList.add('is-dragging');
      }
      if (dragMoved) {
        if (e.cancelable) e.preventDefault();
        setTranslate(dragStartTranslate + dx, false);
      }
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');
      try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}
      if (!dragMoved) return;
      // Advance based on drag direction & ratio of card width.
      // Less than ~15% of a card span snaps back to current; beyond that,
      // advance one card (or more for fast/long drags).
      var current = getCurrentTranslate();
      var dx = current - dragStartTranslate;
      var cardSpan = cards.length > 1
        ? cards[1].offsetLeft - cards[0].offsetLeft
        : (cards[0] ? cards[0].offsetWidth : 1);
      var ratio = -dx / cardSpan; // positive ratio means "moved toward next card"
      var THRESHOLD = 0.15;
      var step = 0;
      if (Math.abs(ratio) >= THRESHOLD) {
        var dir = ratio > 0 ? 1 : -1;
        step = dir * Math.max(1, Math.round(Math.abs(ratio)));
      }
      go(idx + step, true);
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // Suppress click on cards immediately following a drag
    viewport.addEventListener('click', function (e) {
      if (dragMoved) {
        e.preventDefault();
        e.stopPropagation();
        dragMoved = false;
      }
    }, true);

    // Keyboard navigation
    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1, true); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1, true); }
    });

    // Resize: recompute centered offset
    var resizeRaf = null;
    window.addEventListener('resize', function () {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(function () {
        resizeRaf = null;
        go(idx, false);
      });
    });

    // Init after layout settles
    requestAnimationFrame(function () { go(0, false); });
  }

  // ---- Scope rows: click/keyboard to expand the bullet details ----
  function initScopeExpander() {
    var rows = document.querySelectorAll('[data-scope-row]');
    if (!rows.length) return;
    rows.forEach(function (row) {
      var details = row.querySelector('.scope-row-details');
      var inner = details && details.querySelector('.scope-row-details-inner');
      if (!details || !inner) return;

      function toggle() {
        var open = row.classList.toggle('is-expanded');
        row.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          details.style.maxHeight = inner.scrollHeight + 'px';
        } else {
          details.style.maxHeight = '0';
        }
      }

      row.addEventListener('click', toggle);
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });

      // Recompute height on viewport resize for any rows that are open
      window.addEventListener('resize', function () {
        if (row.classList.contains('is-expanded')) {
          details.style.maxHeight = inner.scrollHeight + 'px';
        }
      });
    });
  }

  // ---- Site-plan zoom (hover/hold magnifier + tap/click-to-open lightbox) ----
  function initSitePlanZoom() {
    var wrap = document.querySelector('[data-site-plan]');
    if (!wrap) return;
    var img = wrap.querySelector('.site-plan-img');
    if (!img) return;

    var lens = document.createElement('div');
    lens.className = 'site-plan-lens';
    lens.style.backgroundImage = 'url("' + img.src + '")';
    wrap.appendChild(lens);

    var zoomFactor = 2.5;
    var lensActive = false;
    var holdTimer = null;
    var touchStartX = 0, touchStartY = 0;
    var touchMoved = false;
    var suppressNextClick = false;
    var HOLD_MS = 280;
    var MOVE_THRESHOLD = 10;

    function showLens() {
      if (lensActive) return;
      lensActive = true;
      lens.classList.add('is-active');
      var rect = img.getBoundingClientRect();
      lens.style.backgroundSize = (rect.width * zoomFactor) + 'px ' + (rect.height * zoomFactor) + 'px';
    }
    function hideLens() {
      if (!lensActive) return;
      lensActive = false;
      lens.classList.remove('is-active');
    }
    function updateLens(clientX, clientY) {
      var rect = img.getBoundingClientRect();
      var x = clientX - rect.left;
      var y = clientY - rect.top;
      var lensSize = lens.offsetWidth;
      var halfLens = lensSize / 2;
      var lensX = Math.max(0, Math.min(x - halfLens, rect.width - lensSize));
      var lensY = Math.max(0, Math.min(y - halfLens, rect.height - lensSize));
      lens.style.left = lensX + 'px';
      lens.style.top = lensY + 'px';
      var bgX = -(x * zoomFactor - halfLens);
      var bgY = -(y * zoomFactor - halfLens);
      lens.style.backgroundPosition = bgX + 'px ' + bgY + 'px';
    }

    // Mouse: standard hover magnifier
    img.addEventListener('mouseenter', function () { showLens(); });
    img.addEventListener('mouseleave', function () { hideLens(); });
    img.addEventListener('mousemove', function (e) { updateLens(e.clientX, e.clientY); });

    // Touch: hold to magnify, quick tap opens the modal
    wrap.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      var t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchMoved = false;
      holdTimer = setTimeout(function () {
        if (!touchMoved) {
          showLens();
          updateLens(touchStartX, touchStartY);
          suppressNextClick = true;
        }
      }, HOLD_MS);
    }, { passive: true });

    wrap.addEventListener('touchmove', function (e) {
      if (e.touches.length !== 1) return;
      var t = e.touches[0];
      if (lensActive) {
        e.preventDefault();
        updateLens(t.clientX, t.clientY);
      } else {
        var dx = Math.abs(t.clientX - touchStartX);
        var dy = Math.abs(t.clientY - touchStartY);
        if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
          touchMoved = true;
          clearTimeout(holdTimer);
        }
      }
    }, { passive: false });

    wrap.addEventListener('touchend', function () {
      clearTimeout(holdTimer);
      hideLens();
    }, { passive: true });
    wrap.addEventListener('touchcancel', function () {
      clearTimeout(holdTimer);
      hideLens();
    }, { passive: true });

    // Suppress the long-press / right-click context menu so the magnifier
    // can take over the long-press gesture on touch devices.
    wrap.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    // Click / keyboard to open the lightbox (tap-and-hold suppresses the click)
    function open() { openSitePlanModal(img.src, img.alt); }
    wrap.addEventListener('click', function () {
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      open();
    });
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  function openSitePlanModal(src, alt) {
    var modal = document.querySelector('.site-plan-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'site-plan-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Site plan, full size');
      modal.innerHTML =
        '<button class="site-plan-modal-close" type="button" aria-label="Close">&times;</button>' +
        '<img alt="" />';
      document.body.appendChild(modal);

      modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.classList.contains('site-plan-modal-close')) {
          closeSitePlanModal();
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
          closeSitePlanModal();
        }
      });
    }
    var modalImg = modal.querySelector('img');
    modalImg.src = src;
    modalImg.alt = alt;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeSitePlanModal() {
    var modal = document.querySelector('.site-plan-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // ---- Card deck (Four Pillars deal/reset interaction) ----
  // Drives any element with [data-deck-stage]. Inside the stage:
  //   - [data-deck-origin] anchors the deck pile's resting position
  //   - .deck-slot elements are deal targets (one per card)
  //   - .deck-card elements live in .deck-cards-layer
  //   - [data-deck-reset] toggles the reset flow when the deck is spent
  // Multiple decks per page are supported.
  function initCardDecks() {
    var stages = document.querySelectorAll('[data-deck-stage]');
    if (!stages.length) return;
    stages.forEach(function (stage) { setupDeck(stage); });

    function setupDeck(stage) {
      var origin = stage.querySelector('[data-deck-origin]');
      var slots = Array.prototype.slice.call(stage.querySelectorAll('.deck-slot'));
      var cards = Array.prototype.slice.call(stage.querySelectorAll('.deck-card'));
      var resetBtn = stage.querySelector('[data-deck-reset]');
      if (!origin || !cards.length || !slots.length) return;

      var STACK_OFFSET = 5;   // px between cards in the deck pile
      var JITTER_DEG = 1.4;   // small rotation per stack position

      var currentIdx = 0;
      var isResetting = false; // gates only the reset animation; deals can overlap

      function relTo(stageRect, rect) {
        return { x: rect.left - stageRect.left, y: rect.top - stageRect.top };
      }

      function layout() {
        var stageRect = stage.getBoundingClientRect();
        var originRect = origin.getBoundingClientRect();
        var op = relTo(stageRect, originRect);

        cards.forEach(function (card, i) {
          var depth = i - currentIdx;
          if (!card.classList.contains('is-placed')) {
            if (depth >= 0) {
              var off = depth * STACK_OFFSET;
              card.style.setProperty('--x', (op.x + off) + 'px');
              card.style.setProperty('--y', (op.y + off) + 'px');
              card.style.setProperty('--rot', ((depth - 1.5) * JITTER_DEG) + 'deg');
              card.style.setProperty('--z', String(20 - depth));
            }
          } else {
            var raw = card.dataset.targetSlot;
            var slotIdx = (raw != null && raw !== '') ? parseInt(raw, 10) : -1;
            if (slotIdx >= 0 && slots[slotIdx]) {
              var sp = relTo(stageRect, slots[slotIdx].getBoundingClientRect());
              card.style.setProperty('--slot-x', sp.x + 'px');
              card.style.setProperty('--slot-y', sp.y + 'px');
            }
          }
        });
      }

      function updateClickability() {
        cards.forEach(function (c) { c.removeAttribute('data-clickable'); });
        if (isResetting) return;
        var top = cards[currentIdx];
        if (top && !top.classList.contains('is-placed') && !top.classList.contains('is-flipping')) {
          top.setAttribute('data-clickable', '');
        }
      }

      function dealNext() {
        if (isResetting) return;
        var dealtIdx = currentIdx;
        var card = cards[dealtIdx];
        var slot = slots[dealtIdx];
        if (!card || !slot) return;

        // Advance the pile pointer immediately so rapid clicks queue.
        currentIdx++;

        var stageRect = stage.getBoundingClientRect();
        var sp = relTo(stageRect, slot.getBoundingClientRect());
        card.dataset.targetSlot = String(dealtIdx);
        card.style.setProperty('--slot-x', sp.x + 'px');
        card.style.setProperty('--slot-y', sp.y + 'px');
        card.style.setProperty('--z', '50'); // ride above the pile during travel

        // Phase 1 — flip the inner in place
        card.classList.add('is-flipping');

        // Phase 2 — at ~half through the flip, slide to the slot
        setTimeout(function () {
          card.classList.add('is-placed');
          slot.classList.add('is-filled');
        }, 350);

        // Re-shuffle the visible pile and refresh the clickable card.
        requestAnimationFrame(function () {
          layout();
          updateClickability();
        });

        // Mobile: shift the deck pile out of center on the first deal.
        // (No-op on desktop — the .has-dealt CSS rule is mobile-scoped.)
        if (currentIdx === 1) stage.classList.add('has-dealt');

        // After the last card finishes traveling, mark the stage spent.
        if (currentIdx >= cards.length) {
          setTimeout(function () { stage.classList.add('is-spent'); }, 1300);
        }
      }

      function resetDeck() {
        if (isResetting) return;
        if (currentIdx === 0) return;
        isResetting = true;
        stage.classList.remove('is-spent');
        // Mobile: snap the deck pile back to center BEFORE measuring it
        // for the return animations, so each card flies straight to its
        // final centered home position.
        stage.classList.remove('has-dealt');
        updateClickability(); // strip clickability from any in-flight card

        // Reverse-deal: the last card placed returns first, so the
        // reformed pile keeps its visual stack order (top of pile = card[0]).
        var dealt = cards.slice(0, currentIdx).reverse();
        var stageRect = stage.getBoundingClientRect();
        var originRect = origin.getBoundingClientRect();
        var op = relTo(stageRect, originRect);

        var STAGGER = 130;

        dealt.forEach(function (card, i) {
          var cardIdx = cards.indexOf(card);
          var depth = cardIdx;
          var off = depth * STACK_OFFSET;

          setTimeout(function () {
            card.style.setProperty('--x', (op.x + off) + 'px');
            card.style.setProperty('--y', (op.y + off) + 'px');
            card.style.setProperty('--rot', ((depth - 1.5) * JITTER_DEG) + 'deg');
            card.style.setProperty('--z', String(20 - depth + 30));
            card.style.setProperty('--slot-x', (op.x + off) + 'px');
            card.style.setProperty('--slot-y', (op.y + off) + 'px');

            card.classList.remove('is-placed', 'is-flipping');
            slots[cardIdx].classList.remove('is-filled');
            delete card.dataset.targetSlot;
          }, i * STAGGER);
        });

        var totalTravelMs = (dealt.length - 1) * STAGGER + 900;
        setTimeout(function () {
          isResetting = false;
          currentIdx = 0;
          cards.forEach(function (card, i) {
            card.style.setProperty('--z', String(20 - i));
          });
          layout();
          updateClickability();
        }, totalTravelMs);
      }

      // Send the most recently dealt card back to the deck pile.
      // Three-phase animation gives the return a more human curve:
      //   Phase 1: un-flip in place at slot position (on top)
      //   Phase 2: arc — sweep LEFT past the deck, drop DOWN, then up
      //            onto the deck pile (CSS @keyframes deck-card-return-arc)
      //   Phase 3: cleanup — settle z and re-layout
      //
      // Special case: when the LAST dealt card is returning (deck pile is
      // empty), the arc has nothing to navigate around — skip the arc and
      // let the base transform transition carry the card straight home.
      function returnTopCard() {
        if (isResetting) return;
        if (currentIdx === 0) return;
        var cardIdx = currentIdx - 1;
        var card = cards[cardIdx];
        var slot = slots[cardIdx];
        if (!card || !slot) return;

        var isLastReturning = (currentIdx === 1);

        // Phase 1 — un-flip in place. The .is-returning rule overrides
        // .is-placed so the inner rotates back to face down while the
        // outer stays at slot position. High z keeps it above siblings.
        card.classList.add('is-returning');
        card.style.setProperty('--z', '100');

        // Phase 2 — after the flip, return the card to the deck.
        setTimeout(function () {
          currentIdx--;
          stage.classList.remove('is-spent');
          if (currentIdx === 0) stage.classList.remove('has-dealt');

          var stageRect = stage.getBoundingClientRect();
          var originRect = origin.getBoundingClientRect();
          var op = relTo(stageRect, originRect);

          // Final landing: top of the deck pile (depth 0).
          card.style.setProperty('--x', op.x + 'px');
          card.style.setProperty('--y', op.y + 'px');
          card.style.setProperty('--rot', ((-1.5) * JITTER_DEG) + 'deg');

          // Drop placement classes; the inner is already un-flipped.
          card.classList.remove('is-returning', 'is-flipping', 'is-placed');
          delete card.dataset.targetSlot;
          slot.classList.remove('is-filled');

          if (isLastReturning) {
            // No arc — the deck is empty, just glide straight back.
            // The base .deck-card transition (0.85s) handles the move.
            setTimeout(function () {
              card.style.setProperty('--z', String(20 - cardIdx));
              layout();
              updateClickability();
            }, 850);
          } else {
            // Arc path — used when other cards are still on the slots
            // so the returning card needs to visibly travel around them.
            var cardW = card.offsetWidth || 220;
            card.style.setProperty('--arc-leftmost-x', (op.x - cardW * 0.7) + 'px');
            card.style.setProperty('--arc-down-y', (op.y + 15) + 'px');
            card.classList.add('is-returning-arc');

            // Z-drop mid-arc so the card recedes behind the deck on return.
            setTimeout(function () {
              card.style.setProperty('--z', '21');
            }, 400);

            setTimeout(function () {
              card.classList.remove('is-returning-arc');
              layout();
              updateClickability();
            }, 1000);
          }
        }, 700);
      }

      stage.addEventListener('click', function (e) {
        var isMobile = window.matchMedia('(max-width: 900px)').matches;

        // On mobile, the deck and revealed piles overlap horizontally
        // inside a perspective container — and browsers can mis-route
        // the click target through the 3D layer. Skip hit testing
        // entirely: check the click coords against the top revealed
        // card's bounding rect first; if inside, return that card.
        if (isMobile && currentIdx > 0) {
          var topRevealed = cards[currentIdx - 1];
          if (topRevealed) {
            var r = topRevealed.getBoundingClientRect();
            if (e.clientX >= r.left && e.clientX <= r.right &&
                e.clientY >= r.top && e.clientY <= r.bottom) {
              returnTopCard();
              return;
            }
          }
        }

        if (!e.target.closest) return;
        // Top of the deck pile → deal the next card (desktop + mobile).
        if (e.target.closest('.deck-card[data-clickable]')) {
          dealNext();
          return;
        }
        // Desktop: dealt cards aren't interactive (no return action).
        // Mobile fallback for taps elsewhere in the slots zone.
        if (isMobile && currentIdx > 0 && e.target.closest('.deck-slots')) {
          returnTopCard();
        }
      });
      if (resetBtn) resetBtn.addEventListener('click', resetDeck);

      window.addEventListener('resize', layout);
      // ------------------------------------------------------------------

      // First frame: measure and write the per-card position vars.
      // Then wait for the deck PILE (not the whole stage — the stage
      // also contains the heading + lede above it) to scroll into the
      // middle band of the viewport before firing the entrance.
      requestAnimationFrame(function () {
        layout();
        updateClickability();
        // Web fonts arriving after first layout shift the heading/lede
        // height, which shifts the deck-pile-origin downward. Re-measure
        // once fonts are ready so the entrance animation lands at the
        // right spot.
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(layout);
        }
        if ('IntersectionObserver' in window) {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                // Final re-measure right before the entrance fires,
                // in case anything has shifted since the rAF tick.
                layout();
                stage.classList.add('is-ready');
                io.unobserve(entry.target);
                // After the entrance staggers complete, lock it down
                // so the .is-ready rule's animation never re-fires
                // when other animation classes (return-arc) come and
                // go. Last card's delay is 0.48s + 0.7s anim = 1.18s.
                setTimeout(function () {
                  stage.classList.add('has-entered');
                }, 1300);
              }
            });
          }, { threshold: 0, rootMargin: '-30% 0px -30% 0px' });
          // Observe the pile element so the trigger reflects when the
          // CARDS — not the heading text — are roughly centered.
          io.observe(origin);
        } else {
          // Fallback for browsers without IntersectionObserver.
          stage.classList.add('is-ready');
        }
      });
    }
  }

  // ---- Top-bar height (nav + email banner) for hero sizing ----
  function initTopBarHeight() {
    var root = document.documentElement;
    function measure() {
      var nav = document.querySelector('.nav');
      var banner = document.querySelector('.email-banner');
      var h = (nav ? nav.offsetHeight : 0) + (banner ? banner.offsetHeight : 0);
      root.style.setProperty('--top-bar-height', h + 'px');
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
  }

  // ---- Generic reveal-on-scroll observer ----
  // Adds .is-revealed to any element with .stack-reveal or .page-opener-reveal
  // when it enters the viewport. Fires once per element.
  function initRevealObserver() {
    var els = document.querySelectorAll('.stack-reveal, .page-opener-reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    els.forEach(function (el) { observer.observe(el); });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initTopBarHeight();
    initNav();
    initEmailBanner();
    initParallax();
    initPhotoCarousels();
    initInstallationsCarousel();
    initRevealObserver();
    initSitePlanZoom();
    initScopeExpander();
    initCardDecks();
  });
})();
