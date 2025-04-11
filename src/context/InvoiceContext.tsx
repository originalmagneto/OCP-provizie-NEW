import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { Invoice } from "../types";
import { db } from "../config/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { invoiceServices } from "../services/firebaseServices";
import { useAuth } from "./AuthContext";

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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    if (!user) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const q = query(collection(db, "invoices"), orderBy("date", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isMounted) return;

        try {
          const validInvoices: Invoice[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            const invoice = { ...data, id: doc.id };
            
            if (isValidInvoice(invoice)) {
              validInvoices.push(invoice);
            } else {
              console.warn(`Invalid invoice data for document ${doc.id}:`, data);
            }
          });

          setInvoices(validInvoices);
        } catch (error) {
          console.error("Error processing invoices:", error);
          setInvoices([]);
        } finally {
          setIsLoading(false);
        }
      }, (error) => {
        if (!isMounted) return;
        console.error("Error fetching invoices:", error);
        setInvoices([]);
        setIsLoading(false);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (error) {
      if (isMounted) {
        console.error("Error setting up invoice listener:", error);
        setInvoices([]);
        setIsLoading(false);
      }
    }
  }, [user]);

  const addInvoice = useCallback(async (invoice: Invoice) => {
    if (!isValidInvoice(invoice)) {
      console.error("Invalid invoice data:", invoice);
      return;
    }

    try {
      // The actual invoice will be added via the Firestore listener
      await invoiceServices.addInvoice(invoice);
    } catch (error) {
      console.error("Error adding invoice to Firestore:", error);
    }
  }, []);

  const removeInvoice = useCallback(async (id: string) => {
    try {
      await invoiceServices.deleteInvoice(id);
      // The invoice will be removed via the Firestore listener
    } catch (error) {
      console.error("Error removing invoice from Firestore:", error);
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, updatedInvoice: Partial<Invoice>) => {
    try {
      await invoiceServices.updateInvoice(id, updatedInvoice);
      // The invoice will be updated via the Firestore listener
    } catch (error) {
      console.error("Error updating invoice in Firestore:", error);
    }
  }, []);

  const togglePaid = useCallback(async (id: string) => {
    try {
      // Find the current invoice to get its isPaid status
      const invoice = invoices.find(inv => inv.id === id);
      if (invoice) {
        await invoiceServices.togglePaid(id, !invoice.isPaid);
        // The invoice will be updated via the Firestore listener
      }
    } catch (error) {
      console.error("Error toggling invoice paid status in Firestore:", error);
    }
  }, [invoices]);

  const resetAllData = useCallback(async () => {
    try {
      // This would require admin privileges in a real app
      // For now, we'll just log a message
      console.log("Reset all data requested - this would require admin privileges");
      // In a real implementation, you might call a Cloud Function to handle this
    } catch (error) {
      console.error("Error resetting data in Firestore:", error);
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
