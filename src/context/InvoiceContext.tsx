import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Invoice } from "../types";

interface InvoiceContextType {
  invoices: Invoice[];
  isLoading: boolean;
  addInvoice: (invoice: Invoice) => void;
  removeInvoice: (id: string) => void;
  updateInvoice: (id: string, updatedInvoice: Partial<Invoice>) => void;
  resetAllData: () => void;
  togglePaid: (id: string) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoices must be used within an InvoiceProvider");
  }
  return context;
}

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Initialize invoices from localStorage
  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem("invoices");
      if (storedInvoices) {
        const parsedInvoices = JSON.parse(storedInvoices);
        if (Array.isArray(parsedInvoices)) {
          const validInvoices = parsedInvoices.filter((invoice): invoice is Invoice => {
            return (
              invoice &&
              typeof invoice === "object" &&
              typeof invoice.id === "string" &&
              typeof invoice.clientName === "string" &&
              typeof invoice.amount === "number" &&
              typeof invoice.date === "string" &&
              typeof invoice.commissionPercentage === "number" &&
              typeof invoice.invoicedByFirm === "string" &&
              typeof invoice.referredByFirm === "string" &&
              typeof invoice.isPaid === "boolean"
            );
          });
          setInvoices(validInvoices);
        }
      }
    } catch (error) {
      console.error("Error loading invoices from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("invoices", JSON.stringify(invoices));
      } catch (error) {
        console.error("Error saving invoices to localStorage:", error);
      }
    }
  }, [invoices, isLoading]);

  const addInvoice = useCallback((invoice: Invoice) => {
    if (!invoice?.id || !invoice?.clientName) {
      console.error("Invalid invoice data:", invoice);
      return;
    }

    setInvoices(prev => {
      // Check for duplicate ID
      if (prev.some(i => i.id === invoice.id)) {
        console.error("Invoice with this ID already exists:", invoice.id);
        return prev;
      }
      return [...prev, invoice];
    });
  }, []);

  const removeInvoice = useCallback((id: string) => {
    if (!id) return;
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
  }, []);

  const updateInvoice = useCallback((id: string, updatedInvoice: Partial<Invoice>) => {
    if (!id || !updatedInvoice) return;
    
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === id 
          ? { ...invoice, ...updatedInvoice }
          : invoice
      )
    );
  }, []);

  const togglePaid = useCallback((id: string) => {
    if (!id) return;
    
    setInvoices(prev =>
      prev.map(invoice =>
        invoice.id === id
          ? {
              ...invoice,
              isPaid: !invoice.isPaid,
              paidDate: !invoice.isPaid ? new Date().toISOString() : undefined,
            }
          : invoice
      )
    );
  }, []);

  const resetAllData = useCallback(() => {
    setInvoices([]);
    localStorage.removeItem("invoices");
  }, []);

  const value = {
    invoices,
    isLoading,
    addInvoice,
    removeInvoice,
    updateInvoice,
    resetAllData,
    togglePaid,
  };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}
