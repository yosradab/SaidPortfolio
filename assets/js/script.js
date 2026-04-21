(() => {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━
     PROJECT MODAL GALLERY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const modal        = document.getElementById('modal');
  const modalCard    = document.getElementById('modalCard');
  const modalImgWrap = document.getElementById('modalImgWrap');
  const modalClose   = document.getElementById('modalClose');
  const backdrop     = document.getElementById('modalBackdrop');
  const modalPrev    = document.getElementById('modalPrev');
  const modalNext    = document.getElementById('modalNext');
  const modalCounter = document.getElementById('modalCounter');

  let curGallery = [];
  let curGallIdx = 0;
  let trackEl    = null;

  function updateModalImg() {
    if (trackEl) trackEl.style.transform = `translateX(-${curGallIdx * 100}%)`;
    if (modalCounter) modalCounter.textContent = `${curGallIdx + 1} / ${curGallery.length}`;
    const multi = curGallery.length > 1;
    modalPrev.style.display = multi ? 'flex' : 'none';
    modalNext.style.display = multi ? 'flex' : 'none';
  }

  function openModal(items, startIdx = 0) {
    curGallery = Array.isArray(items) ? items : [items];
    curGallIdx = startIdx;
    modalImgWrap.innerHTML = '';
    trackEl = document.createElement('div');
    trackEl.className = 'modal-track';
    curGallery.forEach(src => {
      const img = document.createElement('img');
      img.src = src.trim();
      img.alt = 'Project gallery image';
      img.setAttribute('draggable', 'false');
      trackEl.appendChild(img);
    });
    modalImgWrap.appendChild(trackEl);
    updateModalImg();
    modal.style.display = 'flex';
    modalCard.style.animation = 'none';
    modalCard.offsetHeight; // reflow
    modalCard.style.animation = '';
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.style.display = 'none';
    modalImgWrap.innerHTML = '';
    trackEl = null;
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  if (modalPrev) modalPrev.addEventListener('click', e => {
    e.stopPropagation();
    curGallIdx = (curGallIdx - 1 + curGallery.length) % curGallery.length;
    updateModalImg();
  });
  if (modalNext) modalNext.addEventListener('click', e => {
    e.stopPropagation();
    curGallIdx = (curGallIdx + 1) % curGallery.length;
    updateModalImg();
  });

  document.addEventListener('keydown', e => {
    if (modal.style.display !== 'flex') return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft'  && curGallery.length > 1) modalPrev.click();
    if (e.key === 'ArrowRight' && curGallery.length > 1) modalNext.click();
  });

  /* Modal swipe */
  let swipeStartX = 0, swipeEndX = 0, isDragging = false;
  modalImgWrap.addEventListener('touchstart', e => { swipeStartX = e.changedTouches[0].screenX; }, { passive: true });
  modalImgWrap.addEventListener('touchend',   e => { swipeEndX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });
  modalImgWrap.addEventListener('mousedown',  e => { isDragging = true; swipeStartX = e.clientX; modalImgWrap.style.cursor = 'grabbing'; });
  modalImgWrap.addEventListener('mouseup',    e => {
    if (!isDragging) return;
    isDragging = false; modalImgWrap.style.cursor = 'default'; swipeEndX = e.clientX; handleSwipe();
  });
  modalImgWrap.addEventListener('mouseleave', () => { if (isDragging) { isDragging = false; modalImgWrap.style.cursor = 'default'; } });

  function handleSwipe() {
    const threshold = 50;
    if (swipeEndX < swipeStartX - threshold && curGallery.length > 1) modalNext.click();
    else if (swipeEndX > swipeStartX + threshold && curGallery.length > 1) modalPrev.click();
  }

  document.querySelectorAll('.img-wrap').forEach(wrap => {
    wrap.style.cursor = 'pointer';
    wrap.addEventListener('click', () => {
      const g = wrap.getAttribute('data-gallery');
      const s = wrap.getAttribute('data-src');
      if (g) openModal(g.split(','));
      else if (s) openModal(s);
    });
  });

  /* ━━ CURSOR ━━ */
  const cur  = document.getElementById('cur');
  const ring = document.getElementById('curRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.style.left = mx + 'px'; cur.style.top = my + 'px'; });
  (function animRing() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a,button,.hstat,.spec-item,.skcard,.cert-card,.edu-card,.img-wrap').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.transform = 'translate(-50%,-50%) scale(2)'; ring.style.opacity = '.25'; });
    el.addEventListener('mouseleave', () => { ring.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.opacity = '.45'; });
  });

  /* ━━ SCROLL PROGRESS BAR ━━ */
  const pb = document.getElementById('pb');
  function onScroll() {
    const h = document.documentElement, b = document.body;
    const pct = (h.scrollTop || b.scrollTop) / ((h.scrollHeight || b.scrollHeight) - h.clientHeight) * 100;
    pb.style.width = pct + '%';
  }

  /* ━━ INTERSECTION OBSERVER ━━ */
  const rvObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        e.target.querySelectorAll('.skfill').forEach(b => b.style.width = b.dataset.w + '%');
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(el => rvObs.observe(el));

  const eduObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.3 });
  document.querySelectorAll('.edu-card').forEach(el => eduObs.observe(el));

  /* ━━ STICKY PROJECTS SCROLL ━━ */
  const N          = 5;
  const projScroll = document.getElementById('proj-scroll');
  const projTrack  = document.getElementById('proj-track');
  const projFill   = document.getElementById('projFill');
  const projCur    = document.getElementById('projCur');
  const hints      = document.querySelectorAll('.proj-hint');
  const pslides    = document.querySelectorAll('.pslide');

  // Cache hint text references to avoid repeated DOM reads
  const hintEN = [...hints].filter(h => h.classList.contains('lang-en'));
  const hintFR = [...hints].filter(h => h.classList.contains('lang-fr'));

  function isMobile() { return window.innerWidth <= 1024; }

  function setupProj() {
    projScroll.style.height = isMobile() ? '' : (N * window.innerHeight) + 'px';
  }

  let lastProjIdx = -1;

  function updateProj() {
    if (isMobile() || document.body.classList.contains('modal-open')) {
      if (!isMobile()) return;
      projTrack.style.transform = '';
      return;
    }
    const vh         = window.innerHeight;  // cached per call
    const rect       = projScroll.getBoundingClientRect();
    const headerH    = 104;
    const dwell      = vh * 0.5;
    const scrollable = Math.max(1, projScroll.offsetHeight - (vh - headerH) - dwell);
    const scrolled   = headerH - rect.top;
    const progress   = Math.max(0, Math.min(1, scrolled / scrollable));
    const tx         = progress * (N - 1) * (100 / N);

    projTrack.style.transform = `translateX(-${tx}%)`;
    if (projFill) projFill.style.width = (progress * 100) + '%';
    projScrollProgress = progress;

    const idx = Math.min(N - 1, Math.floor(progress * N));
    if (projCur) projCur.textContent = idx + 1;

    // Update hints only when state changes
    const atEnd = progress >= 0.99;
    if (atEnd !== _wasAtEnd) {
      _wasAtEnd = atEnd;
      hintEN.forEach(h => { h.textContent = atEnd ? 'End of Selection ⊼' : 'Scroll to explore →'; });
      hintFR.forEach(h => { h.textContent = atEnd ? 'Fin de Sélection ⊼' : 'Défiler pour explorer →'; });
    }

    // Play/pause videos only when active slide changes
    if (idx !== lastProjIdx) {
      lastProjIdx = idx;
      pslides.forEach((slide, i) => {
        slide.querySelectorAll('video').forEach(v => {
          Math.abs(i - idx) <= 1 ? v.play().catch(() => {}) : v.pause();
        });
      });
    }
  }
  let _wasAtEnd = false;

  setupProj();

  /* ━━ CARD REVEAL ON SCROLL ━━ */
  const cardSections = document.querySelectorAll('main > section, main > #projects-section, footer');
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('card-visible'); cardObs.unobserve(e.target); }
    });
  }, { threshold: 0.06, rootMargin: '-40px 0px' });
  cardSections.forEach(sec => { if (!sec.classList.contains('card-visible')) cardObs.observe(sec); });

  /* ━━ SHOPIFY-STYLE RECEDE PARALLAX ━━
     PERF: Batch ALL getBoundingClientRect reads FIRST,
     then do all style writes. This prevents layout thrashing
     (interleaved read→write→read→write forces multiple reflows).
  ━━ */
  let projScrollProgress = 0;
  const cardSectionsArr  = Array.from(cardSections); // static array for indexed access

  function updateRecede() {
    if (isMobile()) return;
    const isDark = document.documentElement.classList.contains('dark');
    const vh     = window.innerHeight;

    // ── PHASE 1: batch all reads (no style writes here) ──
    const rects = cardSectionsArr.map(sec => sec.getBoundingClientRect());

    // ── PHASE 2: batch all writes ──
    cardSectionsArr.forEach((sec, i) => {
      const rect      = rects[i];
      const isProj    = sec.id === 'projects-section';

      if (isProj) {
        if (projScrollProgress < 0.99) { sec.style.filter = ''; return; }
        if (rect.bottom < vh && rect.bottom > 0) {
          const exitProgress = Math.min(1, 1 - rect.bottom / vh);
          const scale        = 1 - exitProgress * 0.04;
          sec.style.transform = `translateY(${exitProgress * -24}px) scale(${scale})`;
          sec.style.filter    = isDark ? `brightness(${1 - exitProgress * 0.25})` : '';
        } else {
          sec.style.filter    = '';
        }
        return;
      }

      if (rect.top < 0 && rect.bottom > 0) {
        const exitProgress = Math.min(1, Math.abs(rect.top) / (rect.height * 0.5));
        const scale        = 1 - exitProgress * 0.04;
        sec.style.transform = `translateY(${exitProgress * -24}px) scale(${scale})`;
        sec.style.filter    = isDark ? `brightness(${1 - exitProgress * 0.25})` : '';
      } else if (rect.top >= 0) {
        sec.style.filter    = '';
        sec.style.transform = '';
      }
    });
  }

  /* ━━ UNIFIED RAF-THROTTLED SCROLL HANDLER ━━
     A single rAF token ensures all scroll work runs
     at most once per display frame, never more.
  ━━ */
  let scrollRAF = null;
  window.addEventListener('scroll', () => {
    if (scrollRAF) return;
    scrollRAF = requestAnimationFrame(() => {
      onScroll();
      updateProj();
      updateRecede();
      scrollRAF = null;
    });
  }, { passive: true });

  /* ━━ DEBOUNCED RESIZE ━━ */
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setupProj();
      updateProj();
    }, 120);
  });

  /* ━━ LANGUAGE ━━ */
  let lang = 'en';
  document.getElementById('langBtn').addEventListener('click', () => {
    lang = lang === 'en' ? 'fr' : 'en';
    document.documentElement.classList.toggle('fr', lang === 'fr');
    _wasAtEnd = !_wasAtEnd; // force hint refresh on next updateProj
  });

  /* ━━ THEME ━━ */
  let dark = true;
  document.getElementById('themeBtn').addEventListener('click', () => {
    dark = !dark;
    document.documentElement.classList.toggle('dark', dark);
  });

  /* ━━ MOBILE NAV ━━ */
  const menuBtn = document.getElementById('menuBtn');
  const mNav    = document.getElementById('mNav');
  if (menuBtn && mNav) {
    menuBtn.addEventListener('click', () => {
      mNav.classList.toggle('active');
      const icon = menuBtn.querySelector('i');
      icon.classList.toggle('fa-bars',  !mNav.classList.contains('active'));
      icon.classList.toggle('fa-times',  mNav.classList.contains('active'));
    });
    document.querySelectorAll('.m-link').forEach(link => {
      link.addEventListener('click', () => {
        mNav.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        icon.classList.replace('fa-times', 'fa-bars');
      });
    });
  }

  /* ━━ PARTICLES ━━
     PERF optimizations:
     - Use squared distance check (d² < maxD²) to skip sqrt for distant pairs
     - Pre-compute colour strings once, not every frame
     - Integer-approximate blended colour with bit-shift
  ━━ */
  (() => {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [];

    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const palette = [
      [75,  126, 255],
      [255, 112,  64],
      [16,  185, 129],
      [168,  85, 247],
      [251, 191,  36],
      [236,  72, 153],
    ];

    for (let i = 0; i < 80; i++) {
      const col = palette[Math.floor(Math.random() * palette.length)];
      pts.push({
        x:     Math.random() * 2000,
        y:     Math.random() * 1000,
        vx:    (Math.random() - .5) * .5,
        vy:    (Math.random() - .5) * .5,
        r:     Math.random() * 1.6 + .5,
        col,
        pulse: Math.random() * Math.PI * 2,
        // Pre-compute fill / glow colour strings (static per particle)
        fillStyle:  `rgba(${col[0]},${col[1]},${col[2]},0.65)`,
        glowStyle:  `rgba(${col[0]},${col[1]},${col[2]},0.15)`,
      });
    }

    const MAX_D  = 130;
    const MAX_D2 = MAX_D * MAX_D; // 16900 — avoid sqrt unless needed

    let tick = 0;
    function drawParticles() {
      tick++;
      ctx.clearRect(0, 0, W, H);

      // Move & draw dots
      for (let i = 0; i < pts.length; i++) {
        const p  = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const pr = p.r + Math.sin(tick * 0.04 + p.pulse) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = p.fillStyle;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, pr + 2, 0, Math.PI * 2);
        ctx.strokeStyle = p.glowStyle;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }

      // Draw connections — skip sqrt until we know d² is close enough
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= MAX_D2) continue;        // early exit — no sqrt needed

          const d     = Math.sqrt(d2);
          const alpha = 0.18 * (1 - d / MAX_D);
          // Fast integer blend via right-shift
          const [r1,g1,b1] = pts[i].col;
          const [r2,g2,b2] = pts[j].col;
          const mr = (r1 + r2) >> 1;
          const mg = (g1 + g2) >> 1;
          const mb = (b1 + b2) >> 1;

          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${mr},${mg},${mb},${alpha})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }

      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  })();

  /* ━━ TYPEWRITER ━━ */
  (() => {
    const el = document.getElementById('typed-role');
    if (!el) return;
    const texts   = ['Electrical Design Engineer','CATIA V5 · Siemens NX Expert','EV Powertrain Specialist','Aerospace & Automotive','PLM · 3D Harness Routing'];
    const frTexts = ['Ingénieur Conception Électrique','Expert CATIA V5 · Siemens NX','Spécialiste en Groupes Motopropulseurs VE','Aéronautique & Automobile','Conception de Faisceaux 3D · PLM'];
    let ti = 0, ci = 0, deleting = false;
    function type() {
      const isFr = document.documentElement.classList.contains('fr');
      const t    = (isFr ? frTexts : texts)[ti];
      el.textContent = deleting ? t.slice(0, --ci) : t.slice(0, ++ci);
      if (!deleting && ci === t.length)  { deleting = true; setTimeout(type, 2200); return; }
      if (deleting  && ci === 0)         { deleting = false; ti = (ti + 1) % texts.length; }
      setTimeout(type, deleting ? 34 : 68);
    }
    setTimeout(type, 800);
  })();

  /* ━━ STATS COUNTER ━━ */
  (() => {
    const bar = document.getElementById('stats-bar');
    if (!bar) return;
    let fired = false;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !fired) {
        fired = true;
        document.querySelectorAll('.stat-num[data-target]').forEach(el => {
          const target = +el.dataset.target;
          const dur = 1600, step = 16;
          let cur = 0;
          const inc = target / (dur / step);
          const t = setInterval(() => { cur = Math.min(cur + inc, target); el.textContent = Math.round(cur); if (cur >= target) clearInterval(t); }, step);
        });
      }
    }, { threshold: 0.5 });
    obs.observe(bar);
  })();

  /* ━━ CONTACT FORM (EmailJS) ━━ */
  const contactForm    = document.getElementById('contact-form');
  const contactMsg     = document.getElementById('cf-msg');
  const contactBtn     = document.getElementById('cf-btn');
  const contactBtnText = document.getElementById('cf-btn-text');

  if (window.emailjs) emailjs.init("Gr6HKmOLlYUFzNUb5");

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      contactBtn.disabled = true;
      const originalBtnHtml = contactBtnText.innerHTML;
      contactBtnText.textContent = lang === 'fr' ? 'Envoi...' : 'Sending...';
      emailjs.sendForm('service_gzav76g', 'template_qdfvj4l', contactForm)
        .then(() => {
          contactMsg.textContent = lang === 'fr' ? '✓ Message envoyé avec succès !' : '✓ Message sent successfully!';
          contactMsg.className   = 'form-msg success';
          contactForm.reset();
        })
        .catch(err => {
          console.error('EmailJS Error:', err);
          contactMsg.textContent = lang === 'fr' ? '✕ Erreur lors de l\'envoi. Réessayez.' : '✕ Error sending. Please try again.';
          contactMsg.className   = 'form-msg error';
        })
        .finally(() => {
          contactBtn.disabled      = false;
          contactBtnText.innerHTML = originalBtnHtml;
          setTimeout(() => { if (contactMsg) contactMsg.className = 'form-msg'; }, 5000);
        });
    });
  }

})();
