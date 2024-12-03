import React, { useCallback, useMemo } from "react";
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
    console.log('Settling commission for firm:', firm, 'Quarter key:', quarterKey);
    onSettleCommission(firm);
  }, [onSettleCommission, quarterKey]);

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

  const getStatusColor = (commission: Commission) => {
    if (commission.isSettled) {
      return "bg-green-50 text-green-700";
    }
    if (commission.isPaying) {
      return "bg-yellow-50 text-yellow-700";
    }
    return "bg-gray-50 text-gray-700";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Q{quarter} {year}
          </h3>
          <span className="text-sm font-medium text-gray-500">
            ${revenue.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {commissionsByFirm.map((commission) => (
          <div
            key={`${commission.firm}-${commission.amount}`}
            className={`rounded-lg p-4 ${getStatusColor(commission)}`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {commission.firm}
                  </span>
                  {getStatusIcon(commission)}
                </div>
                <div className="text-sm opacity-75">
                  ${commission.amount.toFixed(2)}
                </div>
                <div className="text-xs opacity-60">
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
          </div>
        ))}
      </div>
    </div>
  );
}
