import React, { createContext, useContext, useState, useEffect } from "react";
import { useInvoices } from "./InvoiceContext";
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
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: React.ReactNode }) {
  const { invoices } = useInvoices();
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

  // Calculate available years and yearly statistics together to avoid circular dependencies
  const { availableYears, yearlyStats } = React.useMemo(() => {
    const currentRealYear = new Date().getFullYear();
    const stats: Record<number, {
      totalRevenue: number;
      totalCommissions: number;
      invoiceCount: number;
      yearOverYearGrowth: number;
    }> = {};

    // Get years from invoices
    const invoiceYears = invoices.map(invoice => new Date(invoice.date).getFullYear());

    // Create a range of years
    const yearRange = Array.from(
      { length: 10 },
      (_, i) => currentRealYear - 5 + i
    );

    // Combine and sort years
    const allYears = [...new Set([...invoiceYears, ...yearRange])].sort((a, b) => b - a);

    // Initialize stats for all years
    allYears.forEach(year => {
      stats[year] = {
        totalRevenue: 0,
        totalCommissions: 0,
        invoiceCount: 0,
        yearOverYearGrowth: 0
      };
    });

    // Calculate statistics for each year
    allYears.forEach(year => {
      const yearInvoices = invoices.filter(
        invoice => new Date(invoice.date).getFullYear() === year
      );

      const totalRevenue = yearInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );
      const totalCommissions = yearInvoices.reduce(
        (sum, inv) => sum + (inv.amount * inv.commissionPercentage) / 100,
        0
      );

      const previousYear = year - 1;
      const previousYearInvoices = invoices.filter(
        invoice => new Date(invoice.date).getFullYear() === previousYear
      );
      const previousRevenue = previousYearInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );

      stats[year] = {
        totalRevenue,
        totalCommissions,
        invoiceCount: yearInvoices.length,
        yearOverYearGrowth: previousRevenue === 0
          ? 0
          : ((totalRevenue - previousRevenue) / previousRevenue) * 100
      };
    });

    return { availableYears: allYears, yearlyStats: stats };
  }, [invoices]);

  // Calculate available years and yearly statistics together
  const { availableYears, yearlyStats } = React.useMemo(() => {
    const currentRealYear = new Date().getFullYear();
    const stats: Record<number, {
      totalRevenue: number;
      totalCommissions: number;
      invoiceCount: number;
      yearOverYearGrowth: number;
    }> = {};

    // Get years from invoices
    const invoiceYears = invoices.map(invoice => new Date(invoice.date).getFullYear());

    // Create a range of years
    const yearRange = Array.from(
      { length: 10 },
      (_, i) => currentRealYear - 5 + i
    );

    // Combine and sort years
    const allYears = [...new Set([...invoiceYears, ...yearRange])].sort((a, b) => b - a);

    // Initialize stats for all years
    allYears.forEach(year => {
      const yearInvoices = invoices.filter(
        invoice => new Date(invoice.date).getFullYear() === year
      );

      const totalRevenue = yearInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );
      const totalCommissions = yearInvoices.reduce(
        (sum, inv) => sum + (inv.amount * inv.commissionPercentage) / 100,
        0
      );

      const previousYear = year - 1;
      const previousYearInvoices = invoices.filter(
        invoice => new Date(invoice.date).getFullYear() === previousYear
      );
      const previousRevenue = previousYearInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );

      stats[year] = {
        totalRevenue,
        totalCommissions,
        invoiceCount: yearInvoices.length,
        yearOverYearGrowth: previousRevenue === 0
          ? 0
          : ((totalRevenue - previousRevenue) / previousRevenue) * 100
      };
    });

    return { availableYears: allYears, yearlyStats: stats };
  }, [invoices]);

  // Handle year changes
  const setYear = (year: number) => {
    setCurrentYear(year);
    localStorage.setItem("selectedYear", year.toString());
  };

  const setQuarter = (quarter: number) => {
    if (quarter >= 1 && quarter <= 4) {
      setCurrentQuarter(quarter);
      localStorage.setItem("selectedQuarter", quarter.toString());
    }
  };

  const selectYearAndQuarter = (year: number, quarter: number) => {
    if (quarter >= 1 && quarter <= 4) {
      setCurrentYear(year);
      setCurrentQuarter(quarter);
      localStorage.setItem("selectedYear", year.toString());
      localStorage.setItem("selectedQuarter", quarter.toString());
    }
  };

  return (
    <YearContext.Provider
      value={{
        currentYear,
        currentQuarter,
        availableYears,
        yearlyStats,
        setYear,
        setQuarter,
        selectYearAndQuarter,
      }}
    >
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error("useYear must be used within a YearProvider");
  }
  return context;
}

// Helper functions for quarter operations
export function isInQuarter(
  date: Date,
  year: number,
  quarter: number,
): boolean {
  const quarterStart = new Date(year, (quarter - 1) * 3, 1);
  const quarterEnd = new Date(year, quarter * 3, 0);
  
  // Add debugging
  console.log('Quarter check:', {
    date: date.toISOString(),
    quarterStart: quarterStart.toISOString(),
    quarterEnd: quarterEnd.toISOString(),
    isInQuarter: date >= quarterStart && date <= quarterEnd
  });
  
  return date >= quarterStart && date <= quarterEnd;
}

export function filterInvoicesByQuarter(
  invoices: Invoice[],
  year: number,
  quarter: number,
) {
  return invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.date);
    return isInQuarter(invoiceDate, year, quarter);
  });
}

export function getQuarterRange(year: number, quarter: number) {
  const start = new Date(year, (quarter - 1) * 3, 1);
  const end = new Date(year, quarter * 3, 0);
  return { start, end };
}

export function getCurrentQuarter() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    quarter: Math.floor(now.getMonth() / 3) + 1,
  };
}
