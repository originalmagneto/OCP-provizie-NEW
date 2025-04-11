import { createContext, useContext, useState } from "react";
import type { Invoice } from "../types";

interface YearContextType {
  currentYear: number;
  currentQuarter: number;
  availableYears: number[];
  yearlyStats: Record<
    number,
    {
      totalRevenue: number;
      totalCommissions: number;
      invoiceCount: number;
      yearOverYearGrowth: number;
    }
  >;
  setYear: (year: number) => void;
  setQuarter: (quarter: number) => void;
  selectYearAndQuarter: (year: number, quarter: number) => void;
  updateStats: (invoices: Invoice[]) => void;  // New function to update stats
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: React.ReactNode }) {
  const [currentYear, setCurrentYear] = useState(() => {
    const savedYear = localStorage.getItem("selectedYear");
    return savedYear ? parseInt(savedYear) : new Date().getFullYear();
  });

  const [currentQuarter, setCurrentQuarter] = useState(() => {
    const savedQuarter = localStorage.getItem("selectedQuarter");
    return savedQuarter
      ? parseInt(savedQuarter)
      : Math.floor(new Date().getMonth() / 3) + 1;
  });

  const [yearlyStats, setYearlyStats] = useState<YearContextType["yearlyStats"]>({});
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);

  const updateStats = (invoices: Invoice[]) => {
    if (!Array.isArray(invoices)) return;

    const currentRealYear = new Date().getFullYear();
    const stats: YearContextType["yearlyStats"] = {};
    const years = new Set<number>();

    // Add current year even if no invoices
    years.add(currentRealYear);

    try {
      // Process each invoice
      invoices.forEach(invoice => {
        if (!invoice?.date) return;

        const date = new Date(invoice.date);
        if (isNaN(date.getTime())) return;

        const year = date.getFullYear();
        years.add(year);

        if (!stats[year]) {
          stats[year] = {
            totalRevenue: 0,
            totalCommissions: 0,
            invoiceCount: 0,
            yearOverYearGrowth: 0,
          };
        }

        stats[year].totalRevenue += invoice.amount || 0;
        stats[year].totalCommissions +=
          ((invoice.amount || 0) * (invoice.commissionPercentage || 0)) / 100;
        stats[year].invoiceCount += 1;
      });

      // Calculate year over year growth
      const sortedYears = Array.from(years).sort((a, b) => a - b);
      sortedYears.forEach((year, index) => {
        if (index > 0) {
          const previousYear = sortedYears[index - 1];
          const currentRevenue = stats[year].totalRevenue;
          const previousRevenue = stats[previousYear].totalRevenue;
          
          if (previousRevenue > 0) {
            stats[year].yearOverYearGrowth =
              ((currentRevenue - previousRevenue) / previousRevenue) * 100;
          }
        }
      });

      setYearlyStats(stats);
      setAvailableYears(sortedYears);
    } catch (error) {
      console.error('Error updating year stats:', error);
    }
  };

  const selectYearAndQuarter = (year: number, quarter: number) => {
    setCurrentYear(year);
    setCurrentQuarter(quarter);
    localStorage.setItem("selectedYear", year.toString());
    localStorage.setItem("selectedQuarter", quarter.toString());
  };

  const value = {
    currentYear,
    currentQuarter,
    availableYears,
    yearlyStats,
    setYear: (year: number) => selectYearAndQuarter(year, currentQuarter),
    setQuarter: (quarter: number) => selectYearAndQuarter(currentYear, quarter),
    selectYearAndQuarter,
    updateStats,
  };

  return (
    <YearContext.Provider value={value}>
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (!context) {
    throw new Error("useYear must be used within a YearProvider");
  }
  return context;
}

export function isInQuarter(date: Date, year: number, quarter: number): boolean {
  const quarterStartMonth = (quarter - 1) * 3;
  const quarterEndMonth = quarterStartMonth + 2;
  
  return (
    date.getFullYear() === year &&
    date.getMonth() >= quarterStartMonth &&
    date.getMonth() <= quarterEndMonth
  );
}
