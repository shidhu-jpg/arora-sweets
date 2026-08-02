/* Price overrides — patches .price spans from Firebase (with localStorage cache)
   Runs before main.js so the menu JS picks up updated prices. */
(function () {
  var DATA_KEY = 'aroraAdminData';
  var OLD_KEY  = 'aroraPriceOverrides'; /* backward-compat with pre-admin-rewrite cache */
  var config   = (typeof ARORA_FB !== 'undefined') ? ARORA_FB : {};

  /* Extract the prices map from either old flat or new nested format */
  function getPrices(data) {
    if (!data || typeof data !== 'object') return {};
    /* New format: { prices: { name: { display, numeric } }, units: {}, ... } */
    if (data.prices && typeof data.prices === 'object') return data.prices;
    /* Old flat format: { name: { display, numeric } } */
    return data;
  }

  function buildDisplay(numeric, unit) {
    return '₹ ' + numeric + (unit ? ' ' + unit : ' per piece');
  }

  /* Must match fbKey() in admin.html — item names can contain characters
     ( . # $ [ ] / ) that Firebase forbids as object keys, so admin.html
     escapes them when saving. No-op for names without special chars. */
  function fbKey(name) {
    return String(name).replace(/[.#$\[\]\/]/g, function (c) {
      return '~' + c.charCodeAt(0).toString(16);
    });
  }

  /* Patch .price spans and item names in menu and homepage cards */
  function applyToDom(data) {
    var prices = getPrices(data);
    var units  = (data && data.units && typeof data.units === 'object') ? data.units : {};
    var names  = (data && data.names && typeof data.names === 'object') ? data.names : {};
    if (!Object.keys(prices).length && !Object.keys(names).length) return;

    function patch(els) {
      els.forEach(function (el) {
        var nameEl = el.querySelector('h3');
        if (!nameEl) return;
        /* The item's ORIGINAL name is its stable Firebase key. Cache it on
           first patch so re-running this (cached pass, then fresh-fetch
           pass) keeps deriving the same key even after we've renamed the
           on-screen text below — otherwise the second pass would compute
           the key from the already-renamed text and lose the override. */
        var origName = el.dataset.origName || nameEl.textContent.trim();
        el.dataset.origName = origName;
        var key = fbKey(origName);

        var newName = names[key];
        if (newName && nameEl.textContent.trim() !== newName) nameEl.textContent = newName;

        var ov = prices[key];
        if (!ov || ov.numeric === undefined) return;
        var priceEl = el.querySelector('.price');
        if (!priceEl) return;
        /* Rebuild display from numeric + units so "per piece" appears correctly */
        var unit = units.hasOwnProperty(key) ? units[key] : null;
        priceEl.textContent = unit !== null
          ? buildDisplay(ov.numeric, unit)
          : (ov.display || ('₹ ' + ov.numeric));
      });
    }
    patch(document.querySelectorAll('#menuDataSource .menu-card'));
    patch(document.querySelectorAll('.sweet-card'));
  }

  /* Create/remove menu-card elements for items added or deleted via the
     admin panel's "Add Item" modal (data.custom). Without this, new items
     saved in admin.html never appear on the live site because applyToDom()
     only patches EXISTING cards, never creates new ones. Cards are tagged
     with data-custom-id so repeated calls (cached pass + fresh-fetch pass)
     stay idempotent, and stale ones (deleted in admin) get removed. */
  function renderCustomItems(data) {
    var dataSource = document.getElementById('menuDataSource');
    if (!dataSource) return;
    var customItems = (data && Array.isArray(data.custom)) ? data.custom : [];
    var validIds = {};

    customItems.forEach(function (ci) {
      if (!ci || !ci.name || !ci.cat || !ci.id) return;
      var id = String(ci.id);
      validIds[id] = true;
      if (dataSource.querySelector('.menu-card[data-custom-id="' + id + '"]')) return;

      var card = document.createElement('div');
      card.className = 'menu-card';
      card.dataset.category = ci.cat;
      card.dataset.customId = id;

      var body = document.createElement('div');
      body.className = 'menu-card-body';
      var h3 = document.createElement('h3');
      h3.textContent = ci.name; /* baseline identity name — applyToDom() overlays any rename/price edit */
      var p = document.createElement('p');
      p.textContent = ci.desc || '';
      var price = document.createElement('span');
      price.className = 'price';
      price.textContent = buildDisplay(ci.numeric, ci.unit);

      body.appendChild(h3); body.appendChild(p); body.appendChild(price);
      card.appendChild(body);
      dataSource.appendChild(card);
    });

    /* Remove custom cards whose id no longer exists in data.custom (deleted in admin) */
    dataSource.querySelectorAll('.menu-card[data-custom-id]').forEach(function (card) {
      if (!validIds[card.dataset.customId]) card.remove();
    });

    refreshCategoryCounts();
  }

  /* Keep the "N items" badges on menu.html's category landing tiles in sync
     after custom items are injected/removed above. */
  function refreshCategoryCounts() {
    var counts = {};
    document.querySelectorAll('#menuDataSource .menu-card').forEach(function (card) {
      var cat = card.dataset.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    document.querySelectorAll('.menu-cat-count[data-cat]').forEach(function (el) {
      var n = counts[el.dataset.cat] || 0;
      el.textContent = n + ' item' + (n !== 1 ? 's' : '');
    });
  }

  /* Remove cards for items deleted in the admin panel. Must run before
     main.js reads #menuDataSource (menu.html rebuilds category lists from
     it on every click), otherwise deleted items keep showing up. */
  function removeDeleted(data) {
    var deleted = (data && Array.isArray(data.deleted)) ? data.deleted : [];
    if (!deleted.length) return;
    var deletedSet = {};
    deleted.forEach(function (n) { deletedSet[n] = true; });

    function remove(els) {
      els.forEach(function (el) {
        var nameEl = el.querySelector('h3');
        if (!nameEl) return;
        if (deletedSet[nameEl.textContent.trim()]) el.remove();
      });
    }
    remove(document.querySelectorAll('#menuDataSource .menu-card'));
    remove(document.querySelectorAll('.sweet-card'));
  }

  /* Re-wire homepage "Add" buttons after async Firebase update.
     main.js captures price in a closure at run-time, so if Firebase
     data arrives later we recreate the buttons with the fresh price. */
  function repatchHomepageButtons(data) {
    var prices = getPrices(data);
    var units  = (data && data.units && typeof data.units === 'object') ? data.units : {};
    document.querySelectorAll('.sweet-card').forEach(function (card) {
      var nameEl = card.querySelector('h3');
      if (!nameEl) return;
      /* applyToDom() already ran and may have renamed this card's h3 text —
         use the cached original name (its stable Firebase key), not the
         possibly-already-renamed current text. */
      var origName = card.dataset.origName || nameEl.textContent.trim();
      var key = fbKey(origName);
      var ov  = prices[key];
      if (!ov || !window._aroraCartAdd) return;

      var priceEl = card.querySelector('.price');
      if (priceEl) {
        var unit = units.hasOwnProperty(key) ? units[key] : null;
        priceEl.textContent = unit !== null
          ? buildDisplay(ov.numeric, unit)
          : (ov.display || ('₹ ' + ov.numeric));
      }

      var currentName = nameEl.textContent.trim(); /* reflects any rename */
      var oldBtn = card.querySelector('.menu-add-btn');
      if (!oldBtn) return;
      var newBtn = document.createElement('button');
      newBtn.className   = 'menu-add-btn';
      newBtn.textContent = '+ Add';
      (function (n, p) {
        newBtn.addEventListener('click', function () { window._aroraCartAdd(n, p, newBtn); });
      }(currentName, ov.numeric));
      oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    });
  }

  /* ── Step 1: apply cached prices immediately (zero delay) ── */
  var cached = {};
  try {
    var raw = localStorage.getItem(DATA_KEY) || localStorage.getItem(OLD_KEY);
    if (raw) cached = JSON.parse(raw);
  } catch (e) {}
  removeDeleted(cached);
  renderCustomItems(cached);
  applyToDom(cached);

  /* ── Step 2: fetch fresh prices from Firebase ── */
  if (!config.dbUrl) return;

  var authSuffix = config.secret ? '?auth=' + encodeURIComponent(config.secret) : '';
  fetch(config.dbUrl.replace(/\/$/, '') + '/prices.json' + authSuffix)
    .then(function (r) { return r.json(); })
    .then(function (fresh) {
      if (!fresh || typeof fresh !== 'object') {
        /* Nothing saved yet — clear stale caches */
        localStorage.removeItem(DATA_KEY);
        localStorage.removeItem(OLD_KEY);
        return;
      }

      /* Cache under new key so next page load is instant */
      localStorage.setItem(DATA_KEY, JSON.stringify(fresh));
      localStorage.removeItem(OLD_KEY); /* clean up old key */

      /* Patch hidden menuDataSource (menu page reads from here on category click) */
      removeDeleted(fresh);
      renderCustomItems(fresh);
      applyToDom(fresh);

      /* Re-patch homepage buttons with fresh data (main.js has already run by now) */
      repatchHomepageButtons(fresh);
    })
    .catch(function () {
      /* Network error — cached prices already applied, site works offline */
    });
}());
