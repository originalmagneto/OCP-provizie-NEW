import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useInvoices } from "../context/InvoiceContext";
import {
  PlusCircle,
  Euro,
  Search,
  Building,
  Calendar,
  Percent,
  ChevronDown,
} from "lucide-react";
import type { FirmType } from "../types";

interface FormData {
  clientName: string;
  amount: string;
  referredByFirm: FirmType;
  commissionPercentage: string;
  date: string;
}

export default function InvoiceForm() {
  const { user } = useAuth();
  const { invoices, addInvoice } = useInvoices();
  const [formData, setFormData] = useState<FormData>({
    clientName: "",
    amount: "",
    referredByFirm: "SKALLARS" as FirmType,
    commissionPercentage: "10",
    date: new Date().toISOString().split("T")[0],
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Get unique client names from existing invoices
  const clientSuggestions = [
    ...new Set(
      invoices
        .map((invoice) => invoice.clientName)
        .filter(
          (name) =>
            name.toLowerCase().includes(formData.clientName.toLowerCase()) &&
            formData.clientName.length > 0,
        ),
    ),
  ].slice(0, 5); // Limit to 5 suggestions

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    const commission = parseFloat(formData.commissionPercentage);
    if (!commission || commission <= 0 || commission > 100) {
      newErrors.commissionPercentage = "Commission must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await addInvoice({
        clientName: formData.clientName,
        amount: parseFloat(formData.amount),
        referredByFirm: formData.referredByFirm,
        commissionPercentage: parseFloat(formData.commissionPercentage),
        date: formData.date,
      });

      // Reset form
      setFormData({
        clientName: "",
        amount: "",
        referredByFirm: "SKALLARS",
        commissionPercentage: "10",
        date: new Date().toISOString().split("T")[0],
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCommission = () => {
    const amount = parseFloat(formData.amount) || 0;
    const commission = parseFloat(formData.commissionPercentage) || 0;
    return (amount * commission) / 100;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative" ref={suggestionRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client Name
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                clientName: e.target.value,
              }));
              setShowSuggestions(true);
              setErrors((prev) => ({ ...prev, clientName: "" }));
            }}
            onFocus={() => setShowSuggestions(true)}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
              errors.clientName
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
            placeholder="Enter client name"
          />
        </div>
        {errors.clientName && (
          <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
        )}

        {showSuggestions && clientSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
            {clientSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, clientName: suggestion }));
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (€)
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Euro className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, amount: e.target.value }));
              setErrors((prev) => ({ ...prev, amount: "" }));
            }}
            className={`block w-full pl-10 pr-12 rounded-md ${
              errors.amount
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referred By
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={formData.referredByFirm}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  referredByFirm: e.target.value as FirmType,
                }))
              }
              className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md appearance-none"
              style={{ paddingRight: "2.5rem" }}
            >
              {(["SKALLARS", "MKMs", "Contax"] as FirmType[])
                .filter((firm) => firm !== user?.firm)
                .map((firm) => (
                  <option key={firm} value={firm}>
                    {firm}
                  </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commission %
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Percent className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={formData.commissionPercentage}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  commissionPercentage: e.target.value,
                }));
                setErrors((prev) => ({ ...prev, commissionPercentage: "" }));
              }}
              className={`block w-full pl-10 rounded-md ${
                errors.commissionPercentage
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          {errors.commissionPercentage && (
            <p className="mt-1 text-sm text-red-600">
              {errors.commissionPercentage}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            className="block w-full pl-10 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {formData.amount && formData.commissionPercentage && (
        <div className="bg-indigo-50 p-4 rounded-md">
          <p className="text-sm text-indigo-700">
            Commission Amount:{" "}
            <span className="font-medium">
              €{calculateCommission().toFixed(2)}
            </span>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        {isSubmitting ? "Adding Invoice..." : "Add Invoice"}
      </button>
    </form>
  );
}
