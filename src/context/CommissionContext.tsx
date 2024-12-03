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

  useEffect(() => {
    localStorage.setItem('settledQuarters', JSON.stringify(settledQuarters));
  }, [settledQuarters]);

  const isQuarterSettled = (quarterKey: string, firm: FirmType): boolean => {
    // The quarterKey format is now: [YEAR]-Q[QUARTER]-[PAYING_FIRM]-[RECEIVING_FIRM]
    return settledQuarters.some(q => 
      q.quarterKey === quarterKey && 
      q.isSettled && 
      q.settledBy === firm
    );
  };

  const settleQuarter = (quarterKey: string, firm: FirmType) => {
    setSettledQuarters(prev => {
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

      if (existingIndex >= 0) {
        // Update existing settlement
        const updated = [...prev];
        updated[existingIndex] = newStatus;
        return updated;
      }

      // Add new settlement
      return [...prev, newStatus];
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
