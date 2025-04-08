import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { clientServices } from '../services/firebaseServices';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [clientHistory, setClientHistory] = useState<string[]>([]);

  // Set up real-time listener for clients
  useEffect(() => {
    if (!user) {
      setClientHistory([]);
      return;
    }
    // Create a query to get clients
    const q = query(collection(db, "clients"), orderBy("name"));
    
    // Set up the listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const clients = snapshot.docs.map(doc => doc.data().name as string);
        setClientHistory(clients);
      } catch (error) {
        console.error("Error processing client data from Firestore:", error);
      }
    }, (error) => {
      console.error("Firestore client listener error:", error);
    });
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, [user]); // Add user as a dependency

  const addClient = async (clientName: string) => {
    if (clientName) {
      try {
        await clientServices.addClient(clientName);
        // The client will be added via the Firestore listener
      } catch (error) {
        console.error("Error adding client to Firestore:", error);
      }
    }
  };

  const searchClients = async (query: string): Promise<string[]> => {
    if (!query) return [];
    
    try {
      // For immediate results, we can filter the local state
      const normalizedQuery = query.toLowerCase();
      const localResults = clientHistory.filter((client) =>
        client.toLowerCase().includes(normalizedQuery)
      );
      
      // For a more comprehensive search, we could use Firestore
      // This is a simplified implementation
      return localResults;
    } catch (error) {
      console.error("Error searching clients:", error);
      return [];
    }
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
