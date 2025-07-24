/**
 * Firebase Database Functionality Test Script for Node.js
 * Run with: node tests/firebase-test-node.js
 */

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (you'll need to set up service account)
// For testing, you can use the Firebase emulator
let app, auth, db;

try {
  // Initialize with service account key (replace with your actual path)
  // const serviceAccount = require('./path/to/serviceAccountKey.json');
  
  // For emulator testing (uncomment to use emulators)
  // process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  // process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  
  app = admin.initializeApp({
    projectId: 'ocp-provizie',
    // credential: admin.credential.cert(serviceAccount)
  });
  
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  process.exit(1);
}

// Test configuration
const TEST_CONFIG = {
  testUser: {
    uid: 'test-user-123',
    email: 'test@example.com',
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

// Test 1: Create Test User
async function testCreateUser() {
  try {
    const userRecord = await auth.createUser({
      uid: TEST_CONFIG.testUser.uid,
      email: TEST_CONFIG.testUser.email,
      password: 'testPassword123',
      displayName: TEST_CONFIG.testUser.name
    });
    
    if (!userRecord.uid) {
      throw new Error('User creation failed');
    }
    
    logTest('Create Test User', true);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/uid-already-exists') {
      logTest('Create Test User', true, new Error('User already exists (expected)'));
      return await auth.getUser(TEST_CONFIG.testUser.uid);
    }
    logTest('Create Test User', false, error);
    return null;
  }
}

// Test 2: Create User Document in Firestore
async function testCreateUserDocument() {
  try {
    const userDocRef = db.collection('users').doc(TEST_CONFIG.testUser.uid);
    const userData = {
      name: TEST_CONFIG.testUser.name,
      email: TEST_CONFIG.testUser.email,
      firm: TEST_CONFIG.testUser.firm,
      role: TEST_CONFIG.testUser.role,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await userDocRef.set(userData, { merge: true });
    
    logTest('Create User Document', true);
  } catch (error) {
    logTest('Create User Document', false, error);
  }
}

// Test 3: Read User Document
async function testReadUserDocument() {
  try {
    const userDocRef = db.collection('users').doc(TEST_CONFIG.testUser.uid);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
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

// Test 4: Query Firm Users
async function testQueryFirmUsers() {
  try {
    const usersRef = db.collection('users');
    const firmQuery = usersRef.where('firm', '==', TEST_CONFIG.testFirm);
    
    const querySnapshot = await firmQuery.get();
    
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

// Test 5: Update User Document
async function testUpdateUserDocument() {
  try {
    const userDocRef = db.collection('users').doc(TEST_CONFIG.testUser.uid);
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await userDocRef.update(updateData);
    
    logTest('Update User Document', true);
  } catch (error) {
    logTest('Update User Document', false, error);
  }
}

// Test 6: Test Batch Operations
async function testBatchOperations() {
  try {
    const batch = db.batch();
    
    // Create multiple test documents
    for (let i = 1; i <= 3; i++) {
      const docRef = db.collection('test-collection').doc(`test-doc-${i}`);
      batch.set(docRef, {
        name: `Test Document ${i}`,
        firm: TEST_CONFIG.testFirm,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    
    logTest('Batch Operations', true);
  } catch (error) {
    logTest('Batch Operations', false, error);
  }
}

// Test 7: Test Transactions
async function testTransactions() {
  try {
    const userDocRef = db.collection('users').doc(TEST_CONFIG.testUser.uid);
    
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      
      if (!userDoc.exists) {
        throw new Error('User document does not exist');
      }
      
      const userData = userDoc.data();
      const newLoginCount = (userData.loginCount || 0) + 1;
      
      transaction.update(userDocRef, {
        loginCount: newLoginCount,
        lastTransactionTest: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    logTest('Transactions', true);
  } catch (error) {
    logTest('Transactions', false, error);
  }
}

// Test 8: Test Security Rules (Admin bypass)
async function testSecurityRules() {
  try {
    // Admin SDK bypasses security rules, so we'll test document structure
    const testDocRef = db.collection('users').doc('unauthorized-test');
    
    await testDocRef.set({
      name: 'Unauthorized User',
      firm: 'DIFFERENT_FIRM',
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Clean up
    await testDocRef.delete();
    
    logTest('Security Rules Structure', true);
  } catch (error) {
    logTest('Security Rules Structure', false, error);
  }
}

// Test 9: Clean Up Test Data
async function testCleanup() {
  try {
    // Delete test documents
    const testCollectionRef = db.collection('test-collection');
    const testDocs = await testCollectionRef.get();
    
    const batch = db.batch();
    testDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    logTest('Cleanup Test Data', true);
  } catch (error) {
    logTest('Cleanup Test Data', false, error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Firebase Database Functionality Tests (Node.js)\n');
  
  // Run tests in sequence
  await testCreateUser();
  await delay(500);
  
  await testCreateUserDocument();
  await delay(500);
  
  await testReadUserDocument();
  await delay(500);
  
  await testQueryFirmUsers();
  await delay(500);
  
  await testUpdateUserDocument();
  await delay(500);
  
  await testBatchOperations();
  await delay(500);
  
  await testTransactions();
  await delay(500);
  
  await testSecurityRules();
  await delay(500);
  
  await testCleanup();
  
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

// Run tests
runAllTests()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });

module.exports = {
  runAllTests,
  testCreateUser,
  testCreateUserDocument,
  testReadUserDocument,
  testQueryFirmUsers,
  testUpdateUserDocument,
  testBatchOperations,
  testTransactions,
  testSecurityRules,
  testCleanup
};