import React from "react";
import { CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
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

  const commissionsToReceive = commissionsByFirm.filter(c => !c.isPaying);
  const commissionsToPay = commissionsByFirm.filter(c => c.isPaying);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Q{quarter} {year} Summary
        </h3>
      </div>

      <div className="space-y-6">
        {/* Revenue Summary */}
        <div className={`p-4 rounded-lg bg-${COLORS.revenue.secondary}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Revenue</span>
            <TrendingUp className={`w-5 h-5 text-${COLORS.revenue.primary}`} />
          </div>
          <p className={`text-2xl font-bold text-${COLORS.revenue.primary}`}>
            {formatter.format(revenue)}
          </p>
        </div>

        {/* Commissions to Receive */}
        {commissionsToReceive.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Commissions to Receive</h4>
            {commissionsToReceive.map((commission) => (
              <div 
                key={commission.firm}
                className={`p-4 rounded-lg ${commission.isSettled ? 'bg-green-50' : `bg-${COLORS.commission.secondary}`}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">From {commission.firm}</p>
                    <p className={`text-xl font-bold ${commission.isSettled ? 'text-green-600' : `text-${COLORS.commission.primary}`}`}>
                      {formatter.format(commission.amount)}
                    </p>
                  </div>
                  {commission.isSettled ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      <span className="text-sm">Settled</span>
                    </div>
                  ) : (
                    commission.isPaying && (
                      <button
                        onClick={() => onSettleCommission(commission.firm)}
                        className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                      >
                        Mark as Received
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Commissions to Pay */}
        {commissionsToPay.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Commissions to Pay</h4>
            {commissionsToPay.map((commission) => (
              <div 
                key={commission.firm}
                className={`p-4 rounded-lg ${commission.isSettled ? 'bg-green-50' : `bg-${COLORS.pending.secondary}`}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">To {commission.firm}</p>
                    <p className={`text-xl font-bold ${commission.isSettled ? 'text-green-600' : `text-${COLORS.pending.primary}`}`}>
                      {formatter.format(commission.amount)}
                    </p>
                  </div>
                  {commission.isSettled && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      <span className="text-sm">Settled</span>
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
