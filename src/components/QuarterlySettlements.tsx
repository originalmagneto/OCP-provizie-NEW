import React, { useState, useMemo } from 'react';
import { useSettlement } from '../context/SettlementContext';
import { useYear } from '../context/YearContext';
import { useAuth } from '../context/AuthContext';
import { CheckIcon, AlertTriangleIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import type { Settlement } from '../types/settlement';

interface SettlementCardProps {
  settlement: Settlement;
  onUpdateStatus: (status: 'settled' | 'disputed') => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function SettlementCard({ settlement, onUpdateStatus, isExpanded, onToggleExpand }: SettlementCardProps) {
  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    settled: 'bg-green-50 text-green-700 border-green-200',
    disputed: 'bg-red-50 text-red-700 border-red-200',
  };

  const statusIcons = {
    pending: <ClockIcon className="h-5 w-5 text-yellow-500" />,
    settled: <CheckIcon className="h-5 w-5 text-green-500" />,
    disputed: <AlertTriangleIcon className="h-5 w-5 text-red-500" />,
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${statusColors[settlement.status]}`}>
                {statusIcons[settlement.status]}
                <span className="capitalize">{settlement.status}</span>
              </span>
              <h3 className="text-lg font-semibold">
                {settlement.firmFrom} → {settlement.firmTo}
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              Created on {new Date(settlement.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-lg font-semibold">€{settlement.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                Q{settlement.quarter} {settlement.year}
              </p>
            </div>

            <button
              onClick={onToggleExpand}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            {settlement.status === 'pending' && (
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => onUpdateStatus('disputed')}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  Mark as Disputed
                </button>
                <button
                  onClick={() => onUpdateStatus('settled')}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
                >
                  Mark as Settled
                </button>
              </div>
            )}
          </div>
        )}
      </div>
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
        <p className="mt-1 text-2xl font-semibold">€{totalAmount.toFixed(2)}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
        <p className="mt-1 text-2xl font-semibold text-yellow-600">{pendingCount}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Settled</h3>
        <p className="mt-1 text-2xl font-semibold text-green-600">{settledCount}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Disputed</h3>
        <p className="mt-1 text-2xl font-semibold text-red-600">{disputedCount}</p>
      </div>
    </div>
  );
}

export default function QuarterlySettlements() {
  const { getSettlementsByQuarter, getSettlementSummary, updateSettlementStatus } = useSettlement();
  const { currentYear, currentQuarter } = useYear();
  const { userFirm } = useAuth();
  const [expandedSettlements, setExpandedSettlements] = useState<string[]>([]);

  const settlements = useMemo(() => 
    getSettlementsByQuarter(currentQuarter, currentYear),
    [getSettlementsByQuarter, currentQuarter, currentYear]
  );

  const summary = useMemo(() => 
    getSettlementSummary(currentQuarter, currentYear),
    [getSettlementSummary, currentQuarter, currentYear]
  );

  const filteredSettlements = useMemo(() => 
    settlements.filter(settlement => 
      settlement.firmFrom === userFirm || settlement.firmTo === userFirm
    ),
    [settlements, userFirm]
  );

  const handleUpdateStatus = (settlementId: string, status: 'settled' | 'disputed') => {
    updateSettlementStatus(settlementId, status);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Q{currentQuarter} {currentYear} Settlements
        </h2>
      </div>

      <SettlementSummary {...summary} />

      <div className="space-y-4">
        {filteredSettlements.map((settlement) => (
          <SettlementCard
            key={settlement.id}
            settlement={settlement}
            onUpdateStatus={(status) => handleUpdateStatus(settlement.id, status)}
            isExpanded={expandedSettlements.includes(settlement.id)}
            onToggleExpand={() =>
              setExpandedSettlements((prev) =>
                prev.includes(settlement.id)
                  ? prev.filter((id) => id !== settlement.id)
                  : [...prev, settlement.id]
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
