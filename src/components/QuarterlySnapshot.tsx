import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useYear } from "../context/YearContext";
import { useCommissions } from "../context/CommissionContext";
import { useInvoices } from "../context/InvoiceContext";
import { ArrowUpRight, ArrowDownRight, Euro } from "lucide-react";
import QuarterYearSelector from "./QuarterYearSelector";
import type { FirmType } from "../types";

export default function QuarterlySnapshot() {
  const { user } = useAuth();
  const { currentYear, currentQuarter, setCurrentQuarter, setCurrentYear } = useYear();
  const { getSettledInvoiceIds } = useCommissions();
  const { invoices } = useInvoices();

  if (!user) return null;

  const quarterlyTotals = useMemo(() => {
    const totals = {
      toReceive: { settled: 0, unsettled: 0 },
      toPay: { settled: 0, unsettled: 0 }
    };

    if (!invoices?.length) {
      console.log('No invoices found');
      return totals;
    }

    // Only consider paid invoices for commission calculations
    const paidInvoices = invoices.filter(invoice => invoice.isPaid === true);

    paidInvoices.forEach(invoice => {
      const date = new Date(invoice.date);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const year = date.getFullYear();
      
      if (year !== currentYear || quarter !== currentQuarter) return;

      const commission = invoice.amount * (invoice.commissionPercentage / 100);

      if (invoice.referredByFirm === user.firm) {
        // We will receive commission
        const quarterKey = `${year}-Q${quarter}`;
        const settledInvoiceIds = getSettledInvoiceIds(quarterKey, invoice.invoicedByFirm);
        
        if (settledInvoiceIds.includes(invoice.id)) {
          totals.toReceive.settled += commission;
        } else {
          totals.toReceive.unsettled += commission;
        }
      }

      if (invoice.invoicedByFirm === user.firm && invoice.referredByFirm !== user.firm) {
        // We need to pay commission
        const quarterKey = `${year}-Q${quarter}`;
        const settledInvoiceIds = getSettledInvoiceIds(quarterKey, invoice.referredByFirm);
        
        if (settledInvoiceIds.includes(invoice.id)) {
          totals.toPay.settled += commission;
        } else {
          totals.toPay.unsettled += commission;
        }
      }
    });

    return totals;
  }, [invoices, currentYear, currentQuarter, user.firm, getSettledInvoiceIds]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
        <div className="p-4">
          <QuarterYearSelector
            currentYear={currentYear}
            currentQuarter={currentQuarter}
            onYearChange={setCurrentYear}
            onQuarterChange={setCurrentQuarter}
          />
        </div>
      </div>

      <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Commission to Receive Summary Card */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-emerald-700">To Receive</h3>
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-2 text-2xl font-semibold text-emerald-700">
                <Euro className="w-6 h-6" />
                <span>{formatCurrency(quarterlyTotals.toReceive.unsettled)}</span>
              </div>
              {quarterlyTotals.toReceive.settled > 0 && (
                <div className="mt-2 text-sm text-emerald-600">
                  {formatCurrency(quarterlyTotals.toReceive.settled)} settled
                </div>
              )}
            </div>

            {/* Commission to Pay Summary Card */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-blue-700">To Pay</h3>
                <ArrowDownRight className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-center gap-2 text-2xl font-semibold text-blue-700">
                <Euro className="w-6 h-6" />
                <span>{formatCurrency(quarterlyTotals.toPay.unsettled)}</span>
              </div>
              {quarterlyTotals.toPay.settled > 0 && (
                <div className="mt-2 text-sm text-blue-600">
                  {formatCurrency(quarterlyTotals.toPay.settled)} settled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
