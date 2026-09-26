/*! THE BOYS Tilda popups loader v32
 * Lightweight: lazy popup files, no scroll RAF loop, no heavy DOM scans
 * Triggers: #order #gift #visit #story-1
 */
(function () {
  if (window.__tbPopups) return;
  window.__tbPopups = { v: 32 };

  var BASES = [
    'https://cdn.jsdelivr.net/gh/cdn-dmitry-design/THE-BOYS@main/cdn/',
    'https://fastly.jsdelivr.net/gh/cdn-dmitry-design/THE-BOYS@main/cdn/',
    'https://raw.githack.com/cdn-dmitry-design/THE-BOYS/main/cdn/'
  ];
  var BASE = (function () {
    var s = document.currentScript;
    if (s && s.src) {
      var raw = String(s.src).split('?')[0];
      var b = raw.replace(/\/[^\/]*$/, '/');
      if (b) return b;
    }
    return BASES[0];
  })();

  var POP = {
    order: 'tbOrderPop',
    zayavka: 'tbOrderPop',
    gift: 'tbGiftPop',
    card: 'tbGiftPop',
    podarok: 'tbGiftPop',
    visit: 'tbVisitPop',
    'tb-visit': 'tbVisitPop',
    'story-1': 'tbStoryPop',
    'story-2': 'tbStoryPop',
    'story-3': 'tbStoryPop',
    story: 'tbStoryPop'
  };

  var BUNDLE = {
    tbOrderPop: ['order.css', 'order.js'],
    tbGiftPop: ['gift.css', 'gift.js'],
    tbVisitPop: ['visit.css', 'visit.js'],
    tbStoryPop: ['story.css', 'story.js']
  };

  var VER = 'v=32';
  var pending = '';
  var lastY = 0;
  var lastOpen = '';
  var lastOpenAt = 0;
  var jumpUntil = 0;
  var patched = 0;
  var loading = {};
  var cssReady = {};

  var _scrollTo = window.scrollTo.bind(window);
  var _scroll = window.scroll.bind(window);
  var _scrollBy = window.scrollBy.bind(window);
  var _scrollIntoView = Element.prototype.scrollIntoView;

  window.__tbNativeScrollTo = function (x, y) {
    if (typeof x === 'object' && x) {
      y = x.top != null ? x.top : y;
      x = x.left != null ? x.left : 0;
    }
    _scrollTo(x || 0, y || 0);
  };

  function readY() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function isLocked() {
    var html = document.documentElement;
    return (
      html.classList.contains('tb-order-lock') ||
      html.classList.contains('tb-gift-lock') ||
      html.classList.contains('tb-story-lock') ||
      html.classList.contains('tb-visit-lock')
    );
  }

  function normHash(h) {
    return String(h || '').replace(/^#/, '').split(/[?&/]/)[0].toLowerCase();
  }

  function rememberY() {
    var y = readY();
    if (y < 0) y = 0;
    if (y < 2 && lastY > 2) return;
    lastY = y;
    window.__tbKeepY = lastY;
  }

  function forceY() {
    var y = window.__tbKeepY != null ? window.__tbKeepY : lastY;
    if (y < 0) y = 0;
    try {
      _scrollTo(0, y);
      document.documentElement.scrollTop = y;
      if (document.body) document.body.scrollTop = y;
    } catch (e) {}
  }

  function disarmNow() {
    jumpUntil = 0;
    if (patched) {
      patched = 0;
      window.scrollTo = _scrollTo;
      window.scroll = _scroll;
      window.scrollBy = _scrollBy;
      Element.prototype.scrollIntoView = _scrollIntoView;
    }
    var y = window.__tbKeepY != null ? window.__tbKeepY : lastY;
    if (y < 0) y = 0;
    try { _scrollTo(0, y); } catch (e) {}
  }

  window.__tbRestoreY = disarmNow;
  window.__tbReleaseScroll = disarmNow;

  /* Короткий lock только на момент открытия — без RAF-петли на 2.5с */
  function armScrollLock(ms) {
    rememberY();
    jumpUntil = Date.now() + (ms || 900);
    if (!patched) {
      patched = 1;
      window.scrollTo = function () {
        if (Date.now() < jumpUntil || isLocked()) forceY();
        else _scrollTo.apply(window, arguments);
      };
      window.scroll = function () {
        if (Date.now() < jumpUntil || isLocked()) forceY();
        else _scroll.apply(window, arguments);
      };
      window.scrollBy = function () {
        if (Date.now() < jumpUntil || isLocked()) forceY();
        else _scrollBy.apply(window, arguments);
      };
      Element.prototype.scrollIntoView = function () {
        if (Date.now() < jumpUntil || isLocked()) forceY();
        else _scrollIntoView.apply(this, arguments);
      };
    }
    setTimeout(function () {
      if (!isLocked() && Date.now() >= jumpUntil) disarmNow();
    }, (ms || 900) + 50);
  }

  function clearPopHash() {
    var key = normHash(location.hash);
    if (!POP[key]) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }

  function keyFromHref(href) {
    href = String(href || '');
    var i = href.indexOf('#');
    if (i < 0) return '';
    var h = normHash(href.slice(i));
    return POP[h] ? h : '';
  }

  function keyFromNode(node) {
    if (!node) return '';
    if (node.nodeType === 3) node = node.parentElement;
    if (!node || !node.closest) return '';

    /* быстрый путь через closest вместо ручного обхода */
    var hit = node.closest(
      '[data-tb-hash],[data-tb-pop],a[href],a[data-href],area[href],.order,.gift,.visit,.story,.story-1'
    );
    if (!hit) return '';

    var dh = hit.getAttribute('data-tb-hash');
    if (dh && POP[normHash(dh)]) return normHash(dh);

    var kind = String(hit.getAttribute('data-tb-pop') || '').toLowerCase();
    if (kind === 'story') {
      var sid = String(hit.getAttribute('data-tb-story') || '1').toLowerCase();
      var sk = sid.indexOf('story-') === 0 ? sid : 'story-' + sid;
      if (POP[sk]) return sk;
    }
    if (POP[kind]) return kind;

    if (hit.classList) {
      if (hit.classList.contains('order')) return 'order';
      if (hit.classList.contains('gift')) return 'gift';
      if (hit.classList.contains('visit')) return 'visit';
      if (hit.classList.contains('story') || hit.classList.contains('story-1')) return 'story-1';
    }

    return keyFromHref(hit.getAttribute('href') || hit.getAttribute('data-href') || '');
  }

  function classKey(el) {
    if (!el || !el.classList) return '';
    if (el.classList.contains('order')) return 'order';
    if (el.classList.contains('gift')) return 'gift';
    if (el.classList.contains('visit')) return 'visit';
    if (el.classList.contains('story') || el.classList.contains('story-1')) return 'story-1';
    var kind = String((el.getAttribute && el.getAttribute('data-tb-pop')) || '').toLowerCase();
    if (kind === 'story') return 'story-1';
    return POP[kind] ? kind : '';
  }

  function stripAnchor(a, key) {
    if (!a || !key) return;
    a.setAttribute('data-tb-hash', key);
    if (a.hasAttribute('href')) a.removeAttribute('href');
    if (a.hasAttribute('data-href')) a.removeAttribute('data-href');
    a.setAttribute('role', 'button');
    a.style.cursor = 'pointer';
  }

  function neutralizeLinks(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var list = scope.querySelectorAll(
      'a[href*="#order"],a[href*="#zayavka"],a[href*="#gift"],a[href*="#card"],a[href*="#podarok"],a[href*="#visit"],a[href*="#tb-visit"],a[href*="#story"],a[data-href*="#order"],a[data-href*="#gift"],a[data-href*="#visit"],a[data-href*="#story"],.order,.gift,.visit,.story,.story-1,[data-tb-pop]'
    );
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      var href = a.getAttribute('href') || a.getAttribute('data-href') || '';
      var key = keyFromHref(href) || classKey(a);
      if (!key && a.getAttribute('data-tb-hash')) key = normHash(a.getAttribute('data-tb-hash'));
      if (!key) continue;
      stripAnchor(a, key);
    }
  }

  function hideMounts() {
    ['tbOrderMount', 'tbGiftMount', 'tbVisitMount', 'tbStoryMount'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || !el.closest) return;
      var rec = el.closest('[id^="rec"]');
      if (rec) rec.classList.add('tb-mount-hide');
    });
  }

  function loadCss(name) {
    if (cssReady[name]) return cssReady[name];
    cssReady[name] = new Promise(function (resolve) {
      var prev = document.querySelector('link[data-tb-css="' + name + '"]');
      if (prev) {
        if (prev.sheet) return resolve();
        prev.addEventListener('load', function () { resolve(); });
        prev.addEventListener('error', function () { resolve(); });
        setTimeout(resolve, 1200);
        return;
      }
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = BASE + name + '?' + VER;
      l.setAttribute('data-tb-css', name);
      l.onload = function () { resolve(); };
      l.onerror = function () { resolve(); };
      (document.head || document.documentElement).appendChild(l);
      setTimeout(resolve, 1200);
    });
    return cssReady[name];
  }

  function loadJsOnce(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('fail ' + src)); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function loadJs(name) {
    var i = 0;
    var bases = [BASE].concat(BASES.filter(function (b) { return b !== BASE; }));
    function next() {
      if (i >= bases.length) return Promise.reject(new Error('Failed ' + name));
      return loadJsOnce(bases[i++] + name + '?' + VER).catch(next);
    }
    return next();
  }

  function waitApi(apiName) {
    return new Promise(function (resolve, reject) {
      var n = 0;
      function tick() {
        if (window[apiName] && typeof window[apiName].open === 'function') return resolve();
        if (++n > 60) return reject(new Error('API missing ' + apiName));
        setTimeout(tick, 16);
      }
      tick();
    });
  }

  function ensureApi(apiName) {
    if (window[apiName] && typeof window[apiName].open === 'function') {
      return Promise.resolve();
    }
    if (loading[apiName]) return loading[apiName];
    var files = BUNDLE[apiName] || [];
    loading[apiName] = files.reduce(function (chain, name) {
      if (/\.css$/i.test(name)) return chain.then(function () { return loadCss(name); });
      return chain.then(function () { return loadJs(name); });
    }, Promise.resolve()).then(function () {
      return waitApi(apiName);
    }).catch(function (err) {
      loading[apiName] = null;
      throw err;
    });
    return loading[apiName];
  }

  function openKey(key) {
    if (!POP[key]) return false;
    rememberY();
    window.__tbKeepY = lastY;
    var apiName = POP[key];
    var now = Date.now();
    if (lastOpen === key && now - lastOpenAt < 400) return true;

    pending = key;
    ensureApi(apiName).then(function () {
      if (pending !== key && pending !== '') return;
      var api = window[apiName];
      if (!api || typeof api.open !== 'function') return;
      lastOpen = key;
      lastOpenAt = Date.now();
      if (pending === key) pending = '';
      armScrollLock(900);
      forceY();
      api.open(key);
      forceY();
    }, function (err) {
      if (pending === key) pending = '';
      if (typeof console !== 'undefined' && console.error) console.error('[THE BOYS popups]', err);
    });
    return true;
  }

  function warmFromEvent(e) {
    var key = keyFromNode(e.target);
    if (key) ensureApi(POP[key]);
  }

  function intercept(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button && e.button !== 0) return;
    if (e.target && e.target.closest && e.target.closest('#rec4114939801.menu-open .menu-row')) return;

    var key = keyFromNode(e.target);
    if (!key) return;

    if (e.cancelable && e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    rememberY();
    clearPopHash();
    openKey(key);
  }

  (function () {
    var st = document.createElement('style');
    st.id = 'tb-pop-noscroll';
    st.textContent =
      'html{scroll-behavior:auto!important}.tb-mount-hide{padding:0!important;margin:0!important;min-height:0!important;height:0!important;overflow:hidden!important;border:0!important;background:none!important}.tb-mount-hide .t-container,.tb-mount-hide .t123,.tb-mount-hide .t123__content,.tb-mount-hide .t-col,.tb-mount-hide .t-width{max-width:none!important;width:100%!important;padding:0!important;margin:0!important;min-height:0!important;height:0!important;overflow:hidden!important}';
    (document.head || document.documentElement).appendChild(st);
  })();

  rememberY();

  /* только click — не 6 событий на каждый тап */
  window.addEventListener('click', intercept, true);
  /* прогрев бандла по hover — чтобы первый клик не ждал сеть */
  window.addEventListener('pointerover', warmFromEvent, true);
  window.addEventListener('focusin', warmFromEvent, true);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    intercept(e);
  }, true);

  window.addEventListener('hashchange', function () {
    var key = normHash(location.hash);
    if (!POP[key]) return;
    clearPopHash();
    openKey(key);
  });

  /* следим только за class на <html> — дёшево */
  var wasLocked = 0;
  if (typeof MutationObserver !== 'undefined') {
    try {
      var classObs = new MutationObserver(function () {
        var now = isLocked() ? 1 : 0;
        if (wasLocked && !now) disarmNow();
        wasLocked = now;
      });
      classObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
  }

  function bootScan() {
    neutralizeLinks(document);
    hideMounts();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootScan);
  else bootScan();
  /* Без автопрогрева: иначе Safari держит синюю полоску, пока тянет 8 файлов попапов */
  window.addEventListener('load', function () { bootScan(); });

  if (POP[normHash(location.hash)]) {
    var bootKey = normHash(location.hash);
    clearPopHash();
    setTimeout(function () { openKey(bootKey); }, 0);
  }

  window.__tbPopups.ready = 1;
})();
