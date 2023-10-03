import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Outfit } from "next/font/google";
import { addDays, differenceInDays } from "date-fns";
import tennis_courts from "../../public/tennis_court.png";
import wac from "../../public/wac.png";
import pac from "../../public/pac.png";
import stadium from "../../public/stadium.png";
import { StaticImageData } from "next/image";
import { Roboto } from "next/font/google";
export const outfit = Outfit({ display: "swap", subsets: ["latin"] });

export const roboto = Roboto({
  display: "swap",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export async function getListings(): Promise<ListingResponse[]> {
  const res = await fetch("/api/listing", { method: "GET" });
  const json = (await res.json()) as ListingResponse[];
  if (!json) return [];
  const sorted = json.sort((a, b) => {
    const a_date = parseSplitDate(a.fromdate);
    const b_date = parseSplitDate(b.fromdate);
    if (a_date > b_date) return -1;
    if (a_date < b_date) return 1;
    return 0;
  });
  return sorted;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const acceptedLots = ["WAC", "PAC", "Tennis Courts", "Stadium"] as const;
export const allLots: TAcceptedLot[] = [
  "WAC",
  "PAC",
  "Tennis Courts",
  "Stadium",
];
export type TAcceptedLot = (typeof acceptedLots)[number];

export interface EditListing {
  fromdate: string;
  todate: string;
}
export interface CreateListing {
  spot_number: number;
  lot: TAcceptedLot;
  fromdate: string;
  todate: string;
}

export interface ListingResponse {
  user_id: string;
  bought: any;
  views: number;
  sold: boolean;
  listing_id: string;
  spot_number: number;
  lot: TAcceptedLot;
  days: number;
  buyer_id: string | null
  fromdate: string;
  todate: string;
  price: number;
  owner_id: string;
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

export const stats: Stats = {
  spots_sold: 5,
  spots_bought: 5,
  total_revenue: 5,
  days_of_parking: 5,
};

export const metrics: Metrics = {
  views: 5,
  parking_lot: "WAC",
  spot_number: 5,
  days: 5,
  from_date: "2023-07-31",
  to_date: "2023-08-05",
};

export function formatNumber(num: number) {
  return num.toString().padStart(3, "0");
}
export interface ListingRecently extends Omit<ListingResponse, "views"> {
  buyer_id: string;
  date_bought: string;
}

export function convertToPrice(from: Date, to: Date): number {
  const days = differenceInDays(to, addDays(from, -1));
  if (days <= 0) return 0;
  if (days === 5) return 20;
  const res = 3.625 * days + 1.375;
  return Math.round(res * 100) / 100;
}

export function parseSplitDate(date: string): Date {
  const [year, month, day] = date.split("-");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export const spotPics: Record<TAcceptedLot, StaticImageData> = {
  WAC: wac,
  PAC: pac,
  "Tennis Courts": tennis_courts,
  Stadium: stadium,
};
export async function getUserListings(): Promise<ListingResponse[]> {
  const res = await fetch("/api/listing/user");
  const json = await res.json();
  const result = json as ListingResponse[];
  if (!result) return [];
  const sorted = result.sort((a, b) => {
    const a_date = parseSplitDate(a.fromdate);
    const b_date = parseSplitDate(b.fromdate);
    if (a_date > b_date) return -1;
    if (a_date < b_date) return 1;
    return 0;
  });
  return sorted;
}

export async function getPurchased(): Promise<ListingRecently[]> {
  const res = await fetch("/api/listing/user/purchased");
  const json = await res.json();
  const result = json as ListingRecently[];
  const sorted = result.sort((a, b) => {
    const a_date = parseSplitDate(a.fromdate);
    const b_date = parseSplitDate(b.fromdate);
    if (a_date > b_date) return -1;
    if (a_date < b_date) return 1;
    return 0;
  });
  return sorted;
}

export function getDays(listings: ListingResponse[]): number {
  const bought = listings.filter((l) => l.sold);
  let total = 0;
  for (const listing of bought) {
    total += listing.days;
  }
  return total;
}
export function getRevenue(listings: ListingResponse[]): number {
  const bought = listings.filter((l) => l.sold);
  let total = 0;
  for (const listing of bought) {
    total += convertToPrice(
      parseSplitDate(listing.fromdate),
      parseSplitDate(listing.todate),
    );
  }
  return total;
}

export const advanced_lots: Record<TAcceptedLot, string> = {
  WAC: "Westlake Athletic Center",
  PAC: "Performing Arts Center",
  "Tennis Courts": "Tennis Courts",
  Stadium: "Football Stadium",
};
