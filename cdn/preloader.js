/*! THE BOYS preloader
 * Green field, THE | BOYS, a dashed cut top to bottom, then the halves slide away.
 */
(function () {
  if (window.__tbPreloader) return;
  window.__tbPreloader = 1;

  var BASE = window.__tbPreBase || (function () {
    var s = document.currentScript;
    if (s && s.src) {
      var raw = String(s.src).split('?')[0];
      var b = raw.replace(/\/[^\/]*$/, '/');
      if (b) return b;
    }
    return '';
  })();

  var html = document.documentElement;
  html.classList.add('tb-pre-on');

  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = BASE + 'preloader.css?v=18';
  (document.head || html).appendChild(css);

  var root = document.getElementById('tbPreloader');
  if (!root) {
    root = document.createElement('div');
    root.id = 'tbPreloader';
    html.appendChild(root);
  }
  root.className = 'tb-pre';
  root.setAttribute('aria-hidden', 'true');

  function mark(side, fileSm, wSm, hSm, fileLg, wLg, hLg) {
    return (
      '<div class="tb-pre__mark tb-pre__mark--' + side + '">' +
        '<img class="tb-pre__logo tb-pre__logo--sm" alt="" width="' + wSm + '" height="' + hSm + '" src="' + BASE + 'preloader/' + fileSm + '">' +
        '<img class="tb-pre__logo tb-pre__logo--lg" alt="" width="' + wLg + '" height="' + hLg + '" src="' + BASE + 'preloader/' + fileLg + '">' +
      '</div>'
    );
  }

  function half(mod, inner) {
    return (
      '<div class="tb-pre__half tb-pre__half--' + mod + '">' +
        '<div class="tb-pre__wash"></div>' +
        '<div class="tb-pre__grain"></div>' +
        inner +
      '</div>'
    );
  }

  root.innerHTML =
    half('l', mark('the', 'the.svg', 45, 16, 'the-open.svg', 68, 24)) +
    half('r', mark('boys', 'boys.svg', 57, 16, 'boys-open.svg', 86, 24)) +
    '<div class="tb-pre__seam"><i class="tb-pre__line"></i><i class="tb-pre__dot"></i></div>';

  var seam = root.querySelector('.tb-pre__seam');
  var right = root.querySelector('.tb-pre__half--r');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = 0;
  var opened = 0;
  var finished = 0;

  function block(e) {
    if (!finished && e.cancelable) e.preventDefault();
  }
  window.addEventListener('wheel', block, { passive: false });
  window.addEventListener('touchmove', block, { passive: false });

  function finish() {
    if (finished) return;
    finished = 1;
    window.__tbPreloaderDone = 1;
    window.removeEventListener('wheel', block);
    window.removeEventListener('touchmove', block);
    if (root.parentNode) root.parentNode.removeChild(root);
    html.classList.remove('tb-pre-on');
    var cover = document.getElementById('tb-pre-cover');
    if (cover && cover.parentNode) cover.parentNode.removeChild(cover);
  }

  function open() {
    if (opened || finished) return;
    opened = 1;
    root.classList.add('is-split');
    var go = function () {
      if (finished) return;
      root.classList.add('is-open');
      setTimeout(finish, reduce ? 40 : 1000);
    };
    var afterLine = function () {
      if (document.readyState === 'complete') go();
      else {
        var late = setTimeout(go, 2500);
        window.addEventListener('load', function () {
          clearTimeout(late);
          go();
        }, { once: true });
      }
    };
    setTimeout(afterLine, reduce ? 0 : 220);
  }

  function draw() {
    if (started || finished) return;
    started = 1;
    if (reduce) {
      root.classList.add('is-in');
      setTimeout(open, 280);
      return;
    }
    requestAnimationFrame(function () {
      root.classList.add('is-in');
      setTimeout(function () { root.classList.add('is-draw'); }, 420);
    });
    seam.addEventListener('transitionend', function (e) {
      if (e.propertyName !== 'height' || e.target !== seam) return;
      open();
    });
    setTimeout(function () {
      if (!opened) open();
    }, 2400);
  }

  right.addEventListener('transitionend', function (e) {
    if (e.propertyName !== 'transform' || !root.classList.contains('is-open')) return;
    finish();
  });

  if (css.sheet) draw();
  else {
    css.addEventListener('load', draw);
    css.addEventListener('error', draw);
    setTimeout(function () { if (!root.classList.contains('is-in') && !reduce) draw(); }, 700);
  }

  setTimeout(finish, 9000);
})();
