/*! THE BOYS Tilda popups loader v12
 *
 * В T123 вставьте:
 * <script>
 * (function(){if(window.__tbPopBoot)return;window.__tbPopBoot=1;var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/cdn-dmitry-design/THE-BOYS@main/cdn/popups.js?v=12';s.onerror=function(){var b=document.createElement('script');b.src='https://raw.githack.com/cdn-dmitry-design/THE-BOYS/main/cdn/popups.js?v=12';document.head.appendChild(b);};(document.head||document.documentElement).appendChild(s);})();
 * </script>
 *
 * Триггеры — обычные ссылки с хэшем (без прыжка страницы):
 *   #order  #gift  #visit  #story-1  (#story-2 / #story-3 позже)
 * Опционально: CSS-класс order / gift / visit / story-1
 */
(function () {
  if (window.__tbPopups) return;
  window.__tbPopups = { v: 12 };

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
  var lastY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var holdUntil = 0;
  var lastOpen = '';
  var lastOpenAt = 0;
  var pinning = 0;

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

  function keyFromNode(node) {
    if (!node) return '';
    if (node.nodeType === 3) node = node.parentElement;
    if (!node || !node.closest) return '';

    var el = node;
    for (var d = 0; el && d < 16; d++, el = el.parentElement) {
      var tokens = classTokens(el);
      for (var i = 0; i < TRIG.length; i++) {
        if (tokens.indexOf(TRIG[i]) >= 0) return TRIG[i];
      }
      if (el.getAttribute) {
        var kind = String(el.getAttribute('data-tb-pop') || '').toLowerCase();
        if (kind === 'story') {
          var sid = String(el.getAttribute('data-tb-story') || '1').toLowerCase();
          var sk = sid.indexOf('story-') === 0 ? sid : 'story-' + sid;
          if (POP[sk]) return sk;
        }
        if (POP[kind]) return kind;
      }
    }

    var a = node.closest('a[href]');
    if (!a) return '';
    var h = '';
    try { h = a.hash || ''; } catch (e) {}
    if (!h) {
      var raw = a.getAttribute('href') || '';
      var i = raw.indexOf('#');
      if (i >= 0) h = raw.slice(i);
    }
    h = normHash(h);
    return POP[h] ? h : '';
  }

  function pinScroll() {
    pinning = Date.now() + 1000;
    var y = lastY;
    var html = document.documentElement;
    function stick() {
      if (Date.now() > pinning) return;
      var now = window.pageYOffset || html.scrollTop || 0;
      if (Math.abs(now - y) > 1) window.scrollTo(0, y);
      requestAnimationFrame(stick);
    }
    window.scrollTo(0, y);
    requestAnimationFrame(stick);
    setTimeout(function () { window.scrollTo(0, y); }, 0);
    setTimeout(function () { window.scrollTo(0, y); }, 50);
    setTimeout(function () { window.scrollTo(0, y); }, 150);
    setTimeout(function () { window.scrollTo(0, y); }, 300);
  }

  function clearHash() {
    var key = normHash(location.hash);
    if (!POP[key] && key !== '') return;
    if (!POP[key]) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }

  function remember() {
    if (Date.now() < holdUntil || Date.now() < pinning) return;
    var html = document.documentElement;
    if (html.classList.contains('tb-order-lock') || html.classList.contains('tb-gift-lock') || html.classList.contains('tb-story-lock') || html.classList.contains('tb-visit-lock')) return;
    lastY = window.pageYOffset || html.scrollTop || 0;
  }

  function openKey(key) {
    var api = window[POP[key]];
    var now = Date.now();
    if (api && typeof api.open === 'function') {
      if (lastOpen === key && now - lastOpenAt < 400) return true;
      lastOpen = key;
      lastOpenAt = now;
      pending = '';
      api.open(key);
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

    if (Date.now() >= holdUntil) remember();
    holdUntil = Date.now() + 1200;

    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    clearHash();
    pinScroll();

    if (e.type === 'click' || e.type === 'pointerup' || e.type === 'keyup') openKey(key);
  }

  window.addEventListener('scroll', remember, { passive: true });
  // Перехват до Тильды и до скролла по якорю
  ['pointerdown', 'mousedown', 'click', 'pointerup', 'touchstart', 'touchend'].forEach(function (ev) {
    window.addEventListener(ev, intercept, true);
    document.addEventListener(ev, intercept, true);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    intercept(e);
  }, true);

  window.addEventListener('hashchange', function () {
    var key = normHash(location.hash);
    if (!POP[key]) return;
    remember();
    clearHash();
    pinScroll();
    openKey(key);
  });

  // Если кто-то всё же поставил hash — убрать и открыть
  if (POP[normHash(location.hash)]) {
    var bootKey = normHash(location.hash);
    clearHash();
    pinScroll();
    setTimeout(function () { openKey(bootKey); }, 0);
  }

  var FILES = [
    'order.css', 'order.js',
    'gift.css', 'gift.js',
    'visit.css', 'visit.js',
    'story.css', 'story.js'
  ];
  var VER = 'v=12';

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
})();
