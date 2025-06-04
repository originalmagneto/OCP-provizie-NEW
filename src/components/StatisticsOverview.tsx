import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useCommissions } from "../context/CommissionContext";
import {
  PlusCircle,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Euro
} from "lucide-react";

interface QuarterSummary {
  revenue: number;
  commissionsReceivable: number;
  commissionPayable: number;
}

export default function StatisticsOverview() {
  const { invoices } = useInvoices();
  const { user } = useAuth();
  const { isQuarterSettled, settleQuarter } = useCommissions();

  const {
    currentQuarter,
    currentQuarterSummary,
    pendingPayments,
    allInvoices,
  } = useMemo(() => {
    const now = new Date();
    const currentQ = Math.floor((now.getMonth() + 3) / 3);
    const currentY = now.getFullYear();
    const currentQKey = `${currentY}-Q${currentQ}`;

    const quarterSummary: QuarterSummary = {
      revenue: 0,
      commissionsReceivable: 0,
      commissionPayable: 0,
    };

    const pending = [];
    
    invoices.forEach((invoice) => {
      const date = new Date(invoice.date);
      const q = Math.floor((date.getMonth() + 3) / 3);
      const y = date.getFullYear();
      const invoiceQKey = `${y}-Q${q}`;
      
      if (invoiceQKey === currentQKey) {
        const amount = invoice.amount;
        const commission = amount * (invoice.commissionPercentage / 100);

        if (invoice.invoicedByFirm === user?.firm) {
          quarterSummary.revenue += amount;
          if (invoice.referredByFirm !== user?.firm) {
            quarterSummary.commissionPayable += commission;
          }
        }

        if (invoice.referredByFirm === user?.firm && invoice.invoicedByFirm !== user?.firm) {
          quarterSummary.commissionsReceivable += commission;
        }
      }

      if (!invoice.isPaid) {
        pending.push(invoice);
      }
    });

    return {
      currentQuarter: { quarter: currentQ, year: currentY },
      currentQuarterSummary: quarterSummary,
      pendingPayments: pending,
      allInvoices: invoices,
    };
  }, [invoices, user?.firm]);

  const handleMarkQuarterSettled = () => {
    if (!user?.firm) return;
    const quarterKey = `${currentQuarter.year}-Q${currentQuarter.quarter}`;
    settleQuarter(quarterKey, user.firm);
  };

  const formatter = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const currentQuarterKey = `${currentQuarter.year}-Q${currentQuarter.quarter}`;
  const isCurrentQuarterSettled = isQuarterSettled(currentQuarterKey);

  if (!user?.firm) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Partner Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{user.firm}</h1>
            <p className="text-indigo-200 mt-1">Partner Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-200">Current Quarter</p>
            <p className="text-xl font-semibold">Q{currentQuarter.quarter} {currentQuarter.year}</p>
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Invoice Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create New Invoice</h2>
            <PlusCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
            Create Invoice
          </button>
        </div>

        {/* Current Quarter Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Quarter Summary</h2>
            <Calendar className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue</span>
              <span className="text-xl font-semibold">{formatter.format(currentQuarterSummary.revenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Commissions Receivable</span>
              <span className="text-xl font-semibold text-indigo-600">
                {formatter.format(currentQuarterSummary.commissionsReceivable)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Commissions Payable</span>
              <span className="text-xl font-semibold text-amber-600">
                {formatter.format(currentQuarterSummary.commissionPayable)}
              </span>
            </div>
            <div className="pt-4 border-t">
              {isCurrentQuarterSettled ? (
                <div className="flex items-center justify-center space-x-2 bg-green-100 text-green-700 py-2 px-4 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Quarter Settled</span>
                </div>
              ) : (
                <button
                  onClick={handleMarkQuarterSettled}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Mark Quarter as Settled
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Payments</h2>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <div className="space-y-3">
            {pendingPayments.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <div>
                  <p className="font-medium">{invoice.clientName}</p>
                  <p className="text-sm text-gray-600">Due from {invoice.invoicedByFirm}</p>
                </div>
                <span className="font-semibold">{formatter.format(invoice.amount)}</span>
              </div>
            ))}
            {pendingPayments.length > 3 && (
              <button className="w-full text-indigo-600 text-sm font-medium hover:text-indigo-700">
                View All ({pendingPayments.length})
              </button>
            )}
          </div>
        </div>

        {/* All Invoices */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">All Invoices</h2>
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <div className="space-y-3">
            {allInvoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{invoice.clientName}</p>
                  <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <span className="font-semibold">{formatter.format(invoice.amount)}</span>
              </div>
            ))}
            <button className="w-full text-indigo-600 text-sm font-medium hover:text-indigo-700">
              View All ({allInvoices.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
