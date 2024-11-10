import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import type { FirmType } from "../types";

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  invoicedByFirm: FirmType;
  referredByFirm: FirmType;
  commissionPercentage: number;
  date: string;
  isPaid: boolean;
}

interface QuarterlyPayment {
  id: string; // Format: "2024-Q1-SKALLARS-to-MKMs"
  fromFirm: FirmType;
  toFirm: FirmType;
  amount: number;
  isPaid: boolean;
  paidDate?: string;
  quarter: string;
  year: number;
}

interface InvoiceContextType {
  invoices: Invoice[];
  quarterlyPayments: QuarterlyPayment[];
  addInvoice: (invoiceData: Omit<Invoice, "id" | "invoicedByFirm">) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  updateQuarterlyPayment: (paymentId: string, isPaid: boolean) => void;
  resetAllData: () => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

function calculateQuarterlyPayments(invoices: Invoice[]): QuarterlyPayment[] {
  const quarterlyData: Record<string, QuarterlyPayment> = {};

  invoices.forEach((invoice) => {
    if (!invoice.isPaid) return;
    if (invoice.referredByFirm === invoice.invoicedByFirm) return;

    const date = new Date(invoice.date);
    const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
    const year = date.getFullYear();
    const paymentId = `${year}-${quarter}-${invoice.invoicedByFirm}-to-${invoice.referredByFirm}`;
    const commission = invoice.amount * (invoice.commissionPercentage / 100);

    if (!quarterlyData[paymentId]) {
      quarterlyData[paymentId] = {
        id: paymentId,
        fromFirm: invoice.invoicedByFirm,
        toFirm: invoice.referredByFirm,
        amount: 0,
        isPaid: false,
        quarter,
        year,
      };
    }

    quarterlyData[paymentId].amount += commission;
  });

  return Object.values(quarterlyData).sort((a, b) => {
    // Sort by year and quarter, most recent first
    if (a.year !== b.year) return b.year - a.year;
    return b.quarter.localeCompare(a.quarter);
  });
}

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem("invoices");
      return saved ? JSON.parse(saved) : [];
    } catch {
      console.warn("Failed to load invoices from localStorage");
      return [];
    }
  });

  const [quarterlyPayments, setQuarterlyPayments] = useState<
    QuarterlyPayment[]
  >([]);
  const { user } = useAuth();

  // Recalculate quarterly payments when invoices change
  useEffect(() => {
    const payments = calculateQuarterlyPayments(invoices);

    // Preserve payment status from existing payments
    const updatedPayments = payments.map((payment) => {
      const existing = quarterlyPayments.find((p) => p.id === payment.id);
      return existing ? { ...payment, isPaid: existing.isPaid } : payment;
    });

    setQuarterlyPayments(updatedPayments);
  }, [invoices]);

  // Save invoices to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("invoices", JSON.stringify(invoices));
    } catch (error) {
      console.error("Failed to save invoices to localStorage:", error);
    }
  }, [invoices]);

  // Save quarterly payments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "quarterlyPayments",
        JSON.stringify(quarterlyPayments),
      );
    } catch (error) {
      console.error(
        "Failed to save quarterly payments to localStorage:",
        error,
      );
    }
  }, [quarterlyPayments]);

  const addInvoice = (invoiceData: Omit<Invoice, "id" | "invoicedByFirm">) => {
    if (!user) return;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      invoicedByFirm: user.firm,
      isPaid: false,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updates } : invoice,
      ),
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
  };

  const updateQuarterlyPayment = (paymentId: string, isPaid: boolean) => {
    setQuarterlyPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              isPaid,
              paidDate: isPaid ? new Date().toISOString() : undefined,
            }
          : payment,
      ),
    );
  };

  const resetAllData = () => {
    setInvoices([]);
    setQuarterlyPayments([]);
    try {
      localStorage.removeItem("invoices");
      localStorage.removeItem("quarterlyPayments");
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  };

  const value = {
    invoices,
    quarterlyPayments,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateQuarterlyPayment,
    resetAllData,
  };

  return (
    <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoices must be used within an InvoiceProvider");
  }
  return context;
}
