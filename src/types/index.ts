export type FirmType = "SKALLARS" | "MKMs" | "Contax";

export interface Client {
  id?: string;
  name: string;
  belongsTo: FirmType;
  lastInvoiceDate: Date;
  updatedAt?: Date;
}

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  invoicedByFirm: FirmType;
  referredByFirm: FirmType;
  commissionPercentage: number;
  date: string;
  isPaid: boolean;
  comment?: string;
}

export interface SettlementStatus {
  quarterKey: string;
  isSettled: boolean;
  settledAt: string;
  settledBy: FirmType;
  updatedAt: Date;
  createdAt?: Date;
}

export interface FirmTheme {
  logoUrl?: string;
  primary: string;
  secondary: string;
  text: string;
  border?: string;
  light?: string;
  accent: string;
}
