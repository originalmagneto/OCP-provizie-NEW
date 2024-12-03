import React, { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useCommissions } from "../context/CommissionContext";
import { AlertCircle, CircleDollarSign, Clock, CheckCircle2 } from "lucide-react";
import type { FirmType } from "../types";

interface Commission {
  firm: FirmType;
  amount: number;
  isPaying: boolean;
  isSettled: boolean;
}

interface QuarterlyCommissionCardProps {
  quarterKey: string;
  quarter: number;
  year: number;
  revenue: number;
  commissionsByFirm: Commission[];
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
  onSettleCommission
}: QuarterlyCommissionCardProps) {
  const { user } = useAuth();
  const { isQuarterSettled } = useCommissions();

  const handleSettleClick = useCallback((firm: FirmType) => {
    onSettleCommission(firm);
  }, [onSettleCommission]);

  const getStatusIcon = (commission: Commission) => {
    if (commission.isSettled) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    if (commission.isPaying) {
      return <CircleDollarSign className="w-5 h-5 text-yellow-500" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = (commission: Commission) => {
    if (commission.isSettled) {
      return "Settled";
    }
    if (commission.isPaying) {
      return "Pending";
    }
    return "Awaiting Settlement";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Q{quarter} {year}
        </h3>
        <span className="text-sm font-medium text-gray-500">
          Total Revenue: ${revenue.toFixed(2)}
        </span>
      </div>

      <div className="space-y-4">
        {commissionsByFirm.map((commission) => (
          <div
            key={commission.firm}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {commission.firm}
                </span>
                {getStatusIcon(commission)}
              </div>
              <div className="text-sm text-gray-500">
                ${commission.amount.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                {getStatusText(commission)}
              </div>
            </div>

            {!commission.isSettled && user?.firm === userFirm && (
              <button
                onClick={() => handleSettleClick(commission.firm)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Settle
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
