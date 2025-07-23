export type FirmType = "SKALLARS" | "MKMs" | "Contax";

export type UserRole = "admin" | "user";

export interface FirmUser {
  id: string;
  name: string;
  email: string;
  firm: FirmType;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
  pendingApproval?: boolean;
}

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
  createdBy?: string; // User ID who created the invoice
  assignedTo?: string; // User ID who is assigned the commission
  createdByName?: string; // User name for display
  assignedToName?: string; // User name for display
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
