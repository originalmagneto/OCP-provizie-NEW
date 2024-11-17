import type { FirmType } from "./index";

export interface FilterState {
  search: string;
  status: "all" | "paid" | "unpaid";
  firm: "all" | FirmType;
}

export interface SortOptions {
  field: "date" | "amount" | "client";
  direction: "asc" | "desc";
}
