import React, { useState, useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import {
  Check,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Euro,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import type { FirmType } from "../types";

const firmThemes = {
  SKALLARS: {
    primary: "bg-purple-100",
    secondary: "bg-purple-50",
    text: "text-purple-600",
    accent: "bg-purple-600",
    border: "border-purple-200",
    hover: "hover:bg-purple-50",
  },
  MKMs: {
    primary: "bg-blue-100",
    secondary: "bg-blue-50",
    text: "text-blue-600",
    accent: "bg-blue-600",
    border: "border-blue-200",
    hover: "hover:bg-blue-50",
  },
  Contax: {
    primary: "bg-yellow-100",
    secondary: "bg-yellow-50",
    text: "text-yellow-600",
    accent: "bg-yellow-600",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-50",
  },
} as const;

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  invoicedByFirm: FirmType;
  referredByFirm: FirmType;
  commissionPercentage: number;
  date: string;
  isPaid: boolean;
}

function FilterBar({
  filters,
  onFilterChange,
}: {
  filters: {
    search: string;
    status: "all" | "paid" | "unpaid";
    dateRange: string;
  };
  onFilterChange: (filters: any) => void;
}) {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              style={{ minWidth: "200px" }}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="sm:w-48">
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value as "all" | "paid" | "unpaid",
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="sm:w-48">
          <select
            value={filters.dateRange}
            onChange={(e) =>
              onFilterChange({ ...filters, dateRange: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisQuarter">This Quarter</option>
            <option value="lastQuarter">Last Quarter</option>
          </select>
        </div>
      </div>
    </div>
  );
}

interface EditModalProps {
  invoice: Invoice;
  onSave: (updatedInvoice: Partial<Invoice>) => void;
  onCancel: () => void;
}

function EditModal({ invoice, onSave, onCancel }: EditModalProps) {
  const [editForm, setEditForm] = useState<Partial<Invoice>>({
    clientName: invoice.clientName,
    amount: invoice.amount,
    referredByFirm: invoice.referredByFirm,
    commissionPercentage: invoice.commissionPercentage,
    date: invoice.date,
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Invoice</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(editForm);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <input
              type="text"
              value={editForm.clientName || ""}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, clientName: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount (€)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Euro className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={editForm.amount || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value),
                  }))
                }
                className="block w-full pl-10 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Commission %
            </label>
            <input
              type="number"
              value={editForm.commissionPercentage || ""}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  commissionPercentage: parseFloat(e.target.value),
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              step="0.1"
              min="0"
              max="100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={editForm.date || ""}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InvoiceCard({
  invoice,
  onTogglePaid,
  onDelete,
  onEdit,
  userFirm,
}: {
  invoice: Invoice;
  onTogglePaid: () => void;
  onDelete: () => void;
  onEdit: () => void;
  userFirm: FirmType;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const canManage = userFirm === invoice.invoicedByFirm;
  const theme = firmThemes[invoice.invoicedByFirm];

  const formatEUR = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div
      className={`
        border rounded-lg overflow-hidden mb-4 transition-all duration-200
        ${theme.border}
        ${canManage ? theme.secondary : "bg-white"}
      `}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {canManage ? (
            <button
              onClick={onTogglePaid}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                transition-colors duration-200
                ${
                  invoice.isPaid
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }
              `}
            >
              {invoice.isPaid ? <Check size={16} /> : <X size={16} />}
            </button>
          ) : (
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${
                  invoice.isPaid
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }
              `}
            >
              {invoice.isPaid ? <Check size={16} /> : <X size={16} />}
            </div>
          )}

          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {invoice.clientName}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(invoice.date).toLocaleDateString()}
            </div>
          </div>

          <div className="text-right">
            <div className="font-medium text-gray-900">
              {formatEUR(invoice.amount)}
            </div>
            <div className="text-sm text-gray-500">
              {invoice.commissionPercentage}% commission
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canManage && (
              <>
                <button
                  onClick={onEdit}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                  title="Edit invoice"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                  title="Delete invoice"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div
          className={`px-4 py-3 border-t ${theme.border} ${theme.secondary}`}
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Invoiced by</div>
              <div className={firmThemes[invoice.invoicedByFirm].text}>
                {invoice.invoicedByFirm}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Referred by</div>
              <div className={firmThemes[invoice.referredByFirm].text}>
                {invoice.referredByFirm}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Commission Amount</div>
              <div className="font-medium text-gray-900">
                {formatEUR(
                  invoice.amount * (invoice.commissionPercentage / 100),
                )}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Status</div>
              <div
                className={invoice.isPaid ? "text-green-600" : "text-gray-600"}
              >
                {invoice.isPaid ? "Paid" : "Pending Payment"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoiceList() {
  const { invoices, updateInvoice, deleteInvoice } = useInvoices();
  const { user } = useAuth();
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all" as "all" | "paid" | "unpaid",
    dateRange: "all",
  });

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Search filter
      if (
        filters.search &&
        !invoice.clientName.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "paid" && !invoice.isPaid) return false;
        if (filters.status === "unpaid" && invoice.isPaid) return false;
      }

      // Date range filter
      const invoiceDate = new Date(invoice.date);
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const firstDayOfQuarter = new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3,
        1,
      );
      const lastDayOfQuarter = new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3 + 3,
        0,
      );

      switch (filters.dateRange) {
        case "thisMonth":
          return (
            invoiceDate >= firstDayOfMonth && invoiceDate <= lastDayOfMonth
          );
        case "lastMonth":
          const firstDayLastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1,
          );
          const lastDayLastMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
          );
          return (
            invoiceDate >= firstDayLastMonth && invoiceDate <= lastDayLastMonth
          );
        case "thisQuarter":
          return (
            invoiceDate >= firstDayOfQuarter && invoiceDate <= lastDayOfQuarter
          );
        case "lastQuarter":
          const firstDayLastQuarter = new Date(
            now.getFullYear(),
            Math.floor(now.getMonth() / 3) * 3 - 3,
            1,
          );
          const lastDayLastQuarter = new Date(
            now.getFullYear(),
            Math.floor(now.getMonth() / 3) * 3,
            0,
          );
          return (
            invoiceDate >= firstDayLastQuarter &&
            invoiceDate <= lastDayLastQuarter
          );
        default:
          return true;
      }
    });
  }, [invoices, filters]);

  if (!user) return null;

  if (!invoices.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No invoices
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new invoice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
          <div className="text-sm text-gray-500">
            Showing {filteredInvoices.length} invoice
            {filteredInvoices.length !== 1 ? "s" : ""}
          </div>
        </div>

        <FilterBar filters={filters} onFilterChange={setFilters} />

        <div className="space-y-2">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              userFirm={user.firm}
              onTogglePaid={() =>
                updateInvoice(invoice.id, { isPaid: !invoice.isPaid })
              }
              onDelete={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this invoice?",
                  )
                ) {
                  deleteInvoice(invoice.id);
                }
              }}
              onEdit={() => setEditingInvoice(invoice)}
            />
          ))}
        </div>
      </div>

      {editingInvoice && (
        <EditModal
          invoice={editingInvoice}
          onSave={(updates) => {
            updateInvoice(editingInvoice.id, updates);
            setEditingInvoice(null);
          }}
          onCancel={() => setEditingInvoice(null)}
        />
      )}
    </>
  );
}
