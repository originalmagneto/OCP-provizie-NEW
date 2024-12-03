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

const firmColors: Record<FirmType, { bg: string; text: string; border: string }> = {
  SKALLARS: {
    bg: "bg-purple-50",
    text: "text-purple-900",
    border: "border-purple-200",
  },
  MKMs: {
    bg: "bg-blue-50",
    text: "text-blue-900",
    border: "border-blue-200",
  },
  Contax: {
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
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

  const renderCommissionCard = (firm: FirmType, amount: number, isPaying: boolean, isSettled: boolean) => {
    const firmStyle = firmColors[firm];

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    const renderStatus = () => {
      if (!isSettled) {
        return (
          <div className="flex items-center gap-2 mt-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>Commission payment required</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 mt-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settled</span>
        </div>
      );
    };

    return (
      <div
        className={`p-6 rounded-lg border-2 transition-all duration-200 ${firmStyle.bg} ${firmStyle.border} hover:shadow-lg`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${firmStyle.text}`}>{firm}</h3>
            <p className={`text-sm opacity-75 ${firmStyle.text}`}>{isPaying ? "To Pay" : "To Receive"}</p>
          </div>
          <CircleDollarSign className={`w-6 h-6 ${firmStyle.text}`} />
        </div>

        <div className="space-y-3">
          <div>
            <p className={`text-3xl font-bold ${firmStyle.text}`}>
              {formatCurrency(amount)}
            </p>
          </div>
          {renderStatus()}
          {!isSettled && (
            <button
              onClick={() => handleSettleClick(firm)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Mark as Settled
            </button>
          )}
        </div>
      </div>
    );
  };

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
            <div className="flex items-center space-x-2">
              <EuroIcon className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-medium">{formatter.format(revenue)}</span>
            </div>
          </div>
        </div>

        {/* Commission Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-indigo-600 font-medium">Receivable</p>
            <div className="flex items-center space-x-2">
              <EuroIcon className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-medium">{formatter.format(receivableCommissions)}</span>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-600 font-medium">Payable</p>
            <div className="flex items-center space-x-2">
              <EuroIcon className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-medium">{formatter.format(payableCommissions)}</span>
            </div>
          </div>
        </div>

        {/* Commission Details */}
        <div className="space-y-3">
          {commissionsByFirm.map(({ firm, amount, isPaying, isSettled }) => (
            renderCommissionCard(firm, amount, isPaying, isSettled)
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total to Pay</p>
              <p className="text-lg font-semibold">{formatter.format(payableCommissions)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total to Receive</p>
              <p className="text-lg font-semibold">
                {formatter.format(receivableCommissions)}
              </p>
            </div>
          </div>
        </div>

        {/* Quarter Settlement Status */}
        {isCurrentQuarterSettled ? (
          <div className="flex items-center justify-center space-x-2 mt-4 bg-emerald-100 text-emerald-700 py-2 px-4 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">All commissions for this quarter are settled</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2 mt-4 bg-amber-100 text-amber-700 py-2 px-4 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Some commissions are pending settlement</span>
          </div>
        )}
      </div>
    </div>
  );
}
