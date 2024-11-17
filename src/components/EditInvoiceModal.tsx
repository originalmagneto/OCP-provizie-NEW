import React, { useState } from "react";
import { X } from "lucide-react";
import CustomDropdown from "./common/CustomDropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { FirmType } from "../types";

interface EditInvoiceModalProps {
  invoice: any;
  onClose: () => void;
  onSave: (updatedInvoice: any) => void;
  userFirm: FirmType;
}

export default function EditInvoiceModal({
  invoice,
  onClose,
  onSave,
  userFirm,
}: EditInvoiceModalProps) {
  const [formData, setFormData] = useState({
    clientName: invoice.clientName,
    amount: invoice.amount,
    commissionPercentage: invoice.commissionPercentage,
    date: new Date(invoice.date),
    referredByFirm: invoice.referredByFirm,
  });

  const firms: FirmType[] = ["SKALLARS", "MKMs", "Contax"];
  const availableReferrers = firms.filter((firm) => firm !== userFirm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...invoice,
      ...formData,
      date: formData.date.toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Edit Invoice</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, clientName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (€)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission %
            </label>
            <input
              type="number"
              value={formData.commissionPercentage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  commissionPercentage: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <DatePicker
              selected={formData.date}
              onChange={(date: Date) =>
                setFormData((prev) => ({ ...prev, date }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <div>
            <CustomDropdown
              label="Referred By"
              value={formData.referredByFirm}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  referredByFirm: value as FirmType,
                }))
              }
              options={availableReferrers}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
