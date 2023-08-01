import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const acceptedLots = ["WAC", "PAC", "Tennis Courts", "Stadium"] as const;
export type TAcceptedLot = (typeof acceptedLots)[number];

export interface CreateListing {
  spotnumber: number;
  lot: TAcceptedLot;
  fromdate: string;
  todate: string;
}

export interface ListingResponse {
  spaceid: string;
  spotnumber: number;
  lot: TAcceptedLot;
  days: number;
  start_date: string;
  end_date: string;
  price: number;
  user_id: string;
}
