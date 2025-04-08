// Firebase services for handling data operations
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  setDoc,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Invoice, SettlementStatus, FirmType } from '../types';

// Collection references
const invoicesCollection = collection(db, 'invoices');
const clientsCollection = collection(db, 'clients');
const settlementsCollection = collection(db, 'settlements');

// Invoice services
export const invoiceServices = {
  // Get all invoices
  getInvoices: async () => {
    const snapshot = await getDocs(invoicesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Invoice[];
  },

  // Get invoices by firm
  getInvoicesByFirm: async (firm: FirmType) => {
    const q = query(
      invoicesCollection, 
      where('invoicedByFirm', '==', firm),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Invoice[];
  },

  // Add a new invoice
  addInvoice: async (invoice: Omit<Invoice, 'id'>) => {
    const docRef = await addDoc(invoicesCollection, {
      ...invoice,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update an invoice
  updateInvoice: async (id: string, data: Partial<Invoice>) => {
    const docRef = doc(db, 'invoices', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // Delete an invoice
  deleteInvoice: async (id: string) => {
    const docRef = doc(db, 'invoices', id);
    await deleteDoc(docRef);
  },

  // Toggle paid status
  togglePaid: async (id: string, isPaid: boolean) => {
    const docRef = doc(db, 'invoices', id);
    await updateDoc(docRef, {
      isPaid,
      updatedAt: serverTimestamp(),
      paidAt: isPaid ? serverTimestamp() : null
    });
  }
};

// Client services
export const clientServices = {
  // Get all clients
  getClients: async () => {
    const snapshot = await getDocs(clientsCollection);
    return snapshot.docs.map(doc => doc.data().name as string);
  },

  // Add a new client
  addClient: async (clientName: string) => {
    // Check if client already exists
    const q = query(clientsCollection, where('name', '==', clientName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(clientsCollection, {
        name: clientName,
        createdAt: serverTimestamp()
      });
    }
  },

  // Search clients
  searchClients: async (query: string) => {
    // In a real implementation, you would use a more sophisticated search
    // For now, we'll just get all clients and filter on the client side
    const snapshot = await getDocs(clientsCollection);
    const clients = snapshot.docs.map(doc => doc.data().name as string);
    
    if (!query) return [];
    const normalizedQuery = query.toLowerCase();
    return clients.filter(client => 
      client.toLowerCase().includes(normalizedQuery)
    );
  }
};

// Settlement services
export const settlementServices = {
  // Get all settlements
  getSettlements: async () => {
    const snapshot = await getDocs(settlementsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (SettlementStatus & { id: string })[];
  },

  // Check if quarter is settled
  isQuarterSettled: async (quarterKey: string, firm: FirmType) => {
    const q = query(
      settlementsCollection, 
      where('quarterKey', '==', quarterKey),
      where('settledBy', '==', firm)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty && snapshot.docs[0].data().isSettled;
  },

  // Settle a quarter
  settleQuarter: async (quarterKey: string, firm: FirmType) => {
    // Check if settlement already exists
    const q = query(
      settlementsCollection, 
      where('quarterKey', '==', quarterKey),
      where('settledBy', '==', firm)
    );
    const snapshot = await getDocs(q);
    
    const settlementData = {
      quarterKey,
      isSettled: true,
      settledAt: new Date().toISOString(),
      settledBy: firm,
      updatedAt: serverTimestamp()
    };

    if (snapshot.empty) {
      // Create new settlement
      await addDoc(settlementsCollection, {
        ...settlementData,
        createdAt: serverTimestamp()
      });
    } else {
      // Update existing settlement
      const docRef = doc(db, 'settlements', snapshot.docs[0].id);
      await updateDoc(docRef, settlementData);
    }
  },

  // Unsettle a quarter
  unsettleQuarter: async (quarterKey: string, firm: FirmType) => {
    const q = query(
      settlementsCollection, 
      where('quarterKey', '==', quarterKey),
      where('settledBy', '==', firm)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docRef = doc(db, 'settlements', snapshot.docs[0].id);
      await deleteDoc(docRef);
    }
  }
};