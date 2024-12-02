import React, { createContext, useContext, useEffect, useState } from 'react';
import { useInvoices } from './InvoiceContext';

interface ClientContextType {
  clientHistory: string[];
  addClient: (clientName: string) => void;
  searchClients: (query: string) => string[];
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clientHistory, setClientHistory] = useState<string[]>([]);
  const { invoices } = useInvoices();

  // Initialize client history from existing invoices
  useEffect(() => {
    const uniqueClients = Array.from(
      new Set(invoices.map((invoice) => invoice.clientName))
    ).filter(Boolean);
    setClientHistory(uniqueClients);
  }, [invoices]);

  const addClient = (clientName: string) => {
    if (!clientHistory.includes(clientName)) {
      setClientHistory((prev) => [...prev, clientName]);
    }
  };

  // Simple fuzzy search implementation
  const searchClients = (query: string): string[] => {
    const normalizedQuery = query.toLowerCase();
    return clientHistory.filter((client) =>
      client.toLowerCase().includes(normalizedQuery)
    );
  };

  return (
    <ClientContext.Provider value={{ clientHistory, addClient, searchClients }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
}
