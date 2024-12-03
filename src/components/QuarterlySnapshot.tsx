import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useYear, isInQuarter } from "../context/YearContext";
import { useCommissions } from "../context/CommissionContext";
import {
  ArrowUpRight,
  ArrowDownRight,
  Euro,
  AlertCircle,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import QuarterYearSelector from "./QuarterYearSelector";
import type { FirmType } from "../types";

const firmThemes = {
  SKALLARS: {
    light: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
  },
  MKMs: {
    light: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
  },
  Contax: {
    light: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-600",
  },
} as const;

interface UnpaidQuarterInfo {
  quarter: string;
  year: number;
  amount: number;
  receivable: number;
  payable: number;
}

interface CommissionsByFirm {
  firm: FirmType;
  amount: number;
  canSettle: boolean;
  isSettled: boolean;
}

interface QuarterlyData {
  toReceive: {
    total: number;
    byFirm: Record<FirmType, CommissionsByFirm>;
  };
  toPay: {
    total: number;
    byFirm: Record<FirmType, CommissionsByFirm>;
  };
}

interface CommissionSummary {
  toReceive: {
    total: number;
    byFirm: Record<FirmType, number>;
  };
  toPay: {
    total: number;
    byFirm: Record<FirmType, number>;
  };
}

function CommissionCard({
  firm,
  amount,
  direction,
  userFirm,
}: {
  firm: FirmType;
  amount: number;
  direction: "receivable" | "payable";
  userFirm: FirmType;
}) {
  const theme = firmThemes[firm];

  return (
    <div
      className={`
        p-4 rounded-lg ${theme.light} ${theme.border}
        flex justify-between items-center
      `}
    >
      <div className="flex items-center space-x-3">
        {direction === "receivable" ? (
          <>
            <span className={`font-medium ${theme.text}`}>{firm}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-600">owes you</span>
          </>
        ) : (
          <>
            <span className="font-medium text-gray-600">you owe</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className={`font-medium ${theme.text}`}>{firm}</span>
          </>
        )}
      </div>
      <div className="font-medium text-gray-900">{formatCurrency(amount)}</div>
    </div>
  );
}

function UnpaidQuartersWarning({
  unpaidQuarters,
  onQuarterClick,
}: {
  unpaidQuarters: UnpaidQuarterInfo[];
  onQuarterClick: (quarter: string, year: number) => void;
}) {
  if (unpaidQuarters.length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-amber-800">
            Unpaid Commissions from Previous Quarters
          </h4>
          <div className="mt-2 space-y-2">
            {unpaidQuarters.map((q) => (
              <button
                key={`${q.quarter}-${q.year}`}
                onClick={() => onQuarterClick(q.quarter, q.year)}
                className="w-full text-left"
              >
                <div className="text-sm text-amber-700 hover:text-amber-900">
                  <span className="font-medium">
                    {q.quarter} {q.year}
                  </span>
                  <div className="ml-4 space-y-1">
                    {q.receivable > 0 && (
                      <div>To receive: {formatCurrency(q.receivable)}</div>
                    )}
                    {q.payable > 0 && (
                      <div>To pay: {formatCurrency(q.payable)}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuarterlySnapshot() {
  const { invoices } = useInvoices();
  const { user } = useAuth();
  const { currentYear, currentQuarter, selectYearAndQuarter } = useYear();
  const { isQuarterSettled, settleQuarter } = useCommissions();

  const { quarterlyData, unpaidQuarters } = useMemo(() => {
    // Initialize quarterly data
    const currentQuarterData: QuarterlyData = {
      toReceive: { total: 0, byFirm: {} },
      toPay: { total: 0, byFirm: {} },
    };

    // Track unpaid commissions by quarter
    const unpaidByQuarter: Record<string, UnpaidQuarterInfo> = {};

    invoices.forEach((invoice) => {
      if (invoice.referredByFirm === invoice.invoicedByFirm) return; // Skip self-referrals

      const invoiceDate = new Date(invoice.date);
      const invoiceQuarter = Math.floor(invoiceDate.getMonth() / 3) + 1;
      const invoiceYear = invoiceDate.getFullYear();
      const quarterKey = `Q${invoiceQuarter}`;
      const commission = (invoice.amount * invoice.commissionPercentage) / 100;

      // Handle current quarter commissions
      if (isInQuarter(invoiceDate, currentYear, currentQuarter)) {
        if (invoice.referredByFirm === user?.firm) {
          // We are owed commission
          if (!currentQuarterData.toReceive.byFirm[invoice.invoicedByFirm]) {
            currentQuarterData.toReceive.byFirm[invoice.invoicedByFirm] = {
              firm: invoice.invoicedByFirm,
              amount: 0,
              canSettle: invoice.isPaid,
              isSettled: isQuarterSettled(`${currentYear}-Q${currentQuarter}-${invoice.invoicedByFirm}`, user.firm)
            };
          }
          currentQuarterData.toReceive.byFirm[invoice.invoicedByFirm].amount += commission;
          currentQuarterData.toReceive.total += commission;
          // Update canSettle status
          if (!invoice.isPaid) {
            currentQuarterData.toReceive.byFirm[invoice.invoicedByFirm].canSettle = false;
          }
        }
        if (invoice.invoicedByFirm === user?.firm) {
          // We owe commission
          if (!currentQuarterData.toPay.byFirm[invoice.referredByFirm]) {
            currentQuarterData.toPay.byFirm[invoice.referredByFirm] = {
              firm: invoice.referredByFirm,
              amount: 0,
              canSettle: invoice.isPaid,
              isSettled: isQuarterSettled(`${currentYear}-Q${currentQuarter}-${user.firm}`, invoice.referredByFirm)
            };
          }
          currentQuarterData.toPay.byFirm[invoice.referredByFirm].amount += commission;
          currentQuarterData.toPay.total += commission;
          // Update canSettle status
          if (!invoice.isPaid) {
            currentQuarterData.toPay.byFirm[invoice.referredByFirm].canSettle = false;
          }
        }
      }

      // Track unpaid commissions from previous quarters
      if (
        !invoice.isPaid &&
        !isInQuarter(invoiceDate, currentYear, currentQuarter)
      ) {
        const key = `${quarterKey}-${invoiceYear}`;
        if (!unpaidByQuarter[key]) {
          unpaidByQuarter[key] = {
            quarter: quarterKey,
            year: invoiceYear,
            amount: 0,
            receivable: 0,
            payable: 0,
          };
        }

        if (invoice.referredByFirm === user?.firm) {
          unpaidByQuarter[key].receivable += commission;
          unpaidByQuarter[key].amount += commission;
        }
        if (invoice.invoicedByFirm === user?.firm) {
          unpaidByQuarter[key].payable += commission;
          unpaidByQuarter[key].amount += commission;
        }
      }
    });

    return {
      quarterlyData: currentQuarterData,
      unpaidQuarters: Object.values(unpaidByQuarter).sort(
        (a, b) => b.year - a.year || b.quarter.localeCompare(a.quarter),
      ),
    };
  }, [invoices, user?.firm, currentYear, currentQuarter, isQuarterSettled]);

  const handleQuarterClick = (quarter: string, year: number) => {
    const quarterNumber = parseInt(quarter.replace("Q", ""));
    selectYearAndQuarter(year, quarterNumber);

    // Scroll to unpaid invoices section
    const unpaidSection = document.querySelector(".unpaid-invoices-section");
    if (unpaidSection) {
      unpaidSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSettleQuarter = (partnerFirm: FirmType, direction: 'receive' | 'pay') => {
    if (!user?.firm) return;
    
    // Create a quarter key that includes both firms involved
    // The key format should be: [YEAR]-Q[QUARTER]-[PAYING_FIRM]-[RECEIVING_FIRM]
    const quarterKey = direction === 'receive' 
      ? `${currentYear}-Q${currentQuarter}-${partnerFirm}-${user.firm}`
      : `${currentYear}-Q${currentQuarter}-${user.firm}-${partnerFirm}`;
    
    // Only the firm that is owed the commission can mark it as settled
    if (direction === 'receive') {
      settleQuarter(quarterKey, user.firm);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Quarter/Year Selector */}
      <QuarterYearSelector />

      {/* Unpaid Quarters Warning */}
      <UnpaidQuartersWarning
        unpaidQuarters={unpaidQuarters}
        onQuarterClick={handleQuarterClick}
      />

      {/* Main Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-700">To Receive</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">
            {formatCurrency(quarterlyData.toReceive.total)}
          </div>
          <div className="mt-1 text-sm text-green-600">
            From all partners
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-700">To Pay</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">
            {formatCurrency(quarterlyData.toPay.total)}
          </div>
          <div className="mt-1 text-sm text-blue-600">
            To all partners
          </div>
        </div>
      </div>

      {/* Commissions To Receive */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Commissions to Receive</h3>
        <div className="space-y-3">
          {Object.values(quarterlyData.toReceive.byFirm).map((commission) => (
            <div
              key={`receive-${commission.firm}`}
              className={`p-4 bg-white rounded-lg border ${
                commission.canSettle && !commission.isSettled
                  ? 'border-indigo-300 shadow-md'
                  : 'border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{commission.firm}</h4>
                  <p className="text-sm text-gray-500">
                    {commission.canSettle 
                      ? "All invoices paid" 
                      : "Some invoices pending payment"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">
                    {formatCurrency(commission.amount)}
                  </p>
                  {commission.isSettled ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Settled
                    </span>
                  ) : commission.canSettle ? (
                    <button
                      onClick={() => handleSettleQuarter(commission.firm, 'receive')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Mark as Received
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <Clock className="w-4 h-4 mr-1" />
                      Pending Payments
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {Object.keys(quarterlyData.toReceive.byFirm).length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No commissions to receive this quarter
            </div>
          )}
        </div>
      </div>

      {/* Commissions To Pay */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Commissions to Pay</h3>
        <div className="space-y-3">
          {Object.values(quarterlyData.toPay.byFirm).map((commission) => (
            <div
              key={`pay-${commission.firm}`}
              className={`p-4 bg-white rounded-lg border ${
                commission.canSettle && !commission.isSettled
                  ? 'border-red-300 shadow-md'
                  : 'border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{commission.firm}</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">
                      {commission.canSettle 
                        ? "All invoices paid" 
                        : "Some invoices pending payment"}
                    </p>
                    {commission.canSettle && !commission.isSettled && (
                      <p className="text-sm text-red-600 font-medium">
                        Commission payment required
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">
                    {formatCurrency(commission.amount)}
                  </p>
                  {commission.isSettled ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Settled
                    </span>
                  ) : commission.canSettle ? (
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-sm text-red-600">
                        Waiting for {commission.firm} to confirm
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <Clock className="w-4 h-4 mr-1" />
                      Pending Payments
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {Object.keys(quarterlyData.toPay.byFirm).length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No commissions to pay this quarter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
