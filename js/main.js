(function () {
  var header = document.getElementById('header');
  var hero = document.getElementById('hero');
  var btn = document.getElementById('menuBtn');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // トスの球：弧の上をくり返し飛ばす
  var path = document.getElementById('arcPath');
  var ball = document.querySelector('.hero__ball');
  if (path && ball) {
    var len = path.getTotalLength(), t0 = null, DUR = 3200, WAIT = 1400;
    var place = function (p) { var pt = path.getPointAtLength(len * p); ball.setAttribute('cx', pt.x); ball.setAttribute('cy', pt.y); };
    if (reduce) { place(0.5); } else {
      var loop = function (ts) {
        if (t0 === null) t0 = ts + 900;          // 弧が描かれてから飛ばす
        var e = (ts - t0) % (DUR + WAIT);
        var p = Math.min(Math.max(e / DUR, 0), 1);
        p = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // ゆっくり→速く→ゆっくり
        place(p);
        ball.style.opacity = (e < 0 || e > DUR) ? 0 : 1;
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  // スクロール：ヘッダーの色・サービス写真の拡大・カレッジ背景の視差
  var svc = document.querySelectorAll('.svc__photo');
  var colBg = document.querySelector('.college__bg');
  var ticking = false;
  function update() {
    ticking = false;
    if (hero) header.classList.toggle('is-scrolled', window.scrollY > hero.offsetHeight - 80);
    if (reduce) return;
    var vh = window.innerHeight;
    svc.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var t = 1 - Math.abs(r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      el.style.setProperty('--sp', Math.min(Math.max(t * 1.2, 0), 1).toFixed(3));
    });
    if (colBg) {
      var r = colBg.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) colBg.style.setProperty('--py', ((r.top - vh / 2) * -0.15).toFixed(1));
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();

  // メニュー
  btn.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  });
  document.querySelectorAll('.gnav a').forEach(function (a) {
    a.addEventListener('click', function () { document.body.classList.remove('menu-open'); btn.setAttribute('aria-expanded', false); });
  });

  // 数字を数え上げる
  function countUp(el) {
    var to = Number(el.dataset.to), comma = el.dataset.comma, s = null, D = 1600;
    if (reduce) { el.textContent = comma ? to.toLocaleString() : to; return; }
    (function step(ts) {
      if (s === null) s = ts;
      var p = Math.min((ts - s) / D, 1), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = comma ? v.toLocaleString() : v;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  var targets = document.querySelectorAll('.reveal, .virtues');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('.count').forEach(countUp);
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      var c = e.target.querySelector('.count'); if (c) countUp(c);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  targets.forEach(function (el) { io.observe(el); });

  // 同じ段のカードは少しずつずらして出す
  document.querySelectorAll('.numbers__list, .features__list, .works__list, .philo__grid').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.transitionDelay = (i * 0.1) + 's'; });
  });

  // お問い合わせ欄が見えている間は、スマホの固定ボタンを隠す
  var contact = document.getElementById('contact'), spCta = document.querySelector('.sp-cta');
  if (contact && spCta) new IntersectionObserver(function (es) { spCta.classList.toggle('is-hidden', es[0].isIntersecting); }, { threshold: .15 }).observe(contact);
})();

// イベント告知：data-end の翌日になったら隠す／開催中は「開催中！」に切り替える
(function () {
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function d(s) { var a = s.split('-'); return new Date(+a[0], a[1] - 1, +a[2]); }
  document.querySelectorAll('[data-end]').forEach(function (el) {
    if (today > d(el.dataset.end)) { el.hidden = true; return; }
    if (el.dataset.start && today >= d(el.dataset.start)) {
      el.classList.add('is-now');
      var b = el.querySelector('[data-badge]'); if (b) b.textContent = '本日開催中！';
    }
  });
})();
