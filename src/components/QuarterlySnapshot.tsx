import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { ArrowUpRight, ArrowDownRight, Euro, AlertCircle } from "lucide-react";
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

interface CommissionSummary {
  toReceive: {
    total: number;
    byFirm: Record<FirmType, number>;
  };
  toPay: {
    total: number;
    byFirm: Record<FirmType, number>;
  };
  previousQuarter: {
    received: number;
    paid: number;
  };
}

function FirmCommissionCard({
  firm,
  amount,
  type,
}: {
  firm: FirmType;
  amount: number;
  type: "receive" | "pay";
}) {
  const theme = firmThemes[firm];

  return (
    <div
      className={`p-4 rounded-lg ${theme.light} ${theme.border} flex justify-between items-center`}
    >
      <div>
        <span className={`font-medium ${theme.text}`}>{firm}</span>
        <span className="text-sm text-gray-500 ml-2">
          {type === "receive" ? "to receive" : "to pay"}
        </span>
      </div>
      <div className="font-medium text-gray-900">
        {new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(amount)}
      </div>
    </div>
  );
}

export default function QuarterlySnapshot() {
  const { invoices } = useInvoices();
  const { user } = useAuth();

  const quarterlyData: CommissionSummary = useMemo(() => {
    const now = new Date();
    const quarterStart = new Date(
      now.getFullYear(),
      Math.floor(now.getMonth() / 3) * 3,
      1,
    );
    const quarterEnd = new Date(
      now.getFullYear(),
      Math.floor(now.getMonth() / 3) * 3 + 3,
      0,
    );

    const previousQuarterStart = new Date(
      quarterStart.getFullYear(),
      quarterStart.getMonth() - 3,
      1,
    );

    return invoices.reduce(
      (summary, invoice) => {
        const invoiceDate = new Date(invoice.date);
        const isCurrentQuarter =
          invoiceDate >= quarterStart && invoiceDate <= quarterEnd;
        const isPreviousQuarter =
          invoiceDate >= previousQuarterStart && invoiceDate < quarterStart;

        if (isCurrentQuarter) {
          const commission =
            (invoice.amount * invoice.commissionPercentage) / 100;

          if (invoice.referredByFirm !== invoice.invoicedByFirm) {
            // Update receivable amount for referring firm
            if (invoice.referredByFirm === user?.firm) {
              summary.toReceive.total += commission;
              summary.toReceive.byFirm[invoice.invoicedByFirm] =
                (summary.toReceive.byFirm[invoice.invoicedByFirm] || 0) +
                commission;
            }

            // Update payable amount for invoicing firm
            if (invoice.invoicedByFirm === user?.firm) {
              summary.toPay.total += commission;
              summary.toPay.byFirm[invoice.referredByFirm] =
                (summary.toPay.byFirm[invoice.referredByFirm] || 0) +
                commission;
            }
          }
        }

        if (isPreviousQuarter && invoice.isPaid) {
          const commission =
            (invoice.amount * invoice.commissionPercentage) / 100;
          if (invoice.referredByFirm === user?.firm) {
            summary.previousQuarter.received += commission;
          }
          if (invoice.invoicedByFirm === user?.firm) {
            summary.previousQuarter.paid += commission;
          }
        }

        return summary;
      },
      {
        toReceive: { total: 0, byFirm: {} as Record<FirmType, number> },
        toPay: { total: 0, byFirm: {} as Record<FirmType, number> },
        previousQuarter: { received: 0, paid: 0 },
      } as CommissionSummary,
    );
  }, [invoices, user]);

  if (!user) return null;

  const quarterName = `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Quarter Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{quarterName}</h3>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", { month: "long" })}
        </span>
      </div>

      {/* Main Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-700">To Receive</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">
            {new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
            }).format(quarterlyData.toReceive.total)}
          </div>
          <div className="mt-1 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-700">
              vs {formatCurrency(quarterlyData.previousQuarter.received)} last
              quarter
            </span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-700">To Pay</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">
            {new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
            }).format(quarterlyData.toPay.total)}
          </div>
          <div className="mt-1 flex items-center text-sm">
            <ArrowDownRight className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-blue-700">
              vs {formatCurrency(quarterlyData.previousQuarter.paid)} last
              quarter
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">
          Detailed Breakdown
        </h4>

        {/* Commissions to Receive */}
        {Object.entries(quarterlyData.toReceive.byFirm).map(
          ([firm, amount]) => (
            <FirmCommissionCard
              key={`receive-${firm}`}
              firm={firm as FirmType}
              amount={amount}
              type="receive"
            />
          ),
        )}

        {/* Commissions to Pay */}
        {Object.entries(quarterlyData.toPay.byFirm).map(([firm, amount]) => (
          <FirmCommissionCard
            key={`pay-${firm}`}
            firm={firm as FirmType}
            amount={amount}
            type="pay"
          />
        ))}

        {/* No Commissions Message */}
        {Object.keys(quarterlyData.toReceive.byFirm).length === 0 &&
          Object.keys(quarterlyData.toPay.byFirm).length === 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center text-gray-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              No commission transactions for this quarter yet
            </div>
          )}
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
