# Firebase Database Functionality Tests

This directory contains comprehensive test scripts to validate Firebase database functionalities including authentication, user management, Firestore operations, and permission handling.

## Test Files Overview

### 1. `firebase-test.js` - ES6 Module Test (For React/Vite)
- **Purpose**: Client-side Firebase testing using ES6 modules
- **Usage**: Import into your React application or run with modern JavaScript environments
- **Features**: Authentication, Firestore CRUD, permission testing

### 2. `firebase-test-node.js` - Node.js Test (For Server-side)
- **Purpose**: Server-side Firebase testing using Firebase Admin SDK
- **Usage**: Run directly with Node.js
- **Features**: Admin operations, batch processing, transactions

### 3. `firebase-test.html` - Browser Test (Interactive)
- **Purpose**: Interactive browser-based testing with visual interface
- **Usage**: Open directly in a web browser
- **Features**: Real-time test results, progress tracking, configuration UI

## Prerequisites

- Node.js 16+ installed
- Firebase project with Firestore and Authentication enabled
- Firebase Admin SDK service account key (for Node.js tests)
- Web browser with developer tools (for browser tests)
- Firebase CLI installed globally: `npm install -g firebase-tools`

## Configuration Setup

1. **Copy environment configuration:**
   ```bash
   cp tests/.env.example tests/.env
   ```

2. **Update Firebase configuration:**
   - Edit `tests/.env` with your Firebase project details
   - Get your config from Firebase Console > Project Settings > General

3. **Setup Firebase Admin SDK (for Node.js tests):**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate new private key and download JSON file
   - Update `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` in `.env`

4. **Install test dependencies:**
   ```bash
   npm run test:firebase:setup
   ```

### For Node.js Tests
```bash
# Install Firebase Admin SDK
npm install firebase-admin

# Optional: Install Firebase CLI for emulator
npm install -g firebase-tools
```

### For Browser/React Tests
- Firebase project with web configuration
- Valid Firebase configuration object
- Firestore database enabled
- Authentication enabled

## Running the Tests

### Quick Start with Test Runner
The easiest way to run Firebase tests is using the provided test runner:

```bash
# Run all tests
npm run test:firebase

# Or use the test runner directly
./tests/run-tests.sh all
```

### Available Test Commands

```bash
# Setup and install dependencies
npm run test:firebase:setup

# Run Node.js tests only
npm run test:firebase:node

# Open browser tests
npm run test:firebase:browser

# Run tests with Firebase emulators
npm run test:firebase:emulator
```

### Manual Test Execution

#### Option 1: Browser Interactive Test (Recommended for beginners)
1. Open `firebase-test.html` in your web browser
2. Update the Firebase configuration fields with your project details
3. Click "🚀 Run All Tests"
4. View real-time results and summary

#### Option 2: Node.js Server Test
```bash
# Navigate to project root
cd /path/to/your/project

# Run the Node.js test
node tests/firebase-test-node.js
```

#### Option 3: Integration with React App
```javascript
// Import the test functions
import { runAllTests } from './tests/firebase-test.js';

// Run tests programmatically
runAllTests().then(results => {
  console.log('Test results:', results);
});
```

## Test Coverage

The test suites cover the following Firebase functionalities:

### Authentication Tests
- ✅ User registration (createUserWithEmailAndPassword)
- ✅ User login (signInWithEmailAndPassword)
- ✅ User logout (signOut)
- ✅ Authentication state persistence (onAuthStateChanged)

### Firestore Tests
- ✅ Document creation (setDoc)
- ✅ Document reading (getDoc)
- ✅ Document updates (updateDoc)
- ✅ Collection queries (getDocs with where clauses)
- ✅ Firm-based user filtering
- ✅ Batch operations (Node.js only)
- ✅ Transactions (Node.js only)

### Security & Permissions
- ✅ Firestore security rules validation
- ✅ Permission denied scenarios
- ✅ Cross-firm data access prevention
- ✅ User document ownership verification

### Error Handling
- ✅ Firebase configuration validation
- ✅ Network error handling
- ✅ Permission error handling
- ✅ Authentication error handling

## Firebase Configuration

Before running tests, ensure you have the correct Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id" // Optional
};
```

## Firestore Security Rules Testing

The tests validate your Firestore security rules. Ensure your `firestore.rules` file includes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow list: if request.auth != null 
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        && resource.data.firm == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.firm;
    }
  }
}
```

## Expected Test Results

When all tests pass, you should see:
- ✅ Firebase Configuration
- ✅ User Sign Up (or "User already exists")
- ✅ User Sign In
- ✅ Create User Document
- ✅ Read User Document
- ✅ Query Firm Users
- ✅ Update User Document
- ✅ Auth State Persistence
- ✅ Permission Denied Test
- ✅ User Sign Out

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check Firestore security rules
   - Ensure user is authenticated
   - Verify user has correct firm/role

2. **Configuration Errors**
   - Verify Firebase project settings
   - Check API keys and project IDs
   - Ensure Firestore is enabled

3. **Network Errors**
   - Check internet connection
   - Verify Firebase project is active
   - Check for CORS issues in browser

### Debug Mode

To enable detailed logging, add this to your test environment:

```javascript
// Enable Firebase debug logging
if (typeof window !== 'undefined') {
  window.localStorage.setItem('debug', 'firebase:*');
}
```

## Test Data Cleanup

The tests create minimal test data:
- Test user account (`test@example.com`)
- User document in Firestore
- Temporary test documents (cleaned up automatically)

**Note**: The test user account will persist in Firebase Auth. You may want to delete it manually from the Firebase Console after testing.

## Integration with CI/CD

For automated testing in CI/CD pipelines:

```bash
# Install dependencies
npm install firebase-admin

# Set up Firebase service account (for Node.js tests)
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"

# Run tests
node tests/firebase-test-node.js
```

## Contributing

To add new tests:
1. Follow the existing test pattern
2. Add proper error handling
3. Include cleanup procedures
4. Update this README with new test descriptions

## Support

If you encounter issues:
1. Check the Firebase Console for errors
2. Review browser developer tools console
3. Verify Firestore rules and indexes
4. Ensure all Firebase services are enabled