import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useYear, isInQuarter } from "../context/YearContext";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Building,
  Euro,
  ChevronRight,
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

interface UnpaidInvoiceCardProps {
  invoice: any;
  onMarkAsPaid: () => void;
  userFirm: FirmType;
  daysOverdue: number;
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

  const { userInvoices, otherInvoices } = useMemo(() => {
    const unpaidInvoices = invoices.filter(
      (invoice) =>
        !invoice.isPaid &&
        isInQuarter(new Date(invoice.date), currentYear, currentQuarter),
    );

    return {
      userInvoices: unpaidInvoices.filter(
        (invoice) => invoice.invoicedByFirm === user?.firm,
      ),
      otherInvoices: unpaidInvoices.filter(
        (invoice) => invoice.invoicedByFirm !== user?.firm,
      ),
    };
  }, [invoices, user, currentYear, currentQuarter]);

  const calculateDaysOverdue = (date: string) => {
    const invoiceDate = new Date(date);
    const today = new Date();
    const diffTime = today.getTime() - invoiceDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!user) return null;

  if (userInvoices.length === 0 && otherInvoices.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">All Paid!</h3>
        <p className="text-gray-500">No unpaid invoices for this quarter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User's Unpaid Invoices */}
      {userInvoices.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
            Your Unpaid Invoices
          </h3>
          {userInvoices
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .map((invoice) => (
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

      {/* Other Firms' Unpaid Invoices */}
      {otherInvoices.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-2" />
            Other Firms' Unpaid Invoices
          </h3>
          {otherInvoices
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .map((invoice) => (
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
