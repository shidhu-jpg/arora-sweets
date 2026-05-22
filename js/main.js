/* ===========================
   AURORA SWEETS — MAIN JS
   =========================== */

/* ── Announcement banner close ── */
const announceBar   = document.getElementById('announceBar');
const announceClose = document.getElementById('announceClose');
if (announceBar && announceClose) {
  announceClose.addEventListener('click', () => {
    announceBar.classList.add('hidden');
    sessionStorage.setItem('announceDismissed', '1');
  });
  if (sessionStorage.getItem('announceDismissed')) {
    announceBar.classList.add('hidden');
  }
}

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

/* ── Animated stat counters ── */
(function () {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = (target >= 1000
        ? Math.round(current).toLocaleString('en-IN')
        : Math.round(current)) + suffix;
    }, step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => counterObserver.observe(el));
}());

/* ── Scroll to top button ── */
(function () {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}());

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

  /* ── Inject Add buttons on home page featured sweet cards ── */
  document.querySelectorAll('.sweet-card').forEach(card => {
    const name  = card.querySelector('h3')?.textContent.trim();
    const price = parsePrice(card.querySelector('.price')?.textContent);
    if (!name || !price) return;
    const btn = document.createElement('button');
    btn.className   = 'menu-add-btn';
    btn.textContent = '+ Add';
    btn.addEventListener('click', () => addToCart(name, price, btn));
    card.querySelector('.sweet-card-body').appendChild(btn);
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
  /* ── Checkout modal ── */
  const checkoutModal = document.createElement('div');
  checkoutModal.className = 'checkout-modal-overlay';
  checkoutModal.innerHTML = `
    <div class="checkout-modal">
      <button class="checkout-modal-close" id="checkoutModalClose">✕</button>
      <h3 class="checkout-modal-title">Complete Your Order</h3>
      <p class="checkout-modal-sub">We'll receive your order on WhatsApp and confirm shortly.</p>
      <form id="checkoutForm" novalidate>
        <label class="checkout-label">Your Name <span class="req">*</span>
          <input class="checkout-input" id="checkoutName" type="text" placeholder="e.g. Rahul Sharma" required />
        </label>
        <label class="checkout-label">Phone Number <span class="req">*</span>
          <input class="checkout-input" id="checkoutPhone" type="tel" placeholder="e.g. 9876543210" required />
        </label>
        <label class="checkout-label">Delivery Address <span class="opt">(optional)</span>
          <textarea class="checkout-input checkout-textarea" id="checkoutAddress" placeholder="House no., street, area, city…" rows="2"></textarea>
        </label>
        <label class="checkout-label">Special Instructions <span class="opt">(optional)</span>
          <textarea class="checkout-input checkout-textarea" id="checkoutNote" placeholder="Allergies, delivery note, etc." rows="2"></textarea>
        </label>
        <div id="checkoutError" class="checkout-error" style="display:none"></div>
        <button type="submit" class="checkout-submit-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style="flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Send Order on WhatsApp
        </button>
      </form>
    </div>`;
  document.body.appendChild(checkoutModal);

  function openCheckoutModal() {
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('checkoutName').focus();
  }

  function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('checkoutForm').reset();
    document.getElementById('checkoutError').style.display = 'none';
  }

  document.getElementById('checkoutModalClose').addEventListener('click', closeCheckoutModal);
  checkoutModal.addEventListener('click', e => { if (e.target === checkoutModal) closeCheckoutModal(); });

  document.getElementById('checkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('checkoutName').value.trim();
    const phone   = document.getElementById('checkoutPhone').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const note    = document.getElementById('checkoutNote').value.trim();
    const errEl = document.getElementById('checkoutError');

    if (!name || !phone) {
      errEl.textContent = 'Please enter your name and phone number.';
      errEl.style.display = 'block';
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      errEl.textContent = 'Please enter a valid 10-digit Indian mobile number.';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    const items = Object.values(cart);
    const total = getTotal();
    let lines = items.map(i => `  • ${i.name} × ${i.qty} = ₹${i.price * i.qty}`).join('\n');
    let msg =
      `🛍️ *New Order — Arora Sweets*\n\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      (address ? `*Address:* ${address}\n` : '') +
      `\n` +
      `*Order:*\n${lines}\n\n` +
      `*Total: ₹${total}*\n` +
      `_(5% tax will be applied on food items)_\n` +
      `_Ordered via Arora Sweets website_`;
    if (note) msg += `\n*Note:* ${note}`;

    const waUrl = `https://wa.me/919934492744?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener');
    closeCheckoutModal();
  });

  document.getElementById('cartCheckoutBtn').addEventListener('click', () => {
    closePanel();
    openCheckoutModal();
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
  const landing        = document.getElementById('menuCatLanding');
  const backRow        = document.getElementById('menuCatBackRow');
  const backBtn        = document.getElementById('menuCatBackBtn');
  const activeTitle    = document.getElementById('menuCatActiveTitle');
  const itemsDiv       = document.getElementById('menuCatItems');
  const gupshupDiv     = document.getElementById('gupshupSection');
  const catFooter      = document.getElementById('menuCatFooter');
  const catSearchWrap  = document.getElementById('menuCatSearchWrap');
  const catSearchInput = document.getElementById('menuCatSearchInput');
  const catSearchClear = document.getElementById('menuCatSearchClear');

  if (!landing) return;

  let currentCatKey = null;

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
    if (gupshupDiv)    gupshupDiv.style.display    = 'none';
    if (catFooter)     catFooter.style.display     = 'none';
    if (catSearchWrap) catSearchWrap.style.display = 'none';
    if (catSearchInput) { catSearchInput.value = ''; }
    if (catSearchClear) catSearchClear.style.display = 'none';
    const globalSearchWrap = document.getElementById('menuSearchWrap');
    if (globalSearchWrap) globalSearchWrap.style.display = '';
    currentCatKey = null;
    window.scrollTo({ top: document.querySelector('.menu-section')?.offsetTop - 80 || 0, behavior: 'smooth' });
  }

  function parsePrice(str) {
    if (!str) return 0;
    const m = str.match(/[\d,]+/);
    return m ? parseInt(m[0].replace(',', ''), 10) : 0;
  }

  function buildItemRow(name, desc, price, badge) {
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
    row.querySelector('.menu-item-add-btn').addEventListener('click', function () {
      if (window._aroraCartAdd) window._aroraCartAdd(this.dataset.name, parseInt(this.dataset.price, 10), this);
    });
    return row;
  }

  function renderItems(catKey, query) {
    itemsDiv.innerHTML = '';
    const q = (query || '').trim().toLowerCase();
    const cards = document.querySelectorAll(`#menuDataSource .menu-card[data-category="${catKey}"]`);
    let count = 0;
    cards.forEach(card => {
      const name  = card.querySelector('h3')?.textContent.trim()     || '';
      const desc  = card.querySelector('p')?.textContent.trim()      || '';
      const price = card.querySelector('.price')?.textContent.trim() || '';
      const badge = card.querySelector('.menu-card-badge')?.textContent.trim() || '';
      if (q && !name.toLowerCase().includes(q) && !desc.toLowerCase().includes(q)) return;
      itemsDiv.appendChild(buildItemRow(name, desc, price, badge));
      count++;
    });
    if (q && count === 0) {
      itemsDiv.innerHTML = `<p class="menu-search-empty">No items found for "<strong>${query}</strong>"</p>`;
    }
  }

  function showCategory(catKey, catLabel) {
    landing.style.display = 'none';
    backRow.style.display = 'flex';
    activeTitle.textContent = catLabel;
    currentCatKey = catKey;

    const globalSearchWrap = document.getElementById('menuSearchWrap');
    if (globalSearchWrap) globalSearchWrap.style.display = 'none';

    if (catSearchInput) catSearchInput.value = '';
    if (catSearchClear) catSearchClear.style.display = 'none';

    if (catKey === 'gupshup') {
      itemsDiv.style.display = 'none';
      if (catFooter)     catFooter.style.display     = 'none';
      if (catSearchWrap) catSearchWrap.style.display = 'none';
      if (gupshupDiv)    gupshupDiv.style.display    = 'block';
    } else {
      if (gupshupDiv)    gupshupDiv.style.display    = 'none';
      if (catSearchWrap) catSearchWrap.style.display = 'block';
      renderItems(catKey);
      itemsDiv.style.display = 'block';
      if (catFooter) catFooter.style.display = 'block';
    }
    window.scrollTo({ top: document.querySelector('.menu-section')?.offsetTop - 80 || 0, behavior: 'smooth' });
  }

  /* In-category search events */
  if (catSearchInput) {
    catSearchInput.addEventListener('input', () => {
      const q = catSearchInput.value;
      catSearchClear.style.display = q ? 'inline-block' : 'none';
      if (currentCatKey) renderItems(currentCatKey, q);
    });
  }
  if (catSearchClear) {
    catSearchClear.addEventListener('click', () => {
      catSearchInput.value = '';
      catSearchClear.style.display = 'none';
      if (currentCatKey) renderItems(currentCatKey);
      catSearchInput.focus();
    });
  }

  document.querySelectorAll('.menu-cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat   = card.dataset.cat;
      const label = card.querySelector('h3')?.textContent.trim() || cat;
      showCategory(cat, label);
    });
  });

  if (backBtn) backBtn.addEventListener('click', showLanding);

  /* expose showLanding for search to call */
  window._aroraShowMenuLanding = showLanding;
}());

