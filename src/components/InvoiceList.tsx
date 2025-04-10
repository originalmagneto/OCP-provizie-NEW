import { useState, useMemo, useCallback } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useYear, isInQuarter } from "../context/YearContext";
import CustomDropdown from "./common/CustomDropdown";
import StatusBadge from "./common/StatusBadge";
import Tooltip from "./common/Tooltip";
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
  onTogglePaid: () => void;
  onDelete: () => void;
  onEdit: () => void;
  userFirm: FirmType;
}

function FilterBar({
  filters,
  onFilterChange,
  showAllInvoices,
  onToggleShowAll,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  showAllInvoices: boolean;
  onToggleShowAll: (value: boolean) => void;
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

      <div className="flex gap-4 items-center">
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showAllInvoices}
              onChange={(e) => onToggleShowAll(e.target.checked)}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-700">Show All Invoices</span>
          </label>
        </div>

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
}: InvoiceCardProps) {
  const theme = firmThemes[invoice.invoicedByFirm];
  const isOverdue =
    !invoice.isPaid &&
    new Date(invoice.date).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;

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
              <p className="text-lg font-semibold flex items-center">
                <Euro className="w-4 h-4 mr-1" />
                {formatCurrency(invoice.amount)}
              </p>
              <StatusBadge status={invoice.isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending'} />
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

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Commission</p>
                <p className="font-medium">
                  {invoice.commissionPercentage}% (€
                  {formatCurrency(
                    (invoice.amount * invoice.commissionPercentage) / 100
                  )}
                  )
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Referred By</p>
                <p className="font-medium">{invoice.referredByFirm}</p>
              </div>
            </div>

            {userFirm === invoice.invoicedByFirm && (
              <button
                onClick={onTogglePaid}
                className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  invoice.isPaid
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {invoice.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoiceList() {
  const { invoices, isLoading, removeInvoice, togglePaid, updateInvoice } = useInvoices();
  const { user } = useAuth();
  const userFirm = user?.firm || 'SKALLARS';
  const { currentYear, currentQuarter } = useYear();
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [expandedInvoices, setExpandedInvoices] = useState<string[]>([]);
  const [showAllInvoices, setShowAllInvoices] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    firm: "all",
  });

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedInvoices(prev => 
      prev.includes(id) ? prev.filter(invId => invId !== id) : [...prev, id]
    );
  }, []);

  const handleTogglePaid = useCallback((id: string) => {
    togglePaid(id);
  }, [togglePaid]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      removeInvoice(id);
    }
  }, [removeInvoice]);

  const handleUpdateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    updateInvoice(id, updates);
    setEditingInvoice(null);
  }, [updateInvoice]);

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
      if (!showAllInvoices && !isInQuarter(invoiceDate, currentYear, currentQuarter)) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const clientName = invoice.clientName.toLowerCase();
        const invoicedByFirm = invoice.invoicedByFirm.toLowerCase();

        if (
          !clientName.includes(searchLower) &&
          !invoicedByFirm.includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== "all") {
        const isOverdue =
          !invoice.isPaid &&
          new Date(invoice.date).getTime() <
            Date.now() - 30 * 24 * 60 * 60 * 1000;

        if (
          (filters.status === "paid" && !invoice.isPaid) ||
          (filters.status === "pending" && (invoice.isPaid || isOverdue)) ||
          (filters.status === "overdue" && (!isOverdue || invoice.isPaid))
        ) {
          return false;
        }
      }

      // Firm filter
      if (filters.firm !== "all" && invoice.invoicedByFirm !== filters.firm) {
        return false;
      }

      return true;
    },
    [filters, currentYear, currentQuarter, showAllInvoices]
  );

  // Ensure invoices are valid before processing
  const processedInvoices = useMemo(() => {
    if (!Array.isArray(invoices)) {
      return [];
    }

    try {
      return invoices
        .filter(invoice => {
          if (!invoice?.date || !invoice?.clientName || !invoice?.invoicedByFirm) {
            return false;
          }
          return filterInvoice(invoice);
        })
        .sort((a, b) => {
          try {
            if (!a?.date || !b?.date) return 0;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          } catch (error) {
            console.error('Error sorting invoices:', error);
            return 0;
          }
        });
    } catch (error) {
      console.error('Error processing invoices:', error);
      return [];
    }
  }, [invoices, filterInvoice]);

  // Only render list if we have processed invoices
  return (
    <div className="space-y-4">
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showAllInvoices={showAllInvoices}
        onToggleShowAll={setShowAllInvoices}
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : processedInvoices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No invoices found
        </div>
      ) : (
        <div className="space-y-4">
          {processedInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              isExpanded={expandedInvoices.includes(invoice.id)}
              onToggleExpand={() => handleToggleExpand(invoice.id)}
              onTogglePaid={() => handleTogglePaid(invoice.id)}
              onDelete={() => handleDelete(invoice.id)}
              onEdit={() => setEditingInvoice(invoice)}
              userFirm={userFirm}
            />
          ))}
        </div>
      )}
      
      {editingInvoice && (
        <EditInvoiceModal
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
          onSave={(updates) => handleUpdateInvoice(editingInvoice.id, updates)}
          userFirm={userFirm}
        />
      )}
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
