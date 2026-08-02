/* ─────────────────────────────────────────────────
   ARORA SWEETS — OWNER AUTH
   Real Firebase Authentication (Email/Password) via the REST
   API, used by admin.html and dashboard.html. Replaces the old
   hardcoded client-side password + a Realtime Database "secret"
   shipped to every visitor's browser (which bypassed all
   security rules for anyone who read it from the page source).

   The Web API Key below is safe to be public — Google's own
   guidance is that it only identifies the Firebase project, it
   does not grant access on its own. Real access control lives in
   the Realtime Database Rules (Firebase Console → Realtime
   Database → Rules), which only allow writes from a signed-in
   user whose token matches the owner's account email.
   ───────────────────────────────────────────────── */
var OwnerAuth = (function () {
  var STORAGE_KEY = 'aroraOwnerAuth'; /* { idToken, refreshToken, expiresAt, email } */
  var cfg = (typeof ARORA_FB !== 'undefined') ? ARORA_FB : {};

  function readSession() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function writeSession(s) { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
  function clearSession()  { sessionStorage.removeItem(STORAGE_KEY); }

  function isLoggedIn() { return !!readSession(); }
  function currentEmail() { var s = readSession(); return s ? s.email : null; }

  async function login(email, password) {
    if (!cfg.apiKey) throw new Error('Firebase apiKey not configured in js/firebase-config.js');
    var res = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + encodeURIComponent(cfg.apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password, returnSecureToken: true })
      }
    );
    var data = await res.json();
    if (!res.ok) {
      var code = (data && data.error && data.error.message) || 'LOGIN_FAILED';
      var known = ['INVALID_LOGIN_CREDENTIALS', 'EMAIL_NOT_FOUND', 'INVALID_PASSWORD', 'INVALID_EMAIL'];
      throw new Error(known.indexOf(code) !== -1 ? 'Incorrect email or password.' : code);
    }
    writeSession({
      idToken:      data.idToken,
      refreshToken: data.refreshToken,
      expiresAt:    Date.now() + (parseInt(data.expiresIn, 10) || 3600) * 1000,
      email:        data.email
    });
    return true;
  }

  function logout() { clearSession(); }

  async function refresh(session) {
    var res = await fetch(
      'https://securetoken.googleapis.com/v1/token?key=' + encodeURIComponent(cfg.apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(session.refreshToken)
      }
    );
    var data = await res.json();
    if (!res.ok) { clearSession(); throw new Error('Session expired — please log in again.'); }
    var updated = {
      idToken:      data.id_token,
      refreshToken: data.refresh_token,
      expiresAt:    Date.now() + (parseInt(data.expires_in, 10) || 3600) * 1000,
      email:        session.email
    };
    writeSession(updated);
    return updated;
  }

  /* Returns a valid ID token for use as ?auth=<token> on Realtime Database
     REST calls, refreshing it first if it's expired or about to expire. */
  async function getIdToken() {
    var session = readSession();
    if (!session) throw new Error('Not logged in.');
    if (Date.now() > session.expiresAt - 60000) session = await refresh(session);
    return session.idToken;
  }

  return {
    isLoggedIn:    isLoggedIn,
    currentEmail:  currentEmail,
    login:         login,
    logout:        logout,
    getIdToken:    getIdToken
  };
})();
