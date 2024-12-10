import React, { useState, useMemo, useCallback } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useYear, isInQuarter } from "../context/YearContext";
import { useCommissions } from '../context/CommissionContext';
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
import type { FirmType, Invoice } from "../types";

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
  invoice: Invoice;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTogglePaid: (invoice: Invoice) => void;
  onDelete: () => void;
  onEdit: () => void;
  userFirm: FirmType;
  canTogglePaid: boolean;
}

function FilterBar({
  filters,
  onFilterChange,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client or firm..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-40">
          <CustomDropdown
            value={filters.status}
            onChange={(value) =>
              onFilterChange({ ...filters, status: value as FilterState["status"] })
            }
            options={[
              { value: "all", label: "All Status" },
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
              { value: "overdue", label: "Overdue" },
            ]}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        <div className="w-40">
          <CustomDropdown
            value={filters.firm}
            onChange={(value) =>
              onFilterChange({ ...filters, firm: value as FilterState["firm"] })
            }
            options={[
              { value: "all", label: "All Firms" },
              { value: "SKALLARS", label: "SKALLARS" },
              { value: "MKMs", label: "MKMs" },
              { value: "Contax", label: "Contax" },
            ]}
            icon={<Building className="w-4 h-4" />}
          />
        </div>
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
  canTogglePaid,
}: InvoiceCardProps) {
  console.log("InvoiceCard render:", { 
    invoiceId: invoice.id,
    userFirm,
    invoicedByFirm: invoice.invoicedByFirm,
    canTogglePaid,
    isPaid: invoice.isPaid
  });

  const theme = firmThemes[invoice.invoicedByFirm];
  const isOverdue =
    !invoice.isPaid &&
    new Date(invoice.date).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;

  const handlePaidClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Paid button clicked', {
      invoiceId: invoice.id,
      currentStatus: invoice.isPaid,
      canTogglePaid,
      userFirm,
      invoicedByFirm: invoice.invoicedByFirm
    });
    onTogglePaid(invoice);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow transition-all duration-200 ${
        isExpanded ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`px-3 py-1 rounded-full ${theme.bg} ${theme.border} ${theme.text}`}
            >
              {invoice.invoicedByFirm}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{invoice.clientName}</h3>
              <p className="text-sm text-gray-500">
                {new Date(invoice.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-lg font-semibold">
                {formatCurrency(invoice.amount)}
              </p>
              {userFirm === invoice.invoicedByFirm ? (
                canTogglePaid ? (
                  <button
                    onClick={handlePaidClick}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      invoice.isPaid
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    {invoice.isPaid ? 'Paid' : 'Mark as Paid'}
                  </button>
                ) : (
                  <StatusBadge 
                    status={invoice.isPaid ? 'paid' : (isOverdue ? 'overdue' : 'pending')} 
                  />
                )
              ) : (
                <StatusBadge 
                  status={invoice.isPaid ? 'paid' : (isOverdue ? 'overdue' : 'pending')} 
                />
              )}
            </div>

            <div className="flex items-center space-x-2">
              {userFirm === invoice.invoicedByFirm && (
                <>
                  <Tooltip content="Edit Invoice">
                    <button
                      onClick={onEdit}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </Tooltip>

                  <Tooltip content="Delete Invoice">
                    <button
                      onClick={onDelete}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </>
              )}

              <button
                onClick={onToggleExpand}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4">
          <InvoiceSummary invoice={invoice} />
        </div>
      )}
    </div>
  );
}

