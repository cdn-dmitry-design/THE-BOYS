/*! THE BOYS Tilda popups loader v26
 * One-line T123 boot — see docs/tilda-embed.html
 * Triggers: #order #gift #visit #story-1
 */
(function () {
  if (window.__tbPopups) return;
  window.__tbPopups = { v: 26 };

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
  var jumpUntil = 0;
  var jumpRaf = 0;
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
    var y = readY();
    if (y < 0) y = 0;
    // Прыжок наверх не должен затирать место, где человек был
    if (y < 2 && lastY > 2) return;
    if (!force && (restoring || Date.now() < holdUntil || Date.now() < pinning || Date.now() < jumpUntil || isLocked())) return;
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
    pinning = 0;
    holdUntil = 0;
    restoring = 0;
    jumpUntil = 0;
    if (jumpRaf) { cancelAnimationFrame(jumpRaf); jumpRaf = 0; }
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

  function restoreY() {
    disarmNow();
  }

  window.__tbRestoreY = restoreY;
  window.__tbReleaseScroll = disarmNow;

  function jumpLoop() {
    jumpRaf = 0;
    if (Date.now() >= jumpUntil) return;
    forceY();
    jumpRaf = requestAnimationFrame(jumpLoop);
  }

  function armScrollLock(ms) {
    var y = readY();
    if (!(y < 2 && lastY > 2)) freezeY(true);
    jumpUntil = Date.now() + (ms || 1200);
    pinning = jumpUntil;
    holdUntil = Math.max(holdUntil, pinning);
    if (!patched) {
      patched = 1;
      window.scrollTo = function () { if (Date.now() < jumpUntil || isLocked()) forceY(); else _scrollTo.apply(window, arguments); };
      window.scroll = function () { if (Date.now() < jumpUntil || isLocked()) forceY(); else _scroll.apply(window, arguments); };
      window.scrollBy = function () { if (Date.now() < jumpUntil || isLocked()) forceY(); else _scrollBy.apply(window, arguments); };
      Element.prototype.scrollIntoView = function () { if (Date.now() < jumpUntil || isLocked()) forceY(); else _scrollIntoView.apply(this, arguments); };
    }
    if (!jumpRaf) jumpRaf = requestAnimationFrame(jumpLoop);
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
    if (!isLocked() && Date.now() >= jumpUntil) maybeDisarm();
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
      if (el.classList) {
        if (el.classList.contains('order')) return 'order';
        if (el.classList.contains('gift')) return 'gift';
        if (el.classList.contains('visit')) return 'visit';
        if (el.classList.contains('story') || el.classList.contains('story-1')) return 'story-1';
      }
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

  function classKey(el) {
    if (!el || !el.classList) return '';
    if (el.classList.contains('order')) return 'order';
    if (el.classList.contains('gift')) return 'gift';
    if (el.classList.contains('visit')) return 'visit';
    if (el.classList.contains('story') || el.classList.contains('story-1')) return 'story-1';
    var kind = String(el.getAttribute && el.getAttribute('data-tb-pop') || '').toLowerCase();
    if (kind === 'story') return 'story-1';
    return POP[kind] ? kind : '';
  }

  function stripAnchor(a, key) {
    if (!a || !key) return;
    a.setAttribute('data-tb-hash', key);
    // javascript:void(0) и «#» Тильда всё равно уводит на первый экран
    if (a.hasAttribute('href')) a.removeAttribute('href');
    if (a.hasAttribute('data-href')) a.removeAttribute('data-href');
    a.setAttribute('role', 'button');
    a.style.cursor = 'pointer';
  }

  function neutralizeLinks(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var list = scope.querySelectorAll('a[href], a[data-href], area[href], .order, .gift, .visit, .story, .story-1, [data-tb-pop]');
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      var href = a.getAttribute('href') || a.getAttribute('data-href') || '';
      var key = keyFromHref(href) || classKey(a);
      if (!key && a.getAttribute('data-tb-hash')) key = normHash(a.getAttribute('data-tb-hash'));
      if (!key) continue;
      stripAnchor(a, key);
      if (!a.querySelectorAll) continue;
      var inner = a.querySelectorAll('a[href], a[data-href]');
      for (var j = 0; j < inner.length; j++) stripAnchor(inner[j], key);
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
      armScrollLock(1200);
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
    holdUntil = Date.now() + 1200;
    armScrollLock(1200);

    if (e.cancelable && e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    clearPopHash();
    forceY();
    requestAnimationFrame(forceY);
    setTimeout(forceY, 0);

    if (e.type === 'click' || e.type === 'pointerup' || e.type === 'keyup') openKey(key);
  }

  (function () {
    var st = document.createElement('style');
    st.id = 'tb-pop-noscroll';
    st.textContent = 'html{scroll-behavior:auto!important}.tb-mount-hide{padding:0!important;margin:0!important;min-height:0!important;height:0!important;overflow:hidden!important;border:0!important;background:none!important}.tb-mount-hide .t-container,.tb-mount-hide .t123,.tb-mount-hide .t123__content,.tb-mount-hide .t-col,.tb-mount-hide .t-width{max-width:none!important;width:100%!important;padding:0!important;margin:0!important;min-height:0!important;height:0!important;overflow:hidden!important}';
    (document.head || document.documentElement).appendChild(st);
  })();

  freezeY(true);

  window.addEventListener('scroll', function () {
    if (Date.now() < jumpUntil || isLocked()) {
      forceY();
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
    armScrollLock(1200);
    forceY();
    openKey(key);
  });

  if (POP[normHash(location.hash)]) {
    var bootKey = normHash(location.hash);
    freezeY(true);
    clearPopHash();
    armScrollLock(1200);
    setTimeout(function () { openKey(bootKey); }, 0);
  }

  // После закрытия попапа — вернуть Y (класс lock сняли)
  var wasLocked = 0;
  setInterval(function () {
    var now = isLocked() ? 1 : 0;
    if (wasLocked && !now) disarmNow();
    wasLocked = now;
  }, 100);

  function hideMounts() {
    ['tbOrderMount', 'tbGiftMount', 'tbVisitMount', 'tbStoryMount'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || !el.closest) return;
      var rec = el.closest('[id^="rec"]');
      if (rec) rec.classList.add('tb-mount-hide');
    });
  }

  function bootScan() {
    neutralizeLinks(document);
    hideMounts();
    if (typeof MutationObserver !== 'undefined') {
      try {
        var timer = 0;
        var mo = new MutationObserver(function (muts) {
          var added = 0;
          for (var i = 0; i < muts.length; i++) {
            if (muts[i].type === 'childList' && muts[i].addedNodes && muts[i].addedNodes.length) { added = 1; break; }
          }
          if (!added || timer) return;
          timer = setTimeout(function () {
            timer = 0;
            neutralizeLinks(document);
            hideMounts();
          }, 400);
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
      } catch (e) {}
    }
  }

  var FILES = [
    'order.css', 'order.js',
    'gift.css', 'gift.js',
    'visit.css', 'visit.js',
    'story.css', 'story.js'
  ];
  var VER = 'v=26';

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

  var chainStarted = 0;
  function startFiles() {
    if (chainStarted) return;
    chainStarted = 1;
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
  }
  if (document.readyState === 'complete') startFiles();
  else window.addEventListener('load', startFiles);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootScan);
  else bootScan();
})();
