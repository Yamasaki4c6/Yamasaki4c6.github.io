// 読み込み完了後に黒からフェードイン
window.addEventListener('load', function () {
  document.body.classList.add('loaded');
});

// Works カルーセル
(function () {
  var MIN_ITEMS = 5;      // 回転を自然に見せるための最小枚数（足りなければ複製）
  var INTERVAL = 3500;    // 自動で次へ進む間隔(ms)
  var RESUME_DELAY = 2000; // 触れ終わってから自動回転を再開するまで(ms)

  var carousels = Array.prototype.map.call(document.querySelectorAll('.carousel'), setup);

  function setup(el) {
    var track = el.querySelector('.carousel-track');
    var originals = Array.prototype.slice.call(track.children);
    var i = 0;
    while (originals.length && track.children.length < MIN_ITEMS) {
      track.appendChild(originals[i % originals.length].cloneNode(true));
      i++;
    }
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (li) {
      li.querySelectorAll('a, img').forEach(function (a) { a.draggable = false; });
    });

    var c = {
      el: el, items: items, pos: 0, target: 0,
      paused: false, hover: false, dragging: false, moved: false,
      startX: 0, startPos: 0, lastStep: performance.now(), resumeTimer: null
    };

    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { c.hover = true; } });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { c.hover = false; c.lastStep = performance.now(); } });

    el.addEventListener('pointerdown', function (e) {
      c.dragging = true; c.moved = false;
      c.startX = e.clientX; c.startPos = c.pos;
      clearTimeout(c.resumeTimer); c.paused = true;
    });
    window.addEventListener('pointermove', function (e) {
      if (!c.dragging) return;
      var dx = e.clientX - c.startX;
      if (Math.abs(dx) > 5) c.moved = true;
      c.pos = c.target = c.startPos - dx / spacing(c);
    });
    function end() {
      if (!c.dragging) return;
      c.dragging = false;
      c.target = Math.round(c.pos);
      c.resumeTimer = setTimeout(function () { c.paused = false; c.lastStep = performance.now(); }, RESUME_DELAY);
    }
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    el.addEventListener('click', function (e) { if (c.moved) e.preventDefault(); }, true);

    return c;
  }

  function cssNum(el, name) {
    return parseFloat(getComputedStyle(el).getPropertyValue(name));
  }

  function spacing(c) {
    return c.items[0].offsetWidth * cssNum(c.el, '--gap');
  }

  function frame(now) {
    carousels.forEach(function (c) {
      var n = c.items.length;
      if (!n) return;
      if (!c.paused && !c.hover && !c.dragging && now - c.lastStep > INTERVAL) {
        c.target += 1; c.lastStep = now;
      }
      if (!c.dragging) c.pos += (c.target - c.pos) * 0.06;

      var sp = spacing(c);
      var scale = cssNum(c.el, '--scale');
      c.items.forEach(function (li, i) {
        var o = ((i - c.pos) % n + n) % n;
        if (o > n / 2) o -= n;
        var s = 1 + (scale - 1) * Math.max(0, 1 - Math.abs(o));
        li.style.transform = 'translateX(calc(-50% + ' + (o * sp) + 'px)) scale(' + s + ')';
        li.style.zIndex = Math.round(10 - Math.abs(o) * 2);
      });
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
