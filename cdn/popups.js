/*! THE BOYS Tilda popups loader v13
 * One-line T123 boot — see docs/tilda-embed.html
 * Triggers: #order #gift #visit #story-1 (no page jump)
 */
(function () {
  if (window.__tbPopups) return;
  window.__tbPopups = { v: 13 };

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
  var TRIG = ['story-1', 'story-2', 'story-3', 'visit', 'order', 'gift'];
  var pending = '';
  var lastY = readY();
  var holdUntil = 0;
  var lastOpen = '';
  var lastOpenAt = 0;
  var pinning = 0;
  var patched = 0;
  var _scrollTo = window.scrollTo;
  var _scroll = window.scroll;
  var _scrollBy = window.scrollBy;
  var _scrollIntoView = Element.prototype.scrollIntoView;

  function readY() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function normHash(h) {
    return String(h || '').replace(/^#/, '').split(/[?&/]/)[0].toLowerCase();
  }

  function classTokens(el) {
    if (!el) return [];
    var raw = typeof el.className === 'string' ? el.className : (el.getAttribute && el.getAttribute('class')) || '';
    return String(raw).split(/[\s,]+/).map(function (t) {
      return String(t || '').replace(/^\.+/, '').toLowerCase();
    }).filter(Boolean);
  }

  function freezeY() {
    lastY = readY();
    if (lastY < 0) lastY = 0;
    window.__tbKeepY = lastY;
  }

  function forceY() {
    var y = window.__tbKeepY != null ? window.__tbKeepY : lastY;
    try {
      _scrollTo.call(window, 0, y);
      document.documentElement.scrollTop = y;
      if (document.body) document.body.scrollTop = y;
    } catch (e) {}
  }

  function armScrollLock() {
    pinning = Date.now() + 1500;
    holdUntil = Math.max(holdUntil, pinning);
    if (patched) return;
    patched = 1;
    window.scrollTo = function () { forceY(); };
    window.scroll = function () { forceY(); };
    window.scrollBy = function () { forceY(); };
    Element.prototype.scrollIntoView = function () { forceY(); };
    setTimeout(disarmScrollLock, 1500);
  }

  function disarmScrollLock() {
    if (!patched) return;
    patched = 0;
    window.scrollTo = _scrollTo;
    window.scroll = _scroll;
    window.scrollBy = _scrollBy;
    Element.prototype.scrollIntoView = _scrollIntoView;
    forceY();
  }

  function pinScroll() {
    armScrollLock();
    forceY();
    var n = 0;
    function tick() {
      if (Date.now() > pinning || n++ > 90) return;
      forceY();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
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

    var el = node;
    for (var d = 0; el && d < 16; d++, el = el.parentElement) {
      if (el.getAttribute) {
        var dh = el.getAttribute('data-tb-hash');
        if (dh && POP[normHash(dh)]) return normHash(dh);
        var kind = String(el.getAttribute('data-tb-pop') || '').toLowerCase();
        if (kind === 'story') {
          var sid = String(el.getAttribute('data-tb-story') || '1').toLowerCase();
          var sk = sid.indexOf('story-') === 0 ? sid : 'story-' + sid;
          if (POP[sk]) return sk;
        }
        if (POP[kind]) return kind;
      }
      var tokens = classTokens(el);
      for (var i = 0; i < TRIG.length; i++) {
        if (tokens.indexOf(TRIG[i]) >= 0) return TRIG[i];
      }
    }

    var a = node.closest('a[href], area[href]');
    if (!a) return '';
    var fromData = a.getAttribute('data-tb-hash');
    if (fromData && POP[normHash(fromData)]) return normHash(fromData);
    return keyFromHref(a.getAttribute('href') || a.href || '');
  }

  /** Убираем настоящий якорь у ссылок — иначе браузер/Тильда скроллят наверх */
  function neutralizeLinks(root) {
    var list = (root || document).querySelectorAll('a[href], area[href]');
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a.getAttribute('data-tb-hash')) continue;
      var key = keyFromHref(a.getAttribute('href') || '');
      if (!key) continue;
      a.setAttribute('data-tb-hash', key);
      a.setAttribute('href', 'javascript:void(0)');
      a.style.cursor = 'pointer';
    }
  }

  function remember() {
    if (Date.now() < holdUntil || Date.now() < pinning) return;
    var html = document.documentElement;
    if (html.classList.contains('tb-order-lock') || html.classList.contains('tb-gift-lock') || html.classList.contains('tb-story-lock') || html.classList.contains('tb-visit-lock')) return;
    freezeY();
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

    // Запомнить Y до любого скролла якоря
    if (Date.now() >= holdUntil) freezeY();
    holdUntil = Date.now() + 1500;

    if (e.cancelable && e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    clearPopHash();
    pinScroll();

    if (e.type === 'click' || e.type === 'pointerup' || e.type === 'keyup') openKey(key);
  }

  // CSS: запрет smooth-scroll на время жизни страницы для наших кейсов
  (function () {
    var st = document.createElement('style');
    st.id = 'tb-pop-noscroll';
    st.textContent = 'html{scroll-behavior:auto!important}';
    (document.head || document.documentElement).appendChild(st);
  })();

  window.addEventListener('scroll', function () {
    if (Date.now() < pinning) {
      forceY();
      return;
    }
    remember();
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
    // НЕ вызываем remember() — страница уже могла уехать вверх
    clearPopHash();
    pinScroll();
    openKey(key);
  });

  if (POP[normHash(location.hash)]) {
    var bootKey = normHash(location.hash);
    freezeY();
    clearPopHash();
    pinScroll();
    setTimeout(function () { openKey(bootKey); }, 0);
  }

  function bootScan() {
    neutralizeLinks(document);
    setTimeout(function () { neutralizeLinks(document); }, 400);
    setTimeout(function () { neutralizeLinks(document); }, 1200);
    setTimeout(function () { neutralizeLinks(document); }, 3000);
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
            if (m.type === 'attributes' && m.target && m.target.tagName === 'A') neutralizeLinks(m.target.parentNode || document);
          }
        });
        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
      } catch (e) {}
    }
  }

  var FILES = [
    'order.css', 'order.js',
    'gift.css', 'gift.js',
    'visit.css', 'visit.js',
    'story.css', 'story.js'
  ];
  var VER = 'v=13';

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
