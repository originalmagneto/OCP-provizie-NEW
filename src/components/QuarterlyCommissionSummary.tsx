import React, { useMemo } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import { useCommissions } from '../context/CommissionContext';
import { getFirmBranding } from '../config/firmBranding';
import { TrendingUp, TrendingDown, Clock, CheckCircle, Euro, Calendar } from 'lucide-react';
import type { FirmType } from '../types';

interface QuarterlyCommissionData {
  quarter: string;
  year: number;
  quarterKey: string;
  toReceive: {
    total: number;
    paid: number;
    pending: number;
    firms: Record<FirmType, { amount: number; count: number; isPaid: boolean }>;
  };
  toPay: {
    total: number;
    paid: number;
    pending: number;
    firms: Record<FirmType, { amount: number; count: number; isPaid: boolean }>;
  };
  netBalance: number;
  isSettled: boolean;
}

export default function QuarterlyCommissionSummary() {
  const { invoices } = useInvoices();
  const { user } = useAuth();
  const { isQuarterSettled } = useCommissions();

  const quarterlyData = useMemo(() => {
    if (!user) return [];

    const data: Record<string, QuarterlyCommissionData> = {};
    const userFirm = user.firm;
    const firmBranding = getFirmBranding(userFirm as FirmType);

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
            toReceive: {
              total: 0,
              paid: 0,
              pending: 0,
              firms: {} as Record<FirmType, { amount: number; count: number; isPaid: boolean }>
            },
            toPay: {
              total: 0,
              paid: 0,
              pending: 0,
              firms: {} as Record<FirmType, { amount: number; count: number; isPaid: boolean }>
            },
            netBalance: 0,
            isSettled: isQuarterSettled(quarterKey)
          };
        }

        const quarterData = data[quarterKey];
        const commissionAmount = (invoice.amount * (invoice.commissionPercentage || 0)) / 100;

        // Commission to receive (when user's firm is referred by another firm)
        if (invoice.referredByFirm && invoice.referredByFirm !== userFirm && invoice.invoicedByFirm === userFirm) {
          const fromFirm = invoice.referredByFirm;
          if (!quarterData.toReceive.firms[fromFirm]) {
            quarterData.toReceive.firms[fromFirm] = { amount: 0, count: 0, isPaid: false };
          }
          quarterData.toReceive.firms[fromFirm].amount += commissionAmount;
          quarterData.toReceive.firms[fromFirm].count += 1;
          quarterData.toReceive.total += commissionAmount;
        }

        // Commission to pay (when user's firm refers to another firm)
        if (invoice.referredByFirm === userFirm && invoice.invoicedByFirm !== userFirm) {
          const toFirm = invoice.invoicedByFirm;
          if (!quarterData.toPay.firms[toFirm]) {
            quarterData.toPay.firms[toFirm] = { amount: 0, count: 0, isPaid: false };
          }
          quarterData.toPay.firms[toFirm].amount += commissionAmount;
          quarterData.toPay.firms[toFirm].count += 1;
          quarterData.toPay.total += commissionAmount;
        }
      });

    // Calculate paid/pending amounts and net balance
    Object.values(data).forEach(quarterData => {
      quarterData.toReceive.paid = quarterData.isSettled ? quarterData.toReceive.total : 0;
      quarterData.toReceive.pending = quarterData.isSettled ? 0 : quarterData.toReceive.total;
      quarterData.toPay.paid = quarterData.isSettled ? quarterData.toPay.total : 0;
      quarterData.toPay.pending = quarterData.isSettled ? 0 : quarterData.toPay.total;
      quarterData.netBalance = quarterData.toReceive.total - quarterData.toPay.total;
    });

    return Object.values(data).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.quarter.localeCompare(a.quarter);
    });
  }, [invoices, user, isQuarterSettled]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (!user || quarterlyData.length === 0) {
    return null;
  }

  const firmBranding = getFirmBranding(user.firm);
  const FirmLogo = firmBranding.logo;
  const currentQuarter = quarterlyData[0];
  const totalReceivable = quarterlyData.reduce((sum, q) => sum + q.toReceive.pending, 0);
  const totalPayable = quarterlyData.reduce((sum, q) => sum + q.toPay.pending, 0);
  const netPosition = totalReceivable - totalPayable;

  return (
    <div className={`rounded-xl ${firmBranding.theme.card} p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FirmLogo className="h-10 w-10" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {firmBranding.displayName} Commission Overview
            </h2>
            <p className="text-sm text-gray-600">
              Quarterly commission breakdown and summary
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Net Position</div>
          <div className={`text-2xl font-bold ${
            netPosition >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(netPosition)}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Receivable</p>
              <p className="text-xl font-semibold text-green-600">
                {formatCurrency(totalReceivable)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payable</p>
              <p className="text-xl font-semibold text-red-600">
                {formatCurrency(totalPayable)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Quarters</p>
              <p className="text-xl font-semibold text-gray-900">
                {quarterlyData.filter(q => q.toReceive.total > 0 || q.toPay.total > 0).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Quarterly Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Quarters</h3>
        {quarterlyData.slice(0, 4).map((quarter) => (
          <div key={quarter.quarterKey} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  quarter.isSettled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {quarter.quarter} {quarter.year}
                </div>
                {quarter.isSettled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Net Balance</div>
                <div className={`font-semibold ${
                  quarter.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(quarter.netBalance)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* To Receive */}
              {quarter.toReceive.total > 0 && (
                <div className="border-l-4 border-green-400 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">To Receive</h4>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(quarter.toReceive.total)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(quarter.toReceive.firms).map(([firm, data]) => (
                      <div key={firm} className="flex justify-between text-sm">
                        <span className="text-gray-600">From {firm}</span>
                        <span className="font-medium">{formatCurrency(data.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* To Pay */}
              {quarter.toPay.total > 0 && (
                <div className="border-l-4 border-red-400 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">To Pay</h4>
                    <span className="text-red-600 font-semibold">
                      {formatCurrency(quarter.toPay.total)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(quarter.toPay.firms).map(([firm, data]) => (
                      <div key={firm} className="flex justify-between text-sm">
                        <span className="text-gray-600">To {firm}</span>
                        <span className="font-medium">{formatCurrency(data.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {quarterlyData.length > 4 && (
        <div className="text-center mt-4">
          <button className={`text-sm ${firmBranding.theme.button} px-4 py-2 rounded-md`}>
            View All Quarters ({quarterlyData.length})
          </button>
        </div>
      )}
    </div>
  );
}