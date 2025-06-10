import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { firmServices } from '../services/firebaseServices';

export default function FirmLogoUploader() {
  const { user, updateLogo } = useAuth();
  const [uploading, setUploading] = useState(false);

  if (!user) return null;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const url = await firmServices.upsertFirmLogo(user.firm, e.target.files[0]);
      updateLogo(url);
    } catch (err) {
      console.error('Logo upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
      <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {uploading ? 'Uploading...' : 'Upload Logo'}
    </label>
  );
}
