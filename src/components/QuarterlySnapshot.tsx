import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useYear, isInQuarter } from "../context/YearContext";
import {
  ArrowUpRight,
  ArrowDownRight,
  Euro,
  AlertCircle,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export default function QuarterlySnapshot() {
  const { invoices } = useInvoices();
  const { user } = useAuth();
  const { currentYear, currentQuarter, selectYearAndQuarter } = useYear();

  const { quarterlyData, unpaidQuarters } = useMemo(() => {
    if (!user?.firm || !invoices) {
      return {
        quarterlyData: {
          toReceive: { total: 0, byFirm: {} as Record<FirmType, number> },
          toPay: { total: 0, byFirm: {} as Record<FirmType, number> },
        },
        unpaidQuarters: [],
      };
    }

    // Initialize quarterly data
    const currentQuarterData: CommissionSummary = {
      toReceive: { total: 0, byFirm: {} as Record<FirmType, number> },
      toPay: { total: 0, byFirm: {} as Record<FirmType, number> },
    };

    // Track unpaid commissions by quarter
    const unpaidByQuarter: Record<string, UnpaidQuarterInfo> = {};

    // Process all invoices
    invoices.forEach((invoice) => {
      // Skip self-referrals and invalid invoices
      if (
        invoice.referredByFirm === invoice.invoicedByFirm ||
        !invoice.amount ||
        !invoice.commissionPercentage
      ) return;

      const invoiceDate = new Date(invoice.date);
      const invoiceQuarter = Math.floor(invoiceDate.getMonth() / 3) + 1;
      const invoiceYear = invoiceDate.getFullYear();
      const quarterKey = `Q${invoiceQuarter}`;
      const commission = (invoice.amount * invoice.commissionPercentage) / 100;

      // Handle current quarter commissions (paid only)
      if (isInQuarter(invoiceDate, currentYear, currentQuarter)) {
        if (invoice.isPaid) {
          // Handle commissions to receive (when user's firm referred the client)
          if (invoice.referredByFirm === user.firm) {
            currentQuarterData.toReceive.total += commission;
            currentQuarterData.toReceive.byFirm[invoice.invoicedByFirm] =
              (currentQuarterData.toReceive.byFirm[invoice.invoicedByFirm] || 0) +
              commission;
          }

          // Handle commissions to pay (when user's firm was invoicing)
          if (invoice.invoicedByFirm === user.firm) {
            currentQuarterData.toPay.total += commission;
            currentQuarterData.toPay.byFirm[invoice.referredByFirm] =
              (currentQuarterData.toPay.byFirm[invoice.referredByFirm] || 0) +
              commission;
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
  }, [invoices, user, currentYear, currentQuarter]);

  const handleQuarterClick = (quarter: string, year: number) => {
    const quarterNumber = parseInt(quarter.replace("Q", ""));
    selectYearAndQuarter(year, quarterNumber);

    // Scroll to unpaid invoices section
    const unpaidSection = document.querySelector(".unpaid-invoices-section");
    if (unpaidSection) {
      unpaidSection.scrollIntoView({ behavior: "smooth" });
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
            From paid invoices only
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-700">To Pay</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">
            {formatCurrency(quarterlyData.toPay.total)}
          </div>
          <div className="mt-1 text-sm text-blue-600">
            From paid invoices only
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          {/* Receivable Commissions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ArrowUpRight className="h-5 w-5 text-green-500 mr-2" />
              To Receive
              <span className="ml-2 text-sm text-gray-500">
                ({formatCurrency(quarterlyData.toReceive.total)})
              </span>
            </h3>
            <div className="space-y-3">
              {Object.entries(quarterlyData.toReceive.byFirm).map(([firm, amount]) => (
                <CommissionCard
                  key={`receive-${firm}`}
                  firm={firm as FirmType}
                  amount={amount}
                  direction="receivable"
                  userFirm={user.firm}
                />
              ))}
              {Object.keys(quarterlyData.toReceive.byFirm).length === 0 && (
                <div className="text-sm text-gray-500 italic">
                  No receivable commissions for this quarter
                </div>
              )}
            </div>
          </div>

          {/* Payable Commissions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ArrowDownRight className="h-5 w-5 text-red-500 mr-2" />
              To Pay
              <span className="ml-2 text-sm text-gray-500">
                ({formatCurrency(quarterlyData.toPay.total)})
              </span>
            </h3>
            <div className="space-y-3">
              {Object.entries(quarterlyData.toPay.byFirm).map(([firm, amount]) => (
                <CommissionCard
                  key={`pay-${firm}`}
                  firm={firm as FirmType}
                  amount={amount}
                  direction="payable"
                  userFirm={user.firm}
                />
              ))}
              {Object.keys(quarterlyData.toPay.byFirm).length === 0 && (
                <div className="text-sm text-gray-500 italic">
                  No payable commissions for this quarter
                </div>
              )}
            </div>
          </div>

          {/* Quarter Balance */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Quarter Balance</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  quarterlyData.toReceive.total - quarterlyData.toPay.total
                )}
              </span>
            </div>
          </div>
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
