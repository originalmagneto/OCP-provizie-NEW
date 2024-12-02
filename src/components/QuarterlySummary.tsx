import React, { useMemo, useState } from "react";
import { formatCurrency } from '../utils/formatters';
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { ArrowRightIcon, EuroIcon, ClockIcon, CheckIcon } from "lucide-react";
import type { FirmType } from "../types";

const firmThemes = {
  SKALLARS: {
    primary: "bg-purple-100",
    secondary: "bg-purple-50",
    text: "text-purple-600",
    accent: "bg-purple-600",
    border: "border-purple-200",
    gradient: "from-purple-50 to-purple-100",
  },
  MKMs: {
    primary: "bg-gray-100",
    secondary: "bg-gray-50",
    text: "text-gray-600",
    accent: "bg-gray-600",
    border: "border-gray-200",
    gradient: "from-gray-50 to-gray-100",
  },
  Contax: {
    primary: "bg-yellow-100",
    secondary: "bg-yellow-50",
    text: "text-yellow-600",
    accent: "bg-yellow-600",
    border: "border-yellow-200",
    gradient: "from-yellow-50 to-yellow-100",
  },
};

interface QuarterlyData {
  quarter: string;
  year: number;
  commissionsReceivable: {
    [firm in FirmType]?: {
      amount: number;
      count: number;
      isPaid: boolean;
    };
  };
  commissionsPayable: {
    [firm in FirmType]?: {
      amount: number;
      count: number;
      isPaid: boolean;
    };
  };
}

function FirmSummaryCard({
  firm,
  quarterlyData,
  currentUserFirm,
}: {
  firm: FirmType;
  quarterlyData: Record<string, QuarterlyData>;
  currentUserFirm: FirmType;
}) {
  const [isSettled, setIsSettled] = useState(false);

  const handleSettleCommissions = () => {
    setIsSettled(true);
    // Here you would typically update the state or make an API call to mark as settled
  };

  const firmData = quarterlyData[`${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`];
  const receivable = firmData?.commissionsReceivable[firm] || { amount: 0, count: 0 };
  const payable = firmData?.commissionsPayable[firm] || { amount: 0, count: 0 };

  return (
    <div className={`p-4 rounded-lg shadow ${firmThemes[firm].border}`}>
      <h3 className="text-lg font-medium mb-2">
        {firm} Summary
      </h3>
      <div className="mb-4">
        <p className="text-sm text-gray-500">Receivable: {formatCurrency(receivable.amount)}</p>
        <p className="text-sm text-gray-500">Payable: {formatCurrency(payable.amount)}</p>
      </div>
      <button
        onClick={handleSettleCommissions}
        className={`w-full py-2 text-white rounded-md transition-colors ${isSettled ? 'bg-green-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        disabled={isSettled}
      >
        {isSettled ? 'Settled' : 'Settle Commissions'}
      </button>
    </div>
  );
}

export default function QuarterlySummary() {
  const { invoices } = useInvoices();
  const { user } = useAuth();

  const quarterlyData = useMemo(() => {
    const data: Record<string, QuarterlyData> = {};

    invoices.forEach((invoice) => {
      if (!invoice.isPaid) return;

      const date = new Date(invoice.date);
      const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
      const year = date.getFullYear();
      const key = `${year}-${quarter}`;

      if (!data[key]) {
        data[key] = {
          quarter,
          year,
          commissionsReceivable: {},
          commissionsPayable: {},
        };
      }

      const commission = invoice.amount * (invoice.commissionPercentage / 100);

      // If this firm referred the client but didn't invoice
      if (invoice.referredByFirm !== invoice.invoicedByFirm) {
        // Add to receivable for the referring firm
        const receivable = data[key].commissionsReceivable[
          invoice.referredByFirm
        ] || {
          amount: 0,
          count: 0,
          isPaid: false,
        };
        receivable.amount += commission;
        receivable.count += 1;
        data[key].commissionsReceivable[invoice.referredByFirm] = receivable;

        // Add to payable for the invoicing firm
        const payable = data[key].commissionsPayable[
          invoice.invoicedByFirm
        ] || {
          amount: 0,
          count: 0,
          isPaid: false,
        };
        payable.amount += commission;
        payable.count += 1;
        data[key].commissionsPayable[invoice.invoicedByFirm] = payable;
      }
    });

    return data;
  }, [invoices]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">
        Quarterly Summary and Settlements
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(firmThemes).map((firm) => (
          <FirmSummaryCard
            key={firm}
            firm={firm as FirmType}
            quarterlyData={quarterlyData}
            currentUserFirm={user.firm}
          />
        ))}
      </div>
    </div>
  );
}
