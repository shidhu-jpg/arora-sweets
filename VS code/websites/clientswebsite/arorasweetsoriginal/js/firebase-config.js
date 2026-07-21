/* ─────────────────────────────────────────────────
   ARORA SWEETS — FIREBASE CONFIG
   ───────────────────────────────────────────────── */

/* Firebase Web App Config — needed for customer
   sign-in (Google login) and database access.
   Get this from: Firebase Console → Project Settings → General
   → "Your apps" → Web app → SDK setup and config
   Also enable the "Google" provider under
   Build → Authentication → Sign-in method, and add
   your live domain under Authentication → Settings
   → Authorized domains.
   ───────────────────────────────────────────────── */
var ARORA_FB_CONFIG = {
  apiKey: 'AIzaSyDEZeOJfNjIfH-ZtX4S7zdarfJOLpumsW0',
  authDomain: 'arorasweets-35a7b.firebaseapp.com',
  databaseURL: 'https://arorasweets-35a7b-default-rtdb.firebaseio.com/',
  projectId: 'arorasweets-35a7b',
  storageBucket: 'arorasweets-35a7b.appspot.com',
  messagingSenderId: '464083059675',
  appId: '1:464083059675:web:4a27c1ecdcf024ed841dfe'
};

/* ─────────────────────────────────────────────────
   IMPORTANT: The database secret has been removed for security.
   Admin operations now use Firebase Authentication with
   custom claims. See admin-setup.js for implementation.
   ───────────────────────────────────────────────── */