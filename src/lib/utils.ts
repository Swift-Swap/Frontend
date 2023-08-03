import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Outfit } from "next/font/google";
import { addDays, differenceInDays } from "date-fns";
import tennis_courts from "../../public/tennis_court.png";
import wac from "../../public/wac.png";
import pac from "../../public/pac.png";
import stadium from "../../public/stadium.png";
import { StaticImageData } from "next/image";
export const outfit = Outfit({ display: "swap", subsets: ["latin"] });

export async function getListings(): Promise<ListingResponse[]> {
  const res = await fetch("/api/listing", { method: "GET" });
  const json = (await res.json()) as ListingResponse[];
  return json;
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
];
export function convertToPrice(from: Date, to: Date): number {
  const days = differenceInDays(to, addDays(from, -1));
  if (days <= 0) return 0;
  if (days === 5) return 20;
  const res = 3.625 * days + 1.375;
  return res;
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
