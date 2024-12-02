import React, { createContext, useContext, useEffect, useState } from 'react';

interface ClientContextType {
  clientHistory: string[];
  addClient: (clientName: string) => void;
  searchClients: (query: string) => string[];
}

const defaultContext: ClientContextType = {
  clientHistory: [],
  addClient: () => {},
  searchClients: () => [],
};

const ClientContext = createContext<ClientContextType>(defaultContext);

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clientHistory, setClientHistory] = useState<string[]>([]);

  // Load client history from localStorage
  useEffect(() => {
    try {
      const storedClients = localStorage.getItem('clientHistory');
      if (storedClients) {
        const parsedClients = JSON.parse(storedClients);
        if (Array.isArray(parsedClients)) {
          setClientHistory(parsedClients);
        }
      }
    } catch (error) {
      console.error('Error loading client history:', error);
    }
  }, []);

  // Save client history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('clientHistory', JSON.stringify(clientHistory));
    } catch (error) {
      console.error('Error saving client history:', error);
    }
  }, [clientHistory]);

  const addClient = (clientName: string) => {
    if (clientName && !clientHistory.includes(clientName)) {
      setClientHistory(prev => [...prev, clientName]);
    }
  };

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
