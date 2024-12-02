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
    if (invoices && invoices.length > 0) {
      const uniqueClients = Array.from(
        new Set(invoices.map((invoice) => invoice.clientName))
      ).filter(Boolean);
      setClientHistory(prev => {
        // Only update if there are new clients
        const newClients = uniqueClients.filter(client => !prev.includes(client));
        return newClients.length > 0 ? [...prev, ...newClients] : prev;
      });
    }
  }, [invoices]);

  const addClient = (clientName: string) => {
    if (clientName && !clientHistory.includes(clientName)) {
      setClientHistory(prev => [...prev, clientName]);
    }
  };

  // Simple fuzzy search implementation
  const searchClients = (query: string): string[] => {
    if (!query) return [];
    const normalizedQuery = query.toLowerCase();
    return clientHistory.filter((client) =>
      client.toLowerCase().includes(normalizedQuery)
    );
  };

  const value = {
    clientHistory,
    addClient,
    searchClients
  };

  return (
    <ClientContext.Provider value={value}>
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
