import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import CustomDropdown from "./common/CustomDropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { FirmType, Invoice } from "../types";
import { useClient } from "../context/ClientContext";

interface EditInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSave: (updatedInvoice: Partial<Invoice>) => void;
  userFirm: FirmType;
}

export default function EditInvoiceModal({
  invoice,
  onClose,
  onSave,
  userFirm,
}: EditInvoiceModalProps) {
  const { getClientDetails, addClient } = useClient();
  const [formData, setFormData] = useState({
    clientName: invoice.clientName,
    amount: invoice.amount,
    commissionPercentage: invoice.commissionPercentage,
    date: new Date(invoice.date),
    referredByFirm: invoice.referredByFirm,
    clientBelongsTo: userFirm, // Default to user's firm
  });

  const firms: FirmType[] = ["SKALLARS", "MKMs", "Contax"];
  const availableReferrers = firms.filter((firm) => firm !== userFirm);

  // Load client details when modal opens
  useEffect(() => {
    const loadClientDetails = async () => {
      const clientDetails = await getClientDetails(invoice.clientName);
      if (clientDetails) {
        setFormData(prev => ({
          ...prev,
          clientBelongsTo: clientDetails.belongsTo
        }));
      }
    };
    loadClientDetails();
  }, [invoice.clientName, getClientDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update client ownership
    await addClient({
      name: formData.clientName,
      belongsTo: formData.clientBelongsTo,
      lastInvoiceDate: formData.date
    });

    // Update invoice
    onSave({
      ...invoice,
      ...formData,
      date: formData.date.toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 dark:bg-gray-800 dark:border dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium dark:text-gray-100">Edit Invoice</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Client Name
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) =>
                setFormData({ ...formData, clientName: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Client Belongs To
            </label>
            <CustomDropdown
              value={formData.clientBelongsTo}
              onChange={(value) =>
                setFormData({ ...formData, clientBelongsTo: value as FirmType })
              }
              options={firms.map(firm => ({ value: firm, label: firm }))}
              icon={null}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount (€)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Commission Percentage
            </label>
            <input
              type="number"
              value={formData.commissionPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  commissionPercentage: parseFloat(e.target.value),
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            <DatePicker
              selected={formData.date}
              onChange={(date: Date | null) => date && setFormData({ ...formData, date })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:color-scheme-dark dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Referred By
            </label>
            <CustomDropdown
              value={formData.referredByFirm}
              onChange={(value) =>
                setFormData({ ...formData, referredByFirm: value as FirmType })
              }
              options={availableReferrers.map(firm => ({ value: firm, label: firm }))}
              icon={null}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-offset-gray-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
