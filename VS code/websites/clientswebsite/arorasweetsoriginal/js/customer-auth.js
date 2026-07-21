/* ===========================
   ARORA SWEETS — CUSTOMER AUTH
   Google Sign-In + customer profile storage
   (No phone OTP — Firebase Phone Auth requires
   a Blaze billing plan, which this project does
   not use. Phone number stays a plain typed field.)
   =========================== */

(function () {
  var configured = typeof firebase !== 'undefined' &&
    typeof ARORA_FB_CONFIG !== 'undefined' &&
    ARORA_FB_CONFIG.apiKey && ARORA_FB_CONFIG.apiKey !== 'YOUR_API_KEY';

  if (!configured) {
    console.warn('Arora Sweets: customer sign-in is not configured yet — fill in ARORA_FB_CONFIG in js/firebase-config.js');
    return;
  }

  if (!firebase.apps.length) firebase.initializeApp(ARORA_FB_CONFIG);
  var auth = firebase.auth();

  var dbUrl  = (typeof ARORA_FB !== 'undefined' && ARORA_FB.dbUrl) || '';

  function dbFetch(path, opts) {
    return fetch(dbUrl + path + '.json', opts);
  }

  function saveCustomerProfile(user) {
    dbFetch('customers/' + user.uid, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastLogin: Date.now()
      })
    }).catch(function (e) { console.warn('Failed to save customer profile:', e); });
  }

  function getCustomerProfile(uid) {
    return dbFetch('customers/' + uid).then(function (r) { return r.json(); });
  }

  function signInWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider).catch(function (err) {
      console.error('Google sign-in failed:', err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        alert('Sign-in failed. Please try again.');
      }
    });
  }

  function signOutUser() {
    return auth.signOut();
  }

  /* ── Nav UI injection ── */
  function buildNavAuthUI() {
    var nav = document.getElementById('navbar');
    if (!nav || document.getElementById('navAuthWrap')) return;

    var wrap = document.createElement('div');
    wrap.className = 'nav-auth';
    wrap.id = 'navAuthWrap';
    wrap.innerHTML =
      '<button class="nav-auth-btn" id="navAuthBtn" aria-label="Account">' +
        '<span class="nav-auth-avatar" id="navAuthAvatar">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">' +
            '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' +
          '</svg>' +
        '</span>' +
        '<span id="navAuthLabel">Sign In</span>' +
      '</button>' +
      '<div class="nav-auth-menu" id="navAuthMenu">' +
        '<a href="account.html" class="nav-auth-menu-item">My Account</a>' +
        '<button type="button" class="nav-auth-menu-item" id="navSignOutBtn">Sign Out</button>' +
      '</div>';
    nav.appendChild(wrap);

    document.getElementById('navAuthBtn').addEventListener('click', function () {
      if (auth.currentUser) {
        wrap.classList.toggle('open');
      } else {
        signInWithGoogle();
      }
    });
    document.getElementById('navSignOutBtn').addEventListener('click', function () {
      wrap.classList.remove('open');
      signOutUser();
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove('open');
    });
  }

  function updateNavAuthUI(user) {
    var label  = document.getElementById('navAuthLabel');
    var avatar = document.getElementById('navAuthAvatar');
    var wrap   = document.getElementById('navAuthWrap');
    if (!label || !wrap) return;

    if (user) {
      label.textContent = (user.displayName || 'Account').split(' ')[0];
      wrap.classList.add('signed-in');
      if (user.photoURL) {
        avatar.innerHTML = '<img src="' + user.photoURL + '" alt="" referrerpolicy="no-referrer" />';
      }
    } else {
      label.textContent = 'Sign In';
      wrap.classList.remove('signed-in', 'open');
      avatar.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">' +
          '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' +
        '</svg>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNavAuthUI);
  } else {
    buildNavAuthUI();
  }

  auth.onAuthStateChanged(function (user) {
    updateNavAuthUI(user);
    if (user) saveCustomerProfile(user);
    document.dispatchEvent(new CustomEvent('arora-auth-changed', { detail: { user: user } }));
  });

  window._aroraAuth = {
    signInWithGoogle: signInWithGoogle,
    signOut: signOutUser,
    getCustomerProfile: getCustomerProfile,
    dbFetch: dbFetch,
    get currentUser() { return auth.currentUser; }
  };
}());
