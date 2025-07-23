import React, { useState, useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useCommissions } from "../context/CommissionContext";
import { Euro, FileText, TrendingUp, Calendar } from "lucide-react";
import type { FirmType } from "../types";
import { QuarterlyCommissionCard } from "./QuarterlyCommissionCard";
import QuarterlyCommissionSummary from "./QuarterlyCommissionSummary";

interface QuarterlyData {
  quarter: string;
  eligibleCommissions: {
    fromFirm: FirmType;
    amount: number;
    isSettled: boolean;
    invoiceIds: string[];
    type: 'receive' | 'pay';
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

    // Filter for paid invoices where commissions are involved
    const eligibleInvoices = invoices.filter(invoice => 
      invoice.isPaid && (
        // Commissions to receive: user's firm is the referrer
        invoice.referredByFirm === user.firm ||
        // Commissions to pay: user's firm is the invoicing firm and someone else referred
        (invoice.invoicedByFirm === user.firm && invoice.referredByFirm && invoice.referredByFirm !== user.firm)
      )
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

      // Calculate commission based on commission percentage or default 10%
      const commissionPercentage = invoice.commissionPercentage || 10;
      const commission = (invoice.amount * commissionPercentage) / 100;
      
      // Determine the firm and commission type
       let targetFirm: FirmType;
       let commissionType: 'receive' | 'pay';
       
       if (invoice.invoicedByFirm === user.firm && invoice.referredByFirm && invoice.referredByFirm !== user.firm) {
         // When someone else referred the client to user's firm, user owes commission to the referring firm
         targetFirm = invoice.referredByFirm;
         commissionType = 'pay';
       } else if (invoice.referredByFirm === user.firm && invoice.invoicedByFirm !== user.firm) {
         // When user's firm referred the client, they receive commission from the invoicing firm
         targetFirm = invoice.invoicedByFirm;
         commissionType = 'receive';
       } else {
         return; // Skip if no commission scenario applies
       }
      
      // Find or create commission entry
      let commissionEntry = data[quarterKey].eligibleCommissions.find(
        c => c.fromFirm === targetFirm
      );

      if (commissionEntry) {
        commissionEntry.amount += commission;
        commissionEntry.invoiceIds.push(invoice.id);
      } else {
        data[quarterKey].eligibleCommissions.push({
          fromFirm: targetFirm,
          amount: commission,
          isSettled: isQuarterSettled(`${quarterKey}-${targetFirm}`, targetFirm),
          invoiceIds: [invoice.id],
          type: commissionType
        });
      }
    });

    return Object.values(data).sort((a, b) => b.quarter.localeCompare(a.quarter));
  }, [invoices, user?.firm, isQuarterSettled]);

  const handleSettleCommission = (fromFirm: FirmType) => {
    if (!user?.firm) return;
    settleQuarter(`${selectedQuarter}-${fromFirm}`, user.firm as FirmType);
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
      {/* Commission Summary Overview */}
      <QuarterlyCommissionSummary />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Detailed Commission Breakdown
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
            <div key={`${commission.fromFirm}-${commission.type}`} className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
              commission.type === 'receive' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {commission.type === 'receive' 
                        ? `Commission from ${commission.fromFirm}` 
                        : `Commission to ${commission.fromFirm}`
                      }
                    </h3>
                    <p className="text-sm text-gray-500">
                      Based on {commission.invoiceIds.length} paid invoice{commission.invoiceIds.length !== 1 ? 's' : ''}
                    </p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      commission.type === 'receive' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {commission.type === 'receive' ? 'To Receive' : 'To Pay'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      commission.type === 'receive' ? 'text-green-600' : 'text-red-600'
                    }`}>
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
                    <div className={`flex items-center px-3 py-2 rounded-lg ${
                      commission.type === 'receive' 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-red-600 bg-red-100'
                    }`}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Commission Settled</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSettleCommission(commission.fromFirm)}
                      className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        commission.type === 'receive'
                          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                          : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      }`}
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
