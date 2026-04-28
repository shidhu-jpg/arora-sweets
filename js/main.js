/* ===========================
   AURORA SWEETS — MAIN JS
   =========================== */

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile nav toggle ── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    })
  );
}

/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Menu filter ── */
const filterBtns     = document.querySelectorAll('.filter-btn');
const menuCards      = document.querySelectorAll('.menu-card');
const menuGrid       = document.querySelector('.menu-grid');
const gupshupSection = document.getElementById('gupshupSection');

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.filter;
      const showGupshup = cat === 'all' || cat === 'gupshup';
      const showAurora  = cat !== 'gupshup';

      if (gupshupSection) gupshupSection.style.display = showGupshup ? 'block' : 'none';
      if (menuGrid)       menuGrid.style.display        = showAurora  ? 'grid'  : 'none';

      if (showAurora) {
        menuCards.forEach(card => {
          const match = cat === 'all' || card.dataset.category === cat;
          card.style.display = match ? 'flex' : 'none';
          if (match) {
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = 'cardAppear 0.4s ease forwards';
          }
        });
      }
    });
  });
}

/* ── Gallery lightbox ── */
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const masonryItems = document.querySelectorAll('.masonry-item');

if (lightbox && masonryItems.length) {
  masonryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img').src;
      lightboxImg.src = src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  };

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

/* ── Contact form submit ── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Message Sent ✓';
      btn.style.background = '#2a7a2a';
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
        contactForm.reset();
      }, 3000);
    }, 1200);
  });
}

/* ── CSS keyframe for card appear ── */
const style = document.createElement('style');
style.textContent = `
  @keyframes cardAppear {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;
document.head.appendChild(style);
