/* ═══════════════════════════════════════════════════════════
   main.js — marthaconhache.es
   Animaciones con GSAP 3 + ScrollTrigger + ScrollSmoother
   Comentarios en español por sección
════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────
   PRELOADER — arranca inmediatamente, sin depender de GSAP.
   El contador usa setInterval puro. Solo cuando termina
   se inicializa GSAP y el resto de animaciones.
───────────────────────────────────────────────────────── */
(function initPreloader() {
  const preloader  = document.getElementById('preloader');
  const numEl      = document.getElementById('preloader-num');
  const scrollHint = document.getElementById('preloader-scroll-hint');

  if (!preloader || !numEl) {
    // Si no existe el preloader, arrancar animaciones directamente
    initGSAP();
    return;
  }

  // Bloquear scroll durante la carga
  document.body.style.overflow = 'hidden';

  const DURATION = 1800; // ms totales del conteo

  // Declarar antes del branch para evitar TDZ en completarPreloader
  let rafFallback = null;

  // Si el tab no está visible (segundo plano), saltar animación directamente
  if (document.hidden) {
    completarPreloader();
    return;
  }

  // Tab visible: animar con rAF usando tiempo real
  let startTime = null;

  function tick(timestamp) {
    if (!startTime) startTime = timestamp;

    const progress = Math.min((timestamp - startTime) / DURATION, 1);
    numEl.textContent = Math.floor(progress * 100);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      numEl.textContent = 100;
      completarPreloader();
    }
  }

  // Fallback: si rAF no dispara en 3s (tab congelado), completar igualmente
  rafFallback = setTimeout(completarPreloader, DURATION + 1500);

  requestAnimationFrame(tick);

  function completarPreloader() {
    clearTimeout(rafFallback);
    numEl.textContent = 100;

    // Tab en segundo plano: ocultar sin animación para no bloquear el hero
    if (document.hidden) {
      preloader.style.display      = 'none';
      document.body.style.overflow = '';
      initGSAP();
      return;
    }

    if (scrollHint) {
      scrollHint.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      scrollHint.style.opacity    = '1';
      scrollHint.style.transform  = 'translateY(0)';
    }

    setTimeout(() => {
      preloader.style.transition = 'opacity 0.7s ease';
      preloader.style.opacity    = '0';
      setTimeout(() => {
        preloader.style.display      = 'none';
        document.body.style.overflow = '';
        initGSAP();
      }, 700);
    }, 600);
  }
})();


