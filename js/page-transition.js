/**
 * page-transition.js
 * Context-Switch overlay — fires only on page-to-page navigation.
 * Also syncs body[data-header-variant] / data-primary-color / page body-class
 * after each AJAX content swap so per-page CSS stays correct.
 */
(function () {
  'use strict';

  /* ── Timing constants ───────────────────────────────── */
  var FADE_IN_MS      = 180;
  var LINE_STAGGER_MS = 90;
  var MIN_VISIBLE_MS  = 520;
  var FADE_OUT_MS     = 200;
  var MAX_VISIBLE_MS  = 2000;

  /* ── Route → human label map ────────────────────────── */
  var ROUTE_LABELS = {
    '':                 'home',
    'index.html':       'home',
    'about.html':       'about',
    'portfolio.html':   'portfolio',
    'cv.html':          'resume',
    'contact.html':     'contact',
    'coming-soon.html': 'coming-soon'
  };

  /* ── Page-specific body classes that must swap on nav ── */
  var PAGE_BODY_CLASSES = ['index', 'has-slider', 'project-page'];

  /* ── State ──────────────────────────────────────────── */
  var overlayEl    = null;
  var linesEl      = null;
  var shownAt      = 0;
  var dismissTimer = null;
  var maxTimer     = null;
  var pendingAttrs = null;   /* fetched body attrs for next page */
  var navDone      = false;  /* true once page-is-changing removed */

  /* ── Helpers ────────────────────────────────────────── */
  function isVisible() {
    return overlayEl && overlayEl.classList.contains('is-active');
  }

  function routeLabel(href) {
    var parts = (href || '').split('/');
    var file  = parts[parts.length - 1].split('?')[0].split('#')[0];
    return ROUTE_LABELS[file] !== undefined ? ROUTE_LABELS[file] : file.replace('.html', '');
  }

  function buildLines(href) {
    var label = routeLabel(href);
    return [
      '> Resolving route: /' + label,
      '> Loading interface module...',
      '> Rebinding components...',
      '> Ready.'
    ];
  }

  /* ── Prefetch body attrs from target page ────────────── */
  function prefetchAttrs(href) {
    pendingAttrs = null;
    navDone      = false;

    var fullUrl = new URL(href, window.location.href).href;

    fetch(fullUrl, { credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        /* Parse <body ...> opening tag */
        var match = html.match(/<body([^>]*)>/i);
        if (!match) return;
        var attrStr = match[1];

        function getAttr(name) {
          var m = attrStr.match(new RegExp(name + '="([^"]*)"'));
          return m ? m[1] : null;
        }

        pendingAttrs = {
          variant:      getAttr('data-header-variant'),
          primaryColor: getAttr('data-primary-color'),
          bodyClass:    getAttr('class')
        };

        /* If nav already finished before fetch returned, apply now */
        if (navDone) applyPendingAttrs();
      })
      .catch(function () { /* fetch failed — attrs stay null, no-op */ });
  }

  /* ── Apply fetched body attrs to current document ───── */
  function applyPendingAttrs() {
    if (!pendingAttrs) return;

    if (pendingAttrs.variant) {
      document.body.setAttribute('data-header-variant', pendingAttrs.variant);
    }
    if (pendingAttrs.primaryColor) {
      document.body.setAttribute('data-primary-color', pendingAttrs.primaryColor);
    }

    /* Swap page-specific body classes (e.g. "index") */
    if (pendingAttrs.bodyClass) {
      var incoming = pendingAttrs.bodyClass.split(/\s+/).filter(Boolean);
      /* Remove stale page classes */
      PAGE_BODY_CLASSES.forEach(function (cls) {
        document.body.classList.remove(cls);
      });
      /* Add only the page classes present in the new page */
      incoming.forEach(function (cls) {
        if (PAGE_BODY_CLASSES.indexOf(cls) !== -1) {
          document.body.classList.add(cls);
        }
      });
    }

    pendingAttrs = null;
  }

  /* ── Show overlay ────────────────────────────────────── */
  function show(href) {
    if (isVisible()) return;
    shownAt = Date.now();

    prefetchAttrs(href);

    var lines = buildLines(href || '');
    linesEl.innerHTML = lines.map(function (l) {
      return '<div class="ctx-line">' + escapeHtml(l) + '</div>';
    }).join('');

    overlayEl.classList.add('is-active');

    var lineEls = linesEl.querySelectorAll('.ctx-line');
    gsap.fromTo(lineEls,
      { opacity: 0, y: 6 },
      {
        opacity:  1,
        y:        0,
        duration: 0.22,
        stagger:  LINE_STAGGER_MS / 1000,
        ease:     'power2.out',
        delay:    FADE_IN_MS / 1000
      }
    );

    clearTimeout(maxTimer);
    maxTimer = setTimeout(function () {
      applyPendingAttrs(); /* last-resort — apply even if fetch was slow */
      dismiss();
    }, MAX_VISIBLE_MS);
  }

  /* ── Dismiss overlay ─────────────────────────────────── */
  function dismiss() {
    if (!isVisible()) return;

    var elapsed   = shownAt ? Date.now() - shownAt : MIN_VISIBLE_MS;
    var remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    clearTimeout(dismissTimer);
    clearTimeout(maxTimer);

    dismissTimer = setTimeout(function () {
      if (!isVisible()) return;
      gsap.to(overlayEl, {
        opacity:  0,
        duration: FADE_OUT_MS / 1000,
        ease:     'power2.in',
        onComplete: function () {
          overlayEl.classList.remove('is-active');
          gsap.set(overlayEl, { clearProps: 'opacity' });
        }
      });
    }, remaining);
  }

  /* ── DOM injection ───────────────────────────────────── */
  function inject() {
    var existing = document.getElementById('ctx-switch-overlay');
    if (existing) {
      overlayEl = existing;
      linesEl   = document.getElementById('ctx-lines');
      return;
    }
    overlayEl = document.createElement('div');
    overlayEl.id = 'ctx-switch-overlay';
    overlayEl.setAttribute('aria-hidden', 'true');
    overlayEl.setAttribute('role', 'status');
    overlayEl.innerHTML =
      '<div class="ctx-terminal">' +
        '<div id="ctx-lines"></div>' +
        '<div class="ctx-cursor"></div>' +
      '</div>';
    document.body.appendChild(overlayEl);
    linesEl = document.getElementById('ctx-lines');
  }

  /* ── Link eligibility ────────────────────────────────── */
  function isEligible(href) {
    if (!href) return false;
    if (/^(mailto:|tel:|javascript:|#)/.test(href)) return false;
    try {
      var url = new URL(href, window.location.href);
      if (url.hostname !== window.location.hostname) return false;
      if (url.pathname === window.location.pathname && url.hash) return false;
    } catch (e) {
      return false;
    }
    return true;
  }

  /* ── Watch body.page-is-changing for nav completion ──── */
  function hookViaBodyClass() {
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
        var hadChanging = (m.oldValue || '').indexOf('page-is-changing') !== -1;
        var hasChanging = document.body.classList.contains('page-is-changing');
        if (hadChanging && !hasChanging) {
          navDone = true;
          applyPendingAttrs(); /* apply body attrs as soon as content is swapped */
          dismiss();
          break;
        }
      }
    });
    observer.observe(document.body, { attributes: true, attributeOldValue: true });
  }

  /* ── Click interception (capture phase) ─────────────── */
  function attachClickHandler() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!isEligible(href)) return;
      show(href);
    }, true);
  }

  /* ── XSS guard ───────────────────────────────────────── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Bootstrap ───────────────────────────────────────── */
  function init() {
    inject();
    hookViaBodyClass();
    attachClickHandler();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
