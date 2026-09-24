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

  var FILES = [
    'order.css', 'order.js',
    'gift.css', 'gift.js',
    'visit.css', 'visit.js'
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
    var url = BASE + name + '?v=2';
    if (/\.css$/i.test(name)) loadCss(url);
    else chain = chain.then(function () { return loadJs(url); });
  });

  chain.catch(function (err) {
    if (typeof console !== 'undefined' && console.error) console.error('[THE BOYS popups]', err);
  });
})();
