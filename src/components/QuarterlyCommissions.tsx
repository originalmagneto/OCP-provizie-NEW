import React, { useState, useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useCommissions } from "../context/CommissionContext";
import { Euro, FileText, TrendingUp, Calendar } from "lucide-react";
import type { FirmType } from "../types";
import { QuarterlyCommissionCard } from "./QuarterlyCommissionCard";

interface QuarterlyData {
  quarter: string;
  eligibleCommissions: {
    fromFirm: FirmType;
    amount: number;
    isSettled: boolean;
    invoiceIds: string[];
  }[];
}

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

      // Calculate commission (10% of paid invoice)
      const commission = invoice.amount * 0.1;
      
      // Find or create commission entry for the invoicing firm
      const commissionEntry = data[quarterKey].eligibleCommissions.find(
        c => c.fromFirm === invoice.invoicedByFirm
      );

      if (commissionEntry) {
        commissionEntry.amount += commission;
        commissionEntry.invoiceIds.push(invoice.id);
      } else {
        data[quarterKey].eligibleCommissions.push({
          fromFirm: invoice.invoicedByFirm,
          amount: commission,
          isSettled: isQuarterSettled(`${quarterKey}-${invoice.invoicedByFirm}`),
          invoiceIds: [invoice.id]
        });
      }
    });

    return Object.values(data).sort((a, b) => b.quarter.localeCompare(a.quarter));
  }, [invoices, user?.firm, isQuarterSettled]);

  const handleSettleCommission = (fromFirm: FirmType) => {
    if (!user?.firm) return;
    settleQuarter(`${selectedQuarter}-${fromFirm}`, user.firm);
  };

  const currentQuarterData = quarterlyData.find(
    (data) => data.quarter === selectedQuarter
  );

  if (!currentQuarterData || !user?.firm) {
    return <div>No eligible commissions found</div>;
  }

  const [year, quarterStr] = selectedQuarter.split("-");
  const quarter = parseInt(quarterStr.replace("Q", ""));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Eligible Commissions
        </h2>
        <select
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
          className="rounded-lg border-gray-300 text-gray-700"
        >
          {quarterlyData.map((data) => (
            <option key={data.quarter} value={data.quarter}>
              {data.quarter}
            </option>
          ))}
        </select>
      </div>

      {currentQuarterData.eligibleCommissions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No eligible commissions for this quarter
        </div>
      ) : (
        <div className="grid gap-6">
          {currentQuarterData.eligibleCommissions.map((commission) => (
            <div key={commission.fromFirm} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Commission from {commission.fromFirm}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Based on {commission.invoiceIds.length} paid invoice{commission.invoiceIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-emerald-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(commission.amount)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  {commission.isSettled ? (
                    <div className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Commission Settled</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSettleCommission(commission.fromFirm)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Mark as Settled
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuarterlyCommissions;
