import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FirmType, SettlementStatus } from '../types';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { settlementServices } from '../services/firebaseServices';

interface CommissionContextType {
  settledQuarters: SettlementStatus[];
  isQuarterSettled: (quarterKey: string, firm: FirmType) => boolean;
  settleQuarter: (quarterKey: string, firm: FirmType) => void;
  unsettleQuarter: (quarterKey: string, firm: FirmType) => void;
}

const CommissionContext = createContext<CommissionContextType | undefined>(undefined);

export function useCommissions() {
  const context = useContext(CommissionContext);
  if (!context) {
    throw new Error('useCommissions must be used within a CommissionProvider');
  }
  return context;
}

export function CommissionProvider({ children }: { children: React.ReactNode }) {
  const [settledQuarters, setSettledQuarters] = useState<SettlementStatus[]>([]);

  // Set up real-time listener for settlements
  useEffect(() => {
    // Create a query to get settlements
    const q = query(collection(db, "settlements"), orderBy("quarterKey"));
    
    // Set up the listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const settlements = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            quarterKey: data.quarterKey,
            isSettled: data.isSettled,
            settledAt: data.settledAt,
            settledBy: data.settledBy
          } as SettlementStatus;
        });
        
        setSettledQuarters(settlements);
      } catch (error) {
        console.error("Error processing settlement data from Firestore:", error);
      }
    }, (error) => {
      console.error("Firestore settlements listener error:", error);
    });
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  const isQuarterSettled = (quarterKey: string, firm: FirmType): boolean => {
    // Check if this specific quarter-firm combination is settled
    return settledQuarters.some(q => q.quarterKey === quarterKey && q.isSettled && q.settledBy === firm);
  };

  const settleQuarter = async (quarterKey: string, firm: FirmType) => {
    try {
      await settlementServices.settleQuarter(quarterKey, firm);
      // The settlement will be updated via the Firestore listener
    } catch (error) {
      console.error("Error settling quarter in Firestore:", error);
    }
  };

  const unsettleQuarter = async (quarterKey: string, firm: FirmType) => {
    try {
      await settlementServices.unsettleQuarter(quarterKey, firm);
      // The settlement will be removed via the Firestore listener
    } catch (error) {
      console.error("Error unsettling quarter in Firestore:", error);
    }
  };

  const value = {
    settledQuarters,
    isQuarterSettled,
    settleQuarter,
    unsettleQuarter
  };

  return (
    <CommissionContext.Provider value={value}>
      {children}
    </CommissionContext.Provider>
  );
}