/* ─────────────────────────────────────────────────────────
   GSAP + SCROLL ANIMATIONS — se inicializan tras el preloader
───────────────────────────────────────────────────────── */
function initGSAP() {

  if (typeof gsap === 'undefined') { revealHeroFallback(); return; }

  gsap.registerPlugin(ScrollTrigger);


  /* ─────────────────────────────────────────────────────────
     NAV — fondo sólido al hacer scroll
  ───────────────────────────────────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    ScrollTrigger.create({
      start:       '80px top',
      onEnter:     () => nav.classList.add('nav--scrolled'),
      onLeaveBack: () => nav.classList.remove('nav--scrolled')
    });
  }


  /* ─────────────────────────────────────────────────────────
     ANM 1 — HERO ENTRANCE: fade + slide desde abajo con stagger
     Cada línea entra desde y:80px con opacity 0.
     Después del H1: subtítulo → stats → indicador scroll.
  ───────────────────────────────────────────────────────── */
  (function heroEntrance() {
    const lines     = gsap.utils.toArray('.hero__line');
    const sub       = document.querySelector('.hero__sub');
    const stats     = document.querySelector('.hero__stats');
    const scrollInd = document.querySelector('.hero__scroll');

    gsap.set(lines, { opacity: 0, y: 80 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Cada línea: y:80→0 con opacity:0→1, stagger de 0.2s
    tl.to(lines, {
      opacity: 1,
      y:       0,
      duration: 0.85,
      stagger:  0.2
    });

    if (sub)       tl.to(sub,       { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');
    if (stats)     tl.to(stats,     { opacity: 1, y: 0, duration: 0.5 }, '-=0.4');
    if (scrollInd) tl.to(scrollInd, { opacity: 1, duration: 0.5 },       '-=0.2');
  })();


  /* ─────────────────────────────────────────────────────────
     ANM 1 — HERO PARALLAX: imagen se acerca mientras bajas
     scale(1.08)→(1.25), yPercent 0→-15, ligado al scroll.
  ───────────────────────────────────────────────────────── */
  (function heroParallax() {
    const heroImg = document.querySelector('.hero__img');
    if (!heroImg) return;

    // Estado de partida: imagen ligeramente más grande que el contenedor
    gsap.set(heroImg, { scale: 1.08, yPercent: 0 });

    gsap.to(heroImg, {
      scale:    1.25,
      yPercent: -15,
      ease:     'none',
      scrollTrigger: {
        trigger: '#hero',
        start:   'top top',
        end:     'bottom top',
        scrub:   true
      }
    });
  })();


  /* ─────────────────────────────────────────────────────────
     ANM 2 — TEXTO DOBLE EN SCROLL (marquee sentidos contrarios)
  ───────────────────────────────────────────────────────── */
  (function initTextoDoble() {
    const marqueeScrolls = document.querySelectorAll('.marquee-scroll');
    marqueeScrolls.forEach(marquee => {
      const inner    = marquee.querySelector('.marquee-inner');
      const reversed = marquee.dataset.reversed === 'true';
      const xStart   = reversed ? '-30%' : '0%';
      const xEnd     = reversed ? '0%'   : '-30%';

      gsap.fromTo(inner,
        { x: xStart },
        {
          x:    xEnd,
          ease: 'none',
          scrollTrigger: {
            trigger: '.texto-doble',
            start:   'top bottom',
            end:     'bottom top',
            scrub:   1
          }
        }
      );
    });
  })();


  /* ─────────────────────────────────────────────────────────
     ANM 5 — FRASES EN SCROLL: opacity 0.08 → 1 → 0.08
     Cada frase se ilumina al entrar en el centro y se apaga
     al salir. scrub:1 para movimiento continuo.
  ───────────────────────────────────────────────────────── */
  (function initFrasesScroll() {
    const frases = gsap.utils.toArray('.frase-bloque__texto');
    if (!frases.length) return;

    frases.forEach(frase => {
      // Subida: de 0.08 a 1 cuando entra en pantalla
      gsap.fromTo(frase,
        { opacity: 0.08 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: frase,
            start:   'top 68%',
            end:     'top 28%',
            scrub:   1
          }
        }
      );
      // Bajada: de 1 a 0.08 cuando sale por arriba
      gsap.fromTo(frase,
        { opacity: 1 },
        {
          opacity: 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: frase,
            start:   'bottom 62%',
            end:     'bottom 18%',
            scrub:   1
          }
        }
      );
    });
  })();


  /* ─────────────────────────────────────────────────────────
     ANM 4 — ZOOM CINEMATOGRÁFICO: 3 encuadres en sticky
     Un único timeline con scrub:1.5 ligado a los 300vh.
     Encuadre 1→2: manos → vista completa (primera mitad).
     Encuadre 2→3: vista completa → pantalla laptop (segunda mitad).
     Copy aparece en el encuadre 3 con fade.
  ───────────────────────────────────────────────────────── */
  (function initZoom() {
    const zoomImg     = document.getElementById('zoomImg');
    const zoomOverlay = document.getElementById('zoomOverlay');
    const zoomCopy    = document.getElementById('zoomCopy');
    if (!zoomImg) return;

    gsap.set(zoomCopy, { y: 20 });

    const zoomTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#zoomSpacer',
        start:   'top top',
        end:     'bottom bottom',
        scrub:   1.5
      }
    });

    // Encuadre 1→2: manos en teclado → grupo completo
    zoomTl.fromTo(zoomImg,
      { scale: 2.8, xPercent: 4, yPercent: 22 },
      { scale: 1, xPercent: 0, yPercent: 0, ease: 'power1.inOut', duration: 1 }
    )
    // Encuadre 2→3: grupo completo → pantalla del portátil
    .to(zoomImg, {
      scale:    2.4,
      xPercent: -8,
      yPercent: -18,
      ease:     'power1.inOut',
      duration: 1
    })
    // Overlay marino en encuadre 3
    .to(zoomOverlay, {
      backgroundColor: 'rgba(22,27,46,0.65)',
      ease:     'power2.in',
      duration: 0.5
    }, '-=0.4')
    // Copy al llegar al encuadre 3
    .to(zoomCopy, {
      opacity:  1,
      y:        0,
      ease:     'power2.out',
      duration: 0.3
    }, '-=0.2');
  })();


  /* ─────────────────────────────────────────────────────────
     ANM 3 — PILARES: entrada desde la derecha + sidebar activo
     Cada bloque entra con x:100→0, opacity:0→1.
     El ítem del sidebar cambia de color según el bloque visible.
  ───────────────────────────────────────────────────────── */
  (function initPilares() {
    const bloques = gsap.utils.toArray('.pilar-bloque');
    const items   = gsap.utils.toArray('.pilares__item');

    bloques.forEach((bloque, i) => {
      // Entrada desde la derecha
      gsap.to(bloque, {
        opacity: 1,
        x:       0,
        duration: 0.9,
        ease:    'power3.out',
        scrollTrigger: {
          trigger:       bloque,
          start:         'top 75%',
          toggleActions: 'play none none reverse'
        }
      });

      // Sidebar: activar ítem según pilar en pantalla
      ScrollTrigger.create({
        trigger:     bloque,
        start:       'top 55%',
        end:         'bottom 55%',
        onEnter:     () => activarPilar(i),
        onEnterBack: () => activarPilar(i)
      });
    });

    function activarPilar(idx) {
      items.forEach((item, i) => item.classList.toggle('is-active', i === idx));
    }
    if (items.length) activarPilar(0);
  })();


  /* ─────────────────────────────────────────────────────────
     ANM 6 — CONTADORES ANIMADOS
     Cada stat cuenta de 0 a su valor (data-target) al entrar.
     toggleActions: "play none none none" — solo una vez.
  ───────────────────────────────────────────────────────── */
  (function initContadores() {
    const nums = gsap.utils.toArray('.stats-bar__num');
    if (!nums.length) return;

    nums.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.val) + suffix;
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    });
  })();


  /* ─────────────────────────────────────────────────────────
     MANIFIESTO — reveal al scroll
  ───────────────────────────────────────────────────────── */
  (function initManifiesto() {
    const q = document.querySelector('.manifiesto__quote');
    if (!q) return;
    gsap.from(q, {
      opacity: 0, y: 40, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: q, start: 'top 70%', toggleActions: 'play none none reverse' }
    });
  })();


  /* ─────────────────────────────────────────────────────────
     TESTIMONIALES — carrusel con flechas y fade entre slides
  ───────────────────────────────────────────────────────── */
  (function initTestimoniales() {
    const slides  = gsap.utils.toArray('.testimonial');
    const dots    = gsap.utils.toArray('.testimoniales__dot');
    const btnPrev = document.querySelector('.testimoniales__flecha--prev');
    const btnNext = document.querySelector('.testimoniales__flecha--next');
    if (!slides.length) return;

    let actual = 0;

    function irA(idx) {
      slides[actual].setAttribute('aria-hidden', 'true');
      dots[actual].classList.remove('testimoniales__dot--activo');
      actual = (idx + slides.length) % slides.length;
      slides[actual].setAttribute('aria-hidden', 'false');
      dots[actual].classList.add('testimoniales__dot--activo');
      gsap.fromTo(slides[actual],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
    }

    if (btnPrev) btnPrev.addEventListener('click', () => irA(actual - 1));
    if (btnNext) btnNext.addEventListener('click', () => irA(actual + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => irA(i)));
  })();


  /* ─────────────────────────────────────────────────────────
     SECCIÓN DE VÍDEO — entrada al scroll + modal/lightbox
  ───────────────────────────────────────────────────────── */
  (function initVideo() {
    const linea1  = document.querySelector('.video-section__linea1');
    const linea2  = document.querySelector('.video-section__linea2');
    const bloque  = document.querySelector('.video-section__bloque');
    const modal   = document.getElementById('video-modal');
    const iframe  = document.getElementById('video-iframe');
    const btnPlay = document.getElementById('video-play-btn');
    const btnCerrar = document.getElementById('video-modal-cerrar');
    const backdrop  = document.getElementById('video-modal-backdrop');

    if (linea1 && linea2 && bloque) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.video-section', start: 'top 65%', toggleActions: 'play none none reverse' }
      });
      tl.to(linea1, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' })
        .to(linea2,  { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, '-=0.45')
        .to(bloque,  { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55');
    }

    if (!modal || !iframe || !btnPlay) return;

    btnPlay.addEventListener('click', abrirModal);
    document.getElementById('video-thumb')?.addEventListener('click', (e) => {
      if (e.target === btnPlay || btnPlay.contains(e.target)) return;
      abrirModal();
    });
    btnCerrar?.addEventListener('click', cerrarModal);
    backdrop?.addEventListener('click', cerrarModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) cerrarModal();
    });

    function abrirModal() {
      if (!iframe.src || iframe.src === window.location.href) iframe.src = iframe.dataset.src;
      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    }
    function cerrarModal() {
      gsap.to(modal, {
        opacity: 0, duration: 0.25, ease: 'power2.in',
        onComplete: () => {
          modal.setAttribute('hidden', '');
          iframe.src = '';
          document.body.style.overflow = '';
        }
      });
    }
  })();


  /* ─────────────────────────────────────────────────────────
     PROCESO — línea de tiempo horizontal con reveal
  ───────────────────────────────────────────────────────── */
  (function initProceso() {
    const hitos  = gsap.utils.toArray('.proceso__hito');
    const lineas = gsap.utils.toArray('.proceso__linea');

    lineas.forEach(linea => {
      gsap.from(linea, {
        scaleX: 0, transformOrigin: 'left center', duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: linea, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });

    hitos.forEach((hito, i) => {
      gsap.from(hito, {
        opacity: 0, y: 20, duration: 0.5, delay: i * 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.proceso__timeline', start: 'top 75%', toggleActions: 'play none none reverse' }
      });
    });
  })();


  /* ─────────────────────────────────────────────────────────
     ESFERA WIREFRAME — rotación lenta + movimiento vertical
  ───────────────────────────────────────────────────────── */
  (function initEsfera() {
    const esfera = document.getElementById('esfera-svg');
    if (!esfera) return;
    gsap.to(esfera, { rotationY: 360, duration: 28, ease: 'none', repeat: -1 });
    gsap.to(esfera, { y: 20, duration: 6, ease: 'sine.inOut', repeat: -1, yoyo: true });
  })();


  /* ─────────────────────────────────────────────────────────
     FORMULARIO — validación + confirmación animada
  ───────────────────────────────────────────────────────── */
  (function initFormulario() {
    const form    = document.getElementById('contacto-form');
    const success = document.getElementById('form-success');
    if (!form || !success) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) { field.style.borderColor = '#F41354'; valid = false; }
      });
      if (!valid) return;

      success.removeAttribute('hidden');
      gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      const icon = success.querySelector('.form-success__icon');
      if (icon) gsap.fromTo(icon, { scale: 0, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.5, delay: 0.2, ease: 'back.out(1.8)' });
    });
  })();


  /* ─────────────────────────────────────────────────────────
     CTA FINAL — reveal al scroll
  ───────────────────────────────────────────────────────── */
  (function initCtaFinal() {
    const section = document.querySelector('.cta-final');
    if (!section) return;
    gsap.from(
      [section.querySelector('.cta-final__logo'), section.querySelector('.cta-final__tagline'), section.querySelector('.btn')].filter(Boolean),
      { opacity: 0, y: 36, stagger: 0.14, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 65%', toggleActions: 'play none none reverse' } }
    );
  })();

} // fin initGSAP


/* ─────────────────────────────────────────────────────────
   FALLBACK — si GSAP no carga, mostrar contenido sin animar
───────────────────────────────────────────────────────── */
function revealHeroFallback() {
  document.querySelectorAll('.hero__line, .hero__sub, .hero__stats, .hero__scroll, .pilar-bloque')
    .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
}
