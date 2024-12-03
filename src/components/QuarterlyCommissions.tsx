import React, { useState, useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { useCommissions } from "../context/CommissionContext";
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
          isSettled: false,
          invoiceIds: [invoice.id]
        });
      }
    });

    return Object.values(data);
  }, [invoices, user?.firm]);

  const selectedQuarterData = quarterlyData.find(
    data => data.quarter === selectedQuarter
  );

  const renderCommissionCard = (fromFirm: FirmType, amount: number, isSettled: boolean) => {
    const firmStyle = firmColors[fromFirm];
    
    return (
      <div
        key={fromFirm}
        className={`p-6 rounded-lg border-2 transition-all duration-200 ${firmStyle.lightBg} ${firmStyle.border} hover:shadow-lg`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${firmStyle.text}`}>
              Commission to Receive
            </h3>
            <p className={`text-sm opacity-75 ${firmStyle.text}`}>from {fromFirm}</p>
          </div>
          <CircleDollarSign className={`w-6 h-6 ${firmStyle.text}`} />
        </div>

        <div className="space-y-4">
          <div>
            <p className={`text-3xl font-bold ${firmStyle.text}`}>
              {formatter.format(amount)}
            </p>
          </div>
          
          {!isSettled ? (
            <div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>Waiting for {fromFirm}</span>
              </div>
              
              <button
                onClick={() => settleQuarter(selectedQuarter, fromFirm)}
                className={`mt-3 w-full py-2 px-4 rounded-lg ${firmStyle.bg} ${firmStyle.text} font-medium 
                  hover:opacity-90 transition-opacity duration-200`}
              >
                Mark as Settled
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settled</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalCommissions = selectedQuarterData?.eligibleCommissions.reduce(
    (sum, comm) => sum + comm.amount,
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Quarter Selection */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {quarterlyData.map((data) => {
          const [year, quarter] = data.quarter.split("-Q");
          const isSelected = data.quarter === selectedQuarter;
          const isSettled = isQuarterSettled(data.quarter);
          
          return (
            <button
              key={data.quarter}
              onClick={() => setSelectedQuarter(data.quarter)}
              className={`flex-none px-6 py-4 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                  : "border-gray-200 hover:border-indigo-200"}
              `}
            >
              <div className="text-center">
                <p className="font-medium">Q{quarter}</p>
                <p className="text-sm text-gray-500">{year}</p>
              </div>
              {isSettled && (
                <div className="flex justify-center mt-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedQuarterData && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="space-y-6">
            {/* Quarter Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedQuarter}
                </h2>
                <p className="text-sm text-gray-500">Commission Summary</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">{formatter.format(totalCommissions)}</span>
                </div>
                <p className="text-sm text-gray-500">Total Commissions</p>
              </div>
            </div>

            {/* Commission Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {selectedQuarterData.eligibleCommissions.map(({ fromFirm, amount, isSettled }) => (
                renderCommissionCard(fromFirm, amount, isSettled)
              ))}
            </div>

            {/* Quarter Settlement Status */}
            {isQuarterSettled(selectedQuarter) ? (
              <div className="flex items-center justify-center space-x-2 mt-4 bg-emerald-100 text-emerald-700 py-3 px-4 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">All commissions for this quarter are settled</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 mt-4 bg-amber-100 text-amber-700 py-3 px-4 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Some commissions are pending settlement</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuarterlyCommissions;
