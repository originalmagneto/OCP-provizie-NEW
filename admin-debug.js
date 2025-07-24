// Admin Debug Script - Run this in browser console
// This script helps debug and fix admin role issues

// Function to check and fix current user's admin role
window.debugAdminRole = async function() {
  try {
    // Import Firebase functions
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, doc, getDoc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Get Firebase instances from the app
    const auth = getAuth();
    const db = getFirestore();
    
    console.log('🔍 Starting admin role debug...');
    
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ No user is currently authenticated');
      return;
    }
    
    console.log('✅ User authenticated:', currentUser.email, currentUser.uid);
    
    // Get user document
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('❌ User document does not exist');
      return;
    }
    
    const userData = userDoc.data();
    console.log('📄 Current user document:', userData);
    
    // Check admin role
    if (userData.role === 'admin') {
      console.log('✅ User already has admin role');
    } else {
      console.log('⚠️ User does not have admin role, current role:', userData.role);
      
      // Ask if user wants to fix it
      const shouldFix = confirm('Would you like to update your role to admin?');
      if (shouldFix) {
        await updateDoc(userDocRef, {
          role: 'admin',
          isActive: true,
          pendingApproval: false,
          updatedAt: new Date().toISOString()
        });
        
        console.log('✅ User role updated to admin');
        
        // Verify the update
        const updatedDoc = await getDoc(userDocRef);
        console.log('📄 Updated user document:', updatedDoc.data());
      }
    }
    
    // Test admin permissions
    console.log('🧪 Testing admin permissions...');
    
    try {
      const { collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      
      // Test 1: Query all users
      console.log('Testing: Query all users...');
      const usersRef = collection(db, 'users');
      const allUsersSnapshot = await getDocs(usersRef);
      console.log('✅ Query all users successful, count:', allUsersSnapshot.size);
      
      // Test 2: Query pending users
      console.log('Testing: Query pending users...');
      const pendingQuery = query(usersRef, where('pendingApproval', '==', true));
      const pendingSnapshot = await getDocs(pendingQuery);
      console.log('✅ Query pending users successful, count:', pendingSnapshot.size);
      
      console.log('🎉 All admin permission tests passed!');
      
    } catch (permError) {
      console.error('❌ Admin permission test failed:', permError);
    }
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
};

// Auto-run the debug function
console.log('🚀 Admin debug script loaded. Run debugAdminRole() to start debugging.');
console.log('Or it will auto-run in 2 seconds...');

setTimeout(() => {
  if (window.debugAdminRole) {
    window.debugAdminRole();
  }
}, 2000);