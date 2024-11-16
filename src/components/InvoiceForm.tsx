import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useInvoices } from "../context/InvoiceContext";
import { Plus, Euro, AlertCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { FirmType } from "../types";

interface FormData {
  clientName: string;
  amount: string;
  commissionPercentage: string;
  date: Date;
  invoicedByFirm: FirmType;
  referredByFirm: FirmType;
}

// Helper function to get available referring firms
const getReferringFirms = (currentFirm: FirmType): FirmType[] => {
  const allFirms: FirmType[] = ["SKALLARS", "MKMs", "Contax"];
  return allFirms.filter((firm) => firm !== currentFirm);
};

export default function InvoiceForm() {
  const { user } = useAuth();
  const { addInvoice } = useInvoices();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Initialize form with default values
  const [formData, setFormData] = useState<FormData>({
    clientName: "",
    amount: "",
    commissionPercentage: "10", // Default commission percentage
    date: new Date(),
    invoicedByFirm: user?.firm || "SKALLARS",
    referredByFirm: getReferringFirms(user?.firm || "SKALLARS")[0], // Default to first available referring firm
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.clientName.trim()) {
      setError("Client name is required");
      return;
    }

    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      const newInvoice = {
        id: Date.now().toString(),
        clientName: formData.clientName.trim(),
        amount: Number(formData.amount),
        commissionPercentage: Number(formData.commissionPercentage),
        date: formData.date.toISOString(),
        invoicedByFirm: formData.invoicedByFirm,
        referredByFirm: formData.referredByFirm,
        isPaid: false,
      };

      addInvoice(newInvoice);
      setSuccess(true);

      // Reset form but keep the default values
      setFormData((prev) => ({
        ...prev,
        clientName: "",
        amount: "",
        commissionPercentage: "10", // Keep default commission
        date: new Date(),
      }));

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to create invoice. Please try again.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  if (!user) return null;

  const referringFirms = getReferringFirms(user.firm);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
          Invoice created successfully!
        </div>
      )}

      {/* Client Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client Name
        </label>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter client name"
        />
      </div>

      {/* Amount and Commission Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (€)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Euro className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commission % (Default: 10%)
          </label>
          <input
            type="number"
            name="commissionPercentage"
            value={formData.commissionPercentage}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="10"
            step="0.1"
            min="0"
            max="100"
          />
        </div>
      </div>

      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Invoice Date
        </label>
        <DatePicker
          selected={formData.date}
          onChange={(date: Date) => setFormData((prev) => ({ ...prev, date }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          dateFormat="dd/MM/yyyy"
        />
      </div>

      {/* Firm Selection Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoiced By
          </label>
          <input
            type="text"
            value={user.firm}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referred By
          </label>
          <select
            name="referredByFirm"
            value={formData.referredByFirm}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            {referringFirms.map((firm) => (
              <option key={firm} value={firm}>
                {firm}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        Create Invoice
      </button>
    </form>
  );
}
