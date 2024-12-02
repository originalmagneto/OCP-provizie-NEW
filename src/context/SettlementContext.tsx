import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useInvoices } from './InvoiceContext';
import { useAuth } from './AuthContext';
import { useYear } from './YearContext';
import type { Settlement, SettlementStatus, SettlementSummary } from '../types/settlement';
import type { Invoice } from '../types';

interface SettlementContextType {
  settlements: Settlement[];
  isLoading: boolean;
  createSettlement: (invoiceIds: string[]) => void;
  updateSettlementStatus: (settlementId: string, status: SettlementStatus) => void;
  getSettlementsByQuarter: (quarter: number, year: number) => Settlement[];
  getSettlementSummary: (quarter: number, year: number) => SettlementSummary;
}

const SettlementContext = createContext<SettlementContextType | null>(null);

const STORAGE_KEY = 'settlements';

export function SettlementProvider({ children }: { children: React.ReactNode }) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { invoices } = useInvoices();
  const { userFirm } = useAuth();
  const { currentYear, currentQuarter } = useYear();

  // Load settlements from localStorage
  useEffect(() => {
    const storedSettlements = localStorage.getItem(STORAGE_KEY);
    if (storedSettlements) {
      try {
        setSettlements(JSON.parse(storedSettlements));
      } catch (error) {
        console.error('Error loading settlements:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save settlements to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settlements));
    }
  }, [settlements, isLoading]);

  const createSettlement = useCallback((invoiceIds: string[]) => {
    const selectedInvoices = invoices.filter(invoice => 
      invoiceIds.includes(invoice.id) && invoice.isPaid
    );

    if (selectedInvoices.length === 0) return;

    const totalAmount = selectedInvoices.reduce((sum, invoice) => 
      sum + (invoice.amount * invoice.commissionPercentage / 100), 0
    );

    const firstInvoice = selectedInvoices[0];
    const newSettlement: Settlement = {
      id: uuidv4(),
      quarter: currentQuarter,
      year: currentYear,
      firmFrom: firstInvoice.invoicedByFirm,
      firmTo: firstInvoice.referredByFirm,
      amount: totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      invoiceIds
    };

    setSettlements(prev => [...prev, newSettlement]);
  }, [invoices, currentQuarter, currentYear]);

  const updateSettlementStatus = useCallback((settlementId: string, status: SettlementStatus) => {
    setSettlements(prev => prev.map(settlement => {
      if (settlement.id === settlementId) {
        return {
          ...settlement,
          status,
          ...(status === 'settled' ? { settledAt: new Date().toISOString() } : {})
        };
      }
      return settlement;
    }));
  }, []);

  const getSettlementsByQuarter = useCallback((quarter: number, year: number) => {
    return settlements.filter(settlement => 
      settlement.quarter === quarter && 
      settlement.year === year
    );
  }, [settlements]);

  const getSettlementSummary = useCallback((quarter: number, year: number): SettlementSummary => {
    const quarterSettlements = getSettlementsByQuarter(quarter, year);
    
    return quarterSettlements.reduce((summary, settlement) => ({
      totalAmount: summary.totalAmount + settlement.amount,
      pendingCount: summary.pendingCount + (settlement.status === 'pending' ? 1 : 0),
      settledCount: summary.settledCount + (settlement.status === 'settled' ? 1 : 0),
      disputedCount: summary.disputedCount + (settlement.status === 'disputed' ? 1 : 0),
    }), {
      totalAmount: 0,
      pendingCount: 0,
      settledCount: 0,
      disputedCount: 0,
    });
  }, [getSettlementsByQuarter]);

  const value = {
    settlements,
    isLoading,
    createSettlement,
    updateSettlementStatus,
    getSettlementsByQuarter,
    getSettlementSummary,
  };

  return (
    <SettlementContext.Provider value={value}>
      {children}
    </SettlementContext.Provider>
  );
}

export function useSettlement() {
  const context = useContext(SettlementContext);
  if (!context) {
    throw new Error('useSettlement must be used within a SettlementProvider');
  }
  return context;
}
