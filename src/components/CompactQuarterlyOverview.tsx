import React, { useMemo } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import { useCommissions } from '../context/CommissionContext';
import { getFirmBranding } from '../config/firmBranding';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  Euro, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';
import type { FirmType } from '../types';

interface QuarterData {
  quarter: string;
  year: number;
  quarterKey: string;
  toReceive: number;
  toPay: number;
  netBalance: number;
  isSettled: boolean;
  status: 'positive' | 'negative' | 'neutral';
}

export default function CompactQuarterlyOverview() {
  const { invoices } = useInvoices();
  const { user } = useAuth();
  const { isQuarterSettled, settleQuarter } = useCommissions();

  const quarterlyData = useMemo(() => {
    if (!user) return [];

    const data: Record<string, QuarterData> = {};
    const userFirm = user.firm;

    // Process all paid invoices
    invoices
      .filter(invoice => invoice.isPaid)
      .forEach(invoice => {
        const date = new Date(invoice.date);
        const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
        const year = date.getFullYear();
        const quarterKey = `${year}-${quarter}`;

        if (!data[quarterKey]) {
          data[quarterKey] = {
            quarter,
            year,
            quarterKey,
            toReceive: 0,
            toPay: 0,
            netBalance: 0,
            isSettled: isQuarterSettled(quarterKey, userFirm),
            status: 'neutral'
          };
        }

        const quarterData = data[quarterKey];
        const commissionAmount = (invoice.amount * (invoice.commissionPercentage || 0)) / 100;

        // Commission to pay (when another firm refers to us and we invoice)
        if (invoice.referredByFirm && invoice.referredByFirm !== userFirm && invoice.invoicedByFirm === userFirm) {
          quarterData.toPay += commissionAmount;
        }

        // Commission to receive (when we refer to another firm and they invoice)
        if (invoice.referredByFirm === userFirm && invoice.invoicedByFirm !== userFirm) {
          quarterData.toReceive += commissionAmount;
        }
      });

    // Calculate net balance and status
    Object.values(data).forEach(quarterData => {
      quarterData.netBalance = quarterData.toReceive - quarterData.toPay;
      quarterData.status = quarterData.netBalance > 0 ? 'positive' : 
                          quarterData.netBalance < 0 ? 'negative' : 'neutral';
    });

    return Object.values(data)
      .filter(q => q.toReceive > 0 || q.toPay > 0)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.quarter.localeCompare(a.quarter);
      })
      .slice(0, 6); // Show last 6 quarters
  }, [invoices, user, isQuarterSettled]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`;
    }
    return `€${amount.toFixed(0)}`;
  };

  if (!user || quarterlyData.length === 0) {
    return null;
  }

  const firmBranding = getFirmBranding(user.firm as FirmType);
  const totalReceivable = quarterlyData.reduce((sum, q) => sum + (q.isSettled ? 0 : q.toReceive), 0);
  const totalPayable = quarterlyData.reduce((sum, q) => sum + (q.isSettled ? 0 : q.toPay), 0);
  const netPosition = totalReceivable - totalPayable;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header with Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8">
              <firmBranding.logo className="h-full w-full" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Commission Overview
              </h2>
              <p className="text-sm text-gray-500">
                Recent quarters performance
              </p>
            </div>
          </div>
        </div>
        
        {/* Net Position Badge */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Net Position</div>
            <div className={`text-xl font-bold flex items-center space-x-1 ${
              netPosition >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {netPosition >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownLeft className="h-4 w-4" />
              )}
              <span>{formatCurrency(Math.abs(netPosition))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Horizontal Quarter Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Recent Quarters</h3>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Receivable</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Payable</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-gray-400" />
              <span>Settled</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quarterlyData.map((quarter) => {
            const statusColors = {
              positive: 'border-green-200 bg-green-50',
              negative: 'border-red-200 bg-red-50',
              neutral: 'border-gray-200 bg-gray-50'
            };

            return (
              <div
                key={quarter.quarterKey}
                className={`relative p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                  quarter.isSettled ? 'opacity-60' : ''
                } ${statusColors[quarter.status]}`}
              >
                {/* Quarter Label */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-gray-700">
                    {quarter.quarter} {quarter.year}
                  </div>
                  {quarter.isSettled && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                </div>

                {/* Commission Amounts */}
                <div className="space-y-1">
                  {quarter.toReceive > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                        <span className="text-green-700 font-medium">
                          {formatCompactCurrency(quarter.toReceive)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {quarter.toPay > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <ArrowDownLeft className="h-3 w-3 text-red-600" />
                        <span className="text-red-700 font-medium">
                          {formatCompactCurrency(quarter.toPay)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Net Balance */}
                {Math.abs(quarter.netBalance) > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className={`text-xs font-semibold text-center ${
                      quarter.netBalance >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {quarter.netBalance >= 0 ? '+' : ''}{formatCompactCurrency(quarter.netBalance)}
                    </div>
                  </div>
                )}

                {/* Settlement Status Indicator */}
                {!quarter.isSettled && (quarter.toReceive > 0 || quarter.toPay > 0) && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Pending Receivable</div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(totalReceivable)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Pending Payable</div>
            <div className="text-lg font-semibold text-red-600">
              {formatCurrency(totalPayable)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Active Quarters</div>
            <div className="text-lg font-semibold text-gray-900">
              {quarterlyData.filter(q => !q.isSettled).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}