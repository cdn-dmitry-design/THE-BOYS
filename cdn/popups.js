/*! THE BOYS Tilda popups loader v21
 * One-line T123 boot — see docs/tilda-embed.html
 * Triggers: #order #gift #visit #story-1
 */
(function () {
  if (window.__tbPopups) return;
  window.__tbPopups = { v: 21 };

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
  var pending = '';
  var lastY = 0;
  var holdUntil = 0;
  var lastOpen = '';
  var lastOpenAt = 0;
  var pinning = 0;
  var restoring = 0;
  var patched = 0;
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
    return html.classList.contains('tb-order-lock') || html.classList.contains('tb-gift-lock') || html.classList.contains('tb-story-lock') || html.classList.contains('tb-visit-lock');
  }

  function normHash(h) {
    return String(h || '').replace(/^#/, '').split(/[?&/]/)[0].toLowerCase();
  }

  function freezeY(force) {
    if (!force && (restoring || Date.now() < holdUntil || Date.now() < pinning || isLocked())) return;
    var y = readY();
    if (y < 0) y = 0;
    // Не затираем сохранённую позицию нулём, пока открыт/закрывается попап
    if (!force && y < 2 && lastY > 2) return;
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

  function restoreY() {
    restoring = 1;
    holdUntil = Date.now() + 800;
    pinning = Date.now() + 800;
    forceY();
    requestAnimationFrame(forceY);
    setTimeout(forceY, 0);
    setTimeout(forceY, 40);
    setTimeout(forceY, 120);
    setTimeout(forceY, 280);
    setTimeout(function () { restoring = 0; forceY(); }, 400);
  }

  window.__tbRestoreY = restoreY;

  function armScrollLock(ms) {
    pinning = Date.now() + (ms || 2000);
    holdUntil = Math.max(holdUntil, pinning);
    if (patched) return;
    patched = 1;
    window.scrollTo = function () { forceY(); };
    window.scroll = function () { forceY(); };
    window.scrollBy = function () { forceY(); };
    Element.prototype.scrollIntoView = function () { forceY(); };
  }

  function maybeDisarm() {
    if (!patched) return;
    if (Date.now() < pinning || isLocked() || restoring) return;
    patched = 0;
    window.scrollTo = _scrollTo;
    window.scroll = _scroll;
    window.scrollBy = _scrollBy;
    Element.prototype.scrollIntoView = _scrollIntoView;
    forceY();
  }

  setInterval(function () {
    if (isLocked()) {
      pinning = Date.now() + 600;
      holdUntil = Math.max(holdUntil, pinning);
      if (!patched) armScrollLock(600);
    } else {
      maybeDisarm();
    }
  }, 200);

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

    var el = node;
    for (var d = 0; el && d < 20; d++, el = el.parentElement) {
      if (!el.getAttribute) continue;
      var dh = el.getAttribute('data-tb-hash');
      if (dh && POP[normHash(dh)]) return normHash(dh);
      var kind = String(el.getAttribute('data-tb-pop') || '').toLowerCase();
      if (kind === 'story') {
        var sid = String(el.getAttribute('data-tb-story') || '1').toLowerCase();
        var sk = sid.indexOf('story-') === 0 ? sid : 'story-' + sid;
        if (POP[sk]) return sk;
      }
      if (POP[kind]) return kind;
      if (el.tagName === 'A' || el.tagName === 'AREA') {
        var fromHref = keyFromHref(el.getAttribute('href') || el.getAttribute('data-href') || '');
        if (fromHref) return fromHref;
      }
    }
    var a = node.closest('a[href], a[data-tb-hash], a[data-href], area[href]');
    if (!a) return '';
    if (a.getAttribute('data-tb-hash') && POP[normHash(a.getAttribute('data-tb-hash'))]) {
      return normHash(a.getAttribute('data-tb-hash'));
    }
    return keyFromHref(a.getAttribute('href') || a.getAttribute('data-href') || a.href || '');
  }

  function neutralizeLinks(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var list = scope.querySelectorAll('a[href], a[data-href], area[href]');
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      var href = a.getAttribute('href') || a.getAttribute('data-href') || '';
      var key = keyFromHref(href);
      if (!key && a.getAttribute('data-tb-hash')) key = normHash(a.getAttribute('data-tb-hash'));
      if (!key) continue;
      a.setAttribute('data-tb-hash', key);
      // Убираем якорь полностью — иначе Тильда/браузер скроллят наверх
      if (a.getAttribute('href') && a.getAttribute('href').indexOf('#') >= 0) {
        a.setAttribute('href', 'javascript:void(0)');
      }
      if (a.getAttribute('data-href') && String(a.getAttribute('data-href')).indexOf('#') >= 0) {
        a.setAttribute('data-href', 'javascript:void(0)');
      }
      a.style.cursor = 'pointer';
    }
  }

  function openKey(key) {
    forceY();
    window.__tbKeepY = lastY;
    var api = window[POP[key]];
    var now = Date.now();
    if (api && typeof api.open === 'function') {
      if (lastOpen === key && now - lastOpenAt < 400) return true;
      lastOpen = key;
      lastOpenAt = now;
      pending = '';
      armScrollLock(2500);
      forceY();
      api.open(key);
      forceY();
      return true;
    }
    pending = key;
    return false;
  }

  function intercept(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.type !== 'keydown' && e.button && e.button !== 0) return;
    var key = keyFromNode(e.target);
    if (!key) return;

    if (!isLocked()) freezeY(true);
    holdUntil = Date.now() + 2000;
    armScrollLock(2500);

    if (e.cancelable && e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    clearPopHash();
    forceY();

    if (e.type === 'click' || e.type === 'pointerup' || e.type === 'keyup') openKey(key);
  }

  (function () {
    var st = document.createElement('style');
    st.id = 'tb-pop-noscroll';
    st.textContent = 'html{scroll-behavior:auto!important}';
    (document.head || document.documentElement).appendChild(st);
  })();

  freezeY(true);

  window.addEventListener('scroll', function () {
    if (restoring || Date.now() < pinning || isLocked()) {
      if (restoring || Date.now() < pinning || isLocked()) forceY();
      return;
    }
    freezeY(false);
  }, { passive: true });

  ['pointerdown', 'mousedown', 'touchstart', 'click', 'pointerup', 'touchend'].forEach(function (ev) {
    window.addEventListener(ev, intercept, true);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    intercept(e);
  }, true);

  window.addEventListener('hashchange', function () {
    var key = normHash(location.hash);
    if (!POP[key]) return;
    clearPopHash();
    armScrollLock(2500);
    forceY();
    openKey(key);
  });

  if (POP[normHash(location.hash)]) {
    var bootKey = normHash(location.hash);
    freezeY(true);
    clearPopHash();
    armScrollLock(2500);
    setTimeout(function () { openKey(bootKey); }, 0);
  }

  // После закрытия попапа — вернуть Y (класс lock сняли)
  var wasLocked = 0;
  setInterval(function () {
    var now = isLocked() ? 1 : 0;
    if (wasLocked && !now) restoreY();
    wasLocked = now;
  }, 100);

  function bootScan() {
    neutralizeLinks(document);
    [400, 1000, 2000, 4000].forEach(function (t) {
      setTimeout(function () { neutralizeLinks(document); }, t);
    });
    if (typeof MutationObserver !== 'undefined') {
      try {
        var mo = new MutationObserver(function (muts) {
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type === 'childList') {
              for (var j = 0; j < m.addedNodes.length; j++) {
                var n = m.addedNodes[j];
                if (n && n.nodeType === 1) neutralizeLinks(n);
              }
            }
            if (m.type === 'attributes' && m.target) neutralizeLinks(m.target.parentNode || document);
          }
        });
        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'data-href'] });
      } catch (e) {}
    }
  }

  var FILES = [
    'order.css', 'order.js',
    'gift.css', 'gift.js',
    'visit.css', 'visit.js',
    'story.css', 'story.js'
  ];
  var VER = 'v=21';

  function loadCss(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    (document.head || document.documentElement).appendChild(l);
  }

  function loadJsOnce(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
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

  FILES.forEach(function (name) {
    if (/\.css$/i.test(name)) loadCss(BASE + name + '?' + VER);
  });

  var chain = Promise.resolve();
  FILES.forEach(function (name) {
    if (/\.js$/i.test(name)) chain = chain.then(function () { return loadJs(name); });
  });

  function flush() { if (pending) openKey(pending); }
  chain.then(function () {
    flush();
    window.__tbPopups.ready = 1;
  }, function (err) {
    flush();
    if (typeof console !== 'undefined' && console.error) console.error('[THE BOYS popups]', err);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootScan);
  else bootScan();
})();
