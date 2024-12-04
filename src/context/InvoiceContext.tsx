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
      console.error("Invalid required string fields:", { id: invoice.id, clientName: invoice.clientName, date: invoice.date });
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
        try {
          const newInvoices = Array.isArray(prevInvoices) ? prevInvoices : [];
          const combinedInvoices = [...newInvoices, normalizedInvoice];
          
          // Safe sorting function that handles potential invalid dates
          return combinedInvoices.sort((a, b) => {
            try {
              const dateA = new Date(a.date).getTime();
              const dateB = new Date(b.date).getTime();
              
              // Check for invalid dates
              if (isNaN(dateA) || isNaN(dateB)) {
                console.error('Invalid date found during sort:', { a: a.date, b: b.date });
                return 0; // Keep original order if dates are invalid
              }
              
              return dateB - dateA;
            } catch (error) {
              console.error('Error during invoice sort:', error);
              return 0; // Keep original order on error
            }
          });
        } catch (error) {
          console.error('Error processing invoices array:', error);
          return prevInvoices; // Return original array on error
        }
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
          } as Invoice;

          if (!isValidInvoice(updated)) {
            console.error("Invalid updated invoice:", updated);
            return invoice;
          }

          return normalizeInvoice(updated);
        })
      );
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  }, []);

  const togglePaid = useCallback((id: string) => {
    updateInvoice(id, { isPaid: true });
  }, [updateInvoice]);

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
