import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FirmType, SettlementStatus } from '../types';

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
  const [settledQuarters, setSettledQuarters] = useState<SettlementStatus[]>(() => {
    const stored = localStorage.getItem('settledQuarters');
    return stored ? JSON.parse(stored) : [];
  });

  // Debug log the current state
  useEffect(() => {
    console.log('Current settled quarters:', settledQuarters);
  }, [settledQuarters]);

  useEffect(() => {
    localStorage.setItem('settledQuarters', JSON.stringify(settledQuarters));
  }, [settledQuarters]);

  const isQuarterSettled = (quarterKey: string, firm: FirmType): boolean => {
    console.log('Checking if quarter is settled:', { quarterKey, firm });
    console.log('Current settled quarters:', settledQuarters);
    
    // The quarterKey format is now: [YEAR]-Q[QUARTER]-[PAYING_FIRM]-[RECEIVING_FIRM]
    const isSettled = settledQuarters.some(q => 
      q.quarterKey === quarterKey && 
      q.isSettled && 
      q.settledBy === firm
    );
    
    console.log('Quarter settled status:', isSettled);
    return isSettled;
  };

  const settleQuarter = (quarterKey: string, firm: FirmType) => {
    console.log('Settling quarter:', { quarterKey, firm });
    
    setSettledQuarters(prev => {
      console.log('Previous settled quarters:', prev);
      
      // Find if this quarter-firm combination already exists
      const existingIndex = prev.findIndex(q => 
        q.quarterKey === quarterKey && 
        q.settledBy === firm
      );
      
      const newStatus: SettlementStatus = {
        quarterKey,
        isSettled: true,
        settledAt: new Date().toISOString(),
        settledBy: firm
      };

      let updatedSettlements;
      if (existingIndex >= 0) {
        // Update existing settlement
        const updated = [...prev];
        updated[existingIndex] = newStatus;
        updatedSettlements = updated;
      } else {
        // Add new settlement
        updatedSettlements = [...prev, newStatus];
      }
      
      console.log('Updated settlements:', updatedSettlements);
      return updatedSettlements;
    });
  };

  const unsettleQuarter = (quarterKey: string, firm: FirmType) => {
    setSettledQuarters(prev => 
      prev.filter(q => q.quarterKey !== quarterKey || q.settledBy !== firm)
    );
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
