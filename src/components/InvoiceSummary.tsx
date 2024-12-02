import React from 'react';
import { AlertCircleIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';

interface InvoiceSummaryProps {
  totalInvoices: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  totalAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export default function InvoiceSummary({
  totalInvoices,
  paidCount,
  pendingCount,
  overdueCount,
  totalAmount,
  pendingAmount,
  overdueAmount,
}: InvoiceSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Invoices */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Invoices</p>
            <p className="text-2xl font-semibold text-gray-900">{totalInvoices}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-full">
            <CheckCircleIcon className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Total Value: {formatCurrency(totalAmount)}
        </p>
      </div>

      {/* Paid Invoices */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Paid</p>
            <p className="text-2xl font-semibold text-green-600">{paidCount}</p>
          </div>
          <div className="bg-green-50 p-2 rounded-full">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {((paidCount / totalInvoices) * 100).toFixed(1)}% of total
        </p>
      </div>

      {/* Pending Invoices */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-semibold text-amber-600">{pendingCount}</p>
          </div>
          <div className="bg-amber-50 p-2 rounded-full">
            <ClockIcon className="h-6 w-6 text-amber-500" />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Value: {formatCurrency(pendingAmount)}
        </p>
      </div>

      {/* Overdue Invoices */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Overdue</p>
            <p className="text-2xl font-semibold text-red-600">{overdueCount}</p>
          </div>
          <div className="bg-red-50 p-2 rounded-full">
            <AlertCircleIcon className="h-6 w-6 text-red-500" />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Value: {formatCurrency(overdueAmount)}
        </p>
      </div>
    </div>
  );
}
