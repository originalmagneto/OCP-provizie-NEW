import React from "react";
import { CheckCircle, TrendingUp, TrendingDown, Euro } from "lucide-react";
import type { FirmType } from "../types";

const COLORS = {
  revenue: {
    primary: "#10B981",
    secondary: "#D1FAE5",
  },
  commission: {
    primary: "#6366F1",
    secondary: "#E0E7FF",
  },
  pending: {
    primary: "#F59E0B",
    secondary: "#FEF3C7",
  }
};

interface CommissionSettlement {
  firm: FirmType;
  isSettled: boolean;
}

interface QuarterlyCommissionCardProps {
  quarterKey: string;
  quarter: number;
  year: number;
  revenue: number;
  commissionsByFirm: {
    firm: FirmType;
    amount: number;
    isPaying: boolean;
    isSettled: boolean;
  }[];
  userFirm: FirmType;
  onSettleCommission: (firm: FirmType) => void;
}

export function QuarterlyCommissionCard({
  quarterKey,
  quarter,
  year,
  revenue,
  commissionsByFirm,
  userFirm,
  onSettleCommission,
}: QuarterlyCommissionCardProps) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  });

  // These are commissions where we are the receiving party
  const commissionsToReceive = commissionsByFirm.filter(c => !c.isPaying);
  // These are commissions where we are the paying party
  const commissionsToPay = commissionsByFirm.filter(c => c.isPaying);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Q{quarter} {year} Summary
        </h3>
      </div>

      <div className="space-y-8">
        {/* Revenue Summary */}
        <div className={`p-4 rounded-lg bg-${COLORS.revenue.secondary}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Revenue</span>
            <Euro className={`w-5 h-5 text-${COLORS.revenue.primary}`} />
          </div>
          <p className={`text-2xl font-bold text-${COLORS.revenue.primary}`}>
            {formatter.format(revenue)}
          </p>
        </div>

        {/* Commissions to Receive */}
        {commissionsToReceive.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
              Commissions to Receive
            </h4>
            {commissionsToReceive.map((commission) => (
              <div 
                key={commission.firm}
                className={`p-4 rounded-lg border-2 ${
                  commission.isSettled 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-indigo-200 bg-indigo-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">From {commission.firm}</p>
                    <p className={`text-2xl font-bold ${
                      commission.isSettled ? 'text-green-600' : 'text-indigo-600'
                    }`}>
                      {formatter.format(commission.amount)}
                    </p>
                  </div>
                  <div>
                    {!commission.isPaying && !commission.isSettled && (
                      <button
                        onClick={() => onSettleCommission(commission.firm)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Mark as Paid
                      </button>
                    )}
                    {commission.isSettled && (
                      <div className="flex items-center text-green-600 bg-green-100 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Paid</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Commissions to Pay */}
        {commissionsToPay.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
              Commissions to Pay
            </h4>
            {commissionsToPay.map((commission) => (
              <div 
                key={commission.firm}
                className={`p-4 rounded-lg border-2 ${
                  commission.isSettled 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">To {commission.firm}</p>
                    <p className={`text-2xl font-bold ${
                      commission.isSettled ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {formatter.format(commission.amount)}
                    </p>
                  </div>
                  {commission.isSettled && (
                    <div className="flex items-center text-green-600 bg-green-100 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Paid</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
