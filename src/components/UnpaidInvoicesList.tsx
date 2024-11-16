import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Euro,
  Calendar,
  Building,
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

interface UnpaidInvoice {
  id: string;
  clientName: string;
  amount: number;
  commissionPercentage: number;
  date: string;
  dueDate?: string;
  invoicedByFirm: FirmType;
  referredByFirm: FirmType;
}

function DaysOverdue({ date }: { date: string }) {
  const days = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24),
  );

  if (days <= 0) return null;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
        days > 30
          ? "bg-red-100 text-red-700"
          : days > 14
            ? "bg-orange-100 text-orange-700"
            : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {days} days overdue
    </span>
  );
}

function UnpaidInvoiceCard({ invoice }: { invoice: UnpaidInvoice }) {
  const { user } = useAuth();
  const { updateInvoice } = useInvoices();
  const theme = firmThemes[invoice.invoicedByFirm];

  const isUsersFirm = user?.firm === invoice.invoicedByFirm;
  const commission = (invoice.amount * invoice.commissionPercentage) / 100;

  const handleMarkAsPaid = () => {
    if (window.confirm("Are you sure you want to mark this invoice as paid?")) {
      updateInvoice(invoice.id, { isPaid: true });
    }
  };

  return (
    <div
      className={`
        ${theme.bg} ${theme.border}
        border rounded-lg p-4 ${isUsersFirm ? theme.hover : ""}
        transition-all duration-200
      `}
    >
      <div className="flex justify-between items-start">
        {/* Left side - Invoice Details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">{invoice.clientName}</h3>
            <DaysOverdue date={invoice.date} />
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(invoice.date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              {invoice.invoicedByFirm}
            </div>
          </div>
        </div>

        {/* Right side - Amount and Actions */}
        <div className="text-right">
          <div className="font-medium text-gray-900">
            {new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
            }).format(invoice.amount)}
          </div>
          <div className="text-sm text-gray-500">
            Commission:{" "}
            {new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
            }).format(commission)}
          </div>
        </div>
      </div>

      {/* Bottom section - Commission info and actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <span className={theme.text}>
            {invoice.commissionPercentage}% commission to{" "}
            {invoice.referredByFirm}
          </span>
        </div>

        {isUsersFirm && (
          <button
            onClick={handleMarkAsPaid}
            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark as Paid
          </button>
        )}
      </div>
    </div>
  );
}

export default function UnpaidInvoicesList() {
  const { invoices } = useInvoices();
  const { user } = useAuth();

  const unpaidInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => !invoice.isPaid)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [invoices]);

  const groupedInvoices = useMemo(() => {
    const grouped = {
      userFirm: [] as UnpaidInvoice[],
      otherFirms: [] as UnpaidInvoice[],
    };

    unpaidInvoices.forEach((invoice) => {
      if (invoice.invoicedByFirm === user?.firm) {
        grouped.userFirm.push(invoice);
      } else {
        grouped.otherFirms.push(invoice);
      }
    });

    return grouped;
  }, [unpaidInvoices, user]);

  if (!user) return null;

  if (unpaidInvoices.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">All Paid!</h3>
        <p className="text-gray-500">No unpaid invoices at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Firm's Unpaid Invoices */}
      {groupedInvoices.userFirm.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
            Your Unpaid Invoices
          </h3>
          {groupedInvoices.userFirm.map((invoice) => (
            <UnpaidInvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}

      {/* Other Firms' Unpaid Invoices */}
      {groupedInvoices.otherFirms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-2" />
            Other Firms' Unpaid Invoices
          </h3>
          {groupedInvoices.otherFirms.map((invoice) => (
            <UnpaidInvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  );
}
