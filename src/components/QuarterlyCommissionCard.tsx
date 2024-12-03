import React from "react";
import { CheckCircleIcon, TrendingUpIcon, TrendingDownIcon, EuroIcon, AlertCircle, CircleDollarSign, Clock, CheckCircle2 } from "lucide-react";
import type { FirmType } from "../types";
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
  const isCurrentQuarterSettled = isQuarterSettled(quarterKey);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
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

  const renderCommissionCard = (firm: FirmType, amount: number, isPaying: boolean, isSettled: boolean) => {
    const firmStyle = firmColors[firm];
    
    return (
      <div
        key={firm}
        className={`p-6 rounded-lg border-2 transition-all duration-200 ${firmStyle.lightBg} ${firmStyle.border} hover:shadow-lg`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${firmStyle.text}`}>
              {isPaying ? "Commission to Pay" : "Commission to Receive"}
            </h3>
            <p className={`text-sm opacity-75 ${firmStyle.text}`}>with {firm}</p>
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
              {isPaying ? (
                <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>Payment Required</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Waiting for {firm}</span>
                </div>
              )}
              
              <button
                onClick={() => handleSettleClick(firm)}
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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="space-y-6">
        {/* Quarter Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Q{quarter} {year}
            </h2>
            <p className="text-sm text-gray-500">Quarterly Summary</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-emerald-600">
              <TrendingUpIcon className="h-5 w-5" />
              <span className="font-medium">{formatter.format(revenue)}</span>
            </div>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
        </div>

        {/* Commission Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {commissionsByFirm.map(({ firm, amount, isPaying, isSettled }) => (
            renderCommissionCard(firm, amount, isPaying, isSettled)
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-100">
              <p className="text-sm text-red-600 font-medium">Total to Pay</p>
              <p className="text-lg font-semibold text-red-700">
                {formatter.format(payableCommissions)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <p className="text-sm text-green-600 font-medium">Total to Receive</p>
              <p className="text-lg font-semibold text-green-700">
                {formatter.format(receivableCommissions)}
              </p>
            </div>
          </div>
        </div>

        {/* Quarter Settlement Status */}
        {isCurrentQuarterSettled ? (
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
  );
}
