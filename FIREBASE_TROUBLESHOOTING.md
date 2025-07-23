# Firebase Troubleshooting Guide

## Issue 1: Firestore CORS Error

**Error Message:**
```
Fetch API cannot load https://firestore.googleapis.com/... due to access control checks
```

**Cause:** This error typically occurs when:
1. Firebase configuration is using demo/placeholder values
2. Firestore security rules are too restrictive
3. Network connectivity issues

**Solution:**

### Step 1: Verify Firebase Configuration
1. Check your `.env` file has real Firebase project values (not demo values)
2. Ensure your Firebase project exists and is active
3. Verify all environment variables are correctly set:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### Step 2: Check Firestore Security Rules
Ensure your Firestore rules allow authenticated users to read/write:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Restart Development Server
After making changes to `.env`:
```bash
npm run dev
```

## Issue 2: Logo Upload Not Working in Settings

**Problem:** Clicking "Upload New Logo" in Settings doesn't save the logo.

**Solution:** ✅ **FIXED**
- Updated SettingsModal to properly upload logos to Firebase Storage
- Added loading states and error handling
- Logo files are now saved to Firebase and URLs are stored in settings

**How to use:**
1. Go to Settings → Appearance tab
2. Click "Upload New Logo"
3. Select an image file (PNG, JPG, SVG recommended)
4. You'll see a preview and "Selected: filename.ext" message
5. Click "Save Changes" to upload to Firebase Storage

## Additional Tips

### Clear Browser Cache
If you're still seeing issues:
1. Open Developer Tools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"

### Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Check Authentication, Firestore, and Storage tabs for any issues

### Network Issues
If you're behind a corporate firewall:
- Ensure Firebase domains are whitelisted
- Try using a different network connection

## Getting Help

If issues persist:
1. Check the browser console for detailed error messages
2. Verify your Firebase project billing status
3. Ensure your Firebase project has the necessary services enabled:
   - Authentication
   - Firestore Database
   - Storage