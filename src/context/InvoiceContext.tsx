import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Invoice, FirmType } from '../types';
import { useAuth } from "./AuthContext";

interface InvoiceContextType {
  invoices: Invoice[];
  isLoading: boolean;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  removeInvoice: (id: string) => void;
  updateInvoice: (updatedInvoice: Invoice) => void;
  togglePaid: (id: string, firm: FirmType) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  resetAllData: () => void;
}

const defaultContext: InvoiceContextType = {
  invoices: [],
  isLoading: true,
  addInvoice: () => {},
  removeInvoice: () => {},
  updateInvoice: () => {},
  togglePaid: () => {},
  getInvoiceById: () => undefined,
  resetAllData: () => {},
};

const InvoiceContext = createContext<InvoiceContextType>(defaultContext);

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
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
    // Special case: if we're just validating an ID
    if (typeof invoice === "string") {
      return true; // Allow string IDs to pass validation
    }

    if (!invoice || typeof invoice !== "object") {
      console.error("Invoice is not an object:", invoice);
      return false;
    }

    // Required string fields
    if (
      typeof invoice.clientName !== "string" ||
      typeof invoice.date !== "string"
    ) {
      console.error("Invalid required string fields:", { clientName: invoice.clientName, date: invoice.date });
      return false;
    }

    // Validate date
    if (!validateDate(invoice.date)) {
      console.error("Invalid date:", invoice.date);
      return false;
    }

    // Validate numbers
    if (
      !validateNumber(invoice.amount) ||
      !validateNumber(invoice.commissionPercentage)
    ) {
      console.error("Invalid numbers:", { amount: invoice.amount, commissionPercentage: invoice.commissionPercentage });
      return false;
    }

    // Validate firms
    if (
      !validateFirm(invoice.invoicedByFirm) ||
      !validateFirm(invoice.referredByFirm)
    ) {
      console.error("Invalid firms:", { invoicedByFirm: invoice.invoicedByFirm, referredByFirm: invoice.referredByFirm });
      return false;
    }

    // Validate boolean
    if (typeof invoice.isPaid !== "boolean") {
      invoice.isPaid = false; // Set default value if missing
    }

    // For new invoices, ensure ID is a string
    // For existing invoices, the ID must exist and be a string
    if (invoice.id !== undefined && typeof invoice.id !== "string") {
      console.error("Invalid invoice ID:", invoice.id);
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
    id: invoice.id,
    clientName: invoice.clientName.trim(),
    date: new Date(invoice.date).toISOString(),
    amount: Number(invoice.amount),
    commissionPercentage: Number(invoice.commissionPercentage),
    isPaid: Boolean(invoice.isPaid),
    invoicedByFirm: invoice.invoicedByFirm,
    referredByFirm: invoice.referredByFirm,
  };
};

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem('invoices');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading invoices:', error);
      return [];
    }
  });
  const { user } = useAuth();

  // Load invoices from localStorage
  React.useEffect(() => {
    let mounted = true;

    const loadInvoices = () => {
      try {
        const storedInvoices = localStorage.getItem("invoices");
        if (storedInvoices && mounted) {
          const parsedInvoices = JSON.parse(storedInvoices);
          if (Array.isArray(parsedInvoices)) {
            // Filter out invalid invoices and normalize the valid ones
            const validInvoices = parsedInvoices
              .filter((invoice) => {
                const isValid = isValidInvoice(invoice);
                if (!isValid) {
                  console.error("Invalid invoice found:", invoice);
                }
                return isValid;
              })
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

  // Save invoices to localStorage whenever they change
  React.useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('invoices', JSON.stringify(invoices));
      } catch (error) {
        console.error('Error saving invoices:', error);
      }
    }
  }, [invoices, isLoading]);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id'>) => {
    try {
      if (!isValidInvoice({ ...invoice, id: crypto.randomUUID() })) {
        console.error("Invalid invoice data:", invoice);
        return;
      }

      const newInvoice = {
        ...invoice,
        id: crypto.randomUUID()
      };
      setInvoices(prev => [...prev, newInvoice]);
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

  const updateInvoice = useCallback((updatedInvoice: Invoice) => {
    try {
      if (!isValidInvoice(updatedInvoice)) {
        console.error("Invalid invoice data:", updatedInvoice);
        return;
      }

      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === updatedInvoice.id ? updatedInvoice : invoice
        )
      );
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  }, []);

  const togglePaid = useCallback((id: string, firm: FirmType) => {
    try {
      console.log("Attempting to toggle paid status for invoice:", id, "firm:", firm);
      
      if (!user?.firm) {
        console.error("No user firm found");
        return;
      }

      if (!id || typeof id !== 'string') {
        console.error("Invalid invoice ID:", id);
        return;
      }

      if (!validateFirm(firm)) {
        console.error("Invalid firm:", firm);
        return;
      }

      setInvoices(prev => {
        const invoice = prev.find(inv => inv.id === id);
        if (!invoice) {
          console.error("Invoice not found:", id);
          return prev;
        }

        if (invoice.invoicedByFirm !== firm) {
          console.error("Firm mismatch:", invoice.invoicedByFirm, "!=", firm);
          return prev;
        }

        console.log("Found invoice:", invoice);
        console.log("Current paid status:", invoice.isPaid);

        return prev.map(inv => {
          if (inv.id === id) {
            const updatedInvoice = {
              ...inv,
              isPaid: !inv.isPaid
            };
            console.log("Updated paid status to:", updatedInvoice.isPaid);
            return updatedInvoice;
          }
          return inv;
        });
      });
    } catch (error) {
      console.error("Error toggling invoice paid status:", error);
    }
  }, [user?.firm]);

  const getInvoiceById = useCallback((id: string) => {
    return invoices.find(invoice => invoice.id === id);
  }, [invoices]);

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
    togglePaid,
    getInvoiceById,
    resetAllData
  };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}
