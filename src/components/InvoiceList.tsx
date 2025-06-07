import { useState, useMemo, useCallback } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useYear, isInQuarter } from "../context/YearContext";
import CustomDropdown from "./common/CustomDropdown";
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
  onTogglePaidStatus: () => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

function FilterBar({
  filters,
  onFilterChange,
  showAllInvoices,
  onToggleShowAll,
  sortCriteria,
  onSortCriteriaChange,
  sortDirection,
  onSortDirectionChange,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  showAllInvoices: boolean;
  onToggleShowAll: (value: boolean) => void;
  sortCriteria: string;
  onSortCriteriaChange: (value: string) => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (value: "asc" | "desc") => void;
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
            <span className="ms-3 text-sm font-medium text-gray-700">Show All</span>
          </label>
        </div>
        <div className="w-40">
          <CustomDropdown
            value={sortCriteria}
            onChange={onSortCriteriaChange}
            options={[
              { value: 'date', label: 'Sort by Date' },
              { value: 'clientName', label: 'Sort by Client' },
              { value: 'amount', label: 'Sort by Amount' },
              { value: 'status', label: 'Sort by Status' },
            ]}
            icon={<ChevronDown className="w-4 h-4" />}
          />
        </div>

        <div className="w-32">
          <CustomDropdown
            value={sortDirection}
            onChange={onSortDirectionChange}
            options={[
              { value: 'desc', label: 'Descending' },
              { value: 'asc', label: 'Ascending' },
            ]}
            icon={sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          />
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
  onTogglePaidStatus,
  onEdit,
  onDelete 
}: InvoiceCardProps) {
  const date = new Date(invoice.date);
  const firmTheme = firmThemes[invoice.invoicedByFirm];

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${isExpanded ? 'shadow-md' : ''}`}>
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onToggleExpand}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{invoice.clientName}</h3>
              <p className="text-sm text-gray-500">
                {date.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onTogglePaidStatus}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors
                ${invoice.isPaid 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
            >
              {invoice.isPaid ? 'Paid' : 'Pending'}
            </button>
            <span className="text-sm font-medium text-gray-900 flex items-center">
              <Euro className="w-4 h-4 mr-1 text-gray-400" />
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(invoice.amount)}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Invoiced By</p>
                <div className={`mt-1 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                  ${firmTheme.bg} ${firmTheme.text}`}>
                  <Building className="w-3 h-3 mr-1" />
                  {invoice.invoicedByFirm}
                  {invoice.invoicedByUserInitials && (
                    <span className="ml-2 bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-[10px] font-semibold border border-gray-200" title="User initials">
                      {invoice.invoicedByUserInitials}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Referred By</p>
                <div className={`mt-1 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                  ${firmThemes[invoice.referredByFirm].bg} ${firmThemes[invoice.referredByFirm].text}`}>
                  <Building className="w-3 h-3 mr-1" />
                  {invoice.referredByFirm}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Commission</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {invoice.commissionPercentage}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Commission Amount</p>
                <p className="mt-1 text-sm font-medium text-gray-900 flex items-center">
                  <Euro className="w-3 h-3 mr-1 text-gray-400" />
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(invoice.amount * invoice.commissionPercentage / 100)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
              <button
                onClick={() => onEdit(invoice)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(invoice)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoiceList() {
  const { invoices, isLoading, removeInvoice, togglePaid, updateInvoice } = useInvoices();
  const { user } = useAuth();
  const userFirm = user?.firm;
  const { currentYear, currentQuarter } = useYear();
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [expandedInvoices, setExpandedInvoices] = useState<string[]>([]);
  const [showAllInvoices, setShowAllInvoices] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    firm: "all",
  });
  const [sortCriteria, setSortCriteria] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [listError, setListError] = useState<string | null>(null);

  const handleToggleExpand = useCallback((invoiceId: string) => {
    setExpandedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  }, []);

  const handleTogglePaid = useCallback(async (invoiceId: string) => {
    setListError(null);
    try {
      await togglePaid(invoiceId);
    } catch (err) {
      console.error("Error toggling paid status:", err);
      setListError("Failed to update invoice status. Please refresh and try again.");
    }
  }, [togglePaid, setListError]);

  const handleDelete = useCallback(async (invoiceId: string) => {
    setListError(null);
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await removeInvoice(invoiceId);
      } catch (err) {
        console.error("Error deleting invoice:", err);
        setListError("Failed to delete invoice. Please refresh and try again.");
      }
    }
  }, [removeInvoice, setListError]);

  const handleUpdateInvoice = useCallback(async (invoiceId: string, updates: Partial<Invoice>) => {
    setListError(null);
    try {
      await updateInvoice(invoiceId, updates);
      setEditingInvoice(null);
    } catch (err) {
      console.error("Error updating invoice:", err);
      setListError("Failed to update invoice. Please refresh and try again.");
      // Modal will still close if updateInvoice fails before setEditingInvoice(null) is reached.
      // If setEditingInvoice was after await, it would stay open.
      // For this task, we'll accept modal closing and show error in list.
      setEditingInvoice(null);
    }
  }, [updateInvoice, setListError]);

  const filterInvoice = useCallback(
    (invoice: Invoice): boolean => {
      if (!invoice?.date || !invoice?.clientName || !invoice?.invoicedByFirm) {
        return false;
      }

      try {
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
          const clientName = (invoice.clientName || "").toLowerCase();
          const invoicedByFirm = (invoice.invoicedByFirm || "").toLowerCase();

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
            invoiceDate.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;

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
      } catch (error) {
        console.error('Error filtering invoice:', error, invoice);
        return false;
      }
    },
    [filters, currentYear, currentQuarter, showAllInvoices]
  );

  const processedInvoices = useMemo(() => {
    if (!Array.isArray(invoices) || isLoading || !userFirm) {
      return [];
    }

    try {
      // First ensure we have valid invoices
      const validInvoices = invoices.filter((invoice): invoice is Invoice => {
        return (
          invoice &&
          typeof invoice.id === 'string' &&
          typeof invoice.clientName === 'string' &&
          typeof invoice.date === 'string' &&
          typeof invoice.amount === 'number' &&
          typeof invoice.commissionPercentage === 'number' &&
          typeof invoice.invoicedByFirm === 'string' &&
          typeof invoice.isPaid === 'boolean'
        );
      });

      // Then apply filters and sort
      return validInvoices
        .filter(filterInvoice)
        .sort((a, b) => {
          try {
            let comparison = 0;
            switch (sortCriteria) {
              case 'date':
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                comparison = dateA.getTime() - dateB.getTime();
                break;
              case 'clientName':
                comparison = a.clientName.toLowerCase().localeCompare(b.clientName.toLowerCase());
                break;
              case 'amount':
                comparison = a.amount - b.amount;
                break;
              case 'status':
                comparison = (a.isPaid ? 1 : 0) - (b.isPaid ? 1 : 0);
                break;
              default:
                return 0;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
          } catch (error) {
            console.error('Error sorting invoices:', error, { a, b, sortCriteria, sortDirection });
            return 0;
          }
        });
    } catch (error) {
      console.error('Error processing invoices:', error);
      return [];
    }
  }, [invoices, isLoading, userFirm, filterInvoice, sortCriteria, sortDirection]);

  // Only render list if we have processed invoices
  return (
    <div className="space-y-4">
      {listError && <div className="my-4 text-sm text-red-600 bg-red-100 border border-red-400 p-3 rounded-md">{listError}</div>}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showAllInvoices={showAllInvoices}
        onToggleShowAll={setShowAllInvoices}
        sortCriteria={sortCriteria}
        onSortCriteriaChange={setSortCriteria}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
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
              onTogglePaidStatus={() => handleTogglePaid(invoice.id)}
              onDelete={() => handleDelete(invoice.id)}
              onEdit={() => setEditingInvoice(invoice)}
            />
          ))}
        </div>
      )}
      
      {editingInvoice && userFirm && (
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


