import React, { createContext, useContext, useState, useEffect } from "react";
import type { Invoice } from "../types";

interface InvoiceContextType {
  invoices: Invoice[];
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
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const storedInvoices = localStorage.getItem("invoices");
      if (!storedInvoices) return [];

      const parsedInvoices = JSON.parse(storedInvoices);
      if (!Array.isArray(parsedInvoices)) return [];

      // Validate and sanitize each invoice
      return parsedInvoices.filter((invoice): invoice is Invoice => {
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
          !isNaN(new Date(invoice.date).getTime())
        );
      });
    } catch (error) {
      console.error("Error loading invoices from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("invoices", JSON.stringify(invoices));
    } catch (error) {
      console.error("Error saving invoices to localStorage:", error);
    }
  }, [invoices]);

  const addInvoice = (invoice: Invoice) => {
    if (!invoice || typeof invoice !== "object") {
      console.error("Invalid invoice object:", invoice);
      return;
    }

    setInvoices((prev) => {
      // Ensure we don't duplicate IDs
      if (prev.some((i) => i.id === invoice.id)) {
        console.error("Invoice with this ID already exists:", invoice.id);
        return prev;
      }
      return [...prev, invoice];
    });
  };

  const removeInvoice = (id: string) => {
    if (!id) {
      console.error("Invalid invoice ID for removal:", id);
      return;
    }
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
  };

  const updateInvoice = (id: string, updatedInvoice: Partial<Invoice>) => {
    if (!id || !updatedInvoice || typeof updatedInvoice !== "object") {
      console.error("Invalid update parameters:", { id, updatedInvoice });
      return;
    }

    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updatedInvoice } : invoice
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  const togglePaid = (id: string) => {
    if (!id) {
      console.error("Invalid invoice ID for toggle:", id);
      return;
    }

    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              isPaid: !invoice.isPaid,
              paidDate: !invoice.isPaid ? new Date().toISOString() : undefined,
            }
          : invoice
      )
    );
  };

  const resetAllData = () => {
    setInvoices([]);
    try {
      localStorage.removeItem("invoices");
    } catch (error) {
      console.error("Error resetting invoice data:", error);
    }
  };

  const value = {
    invoices,
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
