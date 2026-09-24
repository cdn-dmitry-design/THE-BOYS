/*! THE BOYS Tilda popups loader v11
 * В Тильду (T123) вставляйте ИМЕННО так — inline, не голый <script src>:
 *
 * <script>
 * (function(){if(window.__tbPopBoot)return;window.__tbPopBoot=1;var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/cdn-dmitry-design/THE-BOYS@main/cdn/popups.js?v=11';s.onerror=function(){var b=document.createElement('script');b.src='https://raw.githack.com/cdn-dmitry-design/THE-BOYS/main/cdn/popups.js?v=11';document.head.appendChild(b);};(document.head||document.documentElement).appendChild(s);})();
 * </script>
 *
 * Zero Block CSS-класс БЕЗ точки (через запятую ок): order, visit, gift, story-1
 */
(function () {
  if (window.__tbPopups) return;
  window.__tbPopups = { v: 11 };

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
  var wired = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

  function classTokens(el) {
    if (!el) return [];
    var raw = '';
    if (typeof el.className === 'string') raw = el.className;
    else if (el.getAttribute) raw = el.getAttribute('class') || '';
    return String(raw).split(/[\s,]+/).map(function (t) {
      return String(t || '').replace(/^\.+/, '').replace(/\.+$/, '').toLowerCase();
    }).filter(Boolean);
  }

  function keyFromEl(el) {
    if (!el) return '';
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
    return '';
  }

  function classKey(node) {
    if (!node) return '';
    if (node.nodeType === 3) node = node.parentElement;
    var el = node;
    for (var depth = 0; el && depth < 16; depth++, el = el.parentElement) {
      var k = keyFromEl(el);
      if (k) return k;
    }
    return '';
  }

  function hashKey(node) {
    var byClass = classKey(node);
    if (byClass) return byClass;
    if (!node || !node.closest) return '';
    var a = node.closest ? node.closest('a[href]') : null;
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

  function styleTrigger(el) {
    if (!el || !el.style) return;
    el.style.setProperty('cursor', 'pointer', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    var atoms = el.querySelectorAll ? el.querySelectorAll('.tn-atom, a, button, *') : [];
    for (var i = 0; i < atoms.length; i++) {
      atoms[i].style.setProperty('cursor', 'pointer', 'important');
      atoms[i].style.setProperty('pointer-events', 'auto', 'important');
    }
  }

  function onTrig(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button && e.button !== 0)) return;
    var key = e.currentTarget && e.currentTarget.__tbKey;
    if (!key) key = hashKey(e.target);
    if (!key) return;
    if (Date.now() >= holdUntil) {
      lastY = window.pageYOffset || document.documentElement.scrollTop || 0;
    }
    holdUntil = Date.now() + 800;
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    openKey(key);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (err) {}
    setTimeout(function () {
      if (Math.abs((window.pageYOffset || 0) - lastY) > 1) window.scrollTo(0, lastY);
    }, 0);
  }

  function wireOne(el, key) {
    if (!el || !key) return;
    if (wired) {
      if (wired.has(el)) return;
      wired.add(el);
    } else if (el.getAttribute('data-tb-wired') === '1') return;
    el.__tbKey = key;
    if (el.setAttribute) el.setAttribute('data-tb-wired', '1');
    styleTrigger(el);
    el.addEventListener('click', onTrig, true);
    el.addEventListener('pointerup', onTrig, true);
  }

  function scan() {
    var all = document.querySelectorAll('[class], [data-tb-pop]');
    var found = 0;
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var key = keyFromEl(el);
      if (!key) continue;
      found++;
      wireOne(el, key);
    }
    window.__tbPopups.found = found;
    return found;
  }

  (function injectCursor() {
    if (document.getElementById('tb-pop-cursor')) return;
    var st = document.createElement('style');
    st.id = 'tb-pop-cursor';
    var kids = TRIG.map(function (n) {
      return '.' + n + ',.' + n + ' .tn-atom,.' + n + ' * ,[class*="' + n + '"] ,[class*="' + n + '"] .tn-atom';
    }).join(',');
    st.textContent = kids + '{cursor:pointer!important;pointer-events:auto!important}';
    (document.head || document.documentElement).appendChild(st);
  })();

  function remember() {
    if (Date.now() < holdUntil) return;
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

  function hold(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button && e.button !== 0)) return;
    var key = hashKey(e.target);
    if (!key) return;
    if (Date.now() >= holdUntil) remember();
    holdUntil = Date.now() + 800;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (e.type === 'click' || e.type === 'pointerup') openKey(key);
    try {
      var hk = String(location.hash || '').replace(/^#/, '').split(/[?&/]/)[0].toLowerCase();
      if (POP[hk]) history.replaceState(null, '', location.pathname + location.search);
    } catch (err) {}
    setTimeout(function () {
      if (Math.abs((window.pageYOffset || 0) - lastY) > 1) window.scrollTo(0, lastY);
    }, 0);
  }

  window.addEventListener('scroll', remember, { passive: true });
  window.addEventListener('click', hold, true);
  window.addEventListener('pointerup', hold, true);
  window.addEventListener('hashchange', function () {
    var key = String(location.hash || '').replace(/^#/, '').split(/[?&/]/)[0].toLowerCase();
    if (!POP[key]) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    openKey(key);
  });

  var FILES = [
    'order.css', 'order.js',
    'gift.css', 'gift.js',
    'visit.css', 'visit.js',
    'story.css', 'story.js'
  ];
  var VER = 'v=11';

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
      var url = bases[i++] + name + '?' + VER;
      return loadJsOnce(url).catch(next);
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

  function bootScan() {
    scan();
    setTimeout(scan, 500);
    setTimeout(scan, 1500);
    setTimeout(scan, 3000);
    if (typeof MutationObserver !== 'undefined') {
      try {
        var mo = new MutationObserver(function () { scan(); });
        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
      } catch (e) {}
    }
  }

  function flush() { if (pending) openKey(pending); }
  chain.then(function () {
    flush();
    bootScan();
    window.__tbPopups.ready = 1;
  }, function (err) {
    flush();
    bootScan();
    if (typeof console !== 'undefined' && console.error) console.error('[THE BOYS popups]', err);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootScan);
  else bootScan();
})();
