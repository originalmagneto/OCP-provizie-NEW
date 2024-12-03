export type FirmType = "SKALLARS" | "MKMs" | "Contax";

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  commissionPercentage: number;
  invoicedByFirm: FirmType;  // The firm that sent the invoice to the client
  referredByFirm: FirmType;  // The firm that referred the client
  isPaid: boolean;  // Whether the client has paid the invoice
}

export interface SettlementStatus {
  quarterKey: string;  // Format: "2024-Q1-[PAYING_FIRM]-[RECEIVING_FIRM]" (e.g., "2024-Q1-MKMs-SKALLARS")
  isSettled: boolean;  // Whether the eligible commission has been settled
  settledAt: string;  // When the commission was marked as settled
  settledBy: FirmType;  // The firm that marked the commission as settled (should be the receiving firm)
}
