/**
 * Firebase Database Functionality Test Script
 * Tests authentication, user management, and Firestore operations
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBpZmLqpBOdJhqOqOqOqOqOqOqOqOqOqOq",
  authDomain: "ocp-provizie.firebaseapp.com",
  databaseURL: "https://ocp-provizie-default-rtdb.firebaseio.com",
  projectId: "ocp-provizie",
  storageBucket: "ocp-provizie.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop",
  measurementId: "G-ABCDEFGHIJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test configuration
const TEST_CONFIG = {
  testUser: {
    email: 'test@example.com',
    password: 'testPassword123',
    name: 'Test User',
    firm: 'SKALLARS',
    role: 'admin'
  },
  testFirm: 'SKALLARS'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Utility functions
function logTest(testName, passed, error = null) {
  const result = {
    name: testName,
    passed,
    error: error?.message || null,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${error?.message || 'Unknown error'}`);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Firebase Configuration
async function testFirebaseConfig() {
  try {
    if (!app) throw new Error('Firebase app not initialized');
    if (!auth) throw new Error('Firebase auth not initialized');
    if (!db) throw new Error('Firestore not initialized');
    
    logTest('Firebase Configuration', true);
  } catch (error) {
    logTest('Firebase Configuration', false, error);
  }
}

// Test 2: User Authentication - Sign Up
async function testUserSignUp() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      TEST_CONFIG.testUser.email, 
      TEST_CONFIG.testUser.password
    );
    
    if (!userCredential.user) {
      throw new Error('User creation failed');
    }
    
    logTest('User Sign Up', true);
    return userCredential.user;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      logTest('User Sign Up', true, new Error('User already exists (expected)'));
      return null;
    }
    logTest('User Sign Up', false, error);
    return null;
  }
}

// Test 3: User Authentication - Sign In
async function testUserSignIn() {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      TEST_CONFIG.testUser.email, 
      TEST_CONFIG.testUser.password
    );
    
    if (!userCredential.user) {
      throw new Error('User sign in failed');
    }
    
    logTest('User Sign In', true);
    return userCredential.user;
  } catch (error) {
    logTest('User Sign In', false, error);
    return null;
  }
}

// Test 4: Create User Document in Firestore
async function testCreateUserDocument(user) {
  try {
    if (!user) {
      throw new Error('No authenticated user provided');
    }
    
    const userDocRef = doc(db, 'users', user.uid);
    const userData = {
      name: TEST_CONFIG.testUser.name,
      email: TEST_CONFIG.testUser.email,
      firm: TEST_CONFIG.testUser.firm,
      role: TEST_CONFIG.testUser.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(userDocRef, userData, { merge: true });
    
    logTest('Create User Document', true);
  } catch (error) {
    logTest('Create User Document', false, error);
  }
}

// Test 5: Read User Document from Firestore
async function testReadUserDocument(user) {
  try {
    if (!user) {
      throw new Error('No authenticated user provided');
    }
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document does not exist');
    }
    
    const userData = userDoc.data();
    if (!userData.name || !userData.email || !userData.firm) {
      throw new Error('User document missing required fields');
    }
    
    logTest('Read User Document', true);
    return userData;
  } catch (error) {
    logTest('Read User Document', false, error);
    return null;
  }
}

// Test 6: Query Firm Users (Test Firestore Rules)
async function testQueryFirmUsers(currentUser) {
  try {
    if (!currentUser) {
      throw new Error('No authenticated user provided');
    }
    
    const usersRef = collection(db, 'users');
    const firmQuery = query(
      usersRef, 
      where('firm', '==', TEST_CONFIG.testFirm)
    );
    
    const querySnapshot = await getDocs(firmQuery);
    
    if (querySnapshot.empty) {
      throw new Error('No firm users found');
    }
    
    const firmUsers = [];
    querySnapshot.forEach((doc) => {
      firmUsers.push({ id: doc.id, ...doc.data() });
    });
    
    logTest('Query Firm Users', true);
    return firmUsers;
  } catch (error) {
    logTest('Query Firm Users', false, error);
    return [];
  }
}

// Test 7: Update User Document
async function testUpdateUserDocument(user) {
  try {
    if (!user) {
      throw new Error('No authenticated user provided');
    }
    
    const userDocRef = doc(db, 'users', user.uid);
    const updateData = {
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    await updateDoc(userDocRef, updateData);
    
    logTest('Update User Document', true);
  } catch (error) {
    logTest('Update User Document', false, error);
  }
}

// Test 8: Test Authentication State Persistence
async function testAuthStatePersistence() {
  try {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          logTest('Auth State Persistence', true);
        } else {
          logTest('Auth State Persistence', false, new Error('No user in auth state'));
        }
        unsubscribe();
        resolve(user);
      });
    });
  } catch (error) {
    logTest('Auth State Persistence', false, error);
    return null;
  }
}

// Test 9: Test Permission Denied Scenarios
async function testPermissionDenied() {
  try {
    // Try to access another user's document (should fail)
    const fakeUserId = 'fake-user-id-12345';
    const fakeUserDocRef = doc(db, 'users', fakeUserId);
    
    try {
      await getDoc(fakeUserDocRef);
      // If this succeeds, it's actually a problem with our security rules
      logTest('Permission Denied Test', false, new Error('Should not be able to access other user data'));
    } catch (permissionError) {
      if (permissionError.code === 'permission-denied') {
        logTest('Permission Denied Test', true);
      } else {
        throw permissionError;
      }
    }
  } catch (error) {
    logTest('Permission Denied Test', false, error);
  }
}

// Test 10: Sign Out
async function testSignOut() {
  try {
    await signOut(auth);
    
    if (auth.currentUser) {
      throw new Error('User still signed in after signOut');
    }
    
    logTest('User Sign Out', true);
  } catch (error) {
    logTest('User Sign Out', false, error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Firebase Database Functionality Tests\n');
  
  let currentUser = null;
  
  // Run tests in sequence
  await testFirebaseConfig();
  await delay(1000);
  
  currentUser = await testUserSignUp();
  await delay(1000);
  
  if (!currentUser) {
    currentUser = await testUserSignIn();
  }
  await delay(1000);
  
  if (currentUser) {
    await testCreateUserDocument(currentUser);
    await delay(1000);
    
    await testReadUserDocument(currentUser);
    await delay(1000);
    
    await testQueryFirmUsers(currentUser);
    await delay(1000);
    
    await testUpdateUserDocument(currentUser);
    await delay(1000);
    
    await testAuthStatePersistence();
    await delay(1000);
    
    await testPermissionDenied();
    await delay(1000);
  }
  
  await testSignOut();
  
  // Print results
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`);
      });
  }
  
  console.log('\n🏁 Tests completed!');
  
  return testResults;
}

// Export for use in other modules
export {
  runAllTests,
  testFirebaseConfig,
  testUserSignUp,
  testUserSignIn,
  testCreateUserDocument,
  testReadUserDocument,
  testQueryFirmUsers,
  testUpdateUserDocument,
  testAuthStatePersistence,
  testPermissionDenied,
  testSignOut
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}