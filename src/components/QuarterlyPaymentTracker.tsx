import React, { useState, useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import {
  Check,
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Euro,
} from "lucide-react";
import type { FirmType } from "../types";

const firmThemes = {
  SKALLARS: {
    primary: "bg-purple-100",
    secondary: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    light: "text-purple-500",
    accent: "#9333ea",
  },
  MKMs: {
    primary: "bg-blue-100",
    secondary: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    light: "text-blue-500",
    accent: "#2563eb",
  },
  Contax: {
    primary: "bg-yellow-100",
    secondary: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
    light: "text-yellow-500",
    accent: "#d97706",
  },
} as const;

interface QuarterlyPayment {
  id: string;
  quarter: string;
  year: number;
  fromFirm: FirmType;
  toFirm: FirmType;
  amount: number;
  invoiceCount: number;
  isPaid: boolean;
  paidDate?: string;
  dueDate: string;
  invoices: Array<{
    id: string;
    clientName: string;
    amount: number;
    date: string;
    commission: number;
  }>;
}

function PaymentStatusBadge({
  status,
}: {
  status: "paid" | "pending" | "overdue";
}) {
  const styles = {
    paid: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
  };

  const icons = {
    paid: Check,
    pending: Clock,
    overdue: AlertCircle,
  };

  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PaymentCard({
  payment,
  onMarkPaid,
  canManage,
}: {
  payment: QuarterlyPayment;
  onMarkPaid: () => void;
  canManage: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = firmThemes[payment.fromFirm];

  const formatEUR = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getStatus = () => {
    if (payment.isPaid) return "paid";
    const dueDate = new Date(payment.dueDate);
    return dueDate < new Date() ? "overdue" : "pending";
  };

  const getDaysRemaining = () => {
    if (payment.isPaid) return null;
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`${theme.primary} p-3 rounded-lg`}>
              <Euro className={theme.text} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {payment.quarter} {payment.year}
              </h3>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <span className={theme.text}>{payment.fromFirm}</span>
                <ArrowRight className="mx-2 h-4 w-4" />
                <span className={firmThemes[payment.toFirm].text}>
                  {payment.toFirm}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <PaymentStatusBadge status={getStatus()} />
            {!payment.isPaid && canManage && (
              <button
                onClick={onMarkPaid}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Mark as Paid
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-500"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Amount Due</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatEUR(payment.amount)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Invoices</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {payment.invoiceCount}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Due Date</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {new Date(payment.dueDate).toLocaleDateString()}
              {daysRemaining !== null && daysRemaining > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  ({daysRemaining} days left)
                </span>
              )}
            </p>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900">
              Related Invoices
            </h4>
            <div className="mt-2 divide-y divide-gray-200">
              {payment.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {invoice.clientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatEUR(invoice.commission)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {((invoice.commission / invoice.amount) * 100).toFixed(1)}
                      % of {formatEUR(invoice.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuarterFilter({
  selectedQuarter,
  onQuarterChange,
}: {
  selectedQuarter: string;
  onQuarterChange: (quarter: string) => void;
}) {
  const quarters = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

    const result = [];
    for (let i = 0; i < 4; i++) {
      let year = currentYear;
      let quarter = currentQuarter - i;

      if (quarter <= 0) {
        quarter += 4;
        year -= 1;
      }

      result.push(`Q${quarter} ${year}`);
    }
    return result;
  }, []);

  return (
    <div className="flex space-x-2">
      {quarters.map((quarter) => (
        <button
          key={quarter}
          onClick={() => onQuarterChange(quarter)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${
              selectedQuarter === quarter
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }
          `}
        >
          {quarter}
        </button>
      ))}
    </div>
  );
}

export default function QuarterlyPaymentTracker() {
  const { invoices, updateQuarterlyPayment } = useInvoices();
  const { user } = useAuth();
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${currentQuarter} ${now.getFullYear()}`;
  });

  const quarterlyPayments: QuarterlyPayment[] = useMemo(() => {
    const [quarter, yearStr] = selectedQuarter.split(" ");
    const year = parseInt(yearStr);
    const quarterNumber = parseInt(quarter.substring(1));
    const startMonth = (quarterNumber - 1) * 3;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0);

    // Group invoices by fromFirm -> toFirm
    const paymentGroups = invoices.reduce(
      (acc, invoice) => {
        const invoiceDate = new Date(invoice.date);
        if (
          invoiceDate >= startDate &&
          invoiceDate <= endDate &&
          invoice.isPaid
        ) {
          const key = `${invoice.invoicedByFirm}-${invoice.referredByFirm}`;
          if (!acc[key]) {
            acc[key] = {
              fromFirm: invoice.invoicedByFirm,
              toFirm: invoice.referredByFirm,
              amount: 0,
              invoiceCount: 0,
              invoices: [],
            };
          }

          const commission =
            (invoice.amount * invoice.commissionPercentage) / 100;
          acc[key].amount += commission;
          acc[key].invoiceCount += 1;
          acc[key].invoices.push({
            id: invoice.id,
            clientName: invoice.clientName,
            amount: invoice.amount,
            date: invoice.date,
            commission,
          });
        }
        return acc;
      },
      {} as Record<
        string,
        Omit<QuarterlyPayment, "id" | "quarter" | "year" | "isPaid" | "dueDate">
      >,
    );

    // Transform groups into payments array
    return Object.entries(paymentGroups).map(([key, group]) => ({
      id: `${year}-${quarter}-${key}`,
      quarter,
      year,
      ...group,
      isPaid: false,
      dueDate: new Date(year, startMonth + 3, 15).toISOString(), // Due by 15th of next quarter
    }));
  }, [invoices, selectedQuarter]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Quarterly Payment Tracker
        </h2>
        <QuarterFilter
          selectedQuarter={selectedQuarter}
          onQuarterChange={setSelectedQuarter}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">
              Paid Commissions
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {quarterlyPayments.filter((p) => p.isPaid).length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-lg p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">
              Pending Payments
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {quarterlyPayments.filter((p) => !p.isPaid).length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">
              Total Amount Due
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
              }).format(
                quarterlyPayments.reduce((sum, p) => sum + p.amount, 0),
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {quarterlyPayments.length > 0 ? (
          quarterlyPayments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onMarkPaid={() => updateQuarterlyPayment(payment.id, true)}
              canManage={user.firm === payment.fromFirm}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No payments to track
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no commission payments to track for this quarter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
