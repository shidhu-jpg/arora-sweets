/* Price overrides — patches .price spans from Firebase (with localStorage cache)
   Runs before main.js so the menu JS picks up updated prices. */
(function () {
  var DATA_KEY = 'aroraAdminData';
  var OLD_KEY  = 'aroraPriceOverrides'; /* backward-compat with pre-admin-rewrite cache */
  var config   = (typeof ARORA_FB_CONFIG !== 'undefined') ? ARORA_FB_CONFIG : {};

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

  /* Patch all .price spans in menu and homepage cards */
  function applyToDom(data) {
    var prices = getPrices(data);
    var units  = (data && data.units && typeof data.units === 'object') ? data.units : {};
    if (!Object.keys(prices).length) return;

    function patch(els) {
      els.forEach(function (el) {
        var nameEl = el.querySelector('h3');
        if (!nameEl) return;
        var name = nameEl.textContent.trim();
        var ov   = prices[name];
        if (!ov || ov.numeric === undefined) return;
        var priceEl = el.querySelector('.price');
        if (!priceEl) return;
        /* Rebuild display from numeric + units so "per piece" appears correctly */
        var unit = units.hasOwnProperty(name) ? units[name] : null;
        priceEl.textContent = unit !== null
          ? buildDisplay(ov.numeric, unit)
          : (ov.display || ('₹ ' + ov.numeric));
      });
    }
    patch(document.querySelectorAll('#menuDataSource .menu-card'));
    patch(document.querySelectorAll('.sweet-card'));
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
      var name = nameEl.textContent.trim();
      var ov   = prices[name];
      if (!ov || !window._aroraCartAdd) return;

      var priceEl = card.querySelector('.price');
      if (priceEl) {
        var unit = units.hasOwnProperty(name) ? units[name] : null;
        priceEl.textContent = unit !== null
          ? buildDisplay(ov.numeric, unit)
          : (ov.display || ('₹ ' + ov.numeric));
      }

      var oldBtn = card.querySelector('.menu-add-btn');
      if (!oldBtn) return;
      var newBtn = document.createElement('button');
      newBtn.className   = 'menu-add-btn';
      newBtn.textContent = '+ Add';
      (function (n, p) {
        newBtn.addEventListener('click', function () { window._aroraCartAdd(n, p, newBtn); });
      }(name, ov.numeric));
      oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    });
  }

  /* ── Step 1: apply cached prices immediately (zero delay) ── */
  var cached = {};
  try {
    var raw = localStorage.getItem(DATA_KEY) || localStorage.getItem(OLD_KEY);
    if (raw) cached = JSON.parse(raw);
  } catch (e) {}
  applyToDom(cached);

  /* ── Step 2: fetch fresh prices from Firebase ── */
  if (!config.dbUrl) return;

  fetch(config.databaseURL.replace(/\/$/, '') + '/prices.json')
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
      applyToDom(fresh);

      /* Re-patch homepage buttons with fresh data (main.js has already run by now) */
      repatchHomepageButtons(fresh);
    })
    .catch(function () {
      /* Network error — cached prices already applied, site works offline */
    });
}());