export default function InvoiceList() {
  const { invoices, isLoading: invoicesLoading, removeInvoice, togglePaid, updateInvoice } = useInvoices();
  const { user, isAuthenticated } = useAuth();
  const userFirm = user?.firm;
  const { currentYear, currentQuarter } = useYear();
  const { isQuarterSettled } = useCommissions();
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [expandedInvoices, setExpandedInvoices] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    firm: "all",
  });

  console.log("InvoiceList render:", { 
    userFirm, 
    user, 
    isAuthenticated,
    invoicesCount: invoices.length 
  });

  const handleTogglePaid = useCallback((invoice: Invoice) => {
    console.log("handleTogglePaid called with:", { 
      invoice, 
      userFirm,
      user,
      isAuthenticated 
    });
    
    if (!isAuthenticated) {
      console.error("Cannot toggle paid status: Not authenticated");
      return;
    }

    if (!userFirm) {
      console.error("Cannot toggle paid status: No user firm");
      return;
    }
    
    if (!invoice) {
      console.error("No invoice provided to toggle");
      return;
    }
    
    // Don't allow toggling if the invoice's commission has been settled
    if (isQuarterSettled(invoice.quarterKey, userFirm, invoice.id)) {
      console.log("Cannot toggle: Invoice commission is settled", {
        quarterKey: invoice.quarterKey,
        userFirm,
        invoiceId: invoice.id
      });
      alert('Cannot change paid status of an invoice with settled commissions');
      return;
    }
    
    console.log("About to toggle paid status for invoice:", {
      id: invoice.id,
      firm: userFirm,
      currentStatus: invoice.isPaid,
      invoicedByFirm: invoice.invoicedByFirm
    });
    
    togglePaid(invoice.id, userFirm);
  }, [userFirm, user, isAuthenticated, isQuarterSettled, togglePaid]);

  const filterInvoice = useCallback(
    (invoice: Invoice): boolean => {
      if (!invoice?.date || !invoice?.clientName || !invoice?.invoicedByFirm) {
        return false;
      }

      const invoiceDate = new Date(invoice.date);
      if (isNaN(invoiceDate.getTime())) {
        return false;
      }

      // Check if invoice is in current year and quarter
      if (!isInQuarter(invoiceDate, currentYear, currentQuarter)) {
        return false;
      }

      // Apply search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        !searchLower ||
        invoice.clientName.toLowerCase().includes(searchLower) ||
        invoice.id.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Apply status filter
      const isOverdue =
        !invoice.isPaid &&
        invoiceDate.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;

      switch (filters.status) {
        case "paid":
          if (!invoice.isPaid) return false;
          break;
        case "pending":
          if (invoice.isPaid || isOverdue) return false;
          break;
        case "overdue":
          if (!isOverdue) return false;
          break;
      }

      // Apply firm filter
      if (filters.firm !== "all") {
        if (
          invoice.invoicedByFirm !== filters.firm &&
          invoice.referredByFirm !== filters.firm
        ) {
          return false;
        }
      }

      return true;
    },
    [filters, currentYear, currentQuarter]
  );

  const processedInvoices = useMemo(() => {
    try {
      // First ensure we have valid data
      const safeInvoices = invoices || [];

      const validInvoices = safeInvoices.filter((invoice): invoice is Invoice => {
        if (!invoice || typeof invoice !== 'object') return false;

        try {
          const date = new Date(invoice.date);
          if (isNaN(date.getTime())) return false;

          return (
            typeof invoice.id === 'string' &&
            typeof invoice.clientName === 'string' &&
            typeof invoice.invoicedByFirm === 'string' &&
            typeof invoice.referredByFirm === 'string' &&
            typeof invoice.amount === 'number' &&
            !isNaN(invoice.amount) &&
            typeof invoice.commissionPercentage === 'number' &&
            !isNaN(invoice.commissionPercentage) &&
            typeof invoice.isPaid === 'boolean'
          );
        } catch (error) {
          console.error('Error validating invoice:', error);
          return false;
        }
      });

      // Then apply filters
      const filtered = validInvoices.filter(filterInvoice);

      // Finally sort, with error handling
      try {
        return [...filtered].sort((a, b) => {
          try {
            // Safely parse dates
            const dateA = new Date(a?.date || "");
            const dateB = new Date(b?.date || "");

            // Check if dates are valid before comparing
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
              console.warn("Invalid date encountered during sorting");
              return 0; // Keep original order for invalid dates
            }

            return dateB.getTime() - dateA.getTime();
          } catch (error) {
            console.error("Error sorting invoices:", error);
            return 0; // Keep original order on error
          }
        });
      } catch (error) {
        console.error("Error sorting invoices:", error);
        return filtered;
      }
    } catch (error) {
      console.error("Error preparing invoices for sorting:", error);
      return []; // Return empty array on error
    }
  }, [invoices, filterInvoice]);

  // Show loading state if invoices are loading
  if (invoicesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Please log in to view invoices</div>
      </div>
    );
  }

  // Calculate summary statistics
  const summaryStats = {
    totalInvoices: processedInvoices.length,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    totalAmount: 0,
    overdueAmount: 0,
  };

  processedInvoices.forEach((invoice) => {
    const amount = invoice.amount;
    const isOverdue =
      !invoice.isPaid &&
      new Date(invoice.date).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;

    if (invoice.isPaid) {
      summaryStats.paidCount++;
    } else if (isOverdue) {
      summaryStats.overdueCount++;
      summaryStats.overdueAmount += amount;
    } else {
      summaryStats.pendingCount++;
    }

    summaryStats.totalAmount += amount;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FilterBar filters={filters} onFilterChange={setFilters} />
      </div>

      <InvoiceSummary {...summaryStats} />

      <div className="space-y-4">
        {processedInvoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center space-x-4">
            <div className="flex-1">
              <InvoiceCard
                invoice={invoice}
                isExpanded={expandedInvoices.includes(invoice.id)}
                onToggleExpand={() => {
                  setExpandedInvoices((prev) =>
                    prev.includes(invoice.id)
                      ? prev.filter((id) => id !== invoice.id)
                      : [...prev, invoice.id]
                  );
                }}
                onTogglePaid={() => handleTogglePaid(invoice)}
                onDelete={() => removeInvoice(invoice.id)}
                onEdit={() => setEditingInvoice(invoice)}
                userFirm={userFirm || ""}
                canTogglePaid={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "$0.00";
  }
}
