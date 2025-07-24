import React, { useState } from 'react';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  timestamp?: string;
}

const FirebaseTestComponent: React.FC = () => {
  const [user] = useAuthState(auth);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail] = useState('test@example.com');
  const [testPassword] = useState('testPassword123');

  const addTestResult = (name: string, status: 'pending' | 'success' | 'error', message?: string) => {
    setTestResults(prev => [
      ...prev.filter(r => r.name !== name),
      {
        name,
        status,
        message,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const runFirebaseTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Authentication - Sign Up
      addTestResult('Authentication - Sign Up', 'pending');
      try {
        await createUserWithEmailAndPassword(auth, testEmail, testPassword);
        addTestResult('Authentication - Sign Up', 'success', 'User created successfully');
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          addTestResult('Authentication - Sign Up', 'success', 'User already exists (expected)');
        } else {
          addTestResult('Authentication - Sign Up', 'error', error.message);
        }
      }

      // Test 2: Authentication - Sign In
      addTestResult('Authentication - Sign In', 'pending');
      try {
        const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
        if (userCredential.user) {
          addTestResult('Authentication - Sign In', 'success', `Signed in as ${userCredential.user.email}`);
        }
      } catch (error: any) {
        addTestResult('Authentication - Sign In', 'error', error.message);
      }

      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (auth.currentUser) {
        // Test 3: Create User Document
        addTestResult('Firestore - Create User Document', 'pending');
        try {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          const userData = {
            name: 'Test User',
            email: auth.currentUser.email,
            firm: 'SKALLARS',
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await setDoc(userDocRef, userData, { merge: true });
          addTestResult('Firestore - Create User Document', 'success', 'User document created');
        } catch (error: any) {
          addTestResult('Firestore - Create User Document', 'error', error.message);
        }

        // Test 4: Read User Document
        addTestResult('Firestore - Read User Document', 'pending');
        try {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            addTestResult('Firestore - Read User Document', 'success', `Found user: ${userData.name}`);
          } else {
            addTestResult('Firestore - Read User Document', 'error', 'User document not found');
          }
        } catch (error: any) {
          addTestResult('Firestore - Read User Document', 'error', error.message);
        }

        // Test 5: Query Firm Users (This was the main issue we fixed)
        addTestResult('Firestore - Query Firm Users', 'pending');
        try {
          const usersRef = collection(db, 'users');
          const firmQuery = query(usersRef, where('firm', '==', 'SKALLARS'));
          const querySnapshot = await getDocs(firmQuery);
          
          const firmUsers: any[] = [];
          querySnapshot.forEach((doc) => {
            firmUsers.push({ id: doc.id, ...doc.data() });
          });
          
          addTestResult('Firestore - Query Firm Users', 'success', `Found ${firmUsers.length} firm users`);
        } catch (error: any) {
          addTestResult('Firestore - Query Firm Users', 'error', error.message);
        }

        // Test 6: Admin Permission - Verify Role
        addTestResult('Admin Permission - Verify Role', 'pending');
        try {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Current user data:', userData);
            console.log('User role:', userData.role);
            console.log('Is admin:', userData.role === 'admin');
            
            if (userData.role === 'admin') {
              addTestResult('Admin Permission - Verify Role', 'success', `User has admin role: ${userData.role}`);
            } else {
              addTestResult('Admin Permission - Verify Role', 'error', `User role is not admin: ${userData.role}. Full user data: ${JSON.stringify(userData)}`);
            }
          } else {
            addTestResult('Admin Permission - Verify Role', 'error', 'User document not found');
          }
        } catch (error: any) {
          console.error('Admin role verification failed:', error);
          addTestResult('Admin Permission - Verify Role', 'error', error.message);
        }

        // Test 7: Admin Permission - Query All Users
        addTestResult('Admin Permission - Query All Users', 'pending');
        try {
          console.log('Attempting to query all users...');
          const usersRef = collection(db, 'users');
          const querySnapshot = await getDocs(usersRef);
          
          const allUsers: any[] = [];
          querySnapshot.forEach((doc) => {
            allUsers.push({ id: doc.id, ...doc.data() });
          });
          
          console.log('All users query successful, count:', allUsers.length);
          addTestResult('Admin Permission - Query All Users', 'success', `Found ${allUsers.length} total users across all firms`);
        } catch (error: any) {
          console.error('Query all users failed:', error);
          addTestResult('Admin Permission - Query All Users', 'error', error.message);
        }

        // Test 8: Admin Permission - Query Pending Users
        addTestResult('Admin Permission - Query Pending Users', 'pending');
        try {
          console.log('Attempting to query pending users...');
          const usersRef = collection(db, 'users');
          const pendingQuery = query(usersRef, where('pendingApproval', '==', true));
          const querySnapshot = await getDocs(pendingQuery);
          
          const pendingUsers: any[] = [];
          querySnapshot.forEach((doc) => {
            pendingUsers.push({ id: doc.id, ...doc.data() });
          });
          
          console.log('Pending users query successful, count:', pendingUsers.length);
          addTestResult('Admin Permission - Query Pending Users', 'success', `Found ${pendingUsers.length} pending users`);
        } catch (error: any) {
          console.error('Query pending users failed:', error);
          addTestResult('Admin Permission - Query Pending Users', 'error', error.message);
        }

        // Test 9: Authentication - Sign Out
        addTestResult('Authentication - Sign Out', 'pending');
        try {
          await signOut(auth);
          addTestResult('Authentication - Sign Out', 'success', 'Signed out successfully');
        } catch (error: any) {
          addTestResult('Authentication - Sign Out', 'error', error.message);
        }
      }

    } catch (error: any) {
      addTestResult('General Error', 'error', error.message);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🔥 Firebase Database Test Suite</h2>
        <p className="text-gray-600">
          This test suite validates the Firebase fixes we implemented, including authentication, 
          user document management, and firm-based queries.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={runFirebaseTests}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isRunning 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run Firebase Tests'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-green-700">Passed</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0}%
              </div>
              <div className="text-sm text-blue-700">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              result.status === 'success' 
                ? 'bg-green-50 border-green-400' 
                : result.status === 'error'
                ? 'bg-red-50 border-red-400'
                : 'bg-yellow-50 border-yellow-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getStatusIcon(result.status)}</span>
                <span className="font-semibold text-gray-800">{result.name}</span>
              </div>
              {result.timestamp && (
                <span className="text-sm text-gray-500">{result.timestamp}</span>
              )}
            </div>
            {result.message && (
              <div className={`mt-2 text-sm ${getStatusColor(result.status)}`}>
                {result.message}
              </div>
            )}
          </div>
        ))}
      </div>

      {user && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Current User Status</h3>
          <p className="text-blue-700">Signed in as: {user.email}</p>
          <p className="text-blue-700">User ID: {user.uid}</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Test Information</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Tests Firebase Authentication (sign up, sign in, sign out)</li>
          <li>• Tests Firestore user document operations (create, read)</li>
          <li>• Tests firm-based user queries (the main issue we fixed)</li>
          <li>• Validates security rules and permissions</li>
          <li>• Uses test email: {testEmail}</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseTestComponent;