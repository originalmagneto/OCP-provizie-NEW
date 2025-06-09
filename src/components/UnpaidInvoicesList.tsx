import React, { useMemo, useState } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useYear, isInQuarter } from "../context/YearContext";
import CustomDropdown from "./common/CustomDropdown";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Building,
  Euro,
  ChevronRight,
  Filter,
} from "lucide-react";
import type { FirmType } from "../types.ts";

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

interface Invoice {
  id: string;
  date: string;
  amount: number;
  clientName: string;
  invoicedByFirm: FirmType;
  referredByFirm: FirmType;
  isPaid: boolean;
  commissionPercentage: number;
}

interface UnpaidInvoiceCardProps {
  invoice: Invoice;
  onMarkAsPaid: () => void;
  userFirm: FirmType;
  daysOverdue: number;
}

interface FilterState {
  firm: "all" | FirmType;
  sortBy: "date" | "amount" | "overdue";
}

function FilterBar({
  filters,
  onFilterChange,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-4">
        <div className="w-48">
          <CustomDropdown
            label=""
            value={filters.firm === "all" ? "All Firms" : filters.firm}
            onChange={(value) => {
              const firm = value === "All Firms" ? "all" : (value as FirmType);
              onFilterChange({ ...filters, firm });
            }}
            options={["All Firms", "SKALLARS", "MKMs", "Contax"]}
          />
        </div>
        <div className="w-48">
          <CustomDropdown
            label=""
            value={
              filters.sortBy === "date"
                ? "Sort by Date"
                : filters.sortBy === "amount"
                  ? "Sort by Amount"
                  : "Sort by Overdue Days"
            }
            onChange={(value) => {
              const sortBy =
                value === "Sort by Date"
                  ? "date"
                  : value === "Sort by Amount"
                    ? "amount"
                    : "overdue";
              onFilterChange({ ...filters, sortBy });
            }}
            options={["Sort by Date", "Sort by Amount", "Sort by Overdue Days"]}
          />
        </div>
      </div>
    </div>
  );
}

function UnpaidInvoiceCard({
  invoice,
  onMarkAsPaid,
  userFirm,
  daysOverdue,
}: UnpaidInvoiceCardProps) {
  const theme = firmThemes[invoice.invoicedByFirm];
  const isUsersFirm = userFirm === invoice.invoicedByFirm;
  const commission = (invoice.amount * invoice.commissionPercentage) / 100;

  return (
    <div
      className={`
        p-4 rounded-lg border transition-all duration-200
        ${theme.border}
        ${isUsersFirm ? theme.bg : "bg-white"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center
              ${daysOverdue > 30 ? "bg-red-100" : "bg-amber-100"}
            `}
          >
            <Clock
              className={`h-5 w-5 ${
                daysOverdue > 30 ? "text-red-600" : "text-amber-600"
              }`}
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{invoice.clientName}</h3>
            <div className="flex items-center text-sm">
              {daysOverdue > 0 && (
                <span
                  className={`
                    ${
                      daysOverdue > 30
                        ? "text-red-600"
                        : daysOverdue > 14
                          ? "text-orange-600"
                          : "text-amber-600"
                    }
                  `}
                >
                  {daysOverdue} days overdue
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-medium text-gray-900">
            {formatCurrency(invoice.amount)}
          </div>
          <div className="text-sm text-gray-500">
            Commission: {formatCurrency(commission)}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="flex items-center text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(invoice.date).toLocaleDateString()}
        </div>
        <div className="flex items-center text-gray-500">
          <Building className="h-4 w-4 mr-2" />
          <span className={firmThemes[invoice.invoicedByFirm].text}>
            {invoice.invoicedByFirm}
          </span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className={firmThemes[invoice.referredByFirm].text}>
            {invoice.referredByFirm}
          </span>
        </div>
      </div>

      {/* Actions */}
      {isUsersFirm && (
        <button
          onClick={onMarkAsPaid}
          className="w-full py-2 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Mark as Paid</span>
        </button>
      )}
    </div>
  );
}

export default function UnpaidInvoicesList() {
  const { invoices, updateInvoice } = useInvoices();
  const { user } = useAuth();
  const { currentYear, currentQuarter } = useYear();
  const [filters, setFilters] = useState<FilterState>({
    firm: "all",
    sortBy: "date",
  });

  const unpaidInvoices = useMemo(() => {
    let filtered = invoices.filter(
      (invoice) =>
        !invoice.isPaid &&
        isInQuarter(new Date(invoice.date), currentYear, currentQuarter),
    );

    // Apply firm filter
    if (filters.firm !== "all") {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoicedByFirm === filters.firm ||
          invoice.referredByFirm === filters.firm,
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (!a || !b) return 0;
      
      const daysOverdueA = a.date ? calculateDaysOverdue(a.date) : 0;
      const daysOverdueB = b.date ? calculateDaysOverdue(b.date) : 0;

      switch (filters.sortBy) {
        case "date":
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        case "amount":
          return (b.amount || 0) - (a.amount || 0);
        case "overdue":
          return daysOverdueB - daysOverdueA;
        default:
          return 0;
      }
    });
  }, [invoices, currentYear, currentQuarter, filters]);

  const calculateDaysOverdue = (date: string) => {
    const invoiceDate = new Date(date);
    const today = new Date();
    const diffTime = today.getTime() - invoiceDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <FilterBar filters={filters} onFilterChange={setFilters} />

      {unpaidInvoices.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">All Paid!</h3>
          <p className="text-gray-500">No unpaid invoices for this quarter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {unpaidInvoices.map((invoice) => (
            <UnpaidInvoiceCard
              key={invoice.id}
              invoice={invoice}
              onMarkAsPaid={() => updateInvoice(invoice.id, { isPaid: true })}
              userFirm={user.firm}
              daysOverdue={calculateDaysOverdue(invoice.date)}
            />
          ))}
        </div>
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