/* ── Menu Search ── */
(function () {
  const searchInput   = document.getElementById('menuSearchInput');
  const searchClear   = document.getElementById('menuSearchClear');
  const searchResults = document.getElementById('menuSearchResults');
  const landing       = document.getElementById('menuCatLanding');
  const backRow       = document.getElementById('menuCatBackRow');
  const itemsDiv      = document.getElementById('menuCatItems');
  const gupshupDiv    = document.getElementById('gupshupSection');
  const catFooter     = document.getElementById('menuCatFooter');

  if (!searchInput || !searchResults) return;

  const CAT_LABELS = {
    breakfast: 'Breakfast', chaat: 'Chaat', starters: 'Starters',
    'south-indian': 'South Indian', 'continental-snacks': 'Continental Snacks',
    pizza: 'Pizza', laddu: 'Laddu', 'kaju-sweets': 'Kaju Sweets',
    'khoa-sweets': 'Khoa Sweets', 'besan-sweets': 'Besan Sweets',
    'nariyal-sweets': 'Nariyal Sweets', 'chena-sweets': 'Chena Sweets',
    mains: 'Mains', beverages: 'Beverages', bread: 'Bread'
  };

  function parsePrice(str) {
    if (!str) return 0;
    const m = str.match(/[\d,]+/);
    return m ? parseInt(m[0].replace(',', ''), 10) : 0;
  }

  function getAllItems() {
    const items = [];
    document.querySelectorAll('#menuDataSource .menu-card').forEach(card => {
      const name  = card.querySelector('h3')?.textContent.trim()     || '';
      const desc  = card.querySelector('p')?.textContent.trim()      || '';
      const price = card.querySelector('.price')?.textContent.trim() || '';
      const badge = card.querySelector('.menu-card-badge')?.textContent.trim() || '';
      const cat   = card.dataset.category || '';
      if (name) items.push({ name, desc, price, badge, cat });
    });
    return items;
  }

  function showSearchView() {
    if (landing)    landing.style.display    = 'none';
    if (backRow)    backRow.style.display    = 'none';
    if (itemsDiv)   itemsDiv.style.display   = 'none';
    if (gupshupDiv) gupshupDiv.style.display = 'none';
    if (catFooter)  catFooter.style.display  = 'none';
    const csw = document.getElementById('menuCatSearchWrap');
    if (csw) csw.style.display = 'none';
    searchResults.style.display = 'block';
  }

  function hideSearchView() {
    searchResults.style.display = 'none';
    if (landing) landing.style.display = '';
  }

  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) { hideSearchView(); return; }

    showSearchView();
    const all     = getAllItems();
    const matched = all.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      (CAT_LABELS[item.cat] || '').toLowerCase().includes(q)
    );

    if (!matched.length) {
      searchResults.innerHTML = `<p class="menu-search-empty">No items found for "<strong>${query}</strong>"</p>`;
      return;
    }

    searchResults.innerHTML = matched.map(item => `
      <div class="menu-item-row">
        <div class="menu-item-info">
          <div class="menu-item-name-row">
            <h3 class="menu-item-name">${item.name}</h3>
            ${item.badge ? `<span class="menu-item-badge">${item.badge}</span>` : ''}
            <span class="menu-search-item-cat">${CAT_LABELS[item.cat] || item.cat}</span>
          </div>
          <p class="menu-item-desc">${item.desc}</p>
        </div>
        <div class="menu-item-right">
          <span class="menu-item-price">${item.price}</span>
          <button class="menu-item-add-btn" data-name="${item.name}" data-price="${parsePrice(item.price)}">+ Add</button>
        </div>
      </div>`).join('');

    searchResults.querySelectorAll('.menu-item-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window._aroraCartAdd) window._aroraCartAdd(btn.dataset.name, parseInt(btn.dataset.price, 10), btn);
      });
    });
  }

  searchInput.addEventListener('input', () => {
    const q = searchInput.value;
    searchClear.style.display = q ? 'inline-block' : 'none';
    renderSearchResults(q);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    hideSearchView();
    searchInput.focus();
  });
}());
