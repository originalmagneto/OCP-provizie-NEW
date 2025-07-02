import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Euro, Clock, Check } from "lucide-react";
import type { FirmType } from "../types";
import { firmThemes } from "../config/themes";

interface QuarterlyData {
  quarter: string;
  year: number;
  commissionsReceivable: {
    [firm in FirmType]?: {
      amount: number;
      count: number;
      isPaid: boolean;
    };
  };
  commissionsPayable: {
    [firm in FirmType]?: {
      amount: number;
      count: number;
      isPaid: boolean;
    };
  };
}

function FirmSummaryCard({
  firm,
  quarterlyData,
  currentUserFirm,
}: {
  firm: FirmType;
  quarterlyData: Record<string, QuarterlyData>;
  currentUserFirm: FirmType;
}) {
  const formatEUR = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div
      className={`
      rounded-lg border ${firmThemes[firm].border}
      bg-gradient-to-br ${firmThemes[firm].gradient}
    `}
    >
      <div className="p-6">
        <h3 className={`text-lg font-semibold ${firmThemes[firm].text}`}>
          {firm}
        </h3>

        {Object.entries(quarterlyData)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([key, data]) => (
            <div key={key} className="mt-4 first:mt-2">
              <div className="font-medium text-gray-900 mb-2">
                {data.quarter} {data.year}
              </div>

              {/* Commissions Receivable */}
              {Object.entries(data.commissionsReceivable).map(
                ([fromFirm, details]) => (
                  <div
                    key={`receive-${fromFirm}`}
                    className="mb-2 pl-4 border-l-2 border-green-200"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className={firmThemes[fromFirm as FirmType].text}>
                          {fromFirm}
                        </span>
                        <ArrowRight className="h-3 w-3 mx-1 text-gray-400" />
                        <span className="font-medium">
                          {formatEUR(details.amount)}
                        </span>
                      </div>
                      {details.isPaid ? (
                        <span className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          Received
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      From {details.count} invoice
                      {details.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                ),
              )}

              {/* Commissions Payable */}
              {Object.entries(data.commissionsPayable).map(
                ([toFirm, details]) => (
                  <div
                    key={`pay-${toFirm}`}
                    className="mb-2 pl-4 border-l-2 border-red-200"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Euro className="h-3 w-3 mr-1 text-gray-400" />
                        <span className={firmThemes[toFirm as FirmType].text}>
                          {toFirm}
                        </span>
                        <span className="mx-1">·</span>
                        <span className="font-medium">
                          {formatEUR(details.amount)}
                        </span>
                      </div>
                      {details.isPaid ? (
                        <span className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          Paid
                        </span>
                      ) : (
                        <span className="flex items-center text-orange-500">
                          <Clock className="h-4 w-4 mr-1" />
                          Due
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      For {details.count} referral
                      {details.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                ),
              )}

              {/* Quarter Summary */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quarter Balance</span>
                  <span className="font-medium">
                    {formatEUR(
                      Object.values(data.commissionsReceivable).reduce(
                        (sum, d) => sum + d.amount,
                        0,
                      ) -
                        Object.values(data.commissionsPayable).reduce(
                          (sum, d) => sum + d.amount,
                          0,
                        ),
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function QuarterlySummary() {
  const { invoices } = useInvoices();
  const { user } = useAuth();

  const quarterlyData = useMemo(() => {
    const data: Record<string, QuarterlyData> = {};

    invoices.forEach((invoice) => {
      if (!invoice.isPaid) return;

      const date = new Date(invoice.date);
      const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
      const year = date.getFullYear();
      const key = `${year}-${quarter}`;

      if (!data[key]) {
        data[key] = {
          quarter,
          year,
          commissionsReceivable: {},
          commissionsPayable: {},
        };
      }

      const commission = invoice.amount * (invoice.commissionPercentage / 100);

      // If this firm referred the client but didn't invoice
      if (invoice.referredByFirm !== invoice.invoicedByFirm) {
        // Add to receivable for the referring firm
        const receivable = data[key].commissionsReceivable[
          invoice.referredByFirm
        ] || {
          amount: 0,
          count: 0,
          isPaid: false,
        };
        receivable.amount += commission;
        receivable.count += 1;
        data[key].commissionsReceivable[invoice.referredByFirm] = receivable;

        // Add to payable for the invoicing firm
        const payable = data[key].commissionsPayable[
          invoice.invoicedByFirm
        ] || {
          amount: 0,
          count: 0,
          isPaid: false,
        };
        payable.amount += commission;
        payable.count += 1;
        data[key].commissionsPayable[invoice.invoicedByFirm] = payable;
      }
    });

    return data;
  }, [invoices]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">
        Quarterly Commission Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(firmThemes).map((firm) => (
          <FirmSummaryCard
            key={firm}
            firm={firm as FirmType}
            quarterlyData={quarterlyData}
            currentUserFirm={user.firm}
          />
        ))}
      </div>
    </div>
  );
}
