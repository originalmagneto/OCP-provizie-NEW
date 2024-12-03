import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { Invoice, FirmType } from "../types";

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

// Validate individual fields
const validateDate = (date: string): boolean => {
  try {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  } catch {
    return false;
  }
};

const validateNumber = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const validateFirm = (firm: string): firm is FirmType => {
  return ["SKALLARS", "MKMs", "Contax"].includes(firm);
};

// Main invoice validation
const isValidInvoice = (invoice: any): invoice is Invoice => {
  try {
    if (!invoice || typeof invoice !== "object") return false;

    // Required string fields
    if (
      typeof invoice.id !== "string" ||
      typeof invoice.clientName !== "string" ||
      typeof invoice.date !== "string"
    ) {
      return false;
    }

    // Validate date
    if (!validateDate(invoice.date)) {
      return false;
    }

    // Validate numbers
    if (
      !validateNumber(invoice.amount) ||
      !validateNumber(invoice.commissionPercentage)
    ) {
      return false;
    }

    // Validate firms
    if (
      !validateFirm(invoice.invoicedByFirm) ||
      !validateFirm(invoice.referredByFirm)
    ) {
      return false;
    }

    // Validate boolean
    if (typeof invoice.isPaid !== "boolean") {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating invoice:", error);
    return false;
  }
};

// Normalize invoice data
const normalizeInvoice = (invoice: Invoice): Invoice => {
  return {
    ...invoice,
    date: new Date(invoice.date).toISOString(),
    amount: Number(invoice.amount),
    commissionPercentage: Number(invoice.commissionPercentage),
    isPaid: Boolean(invoice.isPaid),
    // Ensure these are the correct string literals
    invoicedByFirm: invoice.invoicedByFirm as FirmType,
    referredByFirm: invoice.referredByFirm as FirmType,
  };
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
            // Filter out invalid invoices and normalize the valid ones
            const validInvoices = parsedInvoices
              .filter(isValidInvoice)
              .map(normalizeInvoice);
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
    try {
      if (!isValidInvoice(invoice)) {
        console.error("Invalid invoice data:", invoice);
        return;
      }

      const normalizedInvoice = normalizeInvoice(invoice);

      setInvoices(prevInvoices => {
        const newInvoices = Array.isArray(prevInvoices) ? prevInvoices : [];
        return [...newInvoices, normalizedInvoice];
      });
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  }, []);

  const removeInvoice = useCallback((id: string) => {
    try {
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    } catch (error) {
      console.error("Error removing invoice:", error);
    }
  }, []);

  const updateInvoice = useCallback((id: string, updatedInvoice: Partial<Invoice>) => {
    try {
      setInvoices(prev =>
        prev.map(invoice => {
          if (invoice.id !== id) return invoice;

          const updated = {
            ...invoice,
            ...updatedInvoice,
          };

          // Only normalize if the field was updated
          return normalizeInvoice(updated);
        })
      );
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  }, []);

  const togglePaid = useCallback((id: string) => {
    try {
      setInvoices(prev =>
        prev.map(invoice =>
          invoice.id === id ? { ...invoice, isPaid: !invoice.isPaid } : invoice
        )
      );
    } catch (error) {
      console.error("Error toggling invoice paid status:", error);
    }
  }, []);

  const resetAllData = useCallback(() => {
    try {
      setInvoices([]);
      localStorage.removeItem("invoices");
    } catch (error) {
      console.error("Error resetting data:", error);
    }
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
