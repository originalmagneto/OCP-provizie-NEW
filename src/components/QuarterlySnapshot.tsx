import { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useYear, isInQuarter } from "../context/YearContext";
import { useAuth } from "../context/AuthContext";
import { Euro, CheckCircle2, XCircle, CalendarDays, ChevronDown } from "lucide-react";
import type { Invoice } from "../types";
import { useCommissions } from "../context/CommissionContext";

interface CommissionsByFirm {
  owed: { [key in FirmType]?: number };
  toReceive: { [key in FirmType]?: number };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function QuarterCircle({ quarter, currentQuarter, onSelect, isSettled }: { 
  quarter: number; 
  currentQuarter: number;
  onSelect: () => void;
  isSettled: boolean;
}) {
  const isCurrent = quarter === currentQuarter;
  const isPast = quarter < currentQuarter;
  
  return (
    <button
      onClick={onSelect}
      className={`relative w-12 h-12 rounded-full flex items-center justify-center font-medium text-lg transition-all
        ${isCurrent ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 dark:bg-blue-700/30 dark:text-blue-300 dark:ring-blue-500' :
          isPast ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' :
                   'bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-gray-700/70 dark:text-gray-400 dark:hover:bg-gray-600/70'}`}
    >
      {quarter}
      <div className="absolute -bottom-1 -right-1">
        {isPast && <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />}
        {isSettled && <div className="w-3 h-3 bg-indigo-500 rounded-full ring-2 ring-white dark:bg-indigo-400 dark:ring-gray-800" />}
      </div>
    </button>
  );
}

export default function QuarterlySnapshot() {
  const { invoices, isLoading } = useInvoices();
  const { currentYear, currentQuarter, selectYearAndQuarter, availableYears } = useYear();
  const { user } = useAuth();
  const { settledQuarters, settleQuarter, unsettleQuarter, isQuarterSettled } = useCommissions();

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
        unpaidCommissions: 0,
        commissionsByFirm: {
          owed: {},
          toReceive: {}
        } as CommissionsByFirm
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

      const commissionsByFirm: CommissionsByFirm = {
        owed: {},
        toReceive: {}
      };

      // Calculate commissions owed to each firm and to be received
      validInvoices.forEach(inv => {
        const commission = (inv.amount * inv.commissionPercentage) / 100;
        
        if (inv.invoicedByFirm === user.firm && inv.referredByFirm !== user.firm) {
          // We owe commission to the referring firm
          commissionsByFirm.owed[inv.referredByFirm] = (commissionsByFirm.owed[inv.referredByFirm] || 0) + commission;
        } else if (inv.referredByFirm === user.firm && inv.invoicedByFirm !== user.firm) {
          // We will receive commission from the invoicing firm
          commissionsByFirm.toReceive[inv.invoicedByFirm] = (commissionsByFirm.toReceive[inv.invoicedByFirm] || 0) + commission;
        }
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
        unpaidCommissions,
        commissionsByFirm
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
        unpaidCommissions: 0,
        commissionsByFirm: {
          owed: {},
          toReceive: {}
        }
      };
    }
  }, [invoices, currentYear, currentQuarter, user?.firm, isLoading]);

  const quarterKey = `${currentYear}-Q${currentQuarter}`;
  const isSettled = user?.firm ? isQuarterSettled(quarterKey, user.firm) : false;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const handleSettleToggle = () => {
    if (!user?.firm) return;
    if (isSettled) {
      unsettleQuarter(quarterKey, user.firm);
    } else {
      settleQuarter(quarterKey, user.firm);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Year Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Current Quarter Summary</h2>
        <div className="relative">
          <select
            value={currentYear}
            onChange={(e) => selectYearAndQuarter(parseInt(e.target.value), currentQuarter)}
            className="appearance-none pl-10 pr-8 py-2 bg-white border-gray-300 text-gray-700 hover:border-indigo-500 rounded-lg shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:border-indigo-400 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </div>

      {/* Quarters Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 italic dark:text-gray-400">
            Click quarter to view details
          </div>
          <button
            onClick={handleSettleToggle}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isSettled 
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
            }`}
          >
            {isSettled ? 'Mark as Unsettled' : 'Mark as Settled'}
          </button>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((quarter) => (
            <div key={quarter} className="flex items-center">
              <QuarterCircle 
                quarter={quarter} 
                currentQuarter={currentQuarter}
                onSelect={() => selectYearAndQuarter(currentYear, quarter)}
                isSettled={isQuarterSettled(`${currentYear}-Q${quarter}`, user?.firm || 'SKALLARS')}
              />
              {quarter < 4 && (
                <div className={`w-8 h-0.5 ${quarter < currentQuarter ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-200 dark:bg-gray-600'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Commissions to Pay</h3>
          {Object.entries(quarterStats.commissionsByFirm.owed).map(([firm, amount]) => (
            <div key={firm} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-300 dark:bg-gray-750 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{firm}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Euro className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                {formatCurrency(amount)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Commissions to Receive</h3>
          {Object.entries(quarterStats.commissionsByFirm.toReceive).map(([firm, amount]) => (
            <div key={firm} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-300 dark:bg-gray-750 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{firm}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Euro className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                {formatCurrency(amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Original Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid Commissions</h3>
            <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Euro className="w-5 h-5 mr-1 text-gray-400 dark:text-gray-500" />
            {formatCurrency(quarterStats.paidCommissions)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Commissions</h3>
            <XCircle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Euro className="w-5 h-5 mr-1 text-gray-400 dark:text-gray-500" />
            {formatCurrency(quarterStats.unpaidCommissions)}
          </p>
        </div>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Euro className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
            {formatCurrency(quarterStats.totalRevenue)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Commissions</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Euro className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
            {formatCurrency(quarterStats.totalCommissions)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Status</p>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {quarterStats.paidCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {quarterStats.unpaidCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
