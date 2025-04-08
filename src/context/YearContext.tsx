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

  // Calculate available years from invoices and include a range around the current year
  const availableYears = React.useMemo(() => {
    const currentRealYear = new Date().getFullYear();

    // Get years from invoices
    const invoiceYears = invoices.map((invoice) =>
      new Date(invoice.date).getFullYear(),
    );

    // Create a range of years
    const yearRange = Array.from(
      { length: 10 }, // Adjust this number to show more/fewer years
      (_, i) => currentRealYear - 5 + i, // Show 5 years back and 4 years forward
    );

    // Combine invoice years and range, remove duplicates, and sort
    const allYears = [...new Set([...invoiceYears, ...yearRange])].sort(
      (a, b) => b - a,
    ); // Sort in descending order

    return allYears;
  }, [invoices]);

  // Calculate yearly statistics
  const yearlyStats = React.useMemo(() => {
    const stats: Record<
      number,
      {
        totalRevenue: number;
        totalCommissions: number;
        invoiceCount: number;
        yearOverYearGrowth: number;
      }
    > = {};

    availableYears.forEach((year) => {
      const yearInvoices = invoices.filter(
        (invoice) => new Date(invoice.date).getFullYear() === year,
      );

      const totalRevenue = yearInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0,
      );
      const totalCommissions = yearInvoices.reduce(
        (sum, inv) => sum + (inv.amount * inv.commissionPercentage) / 100,
        0,
      );

      const previousYear = year - 1;
      const previousYearInvoices = invoices.filter(
        (invoice) => new Date(invoice.date).getFullYear() === previousYear,
      );
      const previousRevenue = previousYearInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0,
      );

      const yearOverYearGrowth =
        previousRevenue === 0
          ? 100
          : ((totalRevenue - previousRevenue) / previousRevenue) * 100;

      stats[year] = {
        totalRevenue,
        totalCommissions,
        invoiceCount: yearInvoices.length,
        yearOverYearGrowth,
      };
    });

    return stats;
  }, [invoices, availableYears]);

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
