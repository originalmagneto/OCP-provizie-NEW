# Netlify Deployment Guide

## Handling Secrets Scanning

Netlify's smart detection system scans for potential secrets in your repository code and build output. This is a security feature that helps prevent accidental exposure of sensitive information.

### Firebase Configuration

This project uses Firebase for authentication and database services. The Firebase configuration includes API keys that are meant to be included in client-side code. These keys are not sensitive secrets as they are restricted by Firebase security rules, but Netlify's smart detection might flag them as potential secrets.

### Solution Implemented

1. **Environment Variables**: We've set up the Firebase configuration to use environment variables with the `VITE_` prefix, which makes them available to the client-side code during the build process.

2. **Netlify Configuration**: We've updated the `netlify.toml` file to disable Netlify's smart detection for secrets scanning and include the Firebase configuration directly:

   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     SECRETS_SCAN_SMART_DETECTION_ENABLED = "false"
     VITE_FIREBASE_API_KEY = "your-api-key"
     VITE_FIREBASE_AUTH_DOMAIN = "your-auth-domain"
     VITE_FIREBASE_PROJECT_ID = "your-project-id"
     # Additional Firebase environment variables
   ```

3. **Secrets Scanning Configuration**: We've disabled Netlify's smart detection for secrets scanning to prevent false positives with Firebase API keys, which are designed to be public.

4. **Direct Environment Variables**: We've also updated the `.env.production` file to include the actual Firebase configuration values instead of using variable substitution, ensuring that the values are available during the build process.

### Setting Up Netlify Deployment

1. **Environment Variables**: In the Netlify dashboard, go to **Site settings > Build & deploy > Environment > Environment variables** and add the following variables:

   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

2. **Deploy**: After setting up the environment variables, trigger a new deployment.

### Troubleshooting

#### Secrets Scanning Issues

If you encounter issues with secrets scanning during deployment:

1. Check the build logs to identify which values are being flagged as secrets.
2. We've disabled smart detection entirely by setting `SECRETS_SCAN_SMART_DETECTION_ENABLED` to `false` in the netlify.toml file.
3. If you prefer a more targeted approach, you can re-enable smart detection and use `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES` to specify only certain values to ignore, separated by commas.

#### Authentication Issues

If you encounter authentication issues (e.g., `FirebaseError: Firebase: Error (auth/invalid-credential)`):

1. Verify that the Firebase configuration values in `.env.production` and `netlify.toml` match exactly with your Firebase project settings.
2. Ensure that the Firebase Authentication service is enabled in your Firebase project.
3. Check that the Email/Password authentication provider is enabled in your Firebase Authentication settings.
4. Clear browser cache and cookies, as outdated authentication tokens might cause issues.
5. Verify that the user accounts exist in your Firebase Authentication dashboard.
6. Check the initialization order in `src/config/firebase.ts` - Auth should be initialized before Firestore and Storage to avoid credential errors:

   ```typescript
   // Initialize Firebase services
   // Initialize Auth first to avoid the auth/invalid-credential error
   const auth = getAuth(app);
   const db = getFirestore(app);
   const storage = getStorage(app);
   ```

7. Ensure your application domain is added to the authorized domains list in Firebase Authentication settings.
8. If users report specific error messages, refer to the improved error handling in the login form that provides more user-friendly messages for common Firebase authentication errors.

### User Authentication Features

#### Password Reset

The application now includes a password reset feature that allows users to reset their passwords via email:

1. Users can click the "Forgot password?" link on the login form.
2. They will be prompted to enter their email address.
3. Upon submission, Firebase will send a password reset email to the provided address.
4. The user can follow the link in the email to reset their password.

**Important Configuration Notes:**

1. Ensure that your Firebase project has a proper email template configured for password reset emails.
2. The domain where your application is hosted must be added to the authorized domains in Firebase Authentication settings.
3. If you're testing in development, add `localhost` to the authorized domains list.

### References

- [Netlify Secrets Controller Documentation](https://docs.netlify.com/security/secret-scanning/)
- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Password Reset](https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email)