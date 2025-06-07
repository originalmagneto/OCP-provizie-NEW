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
  const [formError, setFormError] = useState<string | null>(null);

  const firms: FirmType[] = ["SKALLARS", "MKMs", "Contax"];
  const availableReferrers = firms.filter((firm) => firm !== user?.firm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors

    try {
      // Client Name Validation
      if (!formData.clientName.trim()) {
        setFormError("Client name cannot be empty.");
        return;
      }

      const amount = parseFloat(formData.amount);
      const commissionPercentage = parseFloat(formData.commissionPercentage);

      // Amount Validation
      if (isNaN(amount) || amount <= 0) {
        setFormError("Please enter a valid positive amount for the invoice.");
        return;
      }

      // Commission Validation (allowing 0%)
      if (isNaN(commissionPercentage) || commissionPercentage < 0) {
        setFormError("Please enter a valid, non-negative commission percentage.");
        return;
      }

      // Create invoice without ID - Firebase will generate one
      // Extract initials from user's name (e.g., Marián Čuprík → MČ)
      let userInitials = undefined;
      if (user?.name) {
        userInitials = user.name
          .split(' ')
          .map(part => part[0]?.toUpperCase() || '')
          .join('');
      }
      const invoiceData: Omit<Invoice, 'id'> & { invoicedByUserInitials?: string } = {
        clientName: formData.clientName,
        amount,
        commissionPercentage,
        date: new Date(formData.invoiceDate).toISOString(),
        invoicedByFirm: user?.firm || "SKALLARS",
        referredByFirm: formData.referredByFirm,
        isPaid: false,
        ...(userInitials ? { invoicedByUserInitials: userInitials } : {}),
      };


      if (formData.comment?.trim()) {
        (invoiceData as any).comment = formData.comment.trim();
      }

      await addInvoice(invoiceData);
      setFormData(INITIAL_FORM_DATA(user?.firm || "SKALLARS"));
      // setFormError(null); // Already cleared at the start, and form reset implies success
    } catch (err) {
      console.error("Error creating invoice:", err);
      setFormError("An unexpected error occurred while creating the invoice. Please check your connection and try again.");
    }
  };

  return (
    <>
      {/* Show current user and firm at the top of the form */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Creating as <span className="font-semibold">{user?.name}</span> (<span className="font-semibold">{user?.firm}</span>)
      </div>
      {formError && <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-400 p-3 rounded-md dark:bg-red-800 dark:border-red-600 dark:text-red-300">{formError}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Invoice Date
          </label>
          <input
            type="date"
            value={formData.invoiceDate}
            onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 dark:color-scheme-dark"
          />
        </div>

      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount (€)
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Euro className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Commission % (Default: 10%)
          </label>
          <input
            type="number"
            value={formData.commissionPercentage}
            onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
            placeholder="10"
            step="0.1"
            min="0"
            max="100"
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Comments (Optional)
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
          rows={3}
          placeholder="Add any notes about this invoice..."
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-offset-gray-800 dark:focus:ring-indigo-400"
      >
        Create Invoice
      </button>
    </form>
    </>
  );
}
