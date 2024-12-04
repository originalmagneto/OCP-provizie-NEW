import React, { useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useCommissions } from "../context/CommissionContext";
import { AlertCircle, CircleDollarSign, Clock, CheckCircle2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
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
  isCurrentQuarter?: boolean;
}

export function QuarterlyCommissionCard({
  quarterKey,
  quarter,
  year,
  revenue,
  commissionsByFirm,
  userFirm,
  onSettleCommission,
  isCurrentQuarter = false
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

  const { commissionsToReceive, commissionsToPay } = useMemo(() => {
    return commissionsByFirm.reduce(
      (acc, commission) => {
        if (!commission.isSettled) {
          if (commission.isPaying) {
            acc.commissionsToPay += 1;
          } else {
            acc.commissionsToReceive += 1;
          }
        }
        return acc;
      },
      { commissionsToReceive: 0, commissionsToPay: 0 }
    );
  }, [commissionsByFirm]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Q{quarter} {year}
              {isCurrentQuarter && (
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  Current
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1 ml-2">
              {commissionsToReceive > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>Receive ({commissionsToReceive})</span>
                </div>
              )}
              {commissionsToPay > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded ml-1">
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>Pay ({commissionsToPay})</span>
                </div>
              )}
            </div>
          </div>
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
