import React, { useState, useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useYear } from "../context/YearContext";
import CustomDropdown from "./common/CustomDropdown";
import EditInvoiceModal from "./EditInvoiceModal";
import { FIRM_THEMES, FIRMS } from "../utils/constants";
import { filterInvoices } from "../utils/filterUtils";
import { formatCurrency } from "../utils/formatting";
import type { Invoice, FirmType, FilterState } from "../types";
import {
  Search,
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
          <CustomDropdown
            label=""
            value={
              filters.status === "all"
                ? "All Status"
                : filters.status === "paid"
                  ? "Paid"
                  : "Unpaid"
            }
            onChange={(value) => {
              const status =
                value === "All Status"
                  ? "all"
                  : (value.toLowerCase() as "paid" | "unpaid");
              onFilterChange({ ...filters, status });
            }}
            options={["All Status", "Paid", "Unpaid"]}
          />
        </div>

        {/* Firm Filter */}
        <div className="sm:w-40">
          <CustomDropdown
            label=""
            value={filters.firm === "all" ? "All Firms" : filters.firm}
            onChange={(value) => {
              const firm = value === "All Firms" ? "all" : (value as FirmType);
              onFilterChange({ ...filters, firm });
            }}
            options={["All Firms", ...FIRMS]}
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
  const theme = FIRM_THEMES[invoice.invoicedByFirm];
  const isUsersFirm = userFirm === invoice.invoicedByFirm;
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
                {formatCurrency(invoice.amount)}
              </div>
              <div className="text-sm text-gray-500">
                {invoice.commissionPercentage}% commission
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isUsersFirm && (
                <>
                  <button
                    onClick={onTogglePaid}
                    className={`p-1 rounded ${
                      invoice.isPaid
                        ? "text-green-600 hover:bg-green-50"
                        : "text-amber-600 hover:bg-amber-50"
                    }`}
                    title={invoice.isPaid ? "Mark as unpaid" : "Mark as paid"}
                  >
                    {invoice.isPaid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={onEdit}
                    className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    title="Edit invoice"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete invoice"
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
                  className={`ml-2 ${FIRM_THEMES[invoice.invoicedByFirm].text}`}
                >
                  {invoice.invoicedByFirm}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Referred by:</span>
                <span
                  className={`ml-2 ${FIRM_THEMES[invoice.referredByFirm].text}`}
                >
                  {invoice.referredByFirm}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Commission Amount:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(commission)}
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
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoiceList() {
  const { invoices, updateInvoice, deleteInvoice } = useInvoices();
  const { user } = useAuth();
  const { currentYear, currentQuarter } = useYear();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    firm: "all",
  });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    if (!Array.isArray(invoices)) return [];
    return filterInvoices(invoices, filters, currentYear, currentQuarter);
  }, [invoices, filters, currentYear, currentQuarter]);

  if (!user) return null;

  return (
    <div>
      <FilterBar filters={filters} onFilterChange={setFilters} />

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {filteredInvoices.length} invoice
          {filteredInvoices.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            isExpanded={expandedIds.has(invoice.id)}
            onToggleExpand={() => {
              setExpandedIds((prev) => {
                const next = new Set(prev);
                if (next.has(invoice.id)) {
                  next.delete(invoice.id);
                } else {
                  next.add(invoice.id);
                }
                return next;
              });
            }}
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
            onEdit={() => setEditingInvoice(invoice)}
            userFirm={user.firm}
          />
        ))}

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No invoices found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or changing the quarter
            </p>
          </div>
        )}
      </div>

      {editingInvoice && (
        <EditInvoiceModal
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
          onSave={(updatedInvoice) => {
            updateInvoice(editingInvoice.id, updatedInvoice);
            setEditingInvoice(null);
          }}
          userFirm={user.firm}
        />
      )}
    </div>
  );
}
