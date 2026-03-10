(() => {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━
     PROJECT MODAL GALLERY
━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const modal = document.getElementById('modal');
  const modalCard = document.getElementById('modalCard');
  const modalImgWrap = document.getElementById('modalImgWrap');
  const modalClose = document.getElementById('modalClose');
  const backdrop = document.getElementById('modalBackdrop');
  const modalPrev = document.getElementById('modalPrev');
  const modalNext = document.getElementById('modalNext');

  const modalCounter = document.getElementById('modalCounter');

  let curGallery = [];
  let curGallIdx = 0;
  let trackEl = null;

  function updateModalImg() {
    if (trackEl) {
      trackEl.style.transform = `translateX(-${curGallIdx * 100}%)`;
    }

    if (modalCounter) {
      modalCounter.textContent = `${curGallIdx + 1} / ${curGallery.length}`;
    }

    if (curGallery.length > 1) {
      modalPrev.style.display = 'flex';
      modalNext.style.display = 'flex';
    } else {
      modalPrev.style.display = 'none';
      modalNext.style.display = 'none';
    }
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
    modalCard.offsetHeight;
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

  if (modalPrev) modalPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    curGallIdx = (curGallIdx - 1 + curGallery.length) % curGallery.length;
    updateModalImg();
  });
  if (modalNext) modalNext.addEventListener('click', (e) => {
    e.stopPropagation();
    curGallIdx = (curGallIdx + 1) % curGallery.length;
    updateModalImg();
  });

  document.addEventListener('keydown', e => {
    if (modal.style.display !== 'flex') return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft' && curGallery.length > 1) modalPrev.click();
    if (e.key === 'ArrowRight' && curGallery.length > 1) modalNext.click();
  });

  /* Modal swipe logic */
  let swipeStartX = 0;
  let swipeEndX = 0;

  modalImgWrap.addEventListener('touchstart', e => {
    swipeStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modalImgWrap.addEventListener('touchend', e => {
    swipeEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  let isDragging = false;

  modalImgWrap.addEventListener('mousedown', e => {
    isDragging = true;
    swipeStartX = e.clientX;
    modalImgWrap.style.cursor = 'grabbing';
  });

  modalImgWrap.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    modalImgWrap.style.cursor = 'default';
    swipeEndX = e.clientX;
    handleSwipe();
  });

  modalImgWrap.addEventListener('mouseleave', () => {
    if (isDragging) {
      isDragging = false;
      modalImgWrap.style.cursor = 'default';
    }
  });

  function handleSwipe() {
    const threshold = 50;
    if (swipeEndX < swipeStartX - threshold && curGallery.length > 1) {
      modalNext.click();
    } else if (swipeEndX > swipeStartX + threshold && curGallery.length > 1) {
      modalPrev.click();
    }
  }

  /* Wire up .img-wrap clicks */
  document.querySelectorAll('.img-wrap').forEach(wrap => {
    wrap.style.cursor = 'pointer';
    wrap.addEventListener('click', () => {
      const g = wrap.getAttribute('data-gallery');
      const s = wrap.getAttribute('data-src');
      if (g) {
        openModal(g.split(','));
      } else if (s) {
        openModal(s);
      }
    });
  });

  /* ━━ CURSOR ━━ */
  const cur = document.getElementById('cur');
  const ring = document.getElementById('curRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
  });
  (function animRing() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a,button,.hstat,.spec-item,.skcard,.cert-card,.edu-card,.img-wrap').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(2)';
      ring.style.opacity = '.25';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.opacity = '.45';
    });
  });

  /* ━━ SCROLL PROGRESS BAR ━━ */
  const pb = document.getElementById('pb');
  const onScroll = () => {
    const h = document.documentElement,
      b = document.body;
    const pct = (h.scrollTop || b.scrollTop) / ((h.scrollHeight || b.scrollHeight) - h.clientHeight) * 100;
    pb.style.width = pct + '%';
  };

  /* ━━ INTERSECTION OBSERVER ━━ */
  const rvObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        e.target.querySelectorAll('.skfill').forEach(b => b.style.width = b.dataset.w + '%');
      }
    });
  }, {
    threshold: 0.12
  });
  document.querySelectorAll('.rv').forEach(el => rvObs.observe(el));

  const eduObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in');
    });
  }, {
    threshold: 0.3
  });
  document.querySelectorAll('.edu-card').forEach(el => eduObs.observe(el));

  /* ━━ STICKY PROJECTS SCROLL ━━ */
  const N = 5;
  const projScroll = document.getElementById('proj-scroll');
  const projTrack = document.getElementById('proj-track');
  const projFill = document.getElementById('projFill');
  const projCur = document.getElementById('projCur');

  function isMobile() {
    return window.innerWidth <= 1024;
  }

  function setupProj() {
    if (isMobile()) {
      projScroll.style.height = '';
    } else {
      projScroll.style.height = (N * window.innerHeight) + 'px';
    }
  }

  function updateProj() {
    if (isMobile() || document.body.classList.contains('modal-open')) {
      if (!isMobile()) {
        // Just return if modal is open, to save CPU
        return;
      }
      projTrack.style.transform = '';
      return;
    }
    const rect = projScroll.getBoundingClientRect();
    const headerH = 104;
    const dwell = window.innerHeight * 0.5;
    const scrollable = Math.max(1, projScroll.offsetHeight - (window.innerHeight - headerH) - dwell);
    const scrolled = headerH - rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollable));
    const tx = progress * (N - 1) * (100 / N);

    projTrack.style.transform = `translateX(-${tx}%)`;
    if (projFill) projFill.style.width = (progress * 100) + '%';
    projScrollProgress = progress; // share with updateRecede()

    const idx = Math.min(N - 1, Math.floor(progress * N));
    if (projCur) projCur.textContent = idx + 1;

    const hints = document.querySelectorAll('.proj-hint');
    if (progress >= 0.99) {
      hints.forEach(h => {
        if (h.classList.contains('lang-en')) h.textContent = 'End of Selection ⊼';
        if (h.classList.contains('lang-fr')) h.textContent = 'Fin de Sélection ⊼';
      });
    } else {
      hints.forEach(h => {
        if (h.classList.contains('lang-en')) h.textContent = 'Scroll to explore →';
        if (h.classList.contains('lang-fr')) h.textContent = 'Défiler pour explorer →';
      });
    }

    document.querySelectorAll('.pslide').forEach((slide, i) => {
      slide.querySelectorAll('video').forEach(v => {
        Math.abs(i - idx) <= 1 ? v.play().catch(() => { }) : v.pause();
      });
    });
  }

  setupProj();
  window.addEventListener('resize', () => {
    setupProj();
    updateProj();
  });
  /* ━━ CARD REVEAL ON SCROLL ━━ */
  const cardSections = document.querySelectorAll('main > section, main > #projects-section, footer');

  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('card-visible');
        cardObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '-40px 0px' });

  cardSections.forEach(sec => {
    if (!sec.classList.contains('card-visible')) {
      cardObs.observe(sec);
    }
  });

  /* ━━ SHOPIFY-STYLE RECEDE PARALLAX ━━
     When a section scrolls OUT of view (exits upward),
     it gently scales down & recedes — giving the premium depth feel.
     For #projects-section: only recede AFTER all slides have been scrolled.
  ━━ */
  let projScrollProgress = 0; // track projects progress globally

  function updateRecede() {
    if (isMobile()) return;
    const isDark = document.documentElement.classList.contains('dark');

    cardSections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const isProjects = sec.id === 'projects-section';

      if (isProjects) {
        if (projScrollProgress < 0.99) {
          sec.style.filter = '';
          return;
        }
        if (rect.bottom < window.innerHeight && rect.bottom > 0) {
          const exitProgress = Math.min(1, 1 - (rect.bottom / window.innerHeight));
          const scale = 1 - exitProgress * 0.04;
          const translateY = exitProgress * -24;
          sec.style.transform = `translateY(${translateY}px) scale(${scale})`;
          // Only dim in dark mode — light mode stays true blue
          sec.style.filter = isDark ? `brightness(${1 - exitProgress * 0.25})` : '';
          sec.style.transformOrigin = 'top center';
        } else {
          sec.style.filter = '';
        }
        return;
      }

      if (rect.top < 0 && rect.bottom > 0) {
        const exitProgress = Math.min(1, Math.abs(rect.top) / (rect.height * 0.5));
        const scale = 1 - exitProgress * 0.04;
        const translateY = exitProgress * -24;
        sec.style.transform = `translateY(${translateY}px) scale(${scale})`;
        // In light mode: skip brightness (it turns blue backgrounds grey)
        sec.style.filter = isDark ? `brightness(${1 - exitProgress * 0.25})` : '';
        sec.style.transformOrigin = 'top center';
      } else if (rect.top >= 0) {
        sec.style.filter = '';
      }
    });
  }

  window.addEventListener('scroll', () => {
    onScroll();
    updateProj();
    updateRecede();
  }, {
    passive: true
  });

  /* ━━ LANGUAGE ━━ */
  let lang = 'en';
  document.getElementById('langBtn').addEventListener('click', () => {
    lang = lang === 'en' ? 'fr' : 'en';
    document.documentElement.classList.toggle('fr', lang === 'fr');
  });

  /* ━━ THEME ━━ */
  let dark = true;
  document.getElementById('themeBtn').addEventListener('click', () => {
    dark = !dark;
    document.documentElement.classList.toggle('dark', dark);
  });

  /* ━━ MOBILE NAV ━━ */
  const menuBtn = document.getElementById('menuBtn');
  const mNav = document.getElementById('mNav');
  const mLinks = document.querySelectorAll('.m-link');

  if (menuBtn && mNav) {
    menuBtn.addEventListener('click', () => {
      mNav.classList.toggle('active');
      const icon = menuBtn.querySelector('i');
      if (mNav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });

    mLinks.forEach(link => {
      link.addEventListener('click', () => {
        mNav.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      });
    });
  }

})();