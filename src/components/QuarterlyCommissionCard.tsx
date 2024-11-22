import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { Invoice, FirmType } from '../types';

interface QuarterlyCommissionCardProps {
  quarter: number;
  year: number;
  invoices: Invoice[];
  userFirm: FirmType;
  isSettled?: boolean;
  onMarkAsSettled?: () => void;
}

interface CommissionSummary {
  firm: FirmType;
  amount: number;
  isReceivable: boolean;
}

export function QuarterlyCommissionCard({
  quarter,
  year,
  invoices,
  userFirm,
  isSettled = false,
  onMarkAsSettled,
}: QuarterlyCommissionCardProps) {
  // Calculate commissions for each firm
  const commissionSummaries = React.useMemo(() => {
    const summaries: CommissionSummary[] = [];
    
    invoices.forEach((invoice) => {
      const commission = (invoice.amount * invoice.commissionPercentage) / 100;
      
      if (invoice.referredByFirm === userFirm) {
        // We should receive commission from the invoicing firm
        summaries.push({
          firm: invoice.invoicedByFirm,
          amount: commission,
          isReceivable: true,
        });
      }
      
      if (invoice.invoicedByFirm === userFirm) {
        // We should pay commission to the referring firm
        summaries.push({
          firm: invoice.referredByFirm,
          amount: commission,
          isReceivable: false,
        });
      }
    });

    // Combine amounts for each firm
    const combined = summaries.reduce((acc, curr) => {
      const existing = acc.find(
        (item) => item.firm === curr.firm && item.isReceivable === curr.isReceivable
      );
      
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push(curr);
      }
      
      return acc;
    }, [] as CommissionSummary[]);

    return combined.sort((a, b) => b.amount - a.amount);
  }, [invoices, userFirm]);

  const totalToReceive = commissionSummaries
    .filter((s) => s.isReceivable)
    .reduce((sum, curr) => sum + curr.amount, 0);

  const totalToPay = commissionSummaries
    .filter((s) => !s.isReceivable)
    .reduce((sum, curr) => sum + curr.amount, 0);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${
      isSettled ? 'border-green-200' : 'border-gray-200'
    } p-6`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Q{quarter} {year} Commission Breakdown
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isSettled ? 'Settled' : 'Unsettled'}
          </p>
        </div>
        {isSettled ? (
          <CheckCircle className="h-6 w-6 text-green-500" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
        )}
      </div>

      <div className="space-y-6">
        {/* Receivables */}
        {commissionSummaries.filter(s => s.isReceivable).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">To Receive</h4>
            <div className="space-y-3">
              {commissionSummaries
                .filter(s => s.isReceivable)
                .map((summary, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {summary.firm} owes you
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      }).format(summary.amount)}
                    </span>
                  </div>
                ))}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    Total to Receive
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    }).format(totalToReceive)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payables */}
        {commissionSummaries.filter(s => !s.isReceivable).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">To Pay</h4>
            <div className="space-y-3">
              {commissionSummaries
                .filter(s => !s.isReceivable)
                .map((summary, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      You owe {summary.firm}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      }).format(summary.amount)}
                    </span>
                  </div>
                ))}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    Total to Pay
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    {new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    }).format(totalToPay)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isSettled && onMarkAsSettled && (
          <button
            onClick={onMarkAsSettled}
            className="mt-4 w-full px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200"
          >
            Mark Quarter as Settled
          </button>
        )}
      </div>
    </div>
  );
}
