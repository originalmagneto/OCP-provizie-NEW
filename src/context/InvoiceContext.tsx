import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { Invoice } from "../types";
import { useClient } from "./ClientContext";

interface InvoiceContextType {
  invoices: Invoice[];
  isLoading: boolean;
  addInvoice: (invoice: Invoice) => void;
  removeInvoice: (id: string) => void;
  updateInvoice: (id: string, updatedInvoice: Partial<Invoice>) => void;
  resetAllData: () => void;
  togglePaid: (id: string) => void;
}

const defaultContext: InvoiceContextType = {
  invoices: [],
  isLoading: true,
  addInvoice: () => {},
  removeInvoice: () => {},
  updateInvoice: () => {},
  resetAllData: () => {},
  togglePaid: () => {},
};

const InvoiceContext = createContext<InvoiceContextType>(defaultContext);

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoices must be used within an InvoiceProvider");
  }
  return context;
}

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const { clients } = useClient();  
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadInvoices = () => {
      try {
        const storedInvoices = localStorage.getItem("invoices");
        if (storedInvoices && mounted) {
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
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    if (clients) {  
      loadInvoices();
    }

    return () => {
      mounted = false;
    };
  }, [clients]);  

  useEffect(() => {
    if (!isLoading && clients) {  
      try {
        localStorage.setItem("invoices", JSON.stringify(invoices));
      } catch (error) {
        console.error("Error saving invoices to localStorage:", error);
      }
    }
  }, [invoices, isLoading, clients]);

  const addInvoice = useCallback((invoice: Invoice) => {
    if (!invoice?.id || !invoice?.clientName || !clients) {  
      console.error("Invalid invoice data or clients not loaded:", invoice);
      return;
    }

    setInvoices((prev) => {
      if (!Array.isArray(prev)) {
        console.error("Previous invoices state is invalid");
        return [];
      }

      if (prev.some((i) => i.id === invoice.id)) {
        console.error("Invoice with this ID already exists:", invoice.id);
        return prev;
      }

      return [...prev, invoice];
    });
  }, [clients]);  

  const removeInvoice = useCallback((id: string) => {
    if (!id || !clients) return;  
    setInvoices((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.filter((invoice) => invoice.id !== id);
    });
  }, [clients]);

  const updateInvoice = useCallback((id: string, updatedInvoice: Partial<Invoice>) => {
    if (!id || !updatedInvoice || !clients) return;  

    setInvoices((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updatedInvoice } : invoice
      );
    });
  }, [clients]);

  const togglePaid = useCallback((id: string) => {
    if (!id || !clients) return;  

    setInvoices((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              isPaid: !invoice.isPaid,
              paidDate: !invoice.isPaid ? new Date().toISOString() : undefined,
            }
          : invoice
      );
    });
  }, [clients]);

  const resetAllData = useCallback(() => {
    if (!clients) return;  
    setInvoices([]);
    localStorage.removeItem("invoices");
  }, [clients]);

  const value = useMemo(
    () => ({
      invoices,
      isLoading,
      addInvoice,
      removeInvoice,
      updateInvoice,
      resetAllData,
      togglePaid,
    }),
    [invoices, isLoading, addInvoice, removeInvoice, updateInvoice, resetAllData, togglePaid]
  );

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
}
