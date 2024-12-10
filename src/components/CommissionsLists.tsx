import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useYear, isInQuarter } from "../context/YearContext";
import { useAuth } from "../context/AuthContext";
import { useCommissions } from "../context/CommissionContext";
import { ArrowUpRight, ArrowDownRight, Euro } from "lucide-react";
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

interface CommissionsByFirm {
  firm: FirmType;
  amount: number;
  canSettle: boolean;
  isSettled: boolean;
  invoiceIds: string[];
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

function CommissionCard({
  firm,
  amount,
  direction,
  userFirm,
  canSettle,
  isSettled,
  onSettle,
}: {
  firm: FirmType;
  amount: number;
  direction: "receivable" | "payable";
  userFirm: FirmType;
  canSettle: boolean;
  isSettled: boolean;
  onSettle?: () => void;
}) {
  const theme = firmThemes[firm];
  const Icon = direction === "receivable" ? ArrowUpRight : ArrowDownRight;
  const iconColor = direction === "receivable" ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg ${theme.light} ${theme.border} border`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <span className={`font-medium ${theme.text}`}>{firm}</span>
        <span className="text-gray-600">{formatCurrency(amount)}</span>
      </div>
      {direction === "receivable" && !isSettled && canSettle && (
        <button
          onClick={onSettle}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Mark as Settled
        </button>
      )}
      {isSettled && (
        <span className="text-green-500 text-sm font-medium">Settled</span>
      )}
    </div>
  );
}

function CommissionsLists() {
  const { user } = useAuth();
  const { currentYear, currentQuarter } = useYear();
  const { invoices } = useInvoices();
  const { settleQuarter, isQuarterSettled } = useCommissions();

  const quarterKey = `${currentYear}-Q${currentQuarter}`;

  const quarterlyData = useMemo(() => {
    const data: QuarterlyData = {
      toReceive: {
        total: 0,
        byFirm: {},
      },
      toPay: {
        total: 0,
        byFirm: {},
      },
    };

    invoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice.date);
      if (isInQuarter(invoiceDate, currentYear, currentQuarter)) {
        const commission = invoice.amount * (invoice.commissionPercentage / 100);

        if (invoice.referredByFirm === user.firm) {
          if (!data.toReceive.byFirm[invoice.invoicedByFirm]) {
            data.toReceive.byFirm[invoice.invoicedByFirm] = {
              firm: invoice.invoicedByFirm,
              amount: 0,
              canSettle: invoice.isPaid,
              isSettled: isQuarterSettled(quarterKey, invoice.invoicedByFirm, invoice.id),
              invoiceIds: []
            };
          }
          data.toReceive.byFirm[invoice.invoicedByFirm].amount += commission;
          data.toReceive.byFirm[invoice.invoicedByFirm].invoiceIds.push(invoice.id);
          data.toReceive.total += commission;
        }

        if (invoice.invoicedByFirm === user.firm) {
          if (!data.toPay.byFirm[invoice.referredByFirm]) {
            data.toPay.byFirm[invoice.referredByFirm] = {
              firm: invoice.referredByFirm,
              amount: 0,
              canSettle: invoice.isPaid,
              isSettled: isQuarterSettled(quarterKey, user.firm, invoice.id),
              invoiceIds: []
            };
          }
          data.toPay.byFirm[invoice.referredByFirm].amount += commission;
          data.toPay.byFirm[invoice.referredByFirm].invoiceIds.push(invoice.id);
          data.toPay.total += commission;
        }
      }
    });

    return data;
  }, [invoices, currentYear, currentQuarter, user?.firm, quarterKey, isQuarterSettled]);

  if (!user) return null;

  const handleSettleCommission = async (firm: FirmType, invoiceIds: string[]) => {
    try {
      await settleQuarter(quarterKey, firm, invoiceIds);
    } catch (error) {
      console.error('Error settling commission:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 space-y-6">
        {/* Commissions to Receive */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Commissions to Receive</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.values(quarterlyData.toReceive.byFirm).map((commission) => (
              <CommissionCard
                key={`receive-${commission.firm}`}
                firm={commission.firm}
                amount={commission.amount}
                direction="receivable"
                userFirm={user.firm}
                canSettle={commission.canSettle}
                isSettled={commission.isSettled}
                onSettle={() => handleSettleCommission(commission.firm, commission.invoiceIds)}
              />
            ))}
            {Object.keys(quarterlyData.toReceive.byFirm).length === 0 && (
              <div className="col-span-2 text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                No commissions to receive this quarter
              </div>
            )}
          </div>
        </div>

        {/* Commissions to Pay */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Commissions to Pay</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.values(quarterlyData.toPay.byFirm).map((commission) => (
              <CommissionCard
                key={`pay-${commission.firm}`}
                firm={commission.firm}
                amount={commission.amount}
                direction="payable"
                userFirm={user.firm}
                canSettle={commission.canSettle}
                isSettled={commission.isSettled}
                onSettle={() => handleSettleCommission(commission.firm, commission.invoiceIds)}
              />
            ))}
            {Object.keys(quarterlyData.toPay.byFirm).length === 0 && (
              <div className="col-span-2 text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                No commissions to pay this quarter
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default CommissionsLists;
