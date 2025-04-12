import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { clientServices } from '../services/firebaseServices';
import { useAuth } from './AuthContext';
import type { FirmType } from '../types';

interface Client {
  name: string;
  belongsTo: FirmType;
  lastInvoiceDate: Date;
}

interface ClientContextType {
  clientHistory: Client[];
  addClient: (client: Client) => Promise<void>;
  searchClients: (query: string) => Promise<string[]>;
  getClientDetails: (clientName: string) => Promise<Client | null>;
}

const defaultContext: ClientContextType = {
  clientHistory: [],
  addClient: async () => {},
  searchClients: async () => [],
  getClientDetails: async () => null,
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
  const [clientHistory, setClientHistory] = useState<Client[]>([]);

  useEffect(() => {
    if (!user) {
      setClientHistory([]);
      return;
    }

    const q = query(collection(db, "clients"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const clients = snapshot.docs.map(doc => ({
          name: doc.data().name,
          belongsTo: doc.data().belongsTo,
          lastInvoiceDate: doc.data().lastInvoiceDate?.toDate(),
        } as Client));
        setClientHistory(clients);
      } catch (error) {
        console.error("Error processing client data from Firestore:", error);
      }
    }, (error) => {
      console.error("Firestore client listener error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const addClient = async (client: Client) => {
    try {
      const clientRef = doc(db, "clients", client.name.toLowerCase());
      await setDoc(clientRef, {
        name: client.name,
        belongsTo: client.belongsTo,
        lastInvoiceDate: client.lastInvoiceDate,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error("Error adding client:", error);
      throw error;
    }
  };

  const searchClients = async (query: string): Promise<string[]> => {
    const lowercaseQuery = query.toLowerCase();
    return clientHistory
      .filter(client => client.name.toLowerCase().includes(lowercaseQuery))
      .map(client => client.name);
  };

  const getClientDetails = async (clientName: string): Promise<Client | null> => {
    try {
      const clientRef = doc(db, "clients", clientName.toLowerCase());
      const clientDoc = await getDoc(clientRef);
      
      if (clientDoc.exists()) {
        const data = clientDoc.data();
        return {
          name: data.name,
          belongsTo: data.belongsTo,
          lastInvoiceDate: data.lastInvoiceDate?.toDate(),
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting client details:", error);
      return null;
    }
  };

  const value = {
    clientHistory,
    addClient,
    searchClients,
    getClientDetails,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}
