import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { FirmType, FirmTheme } from '../types';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  return requiredVars.every(varName => {
    const value = import.meta.env[varName];
    return value && value !== 'demo-api-key' && value !== 'demo-project' && !value.includes('demo-');
  });
};

const firmsCollection = collection(db, 'firms');

export const firmServices = {
  getFirmConfig: async (firm: FirmType): Promise<FirmTheme | null> => {
    const firmRef = doc(firmsCollection, firm);
    const snap = await getDoc(firmRef);
    return snap.exists() ? (snap.data() as FirmTheme) : null;
  },

  updateFirmConfig: async (firm: FirmType, data: Partial<FirmTheme>) => {
    const firmRef = doc(firmsCollection, firm);
    await setDoc(firmRef, data, { merge: true });
  },

  uploadLogo: async (firm: FirmType, file: File): Promise<string> => {
    // Check Firebase configuration first to avoid unnecessary processing
    if (!isFirebaseConfigured() || isDevelopment) {
      console.warn('Firebase Storage not configured. Using localStorage fallback.');
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File must be an image (JPEG, PNG, GIF, WebP, or SVG)');
      }
       
       // Convert file to base64 data URL for local storage
       const dataUrl = await new Promise<string>((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = reject;
         reader.readAsDataURL(file);
       });
       
       // Store in localStorage for development/demo mode
       const logoKey = `logo_${firm}_${Date.now()}`;
       localStorage.setItem(logoKey, dataUrl);
       
       // Save the localStorage key as the logo URL
       const fallbackUrl = `localStorage:${logoKey}`;
       await firmServices.updateFirmConfig(firm, { logoUrl: fallbackUrl });
       
       console.log('Logo saved to localStorage:', logoKey);
       return fallbackUrl;
     }
 
     try {
      
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${firm}-logo-${timestamp}.${fileExtension}`;
      const storageRef = ref(storage, `logos/${firm}/${fileName}`);
      
      console.log('Uploading file to Firebase Storage:', `logos/${firm}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      console.log('Upload successful, URL:', url);
      
      await firmServices.updateFirmConfig(firm, { logoUrl: url });
      return url;
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      
      // If Firebase Storage fails, try fallback solution
      if (error.code && error.code.startsWith('storage/')) {
        console.warn('Firebase Storage failed, attempting fallback solution...');
        
        try {
          // Convert file to base64 data URL for local storage
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          // Store in localStorage as fallback
          const logoKey = `logo_${firm}_${Date.now()}`;
          localStorage.setItem(logoKey, dataUrl);
          
          // Save the localStorage key as the logo URL
          const fallbackUrl = `localStorage:${logoKey}`;
          await firmServices.updateFirmConfig(firm, { logoUrl: fallbackUrl });
          
          console.log('Logo saved to localStorage as fallback:', logoKey);
          return fallbackUrl;
        } catch (fallbackError) {
          console.error('Fallback solution also failed:', fallbackError);
        }
      }
      
      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('You are not authorized to upload files. Please check your authentication.');
      } else if (error.code === 'storage/canceled') {
        throw new Error('Upload was canceled.');
      } else if (error.code === 'storage/unknown') {
        throw new Error('An unknown error occurred during upload. Please check your Firebase Storage configuration.');
      } else if (error.code === 'storage/object-not-found') {
        throw new Error('Firebase Storage bucket not found. Please check your Firebase configuration.');
      } else if (error.code === 'storage/bucket-not-found') {
        throw new Error('Firebase Storage bucket does not exist. Please check your Firebase project setup.');
      } else if (error.code === 'storage/project-not-found') {
        throw new Error('Firebase project not found. Please check your Firebase configuration.');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Storage quota exceeded. Please upgrade your Firebase plan.');
      } else if (error.code === 'storage/unauthenticated') {
        throw new Error('Please log in to upload files.');
      } else if (error.code === 'storage/retry-limit-exceeded') {
        throw new Error('Upload failed after multiple retries. Please try again later.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to upload logo. Please check your internet connection and Firebase configuration.');
      }
    }
  },
};
