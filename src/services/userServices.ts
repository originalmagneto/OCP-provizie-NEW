import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
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
    } catch (error) {
      console.error('Error fetching firm users:', error);
      throw error;
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
    } catch (error) {
      console.error('Error fetching active firm users:', error);
      throw error;
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
  }
};