/* Price overrides — patches .price spans from Firebase (with localStorage cache)
   Runs before main.js so the menu JS picks up updated prices. */
(function () {
  var CACHE_KEY = 'aroraPriceOverrides';
  var config    = (typeof ARORA_FB !== 'undefined') ? ARORA_FB : {};

  function parseNum(str) {
    var m = (str || '').match(/[\d,]+/);
    return m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
  }

  /* Patch .price spans in both the hidden menu source and homepage cards */
  function applyToDom(overrides) {
    if (!overrides || !Object.keys(overrides).length) return;
    function patch(els) {
      els.forEach(function (el) {
        var nameEl = el.querySelector('h3');
        if (!nameEl) return;
        var ov = overrides[nameEl.textContent.trim()];
        if (ov) {
          var priceEl = el.querySelector('.price');
          if (priceEl) priceEl.textContent = ov.display;
        }
      });
    }
    patch(document.querySelectorAll('#menuDataSource .menu-card'));
    patch(document.querySelectorAll('.sweet-card'));
  }

  /* Re-wire homepage "Add" buttons after async Firebase update.
     main.js captures price in a closure at run-time, so if Firebase
     data arrives later we recreate the buttons with the fresh price. */
  function repatchHomepageButtons(overrides) {
    document.querySelectorAll('.sweet-card').forEach(function (card) {
      var nameEl = card.querySelector('h3');
      if (!nameEl) return;
      var name = nameEl.textContent.trim();
      var ov   = overrides[name];
      if (!ov || !window._aroraCartAdd) return;

      var priceEl = card.querySelector('.price');
      if (priceEl) priceEl.textContent = ov.display;

      var oldBtn = card.querySelector('.menu-add-btn');
      if (!oldBtn) return;
      var newBtn = document.createElement('button');
      newBtn.className   = 'menu-add-btn';
      newBtn.textContent = '+ Add';
      (function (n, p) {
        newBtn.addEventListener('click', function () {
          window._aroraCartAdd(n, p, newBtn);
        });
      }(name, ov.numeric));
      oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    });
  }

  /* ── Step 1: apply cached prices immediately (zero delay) ── */
  var cached = {};
  try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch (e) {}
  applyToDom(cached);

  /* ── Step 2: fetch fresh prices from Firebase ── */
  if (!config.dbUrl) return; // Firebase not configured yet

  fetch(config.dbUrl.replace(/\/$/, '') + '/prices.json')
    .then(function (r) { return r.json(); })
    .then(function (fresh) {
      if (!fresh || typeof fresh !== 'object') {
        /* No prices saved in Firebase yet — clear stale cache */
        localStorage.removeItem(CACHE_KEY);
        return;
      }
      /* Update local cache so next page load is instant */
      localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));

      /* Patch hidden menuDataSource (menu page reads from here on category click) */
      document.querySelectorAll('#menuDataSource .menu-card').forEach(function (card) {
        var nameEl   = card.querySelector('h3');
        var priceEl  = card.querySelector('.price');
        if (!nameEl || !priceEl) return;
        var ov = fresh[nameEl.textContent.trim()];
        if (ov) priceEl.textContent = ov.display;
      });

      /* Re-patch homepage buttons with fresh data (main.js has already run by now) */
      repatchHomepageButtons(fresh);
    })
    .catch(function () {
      /* Network error — cached prices already applied, site works offline */
    });
}());
