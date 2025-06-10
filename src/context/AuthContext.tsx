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
import { firmServices } from "../services/firebaseServices";
import type { FirmType } from "../types";
import { getDominantColorFromUrl } from '../lib/color';

interface User {
  id: string;
  name: string;
  email: string;
  firm: FirmType;
  firmLogoUrl?: string;
  accentColor?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, firm: FirmType) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  firebaseUser: FirebaseUser | null;
  updateLogo: (url: string) => void;
  accentColor?: string;
  updateAccentColor: (color: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accentColor, setAccentColor] = useState<string | undefined>();

  const updateLogo = (url: string) => {
    setUser((prev) => (prev ? { ...prev, firmLogoUrl: url } : prev));
  };

  const updateAccentColor = (color: string) => {
    setAccentColor(color);
    setUser((prev) => (prev ? { ...prev, accentColor: color } : prev));
    document.documentElement.style.setProperty('--accent-color', color);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;

            let logoUrl: string | undefined;
            let accent: string | undefined;
            try {
              const firmInfo = await firmServices.getFirm(userData.firm || 'SKALLARS');
              if (firmInfo) {
                if ('logoUrl' in firmInfo) logoUrl = (firmInfo as { logoUrl?: string }).logoUrl;
                if ('accentColor' in firmInfo) accent = (firmInfo as { accentColor?: string }).accentColor;
              }
            } catch (e) {
              console.error('Error fetching firm info:', e);
            }

            setUser({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || 'User',
              email: userData.email || firebaseUser.email || '',
              firm: userData.firm || 'SKALLARS',
              firmLogoUrl: logoUrl,
              accentColor: accent,
            });

            if (accent) {
              updateAccentColor(accent);
            } else if (logoUrl) {
              try {
                const color = await getDominantColorFromUrl(logoUrl);
                updateAccentColor(color);
              } catch (e) {
                console.error('Color detection failed:', e);
              }
            }
            
            setIsAuthenticated(true);
          } else {
            // If user document doesn't exist but user is authenticated
            // Create a basic user profile
            let logoUrl: string | undefined;
            let accent: string | undefined;
            try {
              const firmInfo = await firmServices.getFirm('SKALLARS');
              if (firmInfo) {
                if ('logoUrl' in firmInfo) logoUrl = (firmInfo as { logoUrl?: string }).logoUrl;
                if ('accentColor' in firmInfo) accent = (firmInfo as { accentColor?: string }).accentColor;
              }
            } catch (e) {
              console.error('Error fetching firm info:', e);
            }

            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              firm: 'SKALLARS', // Default firm
              firmLogoUrl: logoUrl,
              accentColor: accent,
            });

            if (accent) {
              updateAccentColor(accent);
            } else if (logoUrl) {
              try {
                const color = await getDominantColorFromUrl(logoUrl);
                updateAccentColor(color);
              } catch (e) {
                console.error('Color detection failed:', e);
              }
            }
            
            // Create user document in Firestore
            await setDoc(doc(db, "users", firebaseUser.uid), {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              firm: 'SKALLARS',
              createdAt: new Date().toISOString()
            });
            
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
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

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, name: string, firm: FirmType) => {
    setIsLoading(true);
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        firm,
        createdAt: new Date().toISOString()
      });

      // Ensure firm document exists
      await setDoc(doc(db, "firms", firm), { name: firm }, { merge: true });
      
      // User will be set by the onAuthStateChanged listener
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User will be set by the onAuthStateChanged listener
    } catch (error) {
      console.error("Login failed:", error);
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
        logout,
        resetPassword,
        updateLogo,
        accentColor,
        updateAccentColor
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
