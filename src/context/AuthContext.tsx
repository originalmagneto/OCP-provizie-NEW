import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { FirmType, UserRole } from "../types/index";

interface User {
  id: string;
  name: string;
  email: string;
  firm: FirmType;
  role: UserRole;
  isActive: boolean;
  pendingApproval?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, firm: FirmType) => Promise<void>;
  createFirmUser: (email: string, password: string, name: string, firm: FirmType, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  firebaseUser: FirebaseUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // Listen for auth state changes
  useEffect(() => {
    // If Firebase is not configured, stop loading immediately
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Running in demo mode.');
      setIsLoading(false);
      setUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth state check timed out. Setting loading to false.');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(loadingTimeout); // Clear timeout since we got a response
      setIsLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // Get additional user data from Firestore with retry logic
        try {
          let userDoc;
          let retryCount = 0;
          const maxRetries = 3;
          
          // Retry logic for user document fetch
          while (retryCount < maxRetries) {
            try {
              userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
              break; // Success, exit retry loop
            } catch (fetchError: any) {
              retryCount++;
              console.warn(`User document fetch attempt ${retryCount} failed:`, fetchError);
              
              if (retryCount >= maxRetries) {
                throw fetchError;
              }
              
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            }
          }
          
          if (userDoc && userDoc.exists()) {
            const userData = userDoc.data();
            
            // Validate required user data fields
            if (!userData.firm || !userData.role) {
              console.warn('User document missing required fields, updating...');
              
              // Update user document with missing fields
              const updateData: any = {
                updatedAt: new Date().toISOString()
              };
              
              if (!userData.firm) updateData.firm = 'SKALLARS';
              if (!userData.role) updateData.role = 'admin';
              if (!userData.name) updateData.name = firebaseUser.displayName || 'User';
              if (!userData.email) updateData.email = firebaseUser.email || '';
              
              await setDoc(doc(db, "users", firebaseUser.uid), updateData, { merge: true });
              
              // Refetch the updated document
              userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            }
            
            const finalUserData = userDoc.data();
             if (!finalUserData) {
               throw new Error('User document data is empty');
             }
             
             const user = {
               id: firebaseUser.uid,
               name: finalUserData.name || firebaseUser.displayName || 'User',
               email: finalUserData.email || firebaseUser.email || '',
               firm: (finalUserData.firm || 'SKALLARS') as FirmType,
               role: (finalUserData.role || 'admin') as UserRole,
               isActive: finalUserData.isActive !== undefined ? finalUserData.isActive : true,
               pendingApproval: finalUserData.pendingApproval || false,
             };
            
            setUser(user);
            
            // Only set authenticated if user is active AND not pending approval
            setIsAuthenticated(user.isActive && !user.pendingApproval);
          } else {
            // If user document doesn't exist but user is authenticated
            console.log('Creating new user document for authenticated user');
            
            const newUserData = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              firm: 'SKALLARS', // Default firm
              role: 'admin', // Default role for new users
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            // Create user document in Firestore
            await setDoc(doc(db, "users", firebaseUser.uid), newUserData);
            
            setUser({
              id: firebaseUser.uid,
              ...newUserData,
              firm: newUserData.firm as FirmType,
              role: newUserData.role as UserRole
            });
            
            setIsAuthenticated(true);
          }
        } catch (error: any) {
          console.error("Error fetching/creating user data:", error);
          
          // For permission errors, provide more specific guidance
          if (error?.code === 'permission-denied') {
            console.error('Permission denied when accessing user document. This may indicate Firestore rules issues.');
          }
          
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, name: string, firm: FirmType) => {
    // Check if Firebase is configured before attempting registration
    if (!isFirebaseConfigured()) {
      const demoError = new Error(
        'Firebase is not configured. Please check FIREBASE_SETUP.md for setup instructions. ' +
        'This is a demo environment - authentication features are not available.'
      );
      demoError.name = 'FirebaseConfigError';
      throw demoError;
    }

    setIsLoading(true);
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user document in Firestore - requires admin approval
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        firm,
        role: 'user', // Default role for self-registered users
        isActive: false, // Requires admin approval
        createdAt: new Date().toISOString(),
        pendingApproval: true
      });
      
      // User will be set by the onAuthStateChanged listener
    } catch (error: any) {
      console.error("Registration failed:", error);
      
      // Check if this is a Firebase configuration error
      if (error?.code === 'auth/api-key-not-valid' || 
          error?.message?.includes('api-key-not-valid') ||
          error?.message?.includes('demo-api-key')) {
        // Show a more user-friendly error for demo mode
        const demoError = new Error(
          'Firebase is not configured. Please check FIREBASE_SETUP.md for setup instructions. ' +
          'This is a demo environment - authentication features are not available.'
        );
        demoError.name = 'FirebaseConfigError';
        throw demoError;
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Check if Firebase is configured before attempting login
    if (!isFirebaseConfigured()) {
      const demoError = new Error(
        'Firebase is not configured. Please check FIREBASE_SETUP.md for setup instructions. ' +
        'This is a demo environment - authentication features are not available.'
      );
      demoError.name = 'FirebaseConfigError';
      throw demoError;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User will be set by the onAuthStateChanged listener
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Check if this is a Firebase configuration error
      if (error?.code === 'auth/api-key-not-valid' || 
          error?.message?.includes('api-key-not-valid') ||
          error?.message?.includes('demo-api-key')) {
        // Show a more user-friendly error for demo mode
        const demoError = new Error(
          'Firebase is not configured. Please check FIREBASE_SETUP.md for setup instructions. ' +
          'This is a demo environment - authentication features are not available.'
        );
        demoError.name = 'FirebaseConfigError';
        throw demoError;
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // User will be cleared by the onAuthStateChanged listener
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const createFirmUser = async (email: string, password: string, name: string, firm: FirmType, role: UserRole) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can create firm users');
    }
    
    // Store current admin user info before creating new user
    const currentAdminEmail = firebaseUser?.email;
    
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newFirebaseUser = userCredential.user;
      
      // Update profile with display name
      await updateProfile(newFirebaseUser, { displayName: name });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", newFirebaseUser.uid), {
        name,
        email,
        firm,
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: user.id
      });
      
      // Sign out the newly created user to keep current admin logged in
      await signOut(auth);
      
      // Note: In a production app, you should use Firebase Admin SDK to create users
      // without affecting the current user's authentication state.
      // For now, the admin will need to sign back in after creating a user.
      
    } catch (error) {
      console.error("User creation failed:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticated,
        login,
        register,
        createFirmUser,
        logout,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
