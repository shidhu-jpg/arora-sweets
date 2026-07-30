# Admin Authentication Setup Guide

This guide explains how to set up secure admin authentication for the Arora Sweets website.

## What Changed

The following security improvements have been made:

1. **Removed exposed Firebase database secret** from `js/firebase-config.js`
2. **Removed hardcoded admin passwords** from `dashboard.html` and `admin.html`
3. **Added Firebase Authentication** with email/password for admin login
4. **Created `.gitignore`** to prevent sensitive files from being committed
5. **Created `js/admin-auth.js`** for secure admin authentication

## Setup Instructions

### Step 1: Enable Firebase Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Select your project: `arorasweets-35a7b`
3. Go to **Build → Authentication** in the left sidebar
4. Click **Get started**
5. Go to the **Sign-in method** tab
6. Click **Email/Password** from the list of providers
7. Enable **Email/Password** and click **Save**

### Step 2: Create Admin User

1. Go to **Authentication → Users** in the Firebase Console
2. Click **Add user**
3. Enter your admin email (e.g., `admin@arorasweets.com`)
4. Enter a strong password (e.g., `YourSecurePassword123!`)
5. Click **Add user**

**Important:** Remember this email and password. You will use it to log in to the admin dashboard.

### Step 3: Configure Admin Email (Optional)

If you want to restrict admin access to a specific email address:

1. Open `js/admin-auth.js`
2. Find the line: `var ADMIN_EMAIL = 'admin@arorasweets.com';`
3. Replace it with your admin email: `var ADMIN_EMAIL = 'your-email@example.com';`

**Note:** This is a client-side check. For production, use Firebase custom claims (see Step 5).

### Step 4: Update Database Rules (Recommended)

For better security, update your Firebase Realtime Database rules:

1. Go to **Build → Realtime Database → Rules** in the Firebase Console
2. Replace the rules with:

```json
{
  "rules": {
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "offers": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "prices": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "customers": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

3. Click **Publish**

**Note:** These rules require authentication for all database access. The admin user created in Step 2 will have access.

### Step 5: Advanced - Use Firebase Custom Claims (Production)

For production environments, use Firebase custom claims to mark admin users:

1. Set up a Firebase Cloud Function or backend server
2. Use the Firebase Admin SDK to set custom claims:

```javascript
// Example using Firebase Admin SDK
const admin = require('firebase-admin');

async function setAdminClaim(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
}
```

3. Update `js/admin-auth.js` to check for the `admin` claim instead of email matching

### Step 6: Test the Setup

1. Open `dashboard.html` in your browser
2. You should see the login form with email and password fields
3. Enter your admin email and password
4. Click **Sign In**
5. You should now have access to the dashboard

### Step 7: Rotate Old Credentials (Important!)

Since the old Firebase database secret was exposed:

1. Go to **Project Settings → Service Accounts → Database Secrets** in the Firebase Console
2. **Delete the old secret** that was exposed
3. Generate a new secret (if needed for other services)
4. Update any other services that used the old secret

## Files Modified

- `.gitignore` - Created to prevent committing sensitive files
- `js/firebase-config.js` - Removed database secret
- `js/admin-auth.js` - New file for admin authentication
- `dashboard.html` - Updated to use Firebase Auth
- `admin.html` - Updated to use Firebase Auth

## Security Notes

1. **Never commit secrets to Git** - Always use `.gitignore` for sensitive files
2. **Use Firebase Auth** instead of hardcoded passwords
3. **Enable Firebase Security Rules** to protect your database
4. **Rotate exposed credentials immediately** - The old database secret should be considered compromised
5. **Use custom claims** for role-based access in production

## Troubleshooting

### "Authentication not configured" error
- Make sure you've included `js/firebase-config.js` and `js/admin-auth.js` in your HTML
- Check that Firebase Auth is enabled in the Firebase Console

### "Login failed" error
- Verify the admin user was created in Firebase Authentication
- Check that Email/Password sign-in is enabled
- Ensure you're using the correct email and password

### Database access denied
- Update Firebase Database rules to allow authenticated access
- Make sure the user is logged in before accessing the database

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify Firebase configuration in `js/firebase-config.js`
3. Ensure all Firebase services are enabled in the Firebase Console