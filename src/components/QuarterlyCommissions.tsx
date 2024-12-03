import React, { useState, useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useCommissions } from "../context/CommissionContext";
import { QuarterlyCommissionCard } from "./QuarterlyCommissionCard";
import { AlertCircle, CircleDollarSign, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import type { FirmType } from "../types";

interface QuarterlyData {
  quarter: string;
  eligibleCommissions: {
    fromFirm: FirmType;
    amount: number;
    isSettled: boolean;
    invoiceIds: string[];
  }[];
}

const firmColors: Record<FirmType, { bg: string; text: string; border: string; lightBg: string }> = {
  SKALLARS: {
    bg: "bg-purple-100",
    text: "text-purple-900",
    border: "border-purple-200",
    lightBg: "bg-purple-50"
  },
  MKMs: {
    bg: "bg-blue-100",
    text: "text-blue-900",
    border: "border-blue-200",
    lightBg: "bg-blue-50"
  },
  Contax: {
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    border: "border-emerald-200",
    lightBg: "bg-emerald-50"
  },
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

function QuarterlyCommissions() {
  const { user } = useAuth();
  const { invoices } = useInvoices();
  const { isQuarterSettled, settleQuarter } = useCommissions();
  const [selectedQuarter, setSelectedQuarter] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
  });

  const quarterlyData = useMemo(() => {
    if (!invoices || !user?.firm) return [];

    const data: { [key: string]: QuarterlyData } = {};

    // Filter for paid invoices where the current user's firm is the referrer
    const eligibleInvoices = invoices.filter(invoice => 
      invoice.isPaid && 
      invoice.referredByFirm === user.firm
    );

    // Group by quarter and calculate commissions
    eligibleInvoices.forEach((invoice) => {
      const date = new Date(invoice.date);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const year = date.getFullYear();
      const quarterKey = `${year}-Q${quarter}`;

      if (!data[quarterKey]) {
        data[quarterKey] = {
          quarter: quarterKey,
          eligibleCommissions: []
        };
      }

      // Find existing commission entry for this firm
      const existingCommission = data[quarterKey].eligibleCommissions.find(
        comm => comm.fromFirm === invoice.invoicedByFirm
      );

      if (existingCommission) {
        existingCommission.amount += invoice.amount * (invoice.commissionPercentage / 100);
        existingCommission.invoiceIds.push(invoice.id);
      } else {
        data[quarterKey].eligibleCommissions.push({
          fromFirm: invoice.invoicedByFirm,
          amount: invoice.amount * (invoice.commissionPercentage / 100),
          isSettled: isQuarterSettled(quarterKey, invoice.invoicedByFirm),
          invoiceIds: [invoice.id]
        });
      }
    });

    return Object.values(data);
  }, [invoices, user?.firm, isQuarterSettled]);

  const selectedQuarterData = quarterlyData.find(
    data => data.quarter === selectedQuarter
  );

  const handleSettleCommission = async (firm: FirmType) => {
    try {
      await settleQuarter(selectedQuarter, firm);
    } catch (error) {
      console.error('Error settling commission:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quarterly Commissions</h2>
        <div className="flex gap-4">
          {quarterlyData.map((data) => (
            <button
              key={data.quarter}
              onClick={() => setSelectedQuarter(data.quarter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedQuarter === data.quarter
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {data.quarter}
            </button>
          ))}
        </div>
      </div>

      {selectedQuarterData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedQuarterData.eligibleCommissions.map(({ fromFirm, amount, isSettled }) => (
            <QuarterlyCommissionCard
              key={fromFirm}
              quarterKey={selectedQuarter}
              quarter={parseInt(selectedQuarter.split('-Q')[1])}
              year={parseInt(selectedQuarter.split('-')[0])}
              revenue={amount}
              commissionsByFirm={[
                {
                  firm: fromFirm,
                  amount,
                  isPaying: false,
                  isSettled
                }
              ]}
              userFirm={user?.firm || 'SKALLARS'}
              onSettleCommission={handleSettleCommission}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default QuarterlyCommissions;
