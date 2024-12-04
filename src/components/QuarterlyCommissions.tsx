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

    // Filter for paid invoices where the current user's firm is involved
    const eligibleInvoices = invoices.filter(invoice => 
      invoice.isPaid && 
      (invoice.referredByFirm === user.firm || invoice.invoicedByFirm === user.firm)
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

      const isUserPaying = invoice.invoicedByFirm === user.firm;
      const commissionAmount = invoice.amount * (invoice.commissionPercentage / 100);
      const otherFirm = isUserPaying ? invoice.referredByFirm : invoice.invoicedByFirm;

      // Find existing commission entry for this firm
      const existingCommission = data[quarterKey].eligibleCommissions.find(
        comm => comm.fromFirm === otherFirm
      );

      if (existingCommission) {
        existingCommission.amount += commissionAmount;
        existingCommission.invoiceIds.push(invoice.id);
      } else {
        data[quarterKey].eligibleCommissions.push({
          fromFirm: otherFirm,
          amount: commissionAmount,
          isSettled: isQuarterSettled(`${quarterKey}-${otherFirm}-${user.firm}`, otherFirm),
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

  // Sort quarters in reverse chronological order
  const sortedQuarterlyData = [...quarterlyData].sort((a, b) => {
    const [yearA, quarterA] = a.quarter.split('-Q').map(Number);
    const [yearB, quarterB] = b.quarter.split('-Q').map(Number);
    if (yearA !== yearB) return yearB - yearA;
    return quarterB - quarterA;
  });

  // Get the selected quarter data
  const selectedQuarterData = sortedQuarterlyData.find(data => data.quarter === selectedQuarter);

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quarterly Commissions</h2>
        <div className="flex gap-2">
          {sortedQuarterlyData.map((data) => {
            const [year, quarterStr] = data.quarter.split('-');
            const quarter = parseInt(quarterStr.replace('Q', ''));
            const now = new Date();
            const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
            const currentYear = now.getFullYear();
            const isCurrentQuarter = parseInt(year) === currentYear && quarter === currentQuarter;

            // Calculate pending commissions for the badge
            const pendingCommissions = data.eligibleCommissions.filter(comm => !comm.isSettled).length;

            return (
              <button
                key={data.quarter}
                onClick={() => setSelectedQuarter(data.quarter)}
                className={`relative px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedQuarter === data.quarter
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Q{quarter} {year}</span>
                  {isCurrentQuarter && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-500 text-white rounded">
                      Current
                    </span>
                  )}
                </div>
                {pendingCommissions > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
                    {pendingCommissions}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedQuarterData && (
        <div key={selectedQuarterData.quarter}>
          {(() => {
            const [year, quarterStr] = selectedQuarterData.quarter.split('-');
            const quarter = parseInt(quarterStr.replace('Q', ''));
            const now = new Date();
            const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
            const currentYear = now.getFullYear();
            const isCurrentQuarter = parseInt(year) === currentYear && quarter === currentQuarter;

            // Calculate total revenue for the quarter
            const totalRevenue = selectedQuarterData.eligibleCommissions.reduce(
              (sum, commission) => sum + commission.amount,
              0
            );

            // Transform eligible commissions into the format expected by QuarterlyCommissionCard
            const commissionsByFirm = selectedQuarterData.eligibleCommissions.map((commission) => ({
              firm: commission.fromFirm,
              amount: commission.amount,
              isPaying: commission.fromFirm === user?.firm,
              isSettled: commission.isSettled,
            }));

            return (
              <QuarterlyCommissionCard
                key={selectedQuarterData.quarter}
                quarterKey={selectedQuarterData.quarter}
                quarter={quarter}
                year={parseInt(year)}
                revenue={totalRevenue}
                commissionsByFirm={commissionsByFirm}
                userFirm={user?.firm}
                onSettleCommission={handleSettleCommission}
                isCurrentQuarter={isCurrentQuarter}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default QuarterlyCommissions;
