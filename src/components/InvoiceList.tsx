import React, { useState, useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useYear, isInQuarter } from "../context/YearContext";
import CustomDropdown from "./common/CustomDropdown";
import StatusBadge from "./common/StatusBadge";
import Tooltip from "./common/Tooltip";
import InvoiceSummary from "./InvoiceSummary";
import EditInvoiceModal from "./EditInvoiceModal";
import {
  Search,
  Building,
  Calendar,
  Euro,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { FirmType } from "../types";

const firmThemes = {
  SKALLARS: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
    hover: "hover:bg-purple-100",
  },
  MKMs: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    hover: "hover:bg-blue-100",
  },
  Contax: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-600",
    hover: "hover:bg-yellow-100",
  },
} as const;

interface FilterState {
  search: string;
  status: "all" | "paid" | "pending" | "overdue";
  firm: "all" | FirmType;
}

interface InvoiceCardProps {
  invoice: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTogglePaid: () => void;
  onDelete: () => void;
  onEdit: () => void;
  userFirm: FirmType;
}

function FilterBar({
  filters,
  onFilterChange,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}) {
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "overdue", label: "Overdue" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            placeholder="Search invoices..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-48">
        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              status: e.target.value as FilterState["status"],
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Firm Filter */}
      <div className="w-full sm:w-48">
        <select
          value={filters.firm}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              firm: e.target.value as FilterState["firm"],
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Firms</option>
          <option value="SKALLARS">SKALLARS</option>
          <option value="MKMs">MKMs</option>
          <option value="Contax">Contax</option>
        </select>
      </div>
    </div>
  );
}

function InvoiceCard({
  invoice,
  isExpanded,
  onToggleExpand,
  onTogglePaid,
  onDelete,
  onEdit,
  userFirm,
}: InvoiceCardProps) {
  const theme = firmThemes[invoice.invoicedByFirm];
  const isUsersFirm = userFirm === invoice.invoicedByFirm;
  const commission = (invoice.amount * invoice.commissionPercentage) / 100;

  // Calculate days since invoice date
  const invoiceDate = new Date(invoice.date);
  const daysSinceInvoice = Math.floor(
    (new Date().getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine invoice status and tooltip text
  const getInvoiceStatus = () => {
    if (invoice.isPaid) return 'paid';
    return daysSinceInvoice > 30 ? 'overdue' : 'pending';
  };

  const getTooltipText = () => {
    if (invoice.isPaid) return `Paid on ${new Date(invoice.paidDate).toLocaleDateString()}`;
    const daysText = daysSinceInvoice === 1 ? '1 day' : `${daysSinceInvoice} days`;
    return daysSinceInvoice > 30
      ? `Overdue by ${daysText}`
      : `Due in ${30 - daysSinceInvoice} days`;
  };

  return (
    <div
      className={`
        border rounded-lg overflow-hidden transition-all duration-200
        ${theme.border}
        ${isUsersFirm ? theme.bg : "bg-white"}
      `}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Basic Info */}
          <div className="flex items-center space-x-4">
            <Tooltip text={getTooltipText()}>
              <StatusBadge status={getInvoiceStatus()} />
            </Tooltip>

            <div>
              <h3 className="font-medium text-gray-900">
                {invoice.clientName}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {invoiceDate.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Right side - Amount and Commission */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(invoice.amount)}
              </div>
              <div className="text-sm text-gray-500">
                Commission: {formatCurrency(commission)}
              </div>
            </div>

            <button
              onClick={onToggleExpand}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Invoice Details</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li>Invoice Number: {invoice.id}</li>
                  <li>Date: {invoiceDate.toLocaleDateString()}</li>
                  <li>Status: {getInvoiceStatus()}</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Financial Details</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li>Amount: {formatCurrency(invoice.amount)}</li>
                  <li>Commission Rate: {invoice.commissionPercentage}%</li>
                  <li>Commission Amount: {formatCurrency(commission)}</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={onTogglePaid}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium
                  ${
                    invoice.isPaid
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }
                `}
              >
                {invoice.isPaid ? "Mark Unpaid" : "Mark Paid"}
              </button>
              <button
                onClick={onEdit}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-1 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoiceList() {
  const { invoices, deleteInvoice, togglePaid } = useInvoices();
  const { userFirm } = useAuth();
  const { selectedYear } = useYear();
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [expandedInvoices, setExpandedInvoices] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    firm: "all",
  });

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      
      // Check if invoice is in selected year
      if (invoiceDate.getFullYear() !== selectedYear) return false;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !invoice.clientName.toLowerCase().includes(searchLower) &&
          !invoice.invoicedByFirm.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== "all") {
        const daysDiff = Math.floor(
          (new Date().getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (filters.status === "paid" && !invoice.isPaid) return false;
        if (filters.status === "pending" && (invoice.isPaid || daysDiff > 30)) return false;
        if (filters.status === "overdue" && (invoice.isPaid || daysDiff <= 30)) return false;
      }

      // Firm filter
      if (filters.firm !== "all" && invoice.invoicedByFirm !== filters.firm) {
        return false;
      }

      return true;
    });
  }, [invoices, filters, selectedYear]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {
      totalInvoices: filteredInvoices.length,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
      totalAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
    };

    filteredInvoices.forEach((invoice) => {
      const amount = Number(invoice.amount);
      stats.totalAmount += amount;

      const daysDiff = Math.floor(
        (new Date().getTime() - new Date(invoice.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (invoice.isPaid) {
        stats.paidCount++;
      } else if (daysDiff > 30) {
        stats.overdueCount++;
        stats.overdueAmount += amount;
      } else {
        stats.pendingCount++;
        stats.pendingAmount += amount;
      }
    });

    return stats;
  }, [filteredInvoices]);

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} onFilterChange={setFilters} />
      
      <InvoiceSummary {...summaryStats} />

      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            isExpanded={expandedInvoices.includes(invoice.id)}
            onToggleExpand={() => {
              setExpandedInvoices((prev) =>
                prev.includes(invoice.id)
                  ? prev.filter((id) => id !== invoice.id)
                  : [...prev, invoice.id]
              );
            }}
            onTogglePaid={() => togglePaid(invoice.id)}
            onDelete={() => deleteInvoice(invoice.id)}
            onEdit={() => setEditingInvoice(invoice)}
            userFirm={userFirm}
          />
        ))}
      </div>

      {editingInvoice && (
        <EditInvoiceModal
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
        />
      )}
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
