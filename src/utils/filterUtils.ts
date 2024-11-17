import type { Invoice, FilterState } from "../types";
import { isInQuarter } from "./dateUtils";

export function filterInvoices(
  invoices: Invoice[],
  filters: FilterState,
  currentYear: number,
  currentQuarter: number,
): Invoice[] {
  if (!Array.isArray(invoices)) return [];

  return invoices
    .filter((invoice) => {
      // Quarter filter
      const invoiceDate = new Date(invoice.date);
      if (!isInQuarter(invoiceDate, currentYear, currentQuarter)) {
        return false;
      }

      // Search filter
      if (
        filters.search &&
        !invoice.clientName.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "paid" && !invoice.isPaid) return false;
        if (filters.status === "unpaid" && invoice.isPaid) return false;
      }

      // Firm filter
      if (filters.firm !== "all") {
        return (
          invoice.invoicedByFirm === filters.firm ||
          invoice.referredByFirm === filters.firm
        );
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
