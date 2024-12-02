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

const isValidInvoice = (invoice: any): invoice is Invoice => {
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
    typeof invoice.isPaid === "boolean" &&
    ["SKALLARS", "MKMs", "Contax"].includes(invoice.invoicedByFirm) &&
    ["SKALLARS", "MKMs", "Contax"].includes(invoice.referredByFirm)
  );
};

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
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
            const validInvoices = parsedInvoices.filter(isValidInvoice);
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

    loadInvoices();

    return () => {
      mounted = false;
    };
  }, []);

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

    setInvoices((prev) => [...prev, invoice]);
  }, []);

  const removeInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
  }, []);

  const updateInvoice = useCallback((id: string, updatedInvoice: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updatedInvoice } : invoice
      )
    );
  }, []);

  const togglePaid = useCallback((id: string) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, isPaid: !invoice.isPaid } : invoice
      )
    );
  }, []);

  const resetAllData = useCallback(() => {
    setInvoices([]);
    localStorage.removeItem("invoices");
  }, []);

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

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}
