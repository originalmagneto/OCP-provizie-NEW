import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettlementStatus {
  quarterKey: string;  // Format: "2024-Q1"
  isSettled: boolean;
  settledAt?: string;
  settledBy: string;
}

interface CommissionContextType {
  settledQuarters: SettlementStatus[];
  isQuarterSettled: (quarterKey: string) => boolean;
  settleQuarter: (quarterKey: string, settledBy: string) => void;
  unsettleQuarter: (quarterKey: string) => void;
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

  const isQuarterSettled = (quarterKey: string): boolean => {
    return settledQuarters.some(q => q.quarterKey === quarterKey && q.isSettled);
  };

  const settleQuarter = (quarterKey: string, settledBy: string) => {
    setSettledQuarters(prev => {
      const existingIndex = prev.findIndex(q => q.quarterKey === quarterKey);
      const newStatus: SettlementStatus = {
        quarterKey,
        isSettled: true,
        settledAt: new Date().toISOString(),
        settledBy
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newStatus;
        return updated;
      }

      return [...prev, newStatus];
    });
  };

  const unsettleQuarter = (quarterKey: string) => {
    setSettledQuarters(prev => 
      prev.filter(q => q.quarterKey !== quarterKey)
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
