import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { FirmUser, FirmType, UserRole } from '../types';

export const userServices = {
  // Get all users for a specific firm
  async getFirmUsers(firm: FirmType): Promise<FirmUser[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('firm', '==', firm));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirmUser[];
    } catch (error: unknown) {
      console.error('Error fetching firm users:', error);
      
      // Handle permission denied errors specifically
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        throw new Error('Permission denied: You may not have admin privileges or your user document may be incomplete. Please try logging out and back in.');
      }
      
      // Handle other Firebase errors
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        throw new Error(`Firebase error (${error.code}): ${error.message}`);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      throw new Error(errorMessage);
    }
  },

  // Update user role
  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Toggle user active status
  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Delete user (soft delete by setting isActive to false)
  async deactivateUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: false,
        deactivatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },

  // Get active users for a firm (for dropdowns, etc.)
  async getActiveFirmUsers(firm: FirmType): Promise<FirmUser[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('firm', '==', firm),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirmUser[];
    } catch (error: unknown) {
      console.error('Error fetching active firm users:', error);
      
      // Handle permission denied errors specifically
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        throw new Error('Permission denied: You may not have admin privileges or your user document may be incomplete. Please try logging out and back in.');
      }
      
      // Handle other Firebase errors
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        throw new Error(`Firebase error (${error.code}): ${error.message}`);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active users';
      throw new Error(errorMessage);
    }
  },

  // Approve a pending user
  async approveUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: true,
        pendingApproval: false,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  },

  // Get all users across all firms (admin only)
  async getAllUsers(): Promise<FirmUser[]> {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirmUser[];
      
      console.log(`Successfully fetched ${users.length} users`);
      return users;
    } catch (error: unknown) {
      console.error('Error fetching all users:', error);
      
      // Handle permission denied errors specifically
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        throw new Error('Permission denied: Firestore security rules are blocking this request. Please check your admin privileges.');
      }
      
      // Handle other Firebase errors
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        throw new Error(`Firebase error (${error.code}): ${error.message}`);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch all users';
      throw new Error(errorMessage);
    }
  },

  // Get all pending users across all firms (admin only)
  async getAllPendingUsers(): Promise<FirmUser[]> {
    try {
      // First check if current user has admin role
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently authenticated');
      }
      
      // Get current user's document to verify admin role
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('Current user document does not exist. Please contact support.');
      }
      
      const userData = userDoc.data();
      console.log('Current user data for pending users check:', userData);
      
      if (userData.role !== 'admin') {
        throw new Error(`Access denied: Current user role is '${userData.role}', admin role required.`);
      }
      
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('pendingApproval', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirmUser[];
      
      console.log(`Successfully fetched ${users.length} pending users`);
      return users;
    } catch (error: unknown) {
      console.error('Error fetching pending users:', error);
      
      // Handle permission denied errors specifically
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        throw new Error('Permission denied: Firestore security rules are blocking this request. Please check your admin privileges.');
      }
      
      // Handle other Firebase errors
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        throw new Error(`Firebase error (${error.code}): ${error.message}`);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending users';
      throw new Error(errorMessage);
    }
  }
};