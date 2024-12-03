import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ArrowLeftRight,
  Timer,
  ChevronDown,
  Check,
  AlertCircle,
  CircleDollarSign,
} from "lucide-react";
import { useYear, isInQuarter } from "../context/YearContext";
import { useInvoices } from "../context/InvoiceContext";
import { useCommissions } from "../context/CommissionContext";
import { useAuth } from "../context/AuthContext";
import type { FirmType } from "../types";

interface QuarterStatus {
  hasUnpaidInvoices: boolean;
  hasUnsettledCommissions: boolean;
}

export default function QuarterYearSelector() {
  const { currentYear, currentQuarter, availableYears, selectYearAndQuarter } = useYear();
  const { invoices } = useInvoices();
  const { settledQuarters } = useCommissions();
  const { user } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const quarters = [1, 2, 3, 4];

  // Calculate status for each quarter
  const quarterStatuses = useMemo(() => {
    const statuses: Record<number, QuarterStatus> = {};
    
    quarters.forEach(quarter => {
      const status: QuarterStatus = {
        hasUnpaidInvoices: false,
        hasUnsettledCommissions: false
      };

      // Check for unpaid invoices
      const hasUnpaidInvoices = invoices.some(invoice => {
        if (!isInQuarter(new Date(invoice.date), currentYear, quarter)) return false;
        return !invoice.isPaid && 
               (invoice.invoicedByFirm === user?.firm || invoice.referredByFirm === user?.firm);
      });

      // Check for unsettled commissions
      const hasUnsettledCommissions = invoices.some(invoice => {
        if (!isInQuarter(new Date(invoice.date), currentYear, quarter)) return false;
        if (!invoice.isPaid) return false;

        if (invoice.referredByFirm === user?.firm && invoice.invoicedByFirm !== user.firm) {
          // Check if we need to receive commission
          const key = `${currentYear}-Q${quarter}-${invoice.invoicedByFirm}-${user.firm}`;
          const isSettled = settledQuarters.some(q => 
            q.quarterKey === key && 
            q.isSettled && 
            q.settledBy === user.firm
          );
          return !isSettled;
        }

        if (invoice.invoicedByFirm === user?.firm && invoice.referredByFirm !== user.firm) {
          // Check if we need to pay commission
          const key = `${currentYear}-Q${quarter}-${user.firm}-${invoice.referredByFirm}`;
          const isSettled = settledQuarters.some(q => 
            q.quarterKey === key && 
            q.isSettled && 
            q.settledBy === invoice.referredByFirm
          );
          return !isSettled;
        }

        return false;
      });

      status.hasUnpaidInvoices = hasUnpaidInvoices;
      status.hasUnsettledCommissions = hasUnsettledCommissions;
      statuses[quarter] = status;
    });

    return statuses;
  }, [currentYear, invoices, settledQuarters, user?.firm]);

  const handleQuarterChange = (year: number, quarter: number) => {
    setIsChanging(true);
    selectYearAndQuarter(year, quarter);
    setTimeout(() => setIsChanging(false), 300);
  };

  const handlePreviousQuarter = () => {
    if (currentQuarter === 1) {
      if (availableYears.includes(currentYear - 1)) {
        handleQuarterChange(currentYear - 1, 4);
      }
    } else {
      handleQuarterChange(currentYear, currentQuarter - 1);
    }
  };

  const handleNextQuarter = () => {
    if (currentQuarter === 4) {
      if (availableYears.includes(currentYear + 1)) {
        handleQuarterChange(currentYear + 1, 1);
      }
    } else {
      handleQuarterChange(currentYear, currentQuarter + 1);
    }
  };

  const isCurrentQuarter = (quarter: number) => {
    const now = new Date();
    const currentRealYear = now.getFullYear();
    const currentRealQuarter = Math.floor(now.getMonth() / 3) + 1;
    return currentYear === currentRealYear && quarter === currentRealQuarter;
  };

  const getQuarterDates = (quarter: number) => {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    const startDate = new Date(currentYear, startMonth, 1);
    const endDate = new Date(currentYear, endMonth + 1, 0);

    return {
      start: startDate.toLocaleDateString("en-US", { month: "short" }),
      end: endDate.toLocaleDateString("en-US", { month: "short" }),
    };
  };

  const YearSelect = () => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={selectRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <CalendarDays className="h-5 w-5 text-gray-400" />
          <span className="text-lg font-semibold text-gray-900">
            {currentYear}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-slide-down">
            <div className="max-h-60 overflow-auto py-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {availableYears.map((year) => {
                const now = new Date().getFullYear();
                const isPast = year < now;
                const isFuture = year > now;
                const isCurrent = year === now;
                const isSelected = year === currentYear;

                return (
                  <button
                    key={year}
                    onClick={() => {
                      handleQuarterChange(year, currentQuarter);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full text-left px-4 py-2 text-sm
                      ${isSelected ? "bg-indigo-50 text-indigo-600" : "text-gray-700"}
                      ${!isSelected && "hover:bg-gray-50"}
                      flex items-center justify-between
                    `}
                  >
                    <span
                      className={`
                      ${isCurrent ? "font-semibold" : ""}
                      ${isPast ? "text-gray-600" : ""}
                      ${isFuture ? "text-indigo-600" : ""}
                    `}
                    >
                      {year}
                    </span>

                    {isSelected && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}

                    {isCurrent && !isSelected && (
                      <span className="text-xs text-indigo-600 font-medium">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const minYear = Math.min(...availableYears);
  const maxYear = Math.max(...availableYears);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header with Year Selection */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <YearSelect />

          <button
            onClick={() => {
              const now = new Date();
              handleQuarterChange(
                now.getFullYear(),
                Math.floor(now.getMonth() / 3) + 1,
              );
            }}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <Timer className="h-4 w-4 mr-1.5" />
            Current Quarter
          </button>
        </div>
      </div>

      {/* Quarter Selection */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousQuarter}
            disabled={currentYear === minYear && currentQuarter === 1}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Navigate between quarters</span>
          </div>

          <button
            onClick={handleNextQuarter}
            disabled={currentYear === maxYear && currentQuarter === 4}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {quarters.map((quarter) => {
            const dates = getQuarterDates(quarter);
            const isCurrent = isCurrentQuarter(quarter);
            const isSelected = currentQuarter === quarter;
            const status = quarterStatuses[quarter];

            return (
              <button
                key={quarter}
                onClick={() => handleQuarterChange(currentYear, quarter)}
                className={`
                  relative p-3 rounded-lg text-left transition-all duration-200
                  ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }
                  ${
                    isCurrent && !isSelected
                      ? "ring-2 ring-indigo-500 ring-offset-2"
                      : ""
                  }
                `}
              >
                <div className="font-semibold">Q{quarter}</div>
                <div
                  className={`text-xs mt-1 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}
                >
                  {dates.start} - {dates.end}
                </div>
                
                {/* Status Indicators */}
                <div className="absolute top-1 right-1 flex space-x-1">
                  {isCurrent && (
                    <div
                      className={`
                      text-xs px-1.5 py-0.5 rounded-full
                      ${isSelected ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-600"}
                    `}
                    >
                      Current
                    </div>
                  )}
                  {status?.hasUnpaidInvoices && (
                    <div
                      className={`
                      flex items-center px-1.5 py-0.5 rounded-full
                      ${isSelected ? "bg-indigo-500" : "bg-amber-100"}
                    `}
                      title="Has unpaid invoices"
                    >
                      <AlertCircle className={`h-3 w-3 ${isSelected ? "text-white" : "text-amber-600"}`} />
                    </div>
                  )}
                  {status?.hasUnsettledCommissions && (
                    <div
                      className={`
                      flex items-center px-1.5 py-0.5 rounded-full
                      ${isSelected ? "bg-indigo-500" : "bg-blue-100"}
                    `}
                      title="Has unsettled commissions"
                    >
                      <CircleDollarSign className={`h-3 w-3 ${isSelected ? "text-white" : "text-blue-600"}`} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
