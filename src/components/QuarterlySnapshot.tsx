import { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useYear, isInQuarter } from "../context/YearContext";
import { useAuth } from "../context/AuthContext";
import { Euro, CheckCircle2, XCircle } from "lucide-react";
import type { Invoice } from "../types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function QuarterCircle({ quarter, currentQuarter, onSelect }: { 
  quarter: number; 
  currentQuarter: number;
  onSelect: () => void;
}) {
  const isCurrent = quarter === currentQuarter;
  const isPast = quarter < currentQuarter;
  
  return (
    <button
      onClick={onSelect}
      className={`relative w-12 h-12 rounded-full flex items-center justify-center font-medium text-lg transition-all
        ${isCurrent ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500' : 
          isPast ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
    >
      {quarter}
      {isPast && (
        <div className="absolute -bottom-1 -right-1">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>
      )}
    </button>
  );
}

export default function QuarterlySnapshot() {
  const { invoices, isLoading } = useInvoices();
  const { currentYear, currentQuarter, selectYearAndQuarter, availableYears } = useYear();
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
        paidCommissions: 0,
        unpaidCommissions: 0
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

      const paidCommissions = validInvoices
        .filter(inv => inv.isPaid)
        .reduce((sum, inv) => sum + (inv.amount * inv.commissionPercentage) / 100, 0);

      const unpaidCommissions = validInvoices
        .filter(inv => !inv.isPaid)
        .reduce((sum, inv) => sum + (inv.amount * inv.commissionPercentage) / 100, 0);

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
        paidCommissions,
        unpaidCommissions
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
        paidCommissions: 0,
        unpaidCommissions: 0
      };
    }
  }, [invoices, currentYear, currentQuarter, user?.firm, isLoading]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quarters Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <select
            value={currentYear}
            onChange={(e) => selectYearAndQuarter(parseInt(e.target.value), currentQuarter)}
            className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            Click on a quarter to view its details
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((quarter) => (
            <div key={quarter} className="flex items-center">
              <QuarterCircle 
                quarter={quarter} 
                currentQuarter={currentQuarter}
                onSelect={() => selectYearAndQuarter(currentYear, quarter)}
              />
              {quarter < 4 && (
                <div className={`w-8 h-0.5 ${quarter < currentQuarter ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Paid Commissions</h3>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 flex items-center">
            <Euro className="w-5 h-5 mr-1 text-gray-400" />
            {formatCurrency(quarterStats.paidCommissions)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Pending Commissions</h3>
            <XCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 flex items-center">
            <Euro className="w-5 h-5 mr-1 text-gray-400" />
            {formatCurrency(quarterStats.unpaidCommissions)}
          </p>
        </div>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
        <div>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-lg font-semibold text-gray-900 flex items-center">
            <Euro className="w-4 h-4 mr-1 text-gray-400" />
            {formatCurrency(quarterStats.totalRevenue)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Total Commissions</p>
          <p className="text-lg font-semibold text-gray-900 flex items-center">
            <Euro className="w-4 h-4 mr-1 text-gray-400" />
            {formatCurrency(quarterStats.totalCommissions)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Invoice Status</p>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {quarterStats.paidCount}
              </p>
              <p className="text-xs text-gray-500">Paid</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {quarterStats.unpaidCount}
              </p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
