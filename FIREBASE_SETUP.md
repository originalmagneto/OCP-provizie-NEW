# Firebase Integration Guide for Commission Tracker

## Overview

This guide will help you set up Firebase for your Commission Tracker application. The application now uses Firebase for:

- **Authentication**: User login and registration
- **Firestore Database**: Storing invoices, clients, and commission settlements
- **Firebase Storage**: (Optional) For future document uploads

## Setup Steps

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "commission-tracker")
4. Follow the setup wizard (you can disable Google Analytics if you don't need it)

### 2. Register Your Web App

1. In your Firebase project console, click the web icon (</>) to add a web app
2. Register your app with a nickname (e.g., "commission-tracker-web")
3. Copy the Firebase configuration object

### 3. Configure Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your Firebase configuration values to the `.env` file:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 4. Enable Authentication

1. In the Firebase console, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" authentication

### 5. Set Up Firestore Database

1. In the Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Start in production mode or test mode (you can adjust security rules later)
4. Choose a database location close to your users

### 6. Set Up Firestore Security Rules

In the Firebase console, go to "Firestore Database" > "Rules" and set up basic security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read and write invoices
    match /invoices/{invoiceId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read and write clients
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read and write settlements
    match /settlements/{settlementId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**IMPORTANT**: After entering these rules, click the "Publish" button to deploy them. If you don't publish the rules, they won't take effect and you'll encounter permission errors.


## Data Migration

If you have existing data in localStorage, it will be automatically migrated to Firebase when you:

1. Register a new account
2. Add new invoices, clients, or settlements

Note that data from localStorage won't be automatically imported to Firebase. You'll need to re-enter any existing data.

## Deployment

When deploying to Netlify, make sure to add your Firebase environment variables in the Netlify dashboard:

1. Go to your site settings in Netlify
2. Navigate to "Build & deploy" > "Environment variables"
3. Add all the Firebase environment variables from your `.env` file

### Authorize Netlify Domain for OAuth

**IMPORTANT**: You must authorize your Netlify domain for Firebase Authentication:

1. Go to the Firebase console > Authentication > Settings
2. Scroll down to the "Authorized domains" section
3. Click "Add domain"
4. Add your Netlify domain (e.g., `ocp-provizie-new.netlify.app`)
5. Click "Add"

Without this step, sign-in with popup/redirect methods will not work on your deployed site.

## Troubleshooting

### Common Issues

- **Authentication Issues**: Make sure Email/Password authentication is enabled in Firebase
- **Database Access Issues**: Check your Firestore security rules
- **Environment Variables**: Ensure all Firebase config variables are correctly set in your `.env` file

### Permission Denied Errors

If you see errors like `FirebaseError: [code=permission-denied]: Missing or insufficient permissions`:

1. **Check Security Rules**: Ensure your Firestore security rules are correctly set up as shown above
2. **Publish Rules**: Make sure you've clicked the "Publish" button after entering your rules
3. **Authentication**: Verify that users are properly authenticated before accessing Firestore
4. **User Permissions**: Ensure the authenticated user has the correct permissions according to your rules

### OAuth Domain Authorization

If you see warnings about the current domain not being authorized for OAuth operations:

1. Add your domain (e.g., `ocp-provizie-new.netlify.app`) to the authorized domains list in Firebase
2. Go to Firebase console > Authentication > Settings > Authorized domains
3. This is required for sign-in methods like `signInWithPopup` and `signInWithRedirect`

## Next Steps

- Consider adding more authentication methods (Google, GitHub, etc.)
- Implement more advanced security rules based on user roles
- Set up Firebase Storage for document uploads (invoices, receipts, etc.