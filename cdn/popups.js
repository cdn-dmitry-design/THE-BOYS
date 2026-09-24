/*! THE BOYS Tilda popups loader
 * One line for Tilda HTML block:
 * <script src="https://cdn.jsdelivr.net/gh/cdn-dmitry-design/THE-BOYS@main/cdn/popups.js"></script>
 *
 * Forms still go through native Tilda form blocks on the page
 * (data-form-rec / default rec ids inside each popup script).
 */
(function () {
  var BASE = (function () {
    var s = document.currentScript;
    if (s && s.src) return s.src.replace(/\/[^\/]*$/, '/');
    return 'https://cdn.jsdelivr.net/gh/cdn-dmitry-design/THE-BOYS@main/cdn/';
  })();

  var POP = {
    order: 'tbOrderPop',
    zayavka: 'tbOrderPop',
    gift: 'tbGiftPop',
    card: 'tbGiftPop',
    podarok: 'tbGiftPop',
    visit: 'tbVisitPop',
    'tb-visit': 'tbVisitPop',
    'story-1': 'tbStoryPop'
  };
  var pending = '';
  var lastY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var holdUntil = 0;
  var lastOpen = '';
  var lastOpenAt = 0;

  function hashKey(node) {
    if (!node) return '';
    if (node.nodeType === 3) node = node.parentElement;
    if (!node || !node.closest) return '';
    var pop = node.closest('[data-tb-pop]');
    if (pop) {
      var kind = String(pop.getAttribute('data-tb-pop') || '').toLowerCase();
      if (POP[kind]) return kind;
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
    h = String(h || '').replace(/^#/, '').split(/[?&/]/)[0].toLowerCase();
    return POP[h] ? h : '';
  }

  function remember() {
    if (Date.now() < holdUntil) return;
    var html = document.documentElement;
    if (html.classList.contains('tb-order-lock') || html.classList.contains('tb-gift-lock') || html.classList.contains('tb-story-lock')) return;
    lastY = window.pageYOffset || html.scrollTop || 0;
  }

  function openKey(key) {
    var api = window[POP[key]];
    var now = Date.now();
    if (api && typeof api.open === 'function') {
      if (lastOpen === key && now - lastOpenAt < 500) return true;
      lastOpen = key;
      lastOpenAt = now;
      pending = '';
      api.open(key);
      return true;
    }
    pending = key;
    return false;
  }

  function stay() {
    var html = document.documentElement;
    if (html.classList.contains('tb-order-lock') || html.classList.contains('tb-gift-lock') || html.classList.contains('tb-story-lock')) return;
    if (Math.abs((window.pageYOffset || html.scrollTop || 0) - lastY) > 1) window.scrollTo(0, lastY);
  }

  function clearHash() {
    var key = String(location.hash || '').replace(/^#/, '').split(/[?&/]/)[0].toLowerCase();
    if (!POP[key]) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    stay();
  }

  function hold(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button && e.button !== 0)) return;
    var key = hashKey(e.target);
    if (!key) return;
    if (Date.now() >= holdUntil) remember();
    holdUntil = Date.now() + 800;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (e.type === 'click') openKey(key);
    clearHash();
    setTimeout(stay, 0);
    requestAnimationFrame(stay);
  }

  window.addEventListener('scroll', remember, { passive: true });
  window.addEventListener('click', hold, true);
  window.addEventListener('hashchange', function () {
    var key = String(location.hash || '').replace(/^#/, '').split(/[?&/]/)[0].toLowerCase();
    if (!POP[key]) return;
    clearHash();
    openKey(key);
    setTimeout(stay, 0);
  });

  var FILES = [
    'order.css', 'order.js',
    'gift.css', 'gift.js',
    'visit.css', 'visit.js',
    'story.css', 'story.js'
  ];

  function loadCss(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    (document.head || document.documentElement).appendChild(l);
  }

  function loadJs(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  var chain = Promise.resolve();
  FILES.forEach(function (name) {
    var url = BASE + name + '?v=5';
    if (/\.css$/i.test(name)) loadCss(url);
    else chain = chain.then(function () { return loadJs(url); });
  });

  function flush() { if (pending) openKey(pending); }
  chain.then(flush, function (err) {
    flush();
    if (typeof console !== 'undefined' && console.error) console.error('[THE BOYS popups]', err);
  });
})();
