"use client";
import { formatNumber, metrics, mockListings, stats } from "@/lib/utils";
import React from "react";
import { outfit } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight, CornerLeftDown, CornerRightDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { PermDenied } from "@/components/perm_denied";
import { redirect } from "next/navigation";
export default function Dashboard() {
  const { isSignedIn, user } = useUser();
  const metric_start_split = metrics.from_date.split("-");
  const metric_end_split = metrics.to_date.split("-");
  const metric_start = new Date(
    parseInt(metric_start_split[0]),
    parseInt(metric_start_split[1]),
    parseInt(metric_start_split[2]),
  );
  const metric_end = new Date(
    parseInt(metric_end_split[0]),
    parseInt(metric_end_split[1]),
    parseInt(metric_end_split[2]),
  );
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const listingsMap = mockListings.map((listing) => {
    const start_split = listing.start_date.split("-");
    const end_split = listing.end_date.split("-");
    const sold_split = listing.sold_on.split("-");
    const start = new Date(
      parseInt(start_split[0]),
      parseInt(start_split[1]),
      parseInt(start_split[2]),
    );
    const end = new Date(
      parseInt(end_split[0]),
      parseInt(end_split[1]),
      parseInt(end_split[2]),
    );
    const sold = new Date(
      parseInt(sold_split[0]),
      parseInt(sold_split[1]),
      parseInt(sold_split[2]),
    );
    return (
      <div
        className="p-4 flex flex-col border-4 rounded-2xl justify-between items-center w-full mb-4 border-[#B7B7B7]"
        key={listing.spaceid}
      >
        <div className="flex mb-4">
          {format(start, "MMM dd")} - {format(end, "MMM dd")}
        </div>
        <div className="px-2 rounded-md bg-primary mb-4">
          #{formatNumber(listing.spotnumber)}
        </div>
        <h5
          className={`text-center font-bold text-3xl uppercase text-[#939393] ${outfit.className}`}
        >
          {listing.lot.toUpperCase()}
        </h5>
        <p className="text-xs uppercase mb-12"> Parking Lot </p>
        <div className="flex gap-2 items-center mb-4">
          <CornerLeftDown size={15} />
          <p className="tracking-widest text-xs uppercase"> Sold on </p>
          <CornerRightDown size={15} />
        </div>
        <p className="text-center text-3xl"> {format(sold, "PPP")} </p>
      </div>
    );
  });
  if (
    !user?.primaryEmailAddress?.emailAddress?.endsWith("@eanesisd.net") &&
    isSignedIn
  ) {
    return <PermDenied emailAddr={user?.primaryEmailAddress?.emailAddress!} />;
  }
  if (!isSignedIn) redirect("/sign-in");
  return (
    <div className="flex flex-col flex-1 w-screen bg-blur bg-cover bg-no-repeat bg-center [text-shadow:_9px_9px_5px_rgb(0_0_0_/_40%)] bg-dark-background text-white">
      <div className="flex flex-col flex-1 w-screen p-6 items-center md:items-start md:px-40 lg:px-52 xl:px-60">
        <div className="flex gap-4 items-end mb-12">
          <h1 className={`font-bold text-7xl ${outfit.className}`}>
            {" "}
            Dashboard{" "}
          </h1>
          <Link href="/buy">
            <Button
              variant="outline"
              className="mb-2 bg-transparent border-primary-blue"
            >
              All Listings
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
        <h3 className="uppercase tracking-widest mb-2"> Your Stats </h3>
        <div className="rounded-3xl border-4 border-[#B7B7B7] w-full p-10 flex justify-around mb-6">
          <div className="flex flex-row gap-2 items-start">
            <h4 className={`text-6xl font-bold ${outfit.className}`}>
              {stats.spots_sold}
            </h4>
            <div className="uppercase tracking-widest mt-2 text-xs">
              spots
              <br />
              sold
            </div>
          </div>
          <div className="flex flex-row gap-2 items-start">
            <h4 className={`text-6xl font-bold ${outfit.className}`}>
              {stats.spots_bought}
            </h4>
            <div className="uppercase tracking-widest mt-2 text-xs">
              spots
              <br />
              bought
            </div>
          </div>
          <div className="flex flex-row gap-2 items-start">
            <h4 className={`text-6xl font-bold ${outfit.className}`}>
              {formatter.format(stats.total_revenue)}
            </h4>
            <div className="uppercase tracking-widest mt-2 text-xs">
              made
              <br />
              from
              <br />
              selling
            </div>
          </div>
          <div className="flex flex-row gap-2 items-start">
            <h4 className={`text-6xl font-bold ${outfit.className}`}>
              {stats.days_of_parking}
            </h4>
            <div className="uppercase tracking-widest mt-2 text-xs">
              days
              <br />
              <span>of parking</span>
              <br />
              sold
            </div>
          </div>
        </div>
        <h3 className="uppercase text-center tracking-widest mb-2">
          {" "}
          Spots Metrics / Info{" "}
        </h3>
        <div className="rounded-3xl border-4 border-[#B7B7B7] w-full p-10 flex justify-around mb-6">
          <div className="flex flex-col gap-2 items-start">
            <h4
              className={`text-6xl font-bold w-full text-center ${outfit.className}`}
            >
              {metrics.views}
            </h4>
            <div className="uppercase w-full text-center tracking-widest mt-2 text-xs">
              Views
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <h4
              className={`text-6xl font-bold w-full text-center ${outfit.className}`}
            >
              {metrics.parking_lot}
            </h4>
            <div className="uppercase w-full text-center tracking-widest mt-2 text-xs">
              parking lot
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <h4
              className={`text-6xl font-bold w-full text-center ${outfit.className}`}
            >
              #{formatNumber(metrics.spot_number)}
            </h4>
            <div className="uppercase w-full text-center tracking-widest mt-2 text-xs">
              spot number
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <h4
              className={`text-6xl font-bold w-full text-center ${outfit.className}`}
            >
              {format(metric_start, "MMM dd")} - {format(metric_end, "MMM dd")}
            </h4>
            <div className="uppercase w-full text-center tracking-widest mt-2 text-xs">
              Date range
            </div>
          </div>
        </div>
        <h3 className="uppercase text-center tracking-widest mb-2">
          {" "}
          Recently purchased spots{" "}
        </h3>
        <div className="rounded-3xl border-4 border-[#B7B7B7] w-full p-10 flex justify-around gap-12">
          {listingsMap}
        </div>
      </div>
    </div>
  );
}
