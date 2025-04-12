import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useInvoices } from "../context/InvoiceContext";
import { useClient } from "../context/ClientContext";
import { Euro } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { FirmType, Invoice } from "../types";
import CustomDropdown from "./common/CustomDropdown";
import AutocompleteInput from "./common/AutocompleteInput";

interface FormData {
  clientName: string;
  amount: string;
  commissionPercentage: string;
  date: Date;
  invoicedByFirm: FirmType;
  referredByFirm: FirmType;
  clientBelongsTo: FirmType;
}

const INITIAL_FORM_DATA = (userFirm: FirmType): FormData => {
  const firms: FirmType[] = ["SKALLARS", "MKMs", "Contax"];
  const availableReferrers = firms.filter((firm) => firm !== userFirm);

  return {
    clientName: "",
    amount: "",
    commissionPercentage: "10",
    date: new Date(),
    invoicedByFirm: userFirm,
    referredByFirm: availableReferrers[0],
    clientBelongsTo: userFirm,
  };
};

export default function InvoiceForm() {
  const { user } = useAuth();
  const { addInvoice } = useInvoices();
  const { addClient, searchClients, getClientDetails } = useClient();
  const [formData, setFormData] = useState<FormData>(() =>
    INITIAL_FORM_DATA(user?.firm || "SKALLARS"),
  );
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const firms: FirmType[] = ["SKALLARS", "MKMs", "Contax"];
  const availableReferrers = firms.filter((firm) => firm !== user?.firm);

  const handleClientSelect = async (clientName: string) => {
    setFormData(prev => ({ ...prev, clientName }));
    const clientDetails = await getClientDetails(clientName);
    if (clientDetails) {
      setSelectedClient(clientDetails);
      setFormData(prev => ({
        ...prev,
        clientBelongsTo: clientDetails.belongsTo,
      }));
    } else {
      setSelectedClient(null);
    }
  };

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

      // Add or update client information
      await addClient({
        name: formData.clientName,
        belongsTo: formData.clientBelongsTo,
        lastInvoiceDate: formData.date
      });

      // Create invoice without ID - we need to omit it since Firebase will generate one
      const invoiceData: Omit<Invoice, 'id'> = {
        clientName: formData.clientName,
        amount,
        commissionPercentage,
        date: formData.date.toISOString(),
        invoicedByFirm: formData.invoicedByFirm,
        referredByFirm: formData.referredByFirm,
        isPaid: false,
      };

      await addInvoice(invoiceData);
      setFormData(INITIAL_FORM_DATA(user?.firm || "SKALLARS"));
    } catch (err) {
      console.error("Error creating invoice:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client Name
          </label>
          <AutocompleteInput
            value={formData.clientName}
            onChange={handleClientSelect}
            onSearch={searchClients}
            placeholder="Enter client name..."
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client Belongs To
          </label>
          <CustomDropdown
            value={formData.clientBelongsTo}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                clientBelongsTo: value as FirmType,
              }))
            }
            options={firms.map(firm => ({ value: firm, label: firm }))}
            icon={null}
          />
          {selectedClient && (
            <p className="mt-1 text-sm text-gray-500">
              Existing client of {selectedClient.belongsTo}
            </p>
          )}
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
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
              value={formData.commissionPercentage}
              onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="10"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Date
          </label>
          <DatePicker
            selected={formData.date}
            onChange={(date: Date | null) => date && setFormData(prev => ({ ...prev, date }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            dateFormat="dd/MM/yyyy"
          />
        </div>

        {/* Firm Selection Row */}
        <div className="grid grid-cols-2 gap-4">
          <CustomDropdown
            value={user?.firm || "SKALLARS"}
            onChange={() => {}}
            options={firms.map(firm => ({ value: firm, label: firm }))}
            disabled={true}
            icon={null}
          />

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

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Create Invoice
        </button>
      </div>
    </form>
  );
}
