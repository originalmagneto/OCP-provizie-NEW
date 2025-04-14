import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useInvoices } from "../context/InvoiceContext";
import { useClient } from "../context/ClientContext";
import { Euro } from "lucide-react";
import type { FirmType, Invoice } from "../types";
import CustomDropdown from "./common/CustomDropdown";
import AutocompleteInput from "./common/AutocompleteInput";

interface FormData {
  clientName: string;
  amount: string;
  commissionPercentage: string;
  referredByFirm: FirmType;
  invoiceDate: string;
  comment?: string;
}

const INITIAL_FORM_DATA = (userFirm: FirmType): FormData => {
  const firms: FirmType[] = ["SKALLARS", "MKMs", "Contax"];
  const availableReferrers = firms.filter((firm) => firm !== userFirm);

  return {
    clientName: "",
    amount: "",
    commissionPercentage: "10",
    referredByFirm: availableReferrers[0],
    invoiceDate: new Date().toISOString().split('T')[0],
    comment: "",
  };
};

export default function InvoiceForm() {
  const { user } = useAuth();
  const { addInvoice } = useInvoices();
  const { searchClients } = useClient();
  const [formData, setFormData] = useState<FormData>(() =>
    INITIAL_FORM_DATA(user?.firm || "SKALLARS"),
  );

  const firms: FirmType[] = ["SKALLARS", "MKMs", "Contax"];
  const availableReferrers = firms.filter((firm) => firm !== user?.firm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const amount = parseFloat(formData.amount);
      const commissionPercentage = parseFloat(formData.commissionPercentage);

      if (isNaN(amount) || amount <= 0) {
        return;
      }

      if (isNaN(commissionPercentage) || commissionPercentage <= 0) {
        return;
      }

      // Create invoice without ID - Firebase will generate one
      const invoiceData: Omit<Invoice, 'id'> = {
        clientName: formData.clientName,
        amount,
        commissionPercentage,
        date: new Date(formData.invoiceDate).toISOString(),
        invoicedByFirm: user?.firm || "SKALLARS",
        referredByFirm: formData.referredByFirm,
        isPaid: false,
      };

      if (formData.comment?.trim()) {
        (invoiceData as any).comment = formData.comment.trim();
      }

      await addInvoice(invoiceData);
      setFormData(INITIAL_FORM_DATA(user?.firm || "SKALLARS"));
    } catch (err) {
      console.error("Error creating invoice:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Client Name
        </label>
        <AutocompleteInput
          value={formData.clientName}
          onChange={(clientName) => setFormData(prev => ({ ...prev, clientName }))}
          onSearch={searchClients}
          placeholder="Enter client name..."
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Invoice Date
          </label>
          <input
            type="date"
            value={formData.invoiceDate}
            onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Referred By
          </label>
          <CustomDropdown
            value={formData.referredByFirm}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                referredByFirm: value as FirmType,
              }))
            }
            options={availableReferrers.map(firm => ({ value: firm, label: firm }))}
            icon={null}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount (€)
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Euro className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Commission % (Default: 10%)
          </label>
          <input
            type="number"
            value={formData.commissionPercentage}
            onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="10"
            step="0.1"
            min="0"
            max="100"
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">
            Referred By
          </label>
          <CustomDropdown
            value={formData.referredByFirm}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                referredByFirm: value as FirmType,
              }))
            }
            options={availableReferrers.map(firm => ({ value: firm, label: firm }))}
            icon={null}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Comments (Optional)
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          placeholder="Add any notes about this invoice..."
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        Create Invoice
      </button>
    </form>
  );
}
