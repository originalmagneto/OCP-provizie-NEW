import React from "react";
import { CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import type { FirmType } from "../types";

const COLORS = {
  revenue: {
    primary: "#10B981", // Emerald-500
    secondary: "#D1FAE5", // Emerald-100
  },
  commission: {
    primary: "#6366F1", // Indigo-500
    secondary: "#E0E7FF", // Indigo-100
  },
  pending: {
    primary: "#F59E0B", // Amber-500
    secondary: "#FEF3C7", // Amber-100
  }
};

interface QuarterlyCommissionCardProps {
  quarterKey: string;
  quarter: number;
  year: number;
  revenue: number;
  commissionsOwed: number;
  commissionsDue: number;
  isSettled: boolean;
  onSettle: () => void;
  userFirm: FirmType;
}

export function QuarterlyCommissionCard({
  quarterKey,
  quarter,
  year,
  revenue,
  commissionsOwed,
  commissionsDue,
  isSettled,
  onSettle,
  userFirm,
}: QuarterlyCommissionCardProps) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${
      isSettled ? 'border-green-500' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Q{quarter} {year} Summary
        </h3>
        {isSettled ? (
          <div className="flex items-center text-green-500">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Settled</span>
          </div>
        ) : (
          <button
            onClick={onSettle}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Mark as Settled
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue */}
        <div className={`p-4 rounded-lg bg-${COLORS.revenue.secondary}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Revenue</span>
            <TrendingUp className={`w-5 h-5 text-${COLORS.revenue.primary}`} />
          </div>
          <p className={`text-2xl font-bold text-${COLORS.revenue.primary}`}>
            {formatter.format(revenue)}
          </p>
        </div>

        {/* Commissions Due */}
        <div className={`p-4 rounded-lg bg-${COLORS.commission.secondary}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Due to You</span>
            <TrendingUp className={`w-5 h-5 text-${COLORS.commission.primary}`} />
          </div>
          <p className={`text-2xl font-bold text-${COLORS.commission.primary}`}>
            {formatter.format(commissionsDue)}
          </p>
        </div>

        {/* Commissions Owed */}
        <div className={`p-4 rounded-lg bg-${COLORS.pending.secondary}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">You Owe</span>
            <TrendingDown className={`w-5 h-5 text-${COLORS.pending.primary}`} />
          </div>
          <p className={`text-2xl font-bold text-${COLORS.pending.primary}`}>
            {formatter.format(commissionsOwed)}
          </p>
        </div>
      </div>
    </div>
  );
}
