import React, { useState, useMemo, useCallback } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useCommissions } from "../context/CommissionContext";
import { QuarterlyCommissionCard } from "./QuarterlyCommissionCard";
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
          isSettled: isQuarterSettled(`${quarterKey}-${invoice.invoicedByFirm}-${user.firm}`, invoice.invoicedByFirm),
          invoiceIds: [invoice.id]
        });
      }
    });

    return Object.values(data);
  }, [invoices, user?.firm, isQuarterSettled]);

  const handleSettleCommission = useCallback(async (firm: FirmType) => {
    if (!user?.firm) return;
    
    try {
      const settlementKey = `${selectedQuarter}-${firm}-${user.firm}`;
      await settleQuarter(settlementKey, firm);
      console.log('Settlement completed for:', settlementKey);
    } catch (error) {
      console.error('Error settling commission:', error);
    }
  }, [selectedQuarter, settleQuarter, user?.firm]);

  if (!user?.firm) {
    return null;
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quarterly Commissions</h2>
        <div className="flex gap-4">
          {quarterlyData.map((data) => (
            <button
              key={data.quarter}
              onClick={() => setSelectedQuarter(data.quarter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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

      {quarterlyData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No commission data available for this quarter
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quarterlyData
            .find(data => data.quarter === selectedQuarter)
            ?.eligibleCommissions.map(({ fromFirm, amount, isSettled }) => {
              const settlementKey = `${selectedQuarter}-${fromFirm}-${user.firm}`;
              return (
                <QuarterlyCommissionCard
                  key={`${settlementKey}-${amount}`}
                  quarterKey={settlementKey}
                  quarter={parseInt(selectedQuarter.split('-Q')[1])}
                  year={parseInt(selectedQuarter.split('-')[0])}
                  revenue={amount}
                  commissionsByFirm={[
                    {
                      firm: fromFirm,
                      amount,
                      isPaying: false,
                      isSettled: isQuarterSettled(settlementKey, fromFirm)
                    }
                  ]}
                  userFirm={user.firm}
                  onSettleCommission={handleSettleCommission}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}

export default QuarterlyCommissions;
