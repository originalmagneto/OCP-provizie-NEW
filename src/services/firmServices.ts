import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { FirmType, FirmTheme } from '../types';

const firmsCollection = collection(db, 'firms');

export const firmServices = {
  getFirmConfig: async (firm: FirmType): Promise<FirmTheme | null> => {
    const firmRef = doc(firmsCollection, firm);
    const snap = await getDoc(firmRef);
    return snap.exists() ? (snap.data() as FirmTheme) : null;
  },

  updateFirmConfig: async (firm: FirmType, data: Partial<FirmTheme>) => {
    const firmRef = doc(firmsCollection, firm);
    await setDoc(firmRef, data, { merge: true });
  },

  uploadLogo: async (firm: FirmType, file: File): Promise<string> => {
    const storageRef = ref(storage, `logos/${firm}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await firmServices.updateFirmConfig(firm, { logoUrl: url });
    return url;
  },
};
