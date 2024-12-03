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
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading settled quarters:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('settledQuarters', JSON.stringify(settledQuarters));
    } catch (error) {
      console.error('Error saving settled quarters:', error);
    }
  }, [settledQuarters]);

  const isQuarterSettled = (quarterKey: string, firm: FirmType): boolean => {
    return settledQuarters.some(q => 
      q.quarterKey === quarterKey && 
      q.isSettled && 
      q.settledBy === firm
    );
  };

  const settleQuarter = async (quarterKey: string, firm: FirmType): Promise<void> => {
    setSettledQuarters(prev => [
      ...prev,
      {
        quarterKey,
        isSettled: true,
        settledBy: firm,
        settledAt: new Date().toISOString()
      }
    ]);
  };

  const unsettleQuarter = (quarterKey: string, firm: FirmType): void => {
    setSettledQuarters(prev => 
      prev.filter(q => !(q.quarterKey === quarterKey && q.settledBy === firm))
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
