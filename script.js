// 読み込み完了後に黒からフェードイン
window.addEventListener('load', function () {
  document.body.classList.add('loaded');
});

// Works カルーセル：常に一定速度で流れ続ける。1行目は左、2行目は右…と交互
(function () {
  var SPEED = 30; // px/秒

  var carousels = Array.prototype.map.call(document.querySelectorAll('.carousel'), function (el, index) {
    var track = el.querySelector('.carousel-track');
    var originals = Array.prototype.slice.call(track.children);
    var c = {
      el: el, track: track, originals: originals,
      dir: index % 2 === 0 ? -1 : 1,
      offset: 0, setWidth: 0,
      dragging: false, moved: false, startX: 0, startOffset: 0
    };

    el.addEventListener('pointerdown', function (e) {
      c.dragging = true; c.moved = false;
      c.startX = e.clientX; c.startOffset = c.offset;
    });
    window.addEventListener('pointermove', function (e) {
      if (!c.dragging) return;
      var dx = e.clientX - c.startX;
      if (Math.abs(dx) > 5) c.moved = true;
      c.offset = c.startOffset + dx;
    });
    function end() { c.dragging = false; }
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    el.addEventListener('click', function (e) { if (c.moved) e.preventDefault(); }, true);

    layout(c);
    return c;
  });

  // 画面幅を埋めて途切れないだけ複製する
  function layout(c) {
    c.track.innerHTML = '';
    c.originals.forEach(function (li) { c.track.appendChild(li); });
    if (!c.originals.length) return;
    var gap = parseFloat(getComputedStyle(c.track).columnGap) || 0;
    c.setWidth = c.track.scrollWidth + gap;
    var copies = Math.ceil(c.el.offsetWidth / c.setWidth) + 1;
    for (var k = 0; k < copies; k++) {
      c.originals.forEach(function (li) {
        var clone = li.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        c.track.appendChild(clone);
      });
    }
    c.track.querySelectorAll('a').forEach(function (a) { a.draggable = false; });
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { carousels.forEach(layout); }, 200);
  });

  var last = performance.now();
  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    carousels.forEach(function (c) {
      if (!c.setWidth) return;
      if (!c.dragging) c.offset += c.dir * SPEED * dt;
      // offset を [-setWidth, 0) に収めてループさせる
      var x = ((c.offset % c.setWidth) + c.setWidth) % c.setWidth - c.setWidth;
      c.track.style.transform = 'translate3d(' + x + 'px,0,0)';
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
