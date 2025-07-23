import { collection, doc, setDoc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { FirmType } from '../types';

export interface ReferralFirm {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactPerson?: string;
  referralDate: string;
  firstWorkDate?: string;
  totalInvoiced: number;
  totalCommissionsPaid: number;
  referredBy: string;
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const referralServices = {
  // Get all referral firms for a specific firm
  async getReferralFirms(firmId: FirmType): Promise<ReferralFirm[]> {
    try {
      const referralsRef = collection(db, 'referralFirms');
      const q = query(
        referralsRef,
        where('createdBy', '==', firmId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReferralFirm));
    } catch (error) {
      console.error('Error fetching referral firms:', error);
      return [];
    }
  },

  // Create a new referral firm
  async createReferralFirm(firmData: Omit<ReferralFirm, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const referralsRef = collection(db, 'referralFirms');
      const docRef = doc(referralsRef);
      const now = new Date().toISOString();
      
      const newFirm: Omit<ReferralFirm, 'id'> = {
        ...firmData,
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(docRef, newFirm);
      return docRef.id;
    } catch (error) {
      console.error('Error creating referral firm:', error);
      throw error;
    }
  },

  // Update an existing referral firm
  async updateReferralFirm(firmId: string, updates: Partial<ReferralFirm>): Promise<void> {
    try {
      const firmRef = doc(db, 'referralFirms', firmId);
      await updateDoc(firmRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating referral firm:', error);
      throw error;
    }
  },

  // Upload logo file and return URL
  async uploadLogo(file: File, firmName: string): Promise<string> {
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${firmName.toLowerCase().replace(/\s+/g, '-')}-logo.${fileExtension}`;
      const logoRef = ref(storage, `referral-logos/${fileName}`);
      
      await uploadBytes(logoRef, file);
      const downloadURL = await getDownloadURL(logoRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  // Fetch logo from website (simplified version - in production you'd use a proper service)
  async fetchLogoFromWebsite(website: string): Promise<string | null> {
    try {
      // This is a simplified implementation
      // In production, you'd use a service like Clearbit Logo API or similar
      const domain = new URL(website).hostname;
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      
      // Test if the logo exists
      const response = await fetch(logoUrl, { method: 'HEAD' });
      if (response.ok) {
        return logoUrl;
      }
      return null;
    } catch (error) {
      console.error('Error fetching logo from website:', error);
      return null;
    }
  },

  // Check if a referral firm already exists
  async checkReferralFirmExists(firmName: string, createdBy: string): Promise<ReferralFirm | null> {
    try {
      const referralsRef = collection(db, 'referralFirms');
      const q = query(
        referralsRef,
        where('name', '==', firmName),
        where('createdBy', '==', createdBy)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as ReferralFirm;
      }
      return null;
    } catch (error) {
      console.error('Error checking referral firm existence:', error);
      return null;
    }
  },

  // Auto-create referral firm from invoice data
  async autoCreateReferralFirm(firmName: string, createdBy: string, invoiceDate: string): Promise<string> {
    try {
      // Check if firm already exists
      const existingFirm = await this.checkReferralFirmExists(firmName, createdBy);
      if (existingFirm) {
        return existingFirm.id;
      }

      // Create new referral firm with basic data
      const firmData: Omit<ReferralFirm, 'id' | 'createdAt' | 'updatedAt'> = {
        name: firmName,
        website: `https://${firmName.toLowerCase().replace(/\s+/g, '')}.com`,
        contactEmail: `contact@${firmName.toLowerCase().replace(/\s+/g, '')}.com`,
        referralDate: invoiceDate,
        firstWorkDate: invoiceDate,
        totalInvoiced: 0,
        totalCommissionsPaid: 0,
        referredBy: 'Auto-created from invoice',
        status: 'pending',
        notes: `Auto-created referral entry from invoice. Please update contact details.`,
        createdBy
      };

      // Try to fetch logo from website
      if (firmData.website) {
        const logoUrl = await this.fetchLogoFromWebsite(firmData.website);
        if (logoUrl) {
          firmData.logo = logoUrl;
        }
      }

      return await this.createReferralFirm(firmData);
    } catch (error) {
      console.error('Error auto-creating referral firm:', error);
      throw error;
    }
  }
};