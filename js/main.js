/* Arawaza Colombia · Brand Guidelines — motion
   Lengaje de movimiento adaptado de "Nanquim" (ProfitizeBuild): máscara de tinta,
   texto que se imprime, letras que suben, galería horizontal fija, nombre gigante al pie. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!window.gsap;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- texto que se imprime ---------- */
  const GLYPHS = '#%&*+=<>01·×';
  function scramble(el, dur = 900) {
    if (reduce) return;
    const html = el.innerHTML;
    const parts = html.split(/(<br\s*\/?>)/i);
    const texts = parts.map(p => (/^<br/i.test(p) ? null : p));
    const total = texts.reduce((n, t) => n + (t ? t.length : 0), 0);
    const t0 = performance.now();
    const tick = now => {
      const k = Math.min(1, (now - t0) / dur);
      let done = Math.floor(k * total), i = 0;
      el.innerHTML = parts.map((p, idx) => {
        const t = texts[idx];
        if (t === null) return p;
        return [...t].map(ch => {
          const pos = i++;
          if (ch === ' ') return ' ';
          if (pos < done) return ch;
          if (pos < done + 6) return GLYPHS[(Math.random() * GLYPHS.length) | 0];
          return ' ';
        }).join('');
      }).join('');
      if (k < 1) requestAnimationFrame(tick); else el.innerHTML = html;
    };
    requestAnimationFrame(tick);
  }

  /* ---------- máscara de tinta (sprite 6x4, 24 cuadros) ---------- */
  function ink(el, dur = 1100, reverse = false) {
    return new Promise(res => {
      if (reduce) { el.classList.add('done'); return res(); }
      el.classList.remove('done');
      el.classList.add('aw-ink');
      const t0 = performance.now();
      const step = now => {
        const k = Math.min(1, (now - t0) / dur);
        let f = Math.round((reverse ? 1 - k : k) * 23);
        const x = (f % 6) * 20, y = Math.floor(f / 6) * (100 / 3);
        el.style.webkitMaskPosition = el.style.maskPosition = `${x}% ${y}%`;
        if (k < 1) requestAnimationFrame(step);
        else { if (!reverse) el.classList.add('done'); res(); }
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- split de letras ---------- */
  $$('.aw-split').forEach(el => {
    el.innerHTML = [...el.textContent].map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  });

  /* ---------- NAV ---------- */
  const nav = $('#nav');
  const links = $$('.aw-links a');
  const pill = $('.aw-pill');
  let lastY = 0;
  function movePill(a) {
    if (!a || !pill) { if (pill) pill.style.opacity = 0; return; }
    const pr = a.parentElement.getBoundingClientRect(), r = a.getBoundingClientRect();
    pill.style.opacity = 1;
    pill.style.width = r.width + 'px';
    pill.style.transform = `translateX(${r.left - pr.left}px)`;
  }
  function onScroll(y) {
    nav.classList.toggle('solid', y > 40);
    if (!document.body.classList.contains('menu-open')) nav.classList.toggle('hide', y > lastY && y > 400);
    lastY = y;
    let cur = null;
    links.forEach(a => {
      const s = $(a.getAttribute('href'));
      if (s && s.getBoundingClientRect().top < innerHeight * 0.45) cur = a;
    });
    movePill(cur);
  }
  const menuBtn = $('#menuBtn'), mobile = $('#mobileMenu');
  menuBtn.addEventListener('click', () => {
    const open = !mobile.classList.contains('open');
    mobile.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    mobile.setAttribute('aria-hidden', !open);
    menuBtn.textContent = open ? 'Cerrar' : 'Menú';
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  });
  $$('a', mobile).forEach(a => a.addEventListener('click', () => menuBtn.click()));

  /* ---------- LOGO: combinaciones ---------- */
  const stage = $('#logoStage'), logoImg = $('#logoImg'), logoName = $('#logoName');
  $$('.aw-swatch-row button').forEach(b => b.addEventListener('click', () => {
    $$('.aw-swatch-row button').forEach(x => x.classList.toggle('on', x === b));
    logoImg.style.opacity = 0;
    stage.style.background = b.dataset.bg;
    setTimeout(() => { logoImg.src = `img/logos/arawaza_${b.dataset.logo}.png`; logoImg.style.opacity = 1; }, 250);
    logoName.textContent = b.dataset.name;
    logoName.style.color = b.dataset.logo === 'black' ? '#111' : '';
  }));

  /* ---------- COLOR: pila de tarjetas ---------- */
  const stack = $('#stack');
  const chips = $$('.aw-chip', stack);
  const fan = open => chips.forEach((c, i) => { c.style.transform = open ? `translateY(${(i - 2) * 14}px) rotate(${(i - 2) * 3}deg) translateX(${(i - 2) * 26}px)` : ''; });
  stack.addEventListener('mouseenter', () => fan(true));
  stack.addEventListener('mouseleave', () => fan(false));
  chips.forEach(c => c.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(c.dataset.hex); } catch (e) {}
    c.classList.add('ok'); setTimeout(() => c.classList.remove('ok'), 1200);
  }));

  /* ---------- TIPOGRAFÍA: probador ---------- */
  const out = $('#tOut'), size = $('#tSize');
  const fonts = {
    'mono-b': { fontFamily: 'var(--aw-display)', fontWeight: 800, fontStyle: 'normal', textTransform: 'uppercase' },
    'mono-r': { fontFamily: 'var(--aw-display)', fontWeight: 400, fontStyle: 'normal', textTransform: 'uppercase' },
    'hk-k': { fontFamily: 'var(--aw-text)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' }
  };
  $$('.aw-tester .grp button').forEach(b => b.addEventListener('click', () => {
    $$('.aw-tester .grp button').forEach(x => x.classList.toggle('on', x === b));
    Object.assign(out.style, fonts[b.dataset.f]);
  }));
  const setSize = () => { out.style.fontSize = Math.min(+size.value, innerWidth * 0.12) + 'px'; };
  size.addEventListener('input', setSize); setSize();

  /* ---------- ATLETAS: tilt ---------- */
  if (matchMedia('(hover:hover)').matches) $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateY(${(x - .5) * 10}deg) rotateX(${(.5 - y) * 10}deg)`;
      card.style.setProperty('--gx', x * 100 + '%'); card.style.setProperty('--gy', y * 100 + '%');
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- GALERÍA: hover en umbral rojo con tinta ---------- */
  if (matchMedia('(hover:hover)').matches) $$('.aw-ph').forEach(f => {
    const hot = document.createElement('div');
    hot.className = 'hot aw-ink';
    hot.innerHTML = `<img src="${$('img', f).getAttribute('src')}" alt="" style="${$('img', f).getAttribute('style') || ''}">`;
    hot.style.webkitMaskPosition = hot.style.maskPosition = '0% 0%';
    f.appendChild(hot);
    f.addEventListener('mouseenter', () => { hot.classList.remove('done'); ink(hot, 500); });
    f.addEventListener('mouseleave', () => { hot.classList.remove('done'); ink(hot, 400, true); });
  });

  /* ---------- contadores ---------- */
  function count(el) {
    const to = +el.dataset.count, small = $('small', el);
    const suffix = small ? small.outerHTML : '';
    if (reduce) { el.innerHTML = to + suffix; return; }
    const t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / 1400); const e = 1 - Math.pow(1 - k, 4); el.innerHTML = Math.round(to * e) + suffix; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- reel timeline ---------- */
  const tl = $('#reelTl');
  if (tl && !reduce) {
    const head = $('.head', tl);
    let t0 = performance.now();
    const loop = now => { const k = ((now - t0) / 15000) % 1; head.style.left = (k * 100) + '%'; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  /* =========================================================
     Sin GSAP (o movimiento reducido): todo visible y listo
     ========================================================= */
  if (!hasGsap || reduce) {
    $$('.aw-rv').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; });
    $('.aw-hero').classList.add('in');
    $('#propbar').classList.add('in');
    $$('[data-count]').forEach(count);
    addEventListener('scroll', () => onScroll(scrollY), { passive: true });
    onScroll(scrollY);
    return;
  }

  /* =========================================================
     GSAP + Lenis
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const start = () => {
    /* HERO: lámpara fría + letras que suben + textos que se imprimen */
    const hero = $('.aw-hero');
    gsap.fromTo('.aw-hero .ph', { opacity: 0 }, {
      keyframes: [{ opacity: .55, duration: .12 }, { opacity: .08, duration: .1 }, { opacity: .85, duration: .14 }, { opacity: .3, duration: .1 }, { opacity: 1, duration: .44 }],
      ease: 'none'
    });
    gsap.from('.aw-hero .w .ch', { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .055, delay: .45 });
    gsap.from('.aw-hero .goal, .aw-hero .cta, .aw-hero .sign', { opacity: 0, y: 20, duration: 1, ease: 'expo.out', stagger: .1, delay: 1.1 });
    setTimeout(() => { hero.classList.add('in'); $$('[data-scramble]', hero).forEach((e, i) => setTimeout(() => scramble(e), i * 120)); }, 600);

    gsap.to('.aw-hero .ph', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.aw-hero .words', { yPercent: -60, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(hero, { '--dim': 1, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => { $('.aw-hero .shade').style.background = `linear-gradient(180deg,rgba(11,11,12,${.6 + s.progress * .3}) 0%,rgba(11,11,12,${s.progress * .75}) 24%,rgba(11,11,12,${s.progress * .75}) 52%,rgba(11,11,12,.82) 100%)`; } } });

    /* parallax de imágenes */
    $$('[data-parallax]').forEach(el => {
      const v = +el.dataset.parallax;
      gsap.fromTo(el, { yPercent: -v }, { yPercent: v, ease: 'none', scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* entradas: IntersectionObserver (no depende de posiciones precalculadas) */
    const io = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).map(e => e.target);
      vis.forEach(t => io.unobserve(t));
      if (vis.length) gsap.to(vis, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .08, overwrite: true });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('.aw-rv').forEach(e => io.observe(e));

    /* barra de proporción y contadores */
    const io2 = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return; io2.unobserve(e.target);
      if (e.target.id === 'propbar') e.target.classList.add('in'); else count(e.target);
    }), { rootMargin: '0px 0px -10% 0px' });
    io2.observe($('#propbar')); $$('[data-count]').forEach(el => io2.observe(el));

    /* palabras abiertas: se separan desde el centro */
    gsap.from('.aw-spread .words span', { x: (i) => (1 - i) * innerWidth * .18, opacity: 0, ease: 'expo.out', duration: 1.4, scrollTrigger: { trigger: '.aw-spread', start: 'top 65%' } });

    /* GALERÍA horizontal fija (computadora) */
    const mm = gsap.matchMedia();
    mm.add('(min-width: 821px)', () => {
      const strip = $('#strip'), gal = $('#fotografia'), pages = $$('#pages span');
      const dist = () => strip.scrollWidth - innerWidth + innerWidth * .05;
      const tw = gsap.to(strip, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: gal, start: 'top top', end: () => '+=' + (dist() + innerHeight * .35), pin: true, scrub: .6, invalidateOnRefresh: true,
          onUpdate: s => { const p = Math.min(3, Math.floor(s.progress * 4)); pages.forEach((e, i) => e.classList.toggle('on', i === p)); }
        }
      });
      const figs = $$('.aw-ph', strip);
      figs.forEach(f => {
        const im = $('img', f); im.classList.add('aw-ink');
        ScrollTrigger.create({ trigger: f, containerAnimation: tw, start: 'left 105%', once: true, onEnter: () => ink(im, 1100) });
      });
      // las que ya se ven al entrar
      ScrollTrigger.create({ trigger: gal, start: 'top 70%', once: true, onEnter: () => figs.slice(0, 4).forEach((f, i) => setTimeout(() => ink($('img', f), 1100), i * 140)) });
      gsap.from('.aw-gal .face', { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: gal, start: 'top 70%' } });
      return () => figs.forEach(f => $('img', f).classList.remove('aw-ink'));
    });

    /* PIE: nombre gigante que sube */
    gsap.fromTo('#giant', { yPercent: 45 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.aw-foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    /* Lenis después de los pins */
    const lenis = new Lenis({ lerp: .1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', e => { ScrollTrigger.update(); onScroll(e.scroll); });
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href')); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.4 });
    }));
    onScroll(0);
    ScrollTrigger.refresh();
    lenis.resize();
    let lt; const later = () => { clearTimeout(lt); lt = setTimeout(() => { ScrollTrigger.refresh(); lenis.resize(); }, 200); };
    $$('img').forEach(im => { if (!im.complete) im.addEventListener('load', later, { once: true }); });
    addEventListener('load', later);
  };

  /* ajustar la palabra gigante del pie al ancho */
  function fitGiant() {
    const g = $('#giant'); if (!g) return;
    g.style.fontSize = '100px';
    const w = g.scrollWidth, avail = innerWidth - 2 * parseFloat(getComputedStyle(g.parentElement).paddingLeft);
    g.style.fontSize = (100 * avail / w) + 'px';
  }
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { fitGiant(); setSize(); ScrollTrigger.refresh(); }, 150); });

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fitGiant(); start(); });
})();
