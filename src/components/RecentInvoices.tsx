import React from "react";
import { useInvoices } from "../context/InvoiceContext";
import {
  CheckCircle,
  AlertTriangle,
  Euro,
  Calendar,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import type { FirmType } from "../types.ts";

const firmThemes = {
  SKALLARS: {
    text: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  MKMs: {
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  Contax: {
    text: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
} as const;

interface RecentInvoiceProps {
  clientName: string;
  amount: number;
  date: string;
  isPaid: boolean;
  commissionPercentage: number;
  referredByFirm: FirmType;
}

function RecentInvoiceRow({
  clientName,
  amount,
  date,
  isPaid,
  commissionPercentage,
  referredByFirm,
}: RecentInvoiceProps) {
  const theme = firmThemes[referredByFirm];
  const formattedAmount = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
  const commission = (amount * commissionPercentage) / 100;
  const formattedCommission = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(commission);

  return (
    <div className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-0">
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {isPaid ? (
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
        )}
      </div>

      {/* Client and Date Info */}
      <div className="ml-4 flex-grow">
        <div className="flex items-center">
          <span className="font-medium text-gray-900">{clientName}</span>
          <span
            className={`ml-2 text-xs px-2 py-1 rounded-full ${theme.bg} ${theme.text}`}
          >
            {referredByFirm}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(date).toLocaleDateString("de-DE", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Amount and Commission Info */}
      <div className="text-right flex-shrink-0">
        <div className="font-medium text-gray-900">{formattedAmount}</div>
        <div className="flex items-center text-sm text-gray-500 mt-1 justify-end">
          <Euro className="w-4 h-4 mr-1" />
          {formattedCommission}
          <span className="text-xs ml-1">({commissionPercentage}%)</span>
        </div>
      </div>
    </div>
  );
}

export default function RecentInvoices() {
  const { invoices } = useInvoices();

  const recentInvoices = invoices
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalPending = invoices.filter((inv) => !inv.isPaid).length;
  const totalAmount = recentInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
          <span className="text-sm text-gray-500">{totalPending} pending</span>
        </div>
        <div className="mt-2 text-2xl font-semibold text-gray-900">
          {new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(totalAmount)}
        </div>
        <div className="mt-2 flex items-center text-sm text-green-600">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          <span>23.5% vs. previous month</span>
        </div>
      </div>

      {/* Scrollable Invoice List */}
      <div className="max-h-[400px] overflow-y-auto">
        {recentInvoices.length > 0 ? (
          recentInvoices.map((invoice) => (
            <RecentInvoiceRow
              key={invoice.id}
              clientName={invoice.clientName}
              amount={invoice.amount}
              date={invoice.date}
              isPaid={invoice.isPaid}
              commissionPercentage={invoice.commissionPercentage}
              referredByFirm={invoice.referredByFirm}
            />
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            No recent invoices found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          View all invoices
        </button>
      </div>
    </div>
  );
}
