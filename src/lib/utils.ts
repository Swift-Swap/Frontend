import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Outfit } from "next/font/google";

export const outfit = Outfit({display: "swap", subsets: ["latin"]})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const acceptedLots = ["WAC", "PAC", "Tennis Courts", "Stadium"] as const;
export type TAcceptedLot = (typeof acceptedLots)[number];

export interface EditListing {
  fromdate: string;
  todate: string;
}
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

export interface Stats {
    spots_sold: number;
    spots_bought: number;
    total_revenue: number;
    days_of_parking: number;
}

export interface Metrics {
    views: number;
    parking_lot: TAcceptedLot;
    spot_number: number;
    days: number;
    from_date: string;
    to_date: string;
}

export const stats: Stats  = {
    spots_sold: 5,
    spots_bought: 5,
    total_revenue: 5,
    days_of_parking: 5,
}

export const metrics: Metrics = {
    views: 5,
    parking_lot: "WAC",
    spot_number: 5,
    days: 5,
    from_date: "2023-07-31",
    to_date: "2023-08-05"
}

export function formatNumber(num: number) {
    return num.toString().padStart(3, "0");
}
interface ListingRecently extends ListingResponse {
    sold_on: string;
}
export const mockListings: ListingRecently[] = [
    {
        start_date: "2023-07-31",
        end_date: "2023-08-05",
        days: 6,
        lot: "WAC",
        price: 30,
        sold_on: "2023-07-30",
        spaceid: "1",
        spotnumber: 1,
        user_id: "1",
    },
    {
        start_date: "2023-07-31",
        end_date: "2023-08-05",
        days: 6,
        lot: "Tennis Courts",
        price: 30,
        sold_on: "2023-07-30",
        spaceid: "3",
        spotnumber: 3,
        user_id: "1",
    },
    {
        start_date: "2023-07-31",
        end_date: "2023-08-05",
        days: 6,
        lot: "Tennis Courts",
        price: 30,
        sold_on: "2023-07-30",
        spaceid: "9",
        spotnumber: 30,
        user_id: "1",
    },
    {
        start_date: "2023-07-31",
        end_date: "2023-08-05",
        days: 6,
        lot: "Tennis Courts",
        price: 30,
        sold_on: "2023-07-30",
        spaceid: "7",
        spotnumber: 6,
        user_id: "1",
    },
    {
        start_date: "2023-07-31",
        end_date: "2023-08-05",
        days: 6,
        lot: "Tennis Courts",
        price: 30,
        sold_on: "2023-07-30",
        spaceid: "2",
        spotnumber: 2,
        user_id: "1",
    },
]
