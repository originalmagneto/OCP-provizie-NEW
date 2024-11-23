export type FirmType = "SKALLARS" | "MKMs" | "Contax";

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  commissionPercentage: number;
  invoicedByFirm: FirmType;
  referredByFirm: FirmType;
  isPaid: boolean;
}

export interface SettlementStatus {
  quarterKey: string;  // Format: "2024-Q1"
  isSettled: boolean;
  settledAt?: string;
  settledBy: FirmType;
}
