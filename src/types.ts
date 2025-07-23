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

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  commissionPercentage: number;
  invoicedByFirm: FirmType;  // The firm that sent the invoice to the client
  referredByFirm: FirmType;  // The firm that referred the client
  isPaid: boolean;  // Whether the client has paid the invoice
  invoicedByUserInitials?: string; // Optional: Initials of the user who created the invoice
}

export interface SettlementStatus {
  quarterKey: string;  // Format: "2024-Q1-FIRMNAME" (e.g., "2024-Q1-MKMs")
  isSettled: boolean;  // Whether the eligible commission has been settled
  settledAt?: string;  // When the commission was marked as settled
  settledBy: FirmType;  // The firm that marked the commission as settled
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
