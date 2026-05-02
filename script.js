/* ==========================================================================
   HARSH & HOLY — Script
   Scroll progress · Scroll-triggered reveals · Star animation
   ========================================================================== */

(function () {
  'use strict';

  // ---------- Progress bar ------------------------------------------------
  const progressFill = document.querySelector('.progress-fill');
  let ticking = false;

  function updateProgress() {
    if (!progressFill) return;
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    progressFill.style.height = pct + '%';
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () { updateProgress(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  updateProgress();

  // ---------- Hide scroll hint once user starts scrolling -----------------
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    window.addEventListener('scroll', function hideHint() {
      scrollHint.classList.add('scroll-hint--hidden');
      window.removeEventListener('scroll', hideHint);
    }, { passive: true, once: true });
  }

  // ---------- Scroll-triggered reveals ------------------------------------
  const revealSelectors = [
    '.epigraph',
    '.image-bleed',
    '.prose--arrival',
    '.prose--ascent',
    '.prose--witness',
    '.prose--stars',
    '.prose--return',
    '.pull-quote',
    '.herald',
    '.said-no',
    '.monument',
    '.song-moment',
    '.star-list',
    '.closing-monument',
  ].join(', ');

  const revealTargets = document.querySelectorAll(revealSelectors);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.1,
    });

    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback — reveal everything immediately
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
  }

  // ---------- One-time discovery pulse on the first prose footnote --------
  // fn3 is the first marker inside actual prose body text — the user is
  // reading carefully there, the element is full-size, and the section has
  // a 1.1s fade-in so we wait for that before pulsing.
  // We observe the parent <p> (normal height) rather than the 1px sup itself.
  var fnPulseTarget = document.querySelector('.fn[data-fn="3"]');
  var fnPulseTrigger = fnPulseTarget && fnPulseTarget.closest('p');
  if (fnPulseTarget && fnPulseTrigger && 'IntersectionObserver' in window) {
    var fnPulseIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setTimeout(function () { fnPulseTarget.classList.add('fn--pulse'); }, 1200);
          fnPulseIO.unobserve(fnPulseTrigger);
        }
      });
    }, { threshold: 0.5 });
    fnPulseIO.observe(fnPulseTrigger);
  }

  // ---------- Trigger star field when stars section enters view -----------
  const starsSection = document.getElementById('stars');
  if (starsSection && 'IntersectionObserver' in window) {
    const starsIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          starsSection.classList.add('in-view');
          starsIO.unobserve(starsSection);
        }
      });
    }, { threshold: 0.1 });
    starsIO.observe(starsSection);
  }

  // ---------- Footnote layer ------------------------------------------------
  const footnoteData = {
    1: { label: 'When to go',      body: 'July sits at the peak of the high-altitude season. The passes are clear of winter snow and the days are warm in Leh, cold at altitude. June–August is the window.' },
    2: { label: 'Getting there',   body: 'About 1.5 hours by air from Delhi (IndiGo, Air India). The alternative is the Srinagar–Leh highway — a two-day drive through Zoji La, one of the great mountain roads.' },
    3: { label: 'Acclimatisation', body: 'Spend at least two full days in Leh (3,500m) before going higher. Most altitude sickness strikes people who don\'t. Rest, hydrate, don\'t push it.' },
    4: { label: 'Altitude kit',    body: 'We carried portable oxygen cans, cloves, camphor (kapur), chewing gum, and motion sickness tablets. Diamox helps. Several people still got sick. There\'s no guarantee.' },
    5: { label: 'Itinerary',       body: 'Tempo Traveller (12-seater) for the group. Route: Leh → Khardung La → Nubra Valley (2 nights) → Pangong Tso (day trip only — no overnight) → Leh. Also: Kargil War Memorial.' },
    6: { label: 'Nubra Valley',    body: 'We stayed in Hunder — white sand dunes, Bactrian camels, and the distinct sense of the Silk Route. A rainbow appeared over the dunes one evening.' },
    7: { label: 'The confluence',  body: 'Downstream, the Zanskar meets the Indus — two rivers of different colours that flow side by side without mixing. We also did a short white-water rafting run here.' },
    8: { label: 'What to wear',    body: 'Thermals, a fleece mid-layer, and a windproof outer — even in July above 14,000 feet. Gloves and a hat are not optional. In the valley, a light jacket is fine.' }
  };

  const fnCard     = document.getElementById('fn-card');
  const fnLabel    = fnCard && fnCard.querySelector('.fn-card__label');
  const fnBody     = fnCard && fnCard.querySelector('.fn-card__body');
  const fnClose    = fnCard && fnCard.querySelector('.fn-card__close');
  let   activeFnEl = null;

  function openFootnote(n, triggerEl) {
    if (!fnCard || !footnoteData[n]) return;
    fnLabel.textContent = footnoteData[n].label;
    fnBody.textContent  = footnoteData[n].body;
    if (activeFnEl) activeFnEl.classList.remove('fn--active');
    activeFnEl = triggerEl;
    activeFnEl.classList.add('fn--active');
    fnCard.classList.add('fn-card--open');
  }

  function closeFootnote() {
    if (!fnCard) return;
    fnCard.classList.remove('fn-card--open');
    if (activeFnEl) { activeFnEl.classList.remove('fn--active'); activeFnEl = null; }
  }

  document.querySelectorAll('.fn').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      var n = parseInt(el.dataset.fn, 10);
      if (activeFnEl === el) { closeFootnote(); } else { openFootnote(n, el); }
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  if (fnClose) {
    fnClose.addEventListener('click', function (e) { e.stopPropagation(); closeFootnote(); });
  }

  document.addEventListener('click', function (e) {
    if (fnCard && fnCard.classList.contains('fn-card--open') &&
        !fnCard.contains(e.target) && !e.target.closest('.fn')) {
      closeFootnote();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeFootnote();
  });

  // ---------- Drawer ---------------------------------------------------------
  var drawerEl     = document.getElementById('practical-drawer');
  var drawerHandle = document.getElementById('drawer-handle');
  var drawerBodyEl = document.getElementById('drawer-body');

  // Show drawer only when the reader reaches the end of the page
  if (drawerEl) {
    function updateDrawerReady() {
      var nearBottom = (window.scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 300);
      if (nearBottom) {
        drawerEl.classList.add('drawer--ready');
      } else {
        drawerEl.classList.remove('drawer--ready');
        // Collapse if open while scrolling away
        if (drawerEl.classList.contains('drawer--open')) {
          drawerEl.classList.remove('drawer--open');
          if (drawerHandle) drawerHandle.setAttribute('aria-expanded', 'false');
          if (drawerBodyEl) drawerBodyEl.setAttribute('aria-hidden', 'true');
        }
      }
    }
    window.addEventListener('scroll', updateDrawerReady, { passive: true });
    updateDrawerReady();
  }

  if (drawerHandle && drawerEl) {
    drawerHandle.addEventListener('click', function () {
      var isOpen = drawerEl.classList.contains('drawer--open');
      if (isOpen) {
        drawerEl.classList.remove('drawer--open');
        drawerHandle.setAttribute('aria-expanded', 'false');
        drawerBodyEl.setAttribute('aria-hidden', 'true');
      } else {
        drawerEl.classList.add('drawer--open');
        drawerHandle.setAttribute('aria-expanded', 'true');
        drawerBodyEl.setAttribute('aria-hidden', 'false');
        closeFootnote(); // dismiss any open footnote card
      }
    });
  }

  // Tab switching
  document.querySelectorAll('.drawer__tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.dataset.tab;
      document.querySelectorAll('.drawer__tab').forEach(function (t) {
        t.classList.remove('drawer__tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.drawer__panel').forEach(function (p) {
        p.classList.remove('drawer__panel--active');
      });
      tab.classList.add('drawer__tab--active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('panel-' + name);
      if (panel) panel.classList.add('drawer__panel--active');
    });
  });

})();
