import React from "react";
import { CheckCircle, TrendingUp, TrendingDown, Euro } from "lucide-react";
import type { FirmType } from "../types/index";
import { useCommissions } from "../context/CommissionContext";

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
  const { isQuarterSettled, settleQuarter } = useCommissions();
  const isCurrentQuarterSettled = isQuarterSettled(quarterKey, userFirm);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const handleSettleClick = (firm: FirmType) => {
    settleQuarter(quarterKey, userFirm);
    onSettleCommission(firm);
  };

  const totalCommissions = commissionsByFirm.reduce(
    (sum, { amount }) => sum + amount,
    0
  );

  const receivableCommissions = commissionsByFirm
    .filter(({ isPaying }) => !isPaying)
    .reduce((sum, { amount }) => sum + amount, 0);

  const payableCommissions = commissionsByFirm
    .filter(({ isPaying }) => isPaying)
    .reduce((sum, { amount }) => sum + amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Q{quarter} {year}
            </h3>
            <p className="text-sm text-gray-500">Quarterly Overview</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-lg font-semibold text-emerald-600">
              {formatter.format(revenue)}
            </p>
          </div>
        </div>

        {/* Commission Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-lg p-5">
            <p className="text-sm text-indigo-600 font-medium mb-1">Receivable</p>
            <p className="text-lg font-semibold text-indigo-700">
              {formatter.format(receivableCommissions)}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-5">
            <p className="text-sm text-amber-600 font-medium mb-1">Payable</p>
            <p className="text-lg font-semibold text-amber-700">
              {formatter.format(payableCommissions)}
            </p>
          </div>
        </div>

        {/* Commission Details */}
        <div className="space-y-3">
          {commissionsByFirm.map(({ firm, amount, isPaying, isSettled }) => (
            <div
              key={firm}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{firm}</p>
                <p className="text-sm text-gray-600">
                  {isPaying ? "To Pay" : "To Receive"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatter.format(amount)}</p>
                {isSettled ? (
                  <div className="flex items-center text-emerald-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Settled</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSettleClick(firm)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Mark as Settled
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quarter Settlement Status */}
        {isCurrentQuarterSettled ? (
          <div className="flex items-center justify-center space-x-2 bg-emerald-100 text-emerald-700 py-2 px-4 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Quarter Settled</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
