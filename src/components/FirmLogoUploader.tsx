import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { firmServices } from '../services/firebaseServices';
import { getDominantColorFromFile } from '../lib/color';
import { Button } from './ui/Button';

export default function FirmLogoUploader() {
  const { user, updateLogo, updateAccentColor } = useAuth();
  const [uploading, setUploading] = useState(false);

  if (!user) return null;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const color = await getDominantColorFromFile(e.target.files[0]);
      const url = await firmServices.upsertFirmLogo(user.firm, e.target.files[0], color);
      updateLogo(url);
      updateAccentColor(color);
    } catch (err) {
      console.error('Logo upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Button asChild className="cursor-pointer bg-gray-600 hover:bg-gray-700">
      <label>
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
        {uploading ? 'Uploading...' : 'Upload Logo'}
      </label>
    </Button>
  );
}
