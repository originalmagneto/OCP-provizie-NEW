import React, { createContext, useContext, useState } from "react";
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
  const { invoices = [] } = useInvoices();
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

  // Calculate available years and yearly statistics together
  const { availableYears, yearlyStats } = React.useMemo(() => {
    const currentRealYear = new Date().getFullYear();
    const stats: Record<number, {
      totalRevenue: number;
      totalCommissions: number;
      invoiceCount: number;
      yearOverYearGrowth: number;
    }> = {};

    // Initialize with current year if no invoices yet
    if (!invoices.length) {
      return {
        availableYears: [currentRealYear],
        yearlyStats: {
          [currentRealYear]: {
            totalRevenue: 0,
            totalCommissions: 0,
            invoiceCount: 0,
            yearOverYearGrowth: 0
          }
        }
      };
    }

    // Get years from invoices and ensure they are valid numbers
    const invoiceYears = invoices
      .map(invoice => new Date(invoice.date).getFullYear())
      .filter(year => !isNaN(year));

    // If we still have no valid years, return current year
    if (!invoiceYears.length) {
      return {
        availableYears: [currentRealYear],
        yearlyStats: {
          [currentRealYear]: {
            totalRevenue: 0,
            totalCommissions: 0,
            invoiceCount: 0,
            yearOverYearGrowth: 0
          }
        }
      };
    }

    // Create a range of years
    const yearRange = Array.from(
      { length: 10 },
      (_, i) => currentRealYear - 5 + i
    );

    // Combine years and ensure uniqueness before sorting
    // Use a safer approach to create and sort the array
    const uniqueYears = new Set([...invoiceYears, ...yearRange]);
    
    // Convert to array and ensure all values are valid numbers before sorting
    const validYears = Array.from(uniqueYears).filter(
      (year): year is number => year !== null && year !== undefined && Number.isFinite(year)
    );
    
    // Sort the years in descending order (newest first)
    // Use a completely safe sorting approach with defensive programming
    let allYears = [];
    try {
      // Create a copy of validYears to avoid modifying the original array
      const yearsToBeSorted = validYears.slice();
      
      // Manual sorting to avoid any potential issues with the built-in sort method
      // Initialize all variables before using them in the comparison
      yearsToBeSorted.sort((a, b) => {
        // Ensure a and b are initialized to valid numbers before comparison
        const numA = typeof a === 'number' ? a : 0;
        const numB = typeof b === 'number' ? b : 0;
        
        // Simple descending order comparison with guaranteed initialized variables
        return numB - numA;
      });
      
      allYears = yearsToBeSorted;
    } catch (error) {
      console.error("Error sorting years:", error);
      // Fallback to a simple array if sorting fails
      allYears = Array.from(validYears);
    }

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
      // Ensure year is a valid number before processing
      if (year === undefined || year === null || !Number.isFinite(year)) {
        console.error("Invalid year encountered:", year);
        return; // Skip this iteration
      }

      const yearInvoices = invoices.filter(invoice => {
        if (!invoice || !invoice.date) return false;
        try {
          const invoiceYear = new Date(invoice.date).getFullYear();
          return invoiceYear === year;
        } catch (e) {
          console.error("Error processing invoice date:", invoice.date, e);
          return false;
        }
      });

      const totalRevenue = yearInvoices.reduce(
        (sum, inv) => sum + (inv.amount || 0),
        0
      );
      const totalCommissions = yearInvoices.reduce(
        (sum, inv) => sum + ((inv.amount || 0) * (inv.commissionPercentage || 0)) / 100,
        0
      );

      const previousYear = year - 1;
      const previousYearInvoices = invoices.filter(invoice => {
        if (!invoice || !invoice.date) return false;
        try {
          const invoiceYear = new Date(invoice.date).getFullYear();
          return invoiceYear === previousYear;
        } catch (e) {
          console.error("Error processing invoice date for previous year:", invoice.date, e);
          return false;
        }
      });
      const previousRevenue = previousYearInvoices.reduce(
        (sum, inv) => sum + (inv.amount || 0),
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
