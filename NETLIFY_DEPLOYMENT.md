# Netlify Deployment Guide

## Handling Secrets Scanning

Netlify's smart detection system scans for potential secrets in your repository code and build output. This is a security feature that helps prevent accidental exposure of sensitive information.

### Firebase Configuration

This project uses Firebase for authentication and database services. The Firebase configuration includes API keys that are meant to be included in client-side code. These keys are not sensitive secrets as they are restricted by Firebase security rules, but Netlify's smart detection might flag them as potential secrets.

### Solution Implemented

1. **Environment Variables**: We've set up the Firebase configuration to use environment variables with the `VITE_` prefix, which makes them available to the client-side code during the build process.

2. **Netlify Configuration**: We've updated the `netlify.toml` file to disable Netlify's smart detection for secrets scanning:

   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     SECRETS_SCAN_SMART_DETECTION_ENABLED = "false"
   ```

3. **Secrets Scanning Configuration**: We've disabled Netlify's smart detection for secrets scanning to prevent false positives with Firebase API keys, which are designed to be public.

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

If you encounter issues with secrets scanning during deployment:

1. Check the build logs to identify which values are being flagged as secrets.
2. We've disabled smart detection entirely by setting `SECRETS_SCAN_SMART_DETECTION_ENABLED` to `false` in the netlify.toml file.
3. If you prefer a more targeted approach, you can re-enable smart detection and use `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES` to specify only certain values to ignore, separated by commas.

### References

- [Netlify Secrets Controller Documentation](https://docs.netlify.com/security/secret-scanning/)
- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)