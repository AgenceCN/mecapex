(() => {
  const videos = [...document.querySelectorAll('video')];

  // Only videos visible/near-visible are allowed to play.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const v = entry.target;
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        if (v.closest('.video-layer--ambient') || v.closest('.video-layer--mobility')) {
          if (v.closest('.video-layer--ambient')) v.play().catch(()=>{});
        } else {
          v.play().catch(()=>{});
        }
      } else if (!v.closest('.video-layer--ambient')) {
        v.pause();
      }
    });
  }, { rootMargin: '240px 0px', threshold: 0.01 });

  videos.forEach(v => observer.observe(v));

  // Lightweight pointer depth for cards. No canvas, no particle engine.
  const cards = document.querySelectorAll('.tilt-card');
  const finePointer = matchMedia('(pointer:fine)').matches;

  if (finePointer) {
    cards.forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(1000px) rotateX(${(-y*3.2).toFixed(2)}deg) rotateY(${(x*4.2).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  // Subtle scan line follows scroll without adding a heavy animation loop.
  const scan = document.querySelector('.hud-scan');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY % Math.max(innerHeight, 1);
      scan.style.transform = `translateY(${Math.round(y)}px)`;
      ticking = false;
    });
  }, {passive:true});

  // Rail active state from sections.
  const sections = [...document.querySelectorAll('main section[id], main section:first-child')];
  const rail = [...document.querySelectorAll('.rail-item')];
  const map = {mobility:1,aero:1,robotics:1,prototypes:4};
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      rail.forEach(x => x.classList.remove('active'));
      const id = entry.target.id;
      const idx = map[id] ?? (id ? 0 : 0);
      if (rail[idx]) rail[idx].classList.add('active');
    });
  }, {threshold:.45});
  sections.forEach(s => io.observe(s));

  // Try to start the ambient video after the page is interactive.
  const ambient = document.querySelector('.video-layer--ambient video');
  window.addEventListener('load', () => ambient?.play().catch(()=>{}), {once:true});
})();
