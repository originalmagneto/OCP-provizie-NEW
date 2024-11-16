import React, { useState, useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
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
  status: "all" | "paid" | "unpaid";
  dateRange: "all" | "thisMonth" | "lastMonth" | "thisQuarter" | "lastQuarter";
  firm: "all" | FirmType;
}

interface InvoiceCardProps {
  invoice: any;
  onTogglePaid: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function InvoiceCard({
  invoice,
  onTogglePaid,
  onDelete,
  onEdit,
  isExpanded,
  onToggleExpand,
}: InvoiceCardProps) {
  const { user } = useAuth();
  const theme = firmThemes[invoice.invoicedByFirm];
  const isUsersFirm = user?.firm === invoice.invoicedByFirm;
  const commission = (invoice.amount * invoice.commissionPercentage) / 100;

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
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center
                ${invoice.isPaid ? "bg-green-100" : "bg-amber-100"}
              `}
            >
              {invoice.isPaid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-amber-600" />
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900">
                {invoice.clientName}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(invoice.date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Right side - Amount and Actions */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-medium text-gray-900">
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                }).format(invoice.amount)}
              </div>
              <div className="text-sm text-gray-500">
                {invoice.commissionPercentage}% commission
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isUsersFirm && (
                <>
                  <button
                    onClick={onEdit}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={onToggleExpand}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Invoiced by:</span>
                <span
                  className={`ml-2 ${firmThemes[invoice.invoicedByFirm].text}`}
                >
                  {invoice.invoicedByFirm}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Referred by:</span>
                <span
                  className={`ml-2 ${firmThemes[invoice.referredByFirm].text}`}
                >
                  {invoice.referredByFirm}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Commission Amount:</span>
                <span className="ml-2 font-medium">
                  {new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(commission)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span
                  className={`ml-2 ${
                    invoice.isPaid ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {invoice.isPaid ? "Paid" : "Pending"}
                </span>
              </div>
            </div>

            {isUsersFirm && !invoice.isPaid && (
              <div className="mt-4">
                <button
                  onClick={onTogglePaid}
                  className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Mark as Paid
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterBar({
  filters,
  onFilterChange,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="sm:w-40">
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
              onFilterChange({
                ...filters,
                dateRange: e.target.value as FilterState["dateRange"],
              })
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

        {/* Firm Filter */}
        <div className="sm:w-40">
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
    </div>
  );
}

export default function InvoiceList() {
  const { invoices, updateInvoice, deleteInvoice } = useInvoices();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    dateRange: "all",
    firm: "all",
  });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => {
        // Search filter
        if (
          filters.search &&
          !invoice.clientName
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        ) {
          return false;
        }

        // Status filter
        if (filters.status !== "all") {
          if (filters.status === "paid" && !invoice.isPaid) return false;
          if (filters.status === "unpaid" && invoice.isPaid) return false;
        }

        // Firm filter
        if (
          filters.firm !== "all" &&
          invoice.invoicedByFirm !== filters.firm &&
          invoice.referredByFirm !== filters.firm
        ) {
          return false;
        }

        // Date range filter
        const invoiceDate = new Date(invoice.date);
        const now = new Date();

        switch (filters.dateRange) {
          case "thisMonth":
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return invoiceDate >= thisMonth;

          case "lastMonth":
            const lastMonth = new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              1,
            );
            const thisMonthStart = new Date(
              now.getFullYear(),
              now.getMonth(),
              1,
            );
            return invoiceDate >= lastMonth && invoiceDate < thisMonthStart;

          case "thisQuarter":
            const thisQuarter = new Date(
              now.getFullYear(),
              Math.floor(now.getMonth() / 3) * 3,
              1,
            );
            return invoiceDate >= thisQuarter;

          case "lastQuarter":
            const lastQuarter = new Date(
              now.getFullYear(),
              Math.floor(now.getMonth() / 3) * 3 - 3,
              1,
            );
            const thisQuarterStart = new Date(
              now.getFullYear(),
              Math.floor(now.getMonth() / 3) * 3,
              1,
            );
            return invoiceDate >= lastQuarter && invoiceDate < thisQuarterStart;

          default:
            return true;
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices, filters]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div>
      <FilterBar filters={filters} onFilterChange={setFilters} />

      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onTogglePaid={() =>
              updateInvoice(invoice.id, { isPaid: !invoice.isPaid })
            }
            onDelete={() => {
              if (
                window.confirm("Are you sure you want to delete this invoice?")
              ) {
                deleteInvoice(invoice.id);
              }
            }}
            onEdit={() => {
              // Handle edit - You'll need to implement this
              console.log("Edit invoice:", invoice.id);
            }}
            isExpanded={expandedIds.has(invoice.id)}
            onToggleExpand={() => toggleExpanded(invoice.id)}
          />
        ))}

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No invoices found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
