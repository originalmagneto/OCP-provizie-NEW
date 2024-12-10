import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FirmType } from '../types';

interface SettlementStatus {
  quarterKey: string;
  settledBy: FirmType;
  isSettled: boolean;
  settledAt: string;
  settledInvoiceIds: string[];
  batchKey: string; 
}

interface CommissionContextType {
  settledQuarters: SettlementStatus[];
  isQuarterSettled: (quarterKey: string, firm: FirmType, invoiceId: string) => boolean;
  getSettledInvoiceIds: (quarterKey: string, firm: FirmType) => string[];
  getSettlementBatch: (quarterKey: string, firm: FirmType, invoiceId: string) => string | null;
  settleQuarter: (quarterKey: string, firm: FirmType, invoiceIds: string[]) => Promise<void>;
  unsettleQuarter: (quarterKey: string, firm: FirmType, batchKey: string) => void;
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

  const isQuarterSettled = useCallback((quarterKey: string, firm: FirmType, invoiceId?: string): boolean => {
    // If checking a specific invoice
    if (invoiceId) {
      const settlement = settledQuarters.find(s => 
        s.quarterKey === quarterKey && 
        s.settledBy === firm &&
        s.settledInvoiceIds.includes(invoiceId)
      );
      return settlement?.isSettled ?? false;
    }
    
    // If checking an entire quarter
    const quarterSettlements = settledQuarters.filter(s => 
      s.quarterKey === quarterKey && 
      s.settledBy === firm
    );
    
    return quarterSettlements.length > 0 && 
           quarterSettlements.every(s => s.isSettled);
  }, [settledQuarters]);

  const getSettledInvoiceIds = useCallback((quarterKey: string, firm: FirmType): string[] => {
    return settledQuarters
      .filter(s => s.quarterKey === quarterKey && s.settledBy === firm)
      .flatMap(s => s.settledInvoiceIds);
  }, [settledQuarters]);

  const getSettlementBatch = useCallback((quarterKey: string, firm: FirmType, invoiceId: string): string | null => {
    const settlement = settledQuarters.find(s => 
      s.quarterKey === quarterKey && 
      s.settledBy === firm && 
      s.settledInvoiceIds.includes(invoiceId)
    );
    return settlement ? settlement.batchKey : null;
  }, [settledQuarters]);

  const settleQuarter = useCallback(async (quarterKey: string, firm: FirmType, invoiceIds: string[]): Promise<void> => {
    try {
      const timestamp = Date.now();
      const batchKey = `${quarterKey}-${firm}-${timestamp}`; 
      const newSettlement: SettlementStatus = {
        quarterKey,
        settledBy: firm,
        isSettled: true,
        settledAt: new Date().toISOString(),
        settledInvoiceIds: invoiceIds,
        batchKey
      };

      setSettledQuarters(prev => [...prev, newSettlement]);
      console.log('Quarter settled successfully:', newSettlement);
    } catch (error) {
      console.error('Error settling quarter:', error);
      throw error;
    }
  }, []);

  const unsettleQuarter = useCallback((quarterKey: string, firm: FirmType, batchKey: string): void => {
    setSettledQuarters(prev => 
      prev.filter(s => !(
        s.quarterKey === quarterKey && 
        s.settledBy === firm && 
        s.batchKey === batchKey
      ))
    );
  }, []);

  const value = {
    settledQuarters,
    isQuarterSettled,
    getSettledInvoiceIds,
    getSettlementBatch,
    settleQuarter,
    unsettleQuarter
  };

  return (
    <CommissionContext.Provider value={value}>
      {children}
    </CommissionContext.Provider>
  );
}
