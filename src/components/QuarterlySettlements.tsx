import React, { useState, useMemo } from 'react';
import { useSettlement } from '../context/SettlementContext';
import { useYear } from '../context/YearContext';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CircleDollarSign,
  ChevronDown,
  ChevronUp,
  TrendingUp
} from 'lucide-react';
import type { Settlement } from '../types/settlement';
import type { FirmType } from '../types';

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

interface SettlementCardProps {
  settlement: Settlement;
  onUpdateStatus: (status: 'settled' | 'disputed') => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

function SettlementCard({ settlement, onUpdateStatus, isExpanded, onToggleExpand }: SettlementCardProps) {
  const firmStyle = firmColors[settlement.firm as FirmType];
  
  const getStatusBadge = () => {
    switch (settlement.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            <span>Pending Confirmation</span>
          </div>
        );
      case 'settled':
        return (
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settled</span>
          </div>
        );
      case 'disputed':
        return (
          <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>Disputed</span>
          </div>
        );
    }
  };

  return (
    <div className={`rounded-lg border-2 transition-all duration-200 ${firmStyle.lightBg} ${firmStyle.border} hover:shadow-lg`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${firmStyle.text}`}>
              Settlement with {settlement.firm}
            </h3>
            <p className={`text-sm opacity-75 ${firmStyle.text}`}>
              Q{settlement.quarter} {settlement.year}
            </p>
          </div>
          <CircleDollarSign className={`w-6 h-6 ${firmStyle.text}`} />
        </div>

        <div className="space-y-4">
          <div>
            <p className={`text-3xl font-bold ${firmStyle.text}`}>
              {formatter.format(settlement.amount)}
            </p>
          </div>

          {getStatusBadge()}

          {settlement.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateStatus('settled')}
                className={`flex-1 py-2 px-4 rounded-lg ${firmStyle.bg} ${firmStyle.text} font-medium 
                  hover:opacity-90 transition-opacity duration-200`}
              >
                Mark as Settled
              </button>
              <button
                onClick={() => onUpdateStatus('disputed')}
                className="flex-1 py-2 px-4 rounded-lg bg-red-100 text-red-700 font-medium 
                  hover:opacity-90 transition-opacity duration-200"
              >
                Dispute
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onToggleExpand}
          className={`mt-4 w-full flex items-center justify-center py-2 ${firmStyle.text} font-medium`}
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="ml-1 w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show Details</span>
              <ChevronDown className="ml-1 w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className={`px-6 pb-6 space-y-4 ${firmStyle.lightBg}`}>
          <div className="space-y-2">
            <h4 className={`font-medium ${firmStyle.text}`}>Settlement Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-500">Invoice Count</p>
                <p className={`font-medium ${firmStyle.text}`}>{settlement.invoiceCount}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className={`font-medium ${firmStyle.text}`}>
                  {new Date(settlement.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettlementSummary({ 
  totalAmount, 
  pendingCount, 
  settledCount, 
  disputedCount 
}: { 
  totalAmount: number;
  pendingCount: number;
  settledCount: number;
  disputedCount: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Settlement Summary</h2>
          <p className="text-sm text-gray-500">Overview of all settlements</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-emerald-600">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">{formatter.format(totalAmount)}</span>
          </div>
          <p className="text-sm text-gray-500">Total Amount</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-600">Pending</p>
          </div>
          <p className="mt-1 text-2xl font-semibold text-amber-700">{pendingCount}</p>
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-600">Settled</p>
          </div>
          <p className="mt-1 text-2xl font-semibold text-green-700">{settledCount}</p>
        </div>
        <div className="p-4 rounded-lg bg-red-50 border border-red-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-600">Disputed</p>
          </div>
          <p className="mt-1 text-2xl font-semibold text-red-700">{disputedCount}</p>
        </div>
      </div>
    </div>
  );
}

export default function QuarterlySettlements() {
  const { settlements, updateSettlementStatus } = useSettlement();
  const { selectedYear } = useYear();
  const { user } = useAuth();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredSettlements = useMemo(() => {
    if (!settlements || !user?.firm) return [];
    return settlements.filter(s => 
      s.year === selectedYear && 
      (s.firm === user.firm || s.counterpartyFirm === user.firm)
    );
  }, [settlements, selectedYear, user?.firm]);

  const summary = useMemo(() => {
    return filteredSettlements.reduce(
      (acc, curr) => ({
        totalAmount: acc.totalAmount + curr.amount,
        pendingCount: acc.pendingCount + (curr.status === 'pending' ? 1 : 0),
        settledCount: acc.settledCount + (curr.status === 'settled' ? 1 : 0),
        disputedCount: acc.disputedCount + (curr.status === 'disputed' ? 1 : 0),
      }),
      { totalAmount: 0, pendingCount: 0, settledCount: 0, disputedCount: 0 }
    );
  }, [filteredSettlements]);

  if (!user?.firm) return null;

  return (
    <div className="space-y-6">
      <SettlementSummary {...summary} />
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filteredSettlements.map(settlement => (
          <SettlementCard
            key={settlement.id}
            settlement={settlement}
            onUpdateStatus={(status) => updateSettlementStatus(settlement.id, status)}
            isExpanded={expandedIds.includes(settlement.id)}
            onToggleExpand={() => handleToggleExpand(settlement.id)}
          />
        ))}
      </div>
    </div>
  );
}
