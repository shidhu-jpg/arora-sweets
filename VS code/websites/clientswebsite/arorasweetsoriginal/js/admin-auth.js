/* ===========================
   ARORA SWEETS — ADMIN AUTH
   Secure admin authentication using Firebase Auth
   =========================== */

(function () {
  'use strict';

  var configured = typeof firebase !== 'undefined' &&
    typeof ARORA_FB_CONFIG !== 'undefined' &&
    ARORA_FB_CONFIG.apiKey &&
    ARORA_FB_CONFIG.apiKey !== 'YOUR_API_KEY';

  if (!configured) {
    console.warn('Arora Sweets: admin auth is not configured yet — fill in ARORA_FB_CONFIG in js/firebase-config.js');
    return;
  }

  if (!firebase.apps.length) firebase.initializeApp(ARORA_FB_CONFIG);
  var auth = firebase.auth();

  /* ── Admin credentials stored in Firebase Realtime Database ──
     Structure: /adminUsers/{email}: { passwordHash, role, createdAt }
     For production, use Firebase Admin SDK on a backend server.
     This is a simplified version for demonstration. ── */

  var ADMIN_EMAIL = 'admin@arorasweets.com'; // Change this to your admin email

  /* Simple hash function (for demo purposes only) */
  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /* ── Admin login ── */
  function adminLogin(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
      .then(function (cred) {
        // Check if user has admin role
        return cred.user.getIdTokenResult()
          .then(function (idTokenResult) {
            if (idTokenResult.claims.admin === true) {
              return { success: true, user: cred.user };
            } else {
              auth.signOut();
              return { success: false, error: 'Not authorized as admin' };
            }
          });
      })
      .catch(function (err) {
        return { success: false, error: err.message };
      });
  }

  /* ── Check if current user is admin ── */
  function isAdmin() {
    return auth.currentUser ? auth.currentUser.email === ADMIN_EMAIL : false;
  }

  /* ── Logout ── */
  function adminLogout() {
    return auth.signOut();
  }

  /* ── Expose API ── */
  window._aroraAdminAuth = {
    login: adminLogin,
    logout: adminLogout,
    isAdmin: isAdmin,
    ADMIN_EMAIL: ADMIN_EMAIL
  };

})();