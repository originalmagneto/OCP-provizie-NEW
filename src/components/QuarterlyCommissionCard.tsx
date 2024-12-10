import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommissions } from '../context/CommissionContext';
import { formatCurrency } from '../utils/formatters';
import { CircleDollarSign, Lock, Unlock } from 'lucide-react';
import type { Commission } from '../types';

interface QuarterlyCommissionCardProps {
  quarterKey: string;
  commissions: Commission[];
  isSettled: boolean;
  batchKey: string | null;
}

export default function QuarterlyCommissionCard({
  quarterKey,
  commissions,
  isSettled,
  batchKey
}: QuarterlyCommissionCardProps) {
  const { firm } = useAuth();
  const { settleQuarter, unsettleQuarter } = useCommissions();

  const totalToPay = commissions
    .filter(c => c.type === 'to_pay')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalToReceive = commissions
    .filter(c => c.type === 'to_receive')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleSettle = async () => {
    try {
      if (!firm) return;
      
      // Get unique invoice IDs from the commissions
      const invoiceIds = [...new Set(commissions.map(c => c.invoiceId))];
      
      if (invoiceIds.length === 0) {
        console.error('No invoices to settle');
        return;
      }

      await settleQuarter(quarterKey, firm, invoiceIds);
    } catch (error) {
      console.error('Error settling commissions:', error);
    }
  };

  const handleUnsettle = () => {
    try {
      if (!firm || !batchKey) {
        console.error('Missing firm or batchKey for unsettling');
        return;
      }
      unsettleQuarter(quarterKey, firm, batchKey);
    } catch (error) {
      console.error('Error unsettling commissions:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CircleDollarSign className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold">
            {isSettled ? 'Settled Commission' : 'Pending Commission'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {isSettled ? (
            <>
              <Lock className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-500">Settled</span>
              <button
                onClick={handleUnsettle}
                className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
              >
                Unsettle
              </button>
            </>
          ) : (
            <>
              <Unlock className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-yellow-500">Pending</span>
              <button
                onClick={handleSettle}
                className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100"
              >
                Settle
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <h4 className="text-sm font-medium text-red-700">To Pay</h4>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalToPay)}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-700">To Receive</h4>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalToReceive)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Commission Details</h4>
        <div className="space-y-2">
          {commissions.map((commission, index) => (
            <div
              key={`${commission.invoiceId}-${index}`}
              className="flex justify-between items-center p-2 bg-gray-50 rounded"
            >
              <span className="text-sm text-gray-600">
                Invoice #{commission.invoiceId}
              </span>
              <span className={`text-sm font-medium ${
                commission.type === 'to_pay' ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(commission.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
