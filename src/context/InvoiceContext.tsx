import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { Invoice } from "../types";

interface InvoiceContextType {
  invoices: Invoice[];
  isLoading: boolean;
  addInvoice: (invoice: Invoice) => void;
  removeInvoice: (id: string) => void;
  updateInvoice: (id: string, updatedInvoice: Partial<Invoice>) => void;
  resetAllData: () => void;
  togglePaid: (id: string) => void;
  calculateCommissions: Record<string, number>;
}

const defaultContext: InvoiceContextType = {
  invoices: [],
  isLoading: true,
  addInvoice: () => {},
  removeInvoice: () => {},
  updateInvoice: () => {},
  resetAllData: () => {},
  togglePaid: () => {},
  calculateCommissions: {},
};

const InvoiceContext = createContext<InvoiceContextType>(defaultContext);

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoices must be used within an InvoiceProvider");
  }
  return context;
}

const isValidInvoice = (invoice: any): invoice is Invoice => {
  return (
    invoice &&
    typeof invoice === "object" &&
    typeof invoice.id === "string" &&
    typeof invoice.clientName === "string" &&
    typeof invoice.amount === "number" &&
    typeof invoice.date === "string" &&
    !isNaN(new Date(invoice.date).getTime()) && // Ensure date is valid
    typeof invoice.commissionPercentage === "number" &&
    typeof invoice.invoicedByFirm === "string" &&
    typeof invoice.referredByFirm === "string" &&
    typeof invoice.isPaid === "boolean" &&
    ["SKALLARS", "MKMs", "Contax"].includes(invoice.invoicedByFirm) &&
    ["SKALLARS", "MKMs", "Contax"].includes(invoice.referredByFirm)
  );
};

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Load invoices from localStorage
  useEffect(() => {
    let mounted = true;

    const loadInvoices = () => {
      try {
        const storedInvoices = localStorage.getItem("invoices");
        if (storedInvoices && mounted) {
          const parsedInvoices = JSON.parse(storedInvoices);
          if (Array.isArray(parsedInvoices)) {
            // Filter out invalid invoices and ensure they're properly initialized
            const validInvoices = parsedInvoices
              .filter(isValidInvoice)
              .map(invoice => ({
                ...invoice,
                date: new Date(invoice.date).toISOString(), // Normalize date format
                amount: Number(invoice.amount), // Ensure amount is a number
                commissionPercentage: Number(invoice.commissionPercentage), // Ensure commission is a number
                isPaid: Boolean(invoice.isPaid) // Ensure isPaid is a boolean
              }));
            setInvoices(validInvoices);
          }
        }
      } catch (error) {
        console.error("Error loading invoices from localStorage:", error);
        setInvoices([]); // Reset to empty array on error
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInvoices();

    return () => {
      mounted = false;
    };
  }, []);

  // Save invoices to localStorage
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
    if (!isValidInvoice(invoice)) {
      console.error("Invalid invoice data:", invoice);
      return;
    }

    const normalizedInvoice = {
      ...invoice,
      date: new Date(invoice.date).toISOString(),
      amount: Number(invoice.amount),
      commissionPercentage: Number(invoice.commissionPercentage),
      isPaid: Boolean(invoice.isPaid)
    };

    setInvoices(prevInvoices => {
      const newInvoices = Array.isArray(prevInvoices) ? prevInvoices : [];
      return [...newInvoices, normalizedInvoice];
    });
  }, []);

  const removeInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
  }, []);

  const updateInvoice = useCallback((id: string, updatedInvoice: Partial<Invoice>) => {
    setInvoices(prev =>
      prev.map(invoice =>
        invoice.id === id
          ? {
              ...invoice,
              ...updatedInvoice,
              date: updatedInvoice.date 
                ? new Date(updatedInvoice.date).toISOString()
                : invoice.date,
              amount: updatedInvoice.amount !== undefined
                ? Number(updatedInvoice.amount)
                : invoice.amount,
              commissionPercentage: updatedInvoice.commissionPercentage !== undefined
                ? Number(updatedInvoice.commissionPercentage)
                : invoice.commissionPercentage,
              isPaid: updatedInvoice.isPaid !== undefined
                ? Boolean(updatedInvoice.isPaid)
                : invoice.isPaid
            }
          : invoice
      )
    );
  }, []);

  const togglePaid = useCallback((id: string) => {
    setInvoices(prev =>
      prev.map(invoice =>
        invoice.id === id ? { ...invoice, isPaid: !invoice.isPaid } : invoice
      )
    );
  }, []);

  const resetAllData = useCallback(() => {
    setInvoices([]);
    localStorage.removeItem("invoices");
  }, []);

  const calculateCommissions = (invoices: Invoice[]): Record<string, number> => {
    const commissions: Record<string, number> = {};

    invoices.forEach((invoice) => {
      if (!invoice.isPaid) return;

      const commission = invoice.amount * (invoice.commissionPercentage / 100);
      const firmKey = `${invoice.referredByFirm}-${invoice.invoicedByFirm}`;

      if (!commissions[firmKey]) {
        commissions[firmKey] = 0;
      }

      commissions[firmKey] += commission;
    });

    return commissions;
  };

  const value = useMemo(
    () => ({
      invoices,
      isLoading,
      addInvoice,
      removeInvoice,
      updateInvoice,
      resetAllData,
      togglePaid,
      calculateCommissions: calculateCommissions(invoices),
    }),
    [invoices, isLoading, addInvoice, removeInvoice, updateInvoice, resetAllData, togglePaid]
  );

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useCommissions() {
  const { calculateCommissions } = useInvoices();
  return calculateCommissions;
}
