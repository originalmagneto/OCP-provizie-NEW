import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FirmType, SettlementStatus } from '../types';

interface CommissionContextType {
  settledQuarters: SettlementStatus[];
  isQuarterSettled: (quarterKey: string, firm: FirmType) => boolean;
  settleQuarter: (quarterKey: string, firm: FirmType) => Promise<void>;
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
    try {
      const stored = localStorage.getItem('settledQuarters');
      const parsed = stored ? JSON.parse(stored) : [];
      console.log('Loaded settled quarters from storage:', parsed);
      return parsed;
    } catch (error) {
      console.error('Error loading settled quarters:', error);
      return [];
    }
  });

  // Save to localStorage whenever settledQuarters changes
  useEffect(() => {
    try {
      console.log('Saving settled quarters to storage:', settledQuarters);
      localStorage.setItem('settledQuarters', JSON.stringify(settledQuarters));
    } catch (error) {
      console.error('Error saving settled quarters:', error);
    }
  }, [settledQuarters]);

  const isQuarterSettled = (quarterKey: string, firm: FirmType): boolean => {
    console.log('Checking settlement status:', { quarterKey, firm, settledQuarters });
    return settledQuarters.some(q => 
      q.quarterKey === quarterKey && 
      q.isSettled && 
      q.settledBy === firm
    );
  };

  const settleQuarter = async (quarterKey: string, firm: FirmType): Promise<void> => {
    console.log('Settling quarter:', { quarterKey, firm });
    
    const newStatus: SettlementStatus = {
      quarterKey,
      isSettled: true,
      settledAt: new Date().toISOString(),
      settledBy: firm
    };

    setSettledQuarters(prev => {
      // Remove any existing settlement for this quarter and firm
      const filtered = prev.filter(q => q.quarterKey !== quarterKey || q.settledBy !== firm);
      // Add the new settlement
      const updated = [...filtered, newStatus];
      console.log('Updated settled quarters:', updated);
      return updated;
    });
  };

  const unsettleQuarter = (quarterKey: string, firm: FirmType) => {
    console.log('Unsettling quarter:', { quarterKey, firm });
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
