import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { firmServices } from '../services/firmServices';
import type { FirmTheme } from '../types';

export default function AdminFirmSettings() {
  const { user } = useAuth();
  const { theme, refresh } = useTheme();
  const [form, setForm] = useState<FirmTheme | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    if (theme) setForm(theme);
  }, [theme]);

  if (!user || !form) return null;

  const handleSave = async () => {
    if (logoUrl.trim()) {
      form.logoUrl = logoUrl.trim();
    }
    await firmServices.updateFirmConfig(user.firm, form);
    await refresh();
    alert('Settings saved');
  };

  const updateField = (field: keyof FirmTheme, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-lg font-medium">Firm Settings</h2>
      {form.logoUrl && (
        <img src={form.logoUrl} alt="logo" className="h-12" />
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
        <input
          type="url"
          placeholder="https://example.com/logo.png"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-sm text-gray-500 mt-1">Enter a direct link to your logo image</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Primary</label>
          <input
            type="color"
            value={form.primary}
            onChange={(e) => updateField('primary', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Secondary</label>
          <input
            type="color"
            value={form.secondary}
            onChange={(e) => updateField('secondary', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Text</label>
          <input
            type="color"
            value={form.text}
            onChange={(e) => updateField('text', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Accent</label>
          <input
            type="color"
            value={form.accent}
            onChange={(e) => updateField('accent', e.target.value)}
          />
        </div>
      </div>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded"
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  );
}
