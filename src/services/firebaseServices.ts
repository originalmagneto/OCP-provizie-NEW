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
} from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Invoice, SettlementStatus, FirmType, Client } from '../types/index';

// Collection references
const invoicesCollection = collection(db, 'invoices');
const clientsCollection = collection(db, 'clients');
const settlementsCollection = collection(db, 'settlements');
const firmsCollection = collection(db, 'firms');

// Invoice services
export const invoiceServices = {
  getInvoices: async () => {
    const snapshot = await getDocs(invoicesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Invoice[];
  },

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

  addInvoice: async (invoice: Omit<Invoice, 'id'>) => {
    await addDoc(invoicesCollection, invoice);
  },

  updateInvoice: async (id: string, data: Partial<Invoice>) => {
    const invoiceRef = doc(invoicesCollection, id);
    await updateDoc(invoiceRef, data);
  },

  deleteInvoice: async (id: string) => {
    const invoiceRef = doc(invoicesCollection, id);
    await deleteDoc(invoiceRef);
  },

  togglePaid: async (id: string, isPaid: boolean) => {
    const invoiceRef = doc(invoicesCollection, id);
    await updateDoc(invoiceRef, { isPaid });
  }
};

// Client services
export const clientServices = {
  // Get client by name
  getClientByName: async (name: string) => {
    const clientRef = doc(clientsCollection, name.toLowerCase());
    const clientDoc = await getDoc(clientRef);
    if (clientDoc.exists()) {
      return { id: clientDoc.id, ...clientDoc.data() };
    }
    return null;
  },

  // Add or update client
  upsertClient: async (name: string, data: {
    belongsTo: FirmType;
    lastInvoiceDate: Date;
  }) => {
    const clientRef = doc(clientsCollection, name.toLowerCase());
    await setDoc(clientRef, {
      name,
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  // Get all clients for a firm
  getClientsByFirm: async (firm: FirmType) => {
    const q = query(
      clientsCollection,
      where('belongsTo', '==', firm),
      orderBy('name')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Search clients
  searchClients: async (searchTerm: string) => {
    const snapshot = await getDocs(clientsCollection);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Client))
      .filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
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

// Firm services for handling logos
export const firmServices = {
  getFirm: async (firm: FirmType) => {
    const docRef = doc(firmsCollection, firm);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  },
  upsertFirmLogo: async (firm: FirmType, file: File) => {
    const storageRef = ref(storage, `firmLogos/${firm}`);
    await uploadBytes(storageRef, file);
    const logoUrl = await getDownloadURL(storageRef);
    const docRef = doc(firmsCollection, firm);
    await setDoc(docRef, { logoUrl }, { merge: true });
    return logoUrl;
  }
};