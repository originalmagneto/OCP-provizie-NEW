// Script to fix admin role for current user
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function fixAdminRole() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log('Current user:', user.uid);
          
          // Get current user document
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Current user data:', userData);
            
            // Update user to admin role
            await updateDoc(userDocRef, {
              role: 'admin',
              isActive: true,
              pendingApproval: false,
              updatedAt: new Date().toISOString()
            });
            
            console.log('User role updated to admin successfully!');
            
            // Verify the update
            const updatedDoc = await getDoc(userDocRef);
            console.log('Updated user data:', updatedDoc.data());
            
            resolve('Success');
          } else {
            console.error('User document does not exist');
            reject('User document does not exist');
          }
        } catch (error) {
          console.error('Error updating user role:', error);
          reject(error);
        }
      } else {
        console.error('No user is currently signed in');
        reject('No user signed in');
      }
    });
  });
}

// Run the fix
fixAdminRole()
  .then(() => console.log('Admin role fix completed'))
  .catch((error) => console.error('Admin role fix failed:', error));