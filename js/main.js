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

/* ── Order / Cart ── */
(function () {
  if (!document.querySelector('.menu-section')) return;

  let cart = {};
  try { cart = JSON.parse(localStorage.getItem('aroraCart') || '{}'); } catch (e) {}

  function saveCart() { localStorage.setItem('aroraCart', JSON.stringify(cart)); }

  function parsePrice(str) {
    if (!str) return 0;
    const m = str.match(/[\d,]+/);
    return m ? parseInt(m[0].replace(',', ''), 10) : 0;
  }

  function addToCart(name, price, btn) {
    if (cart[name]) cart[name].qty++;
    else cart[name] = { name, price, qty: 1 };
    saveCart();
    const isSmall = btn.classList.contains('gcat-add-btn');
    btn.textContent = isSmall ? '✓' : '✓ Added';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = isSmall ? '+' : '+ Add';
      btn.classList.remove('added');
    }, 900);
    renderCart();
    cartBar.classList.add('visible');
  }

  function removeFromCart(name) {
    delete cart[name];
    saveCart();
    renderCart();
    if (!Object.keys(cart).length) {
      cartBar.classList.remove('visible');
      closePanel();
    }
  }

  function updateQty(name, delta) {
    if (!cart[name]) return;
    cart[name].qty += delta;
    if (cart[name].qty <= 0) removeFromCart(name);
    else { saveCart(); renderCart(); }
  }

  function getTotal() {
    return Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
  }

  function getTotalItems() {
    return Object.values(cart).reduce((s, i) => s + i.qty, 0);
  }

  /* ── Inject Add buttons on menu cards ── */
  document.querySelectorAll('.menu-card').forEach(card => {
    const name  = card.querySelector('h3')?.textContent.trim();
    const price = parsePrice(card.querySelector('.price')?.textContent);
    if (!name) return;
    const btn = document.createElement('button');
    btn.className   = 'menu-add-btn';
    btn.textContent = '+ Add';
    btn.addEventListener('click', () => addToCart(name, price, btn));
    card.querySelector('.menu-card-body').appendChild(btn);
  });

  /* ── Inject Add buttons on Gupshup list rows ── */
  document.querySelectorAll('.gcat-list li').forEach(li => {
    let name, price;
    const thali = li.querySelector('.gcat-thali-item');
    if (thali) {
      name  = thali.querySelector('.gcat-thali-name')?.textContent.trim();
      price = parsePrice(thali.querySelector('.gcat-thali-price')?.textContent);
    } else {
      const spans = li.querySelectorAll('span');
      name  = spans[0]?.textContent.trim();
      price = parsePrice(spans[1]?.textContent);
    }
    if (!name || !price) return;
    const btn = document.createElement('button');
    btn.className   = 'gcat-add-btn';
    btn.textContent = '+';
    btn.title       = 'Add to order';
    btn.addEventListener('click', () => addToCart(name, price, btn));
    li.appendChild(btn);
  });

  /* ── Cart bar ── */
  const cartBar = document.createElement('div');
  cartBar.className = 'cart-bar';
  cartBar.innerHTML = `
    <div class="cart-bar-left">
      <span class="cart-bar-count" id="cartBarCount">0</span>
      <span class="cart-bar-label">items &nbsp;·&nbsp; Ready in <strong>~20 min</strong></span>
    </div>
    <div class="cart-bar-right">
      <span class="cart-bar-total" id="cartBarTotal">₹0</span>
      <button class="cart-bar-btn" id="cartViewBtn">View Order</button>
    </div>`;
  document.body.appendChild(cartBar);

  /* ── Cart panel ── */
  const cartPanel = document.createElement('div');
  cartPanel.className = 'cart-panel';
  cartPanel.innerHTML = `
    <div class="cart-panel-header">
      <h3>Your Order</h3>
      <button class="cart-panel-close" id="cartPanelClose">✕</button>
    </div>
    <div class="cart-notice">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      Food is freshly prepared — ready in <strong>~20 minutes</strong>
    </div>
    <div class="cart-items-list" id="cartItemsList">
      <p class="cart-empty">No items added yet.</p>
    </div>
    <div class="cart-panel-footer">
      <div class="cart-total-row">
        <span>Estimated Total</span>
        <span id="cartPanelTotal">₹0</span>
      </div>
      <button class="cart-checkout-btn" id="cartCheckoutBtn">
        Proceed to Checkout &rarr;
      </button>
      <button class="cart-clear-btn" id="cartClearBtn">Clear Order</button>
    </div>`;
  document.body.appendChild(cartPanel);

  const cartOverlay = document.createElement('div');
  cartOverlay.className = 'cart-overlay';
  document.body.appendChild(cartOverlay);

  /* ── Panel open / close ── */
  function openPanel() {
    cartPanel.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('cartViewBtn').addEventListener('click', openPanel);
  document.getElementById('cartPanelClose').addEventListener('click', closePanel);
  const navCartBtn = document.getElementById('navCartBtn');
  if (navCartBtn) navCartBtn.addEventListener('click', openPanel);
  cartOverlay.addEventListener('click', closePanel);
  document.getElementById('cartCheckoutBtn').addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
  document.getElementById('cartClearBtn').addEventListener('click', () => {
    Object.keys(cart).forEach(k => delete cart[k]);
    saveCart();
    renderCart();
    cartBar.classList.remove('visible');
    closePanel();
  });

  /* ── Render cart contents ── */
  function renderCart() {
    const total      = getTotal();
    const totalItems = getTotalItems();

    document.getElementById('cartBarCount').textContent   = totalItems;
    document.getElementById('cartBarTotal').textContent   = '₹' + total;
    document.getElementById('cartPanelTotal').textContent = '₹' + total;

    const badge = document.getElementById('navCartBadge');
    if (badge) {
      if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    const list  = document.getElementById('cartItemsList');
    const items = Object.values(cart);

    if (!items.length) {
      list.innerHTML = '<p class="cart-empty">No items added yet.</p>';
      return;
    }

    list.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</span>
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" data-name="${item.name}" data-delta="-1">−</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="cart-qty-btn" data-name="${item.name}" data-delta="1">+</button>
          <button class="cart-remove-btn" data-name="${item.name}">✕</button>
        </div>
      </div>`).join('');

    list.querySelectorAll('.cart-qty-btn').forEach(btn =>
      btn.addEventListener('click', () => updateQty(btn.dataset.name, parseInt(btn.dataset.delta, 10)))
    );
    list.querySelectorAll('.cart-remove-btn').forEach(btn =>
      btn.addEventListener('click', () => removeFromCart(btn.dataset.name))
    );
  }

  /* ── Init: restore cart state from localStorage ── */
  if (Object.keys(cart).length) {
    renderCart();
    cartBar.classList.add('visible');
  }

  window._aroraCartAdd     = addToCart;
  window._aroraCartBar     = cartBar;
  window._aroraRenderCart  = renderCart;
}());

/* ── Menu Category Navigation ── */
(function () {
  const landing     = document.getElementById('menuCatLanding');
  const backRow     = document.getElementById('menuCatBackRow');
  const backBtn     = document.getElementById('menuCatBackBtn');
  const activeTitle = document.getElementById('menuCatActiveTitle');
  const itemsDiv    = document.getElementById('menuCatItems');
  const gupshupDiv  = document.getElementById('gupshupSection');

  if (!landing) return;

  /* Count items per category from hidden data source */
  const dataCounts = {};
  document.querySelectorAll('#menuDataSource .menu-card').forEach(card => {
    const cat = card.dataset.category;
    dataCounts[cat] = (dataCounts[cat] || 0) + 1;
  });

  /* Fill item-count labels on category cards */
  document.querySelectorAll('.menu-cat-count[data-cat]').forEach(el => {
    const n = dataCounts[el.dataset.cat] || 0;
    el.textContent = n + ' item' + (n !== 1 ? 's' : '');
  });

  function showLanding() {
    landing.style.display  = '';
    backRow.style.display  = 'none';
    itemsDiv.style.display = 'none';
    if (gupshupDiv) gupshupDiv.style.display = 'none';
    window.scrollTo({ top: document.querySelector('.menu-section')?.offsetTop - 80 || 0, behavior: 'smooth' });
  }

  function parsePrice(str) {
    if (!str) return 0;
    const m = str.match(/[\d,]+/);
    return m ? parseInt(m[0].replace(',', ''), 10) : 0;
  }

  function renderItems(catKey) {
    itemsDiv.innerHTML = '';
    const cards = document.querySelectorAll(`#menuDataSource .menu-card[data-category="${catKey}"]`);
    cards.forEach(card => {
      const name  = card.querySelector('h3')?.textContent.trim()    || '';
      const desc  = card.querySelector('p')?.textContent.trim()     || '';
      const price = card.querySelector('.price')?.textContent.trim() || '';
      const badge = card.querySelector('.menu-card-badge')?.textContent.trim() || '';

      const row = document.createElement('div');
      row.className = 'menu-item-row';
      row.innerHTML = `
        <div class="menu-item-info">
          <div class="menu-item-name-row">
            <h3 class="menu-item-name">${name}</h3>
            ${badge ? `<span class="menu-item-badge">${badge}</span>` : ''}
          </div>
          <p class="menu-item-desc">${desc}</p>
        </div>
        <div class="menu-item-right">
          <span class="menu-item-price">${price}</span>
          <button class="menu-item-add-btn" data-name="${name}" data-price="${parsePrice(price)}">+ Add</button>
        </div>`;
      itemsDiv.appendChild(row);
    });

    itemsDiv.querySelectorAll('.menu-item-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name  = btn.dataset.name;
        const price = parseInt(btn.dataset.price, 10);
        if (window._aroraCartAdd) {
          window._aroraCartAdd(name, price, btn);
        }
      });
    });
  }

  function showCategory(catKey, catLabel) {
    landing.style.display = 'none';
    backRow.style.display = 'flex';
    activeTitle.textContent = catLabel;

    if (catKey === 'gupshup') {
      itemsDiv.style.display = 'none';
      if (gupshupDiv) gupshupDiv.style.display = 'block';
    } else {
      if (gupshupDiv) gupshupDiv.style.display = 'none';
      renderItems(catKey);
      itemsDiv.style.display = 'block';
    }
    window.scrollTo({ top: document.querySelector('.menu-section')?.offsetTop - 80 || 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.menu-cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat   = card.dataset.cat;
      const label = card.querySelector('h3')?.textContent.trim() || cat;
      showCategory(cat, label);
    });
  });

  if (backBtn) backBtn.addEventListener('click', showLanding);
}());
