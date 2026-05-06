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
      // Mobile interaction: tap the revealed pile to flip cards back
      // one at a time. Companion to dealNext (the inverse single step).
      function returnTopCard() {
        if (isResetting) return;
        if (currentIdx === 0) return;
        var idx = currentIdx - 1;
        var card = cards[idx];
        var slot = slots[idx];
        if (!card || !slot) return;

        // Move the pointer back BEFORE we re-layout so this card lands
        // at depth 0 (top of the reformed pile).
        currentIdx--;
        stage.classList.remove('is-spent');

        // Dropping both classes triggers two transitions: the inner
        // un-flips while the outer travels back to the pile.
        card.classList.remove('is-flipping', 'is-placed');
        delete card.dataset.targetSlot;
        slot.classList.remove('is-filled');

        // Ride above the rest of the pile during the journey home.
        card.style.setProperty('--z', '50');

        layout();
        updateClickability();

        setTimeout(function () {
          card.style.setProperty('--z', String(20)); // depth 0 now (top of pile)
        }, 900);
      }

      stage.addEventListener('click', function (e) {
        if (!e.target.closest) return;
        // 1) Top of the deck pile → deal the next card (desktop + mobile).
        if (e.target.closest('.deck-card[data-clickable]')) {
          dealNext();
          return;
        }
        // 2) Mobile only — tap any dealt card OR the revealed-pile zone
        //    to flip the topmost dealt card back to the deck pile.
        if (window.matchMedia('(max-width: 900px)').matches) {
          if (e.target.closest('.deck-card.is-placed') ||
              e.target.closest('.deck-slots')) {
            returnTopCard();
          }
        }
      });
      if (resetBtn) resetBtn.addEventListener('click', resetDeck);

      window.addEventListener('resize', layout);

      // ---- DEV SHORTCUT (remove when done iterating) -------------------
      // Append ?dealt to the URL to skip the deal cycle and render with
      // all cards face-up in their slots immediately. The reset placeholder
      // is also exposed, so click-to-reset still works for testing.
      if (location.search.indexOf('dealt') !== -1) {
        requestAnimationFrame(function () {
          var stageRect = stage.getBoundingClientRect();
          cards.forEach(function (card, i) {
            var sp = relTo(stageRect, slots[i].getBoundingClientRect());
            var inner = card.querySelector('.deck-card-inner');
            card.dataset.targetSlot = String(i);
            card.style.setProperty('--slot-x', sp.x + 'px');
            card.style.setProperty('--slot-y', sp.y + 'px');
            card.style.opacity = '1';
            card.style.transition = 'none';
            if (inner) inner.style.transition = 'none';
            card.classList.add('is-flipping', 'is-placed');
            slots[i].classList.add('is-filled');
          });
          currentIdx = cards.length;
          stage.classList.add('is-spent');
          // Restore transitions on the next frame so reset etc. still animate.
          requestAnimationFrame(function () {
            cards.forEach(function (card) {
              card.style.transition = '';
              var inner = card.querySelector('.deck-card-inner');
              if (inner) inner.style.transition = '';
            });
          });
        });
        return;
      }
      // ------------------------------------------------------------------

      // First frame: measure and write the per-card position vars.
      // Then wait for the deck to scroll into view before firing the
      // entrance animation (matches the rest of the site's reveal pattern).
      requestAnimationFrame(function () {
        layout();
        updateClickability();
        if ('IntersectionObserver' in window) {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                stage.classList.add('is-ready');
                io.unobserve(stage);
              }
            });
          }, { threshold: 0.2 });
          io.observe(stage);
        } else {
          // Fallback for browsers without IntersectionObserver.
          stage.classList.add('is-ready');
        }
      });
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
    initNav();
    initEmailBanner();
    initParallax();
    initLandCarousel();
    initInstallationsCarousel();
    initRevealObserver();
    initSitePlanZoom();
    initScopeExpander();
    initCardDecks();
  });
})();
