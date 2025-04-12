import { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useYear, isInQuarter } from "../context/YearContext";
import { useAuth } from "../context/AuthContext";
import { Euro } from "lucide-react";
import type { Invoice } from "../types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function QuarterlySnapshot() {
  const { invoices, isLoading } = useInvoices();
  const { currentYear, currentQuarter } = useYear();
  const { user } = useAuth();

  const quarterStats = useMemo(() => {
    if (!Array.isArray(invoices) || isLoading || !user?.firm) {
      return {
        totalRevenue: 0,
        totalCommissions: 0,
        invoiceCount: 0,
        paidCount: 0,
        unpaidCount: 0,
        quarterInvoices: [],
      };
    }

    try {
      const quarterInvoices = invoices.filter(invoice => {
        if (!invoice?.date) return false;
        const date = new Date(invoice.date);
        return !isNaN(date.getTime()) && isInQuarter(date, currentYear, currentQuarter);
      });

      const validInvoices = quarterInvoices.filter((invoice): invoice is Invoice => {
        return (
          invoice &&
          typeof invoice.amount === 'number' &&
          typeof invoice.commissionPercentage === 'number' &&
          typeof invoice.isPaid === 'boolean'
        );
      });

      return {
        totalRevenue: validInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        totalCommissions: validInvoices.reduce(
          (sum, inv) => sum + (inv.amount * inv.commissionPercentage) / 100,
          0
        ),
        invoiceCount: validInvoices.length,
        paidCount: validInvoices.filter(inv => inv.isPaid).length,
        unpaidCount: validInvoices.filter(inv => !inv.isPaid).length,
        quarterInvoices: validInvoices,
      };
    } catch (error) {
      console.error('Error calculating quarter stats:', error);
      return {
        totalRevenue: 0,
        totalCommissions: 0,
        invoiceCount: 0,
        paidCount: 0,
        unpaidCount: 0,
        quarterInvoices: [],
      };
    }
  }, [invoices, currentYear, currentQuarter, user?.firm, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Q{currentQuarter} {currentYear} Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-semibold text-gray-900 flex items-center">
              <Euro className="w-5 h-5 mr-1 text-gray-400" />
              {formatCurrency(quarterStats.totalRevenue)}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Total Commissions</p>
            <p className="text-2xl font-semibold text-gray-900 flex items-center">
              <Euro className="w-5 h-5 mr-1 text-gray-400" />
              {formatCurrency(quarterStats.totalCommissions)}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Invoice Status</p>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {quarterStats.paidCount}
                </p>
                <p className="text-sm text-gray-500">Paid</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {quarterStats.unpaidCount}
                </p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
