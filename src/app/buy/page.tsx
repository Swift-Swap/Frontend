"use client";
import { DatePicker } from "@/components/ui/daterangepicker";
import { addDays } from "date-fns";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  acceptedLots,
  ListingResponse,
  formatNumber,
  getListings,
  outfit,
  parseSplitDate,
  spotPics,
  roboto,
  convertToPrice,
  advanced_lots,
} from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { format } from "date-fns";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ArrowRight,
  DollarSign,
  Eye,
  Info,
  Share,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { redirect, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";

export default function Home() {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(undefined);
  const [listings, setListings] = React.useState<ListingResponse[] | null>([]);
  const [toDate, setToDate] = React.useState<Date | undefined>(undefined);
  const [currLots, setCurrLots] = React.useState<string[]>([]);
  const [all, setAll] = React.useState<boolean>(true);
  const [info, setInfo] = React.useState(useSearchParams().get("info"));
  const [moreInfo, setMoreInfo] = React.useState<ListingResponse | null>(null);
  const { isLoaded, user } = useUser();
  const [loaded, setLoaded] = React.useState<boolean>(false);
  function onFromDateChange(date: Date) {
    setFromDate(date);
    setAll(false);
    if (typeof localStorage === "undefined") return;
    localStorage.setItem("fromDate", date.toDateString());
  }
  function onToDateChange(date: Date) {
    setToDate(date);
    setAll(false);
    if (typeof localStorage === "undefined") return;
    localStorage.setItem("toDate", date.toDateString());
  }
  React.useEffect(() => {
    if (typeof localStorage === "undefined") return;
    const toDate = localStorage.getItem("toDate");
    const fromDate = localStorage.getItem("fromDate");
    toDate ? setToDate(new Date(toDate)) : setToDate(addDays(new Date(), 1));
    fromDate ? setFromDate(new Date(fromDate)) : setFromDate(new Date());
    async function main() {
      if (loaded) return;
      const res = await getListings();
      setListings(res);
      setLoaded(true);
    }
    if (listings) {
      if (!moreInfo && info) {
        const listing = listings.find((l) => l.listing_id === info);
        if (listing) {
          if (!user) return;
          if (listing.user_id === user?.id) {
            redirect("/dashboard#edit");
          }
          setMoreInfo(listing);
        }
      }
    }
    main();
  }, [listings, info, loaded, moreInfo, user]);

  if (
    user &&
    user.primaryEmailAddress &&
    user.primaryEmailAddress.emailAddress.split("@")[1] !== "eanesisd.net"
  ) {
    redirect("/perm-denied");
  }
  if (!listings) return null;
  if (!isLoaded) return null;

  const lotsMapped = acceptedLots.map((lot) => {
    return (
      <Button
        variant={`${
          currLots.includes(lot.toLowerCase()) && !all ? "default" : "secondary"
        }`}
        key={lot}
        onClick={() => {
          if (currLots.includes(lot.toLowerCase())) {
            setCurrLots(currLots.filter((l) => l !== lot.toLowerCase()));
            return;
          }
          setCurrLots([...currLots, lot.toLowerCase()]);
          setAll(false);
        }}
      >
        {lot}
      </Button>
    );
  });
  const listingsMap = listings
    .filter((l) => {
      if (l.bought) return false;
      if (user && l.user_id === user.id) return false;
      if (all) return true;
      return (
        currLots.includes(l.lot.toLowerCase()) &&
        format(fromDate!, "yyyy-MM-dd") === l.fromdate &&
        format(toDate!, "yyyy-MM-dd") === l.todate &&
        (user ? l.user_id != user.id : true)
      );
    })
    .map((listing) => {
      const start_date = parseSplitDate(listing.fromdate);
      const end_date = parseSplitDate(listing.todate);
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      return (
        <Card
          className={`h-fit w-fit flex flex-col gap-14 items-center text-center p-4 justify-between border-xl`}
          key={listing.listing_id}
        >
          <CardHeader className="flex flex-1 flex-col items-center justify-between w-fit gap-4">
            <CardTitle className="text-md md:text-xl">
              {" "}
              {format(start_date, "LLL dd")} - {format(end_date, "LLL dd")}{" "}
            </CardTitle>
            <CardDescription className="text-sm md:text-md rounded-lg bg-primary px-2">
              {" "}
              <p className="text-white">#{formatNumber(listing.spot_number)} </p>
            </CardDescription>
            <CardDescription
              className={`font-bold text-xl md:text-2xl ${outfit.className}`}
            >
              {" "}
              {listing.lot}{" "}
              <div
                className={`text-sm md:text-md flex items-center mt-2 gap-2 ${roboto.className} justify-center`}
              >
                <Eye />
                {listing.views}
                <p className="uppercase tracking-widest">
                  {listing.views === 1 ? "view" : "views"}
                </p>
              </div>
              <div
                className={`text-md md:text-lg flex items-center mt-2 gap-2 ${roboto.className} justify-center`}
              >
                {formatter.format(convertToPrice(start_date, end_date))}
              </div>
            </CardDescription>
            <Button
              className={`w-full text-xs flex items-center gap-2 uppercase tracking-widest ${outfit.className}`}
              onClick={async () => {
                setMoreInfo(listing);
                setInfo(listing.listing_id);
                let seenItems = localStorage.getItem("seenListings");
                if (!seenItems) seenItems = JSON.stringify([]);
                const seenItemsParsed = JSON.parse(seenItems) as string[];
                if (seenItemsParsed.includes(listing.listing_id)) return;
                await fetch(`/api/listing/view?listing_id=${listing.listing_id}`, {
                  method: "POST",
                });
                localStorage.setItem(
                  "seenListings",
                  JSON.stringify([...seenItemsParsed, listing.listing_id]),
                );
                setListings(await getListings());
              }}
            >
              <Info />
              View Details
            </Button>
          </CardHeader>
        </Card>
      );
    });
  return (
    <div className="w-full flex flex-col md:flex-row p-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-min flex items-center gap-2">
            <SlidersHorizontal />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex">
          <Opts
            setListings={setListings}
            setCurrFrom={setFromDate}
            setCurrTo={setToDate}
            currFrom={fromDate}
            currTo={toDate}
            all={all}
            setAll={setAll}
            lotsMapped={lotsMapped}
            onFromDateChange={onFromDateChange}
            onToDateChange={onToDateChange}
          />
        </SheetContent>
      </Sheet>
      <div className={`grid w-full flex-1 place-items-center`}>
        <div
          className={`w-full place-items-center grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 p-12`}
        >
          {listingsMap}
          {listingsMap.length === 0 && (
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-3xl">
                {" "}
                {loaded ? "There are no spots" : "Loading..."}{" "}
              </h1>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={moreInfo !== null}
        onOpenChange={() => {
          setMoreInfo(null);
          setInfo(null);
        }}
      >
        <DialogContent className="py-14 flex flex-col">
          <div className="flex-1 w-full">
            <div className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:cursor-pointer">
              <Button
                variant="outline"
                className="w-min h-min px-1 py-1"
                onClick={() => {
                  const text =
                    window.location.href.split("?")[0] +
                    `?info=${moreInfo?.listing_id}`;
                  if (!navigator.clipboard) {
                    // hacky mobile stuff
                    if (document.execCommand) {
                      let e = document.createElement("DIV");
                      e.style.cssText = "position:fixed;top:-999px";
                      e.textContent = text;
                      document.body.append(e);
                      getSelection()!.setBaseAndExtent(
                        e.firstChild!,
                        0,
                        e.firstChild!,
                        e.textContent.length,
                      );
                      if (!document.execCommand("copy")) {
                        alert("your browser doesn't support copying");
                      }
                      e.remove();
                    } else alert("your browser doesn't support copying");
                  } else navigator.clipboard.writeText(text);
                  toast({
                    title: "Copied to clipboard!",
                    description: `Share this link with your friends!: ${text}`,
                  });
                }}
              >
                <Share className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className={`${outfit.className} text-3xl`}>
              {moreInfo
                ? format(parseSplitDate(moreInfo.fromdate), "PPP").split(
                    ",",
                  )[0]
                : ""}{" "}
              -{" "}
              {moreInfo
                ? format(parseSplitDate(moreInfo.todate), "PPP").split(",")[0]
                : ""}
            </DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest">
              At the{" "}
              <span className="font-semibold text-foreground">
                {advanced_lots[moreInfo?.lot || "WAC"]}
              </span>
            </DialogDescription>
          </DialogHeader>
          {moreInfo && (
            <Image
              className="w-full h-72 object-cover rounded-xl"
              src={spotPics[moreInfo.lot]}
              alt="Spot Image"
            />
          )}
          <DialogFooter className="flex justify-between items-center gap-4">
            {moreInfo && (
              <>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(
                  convertToPrice(
                    parseSplitDate(moreInfo!.fromdate),
                    parseSplitDate(moreInfo!.todate),
                  ),
                )}
              </>
            )}
            <DialogPrimitive.Close>
              <Button
                className="flex items-center gap-2"
                onClick={async () => {
                  toast({
                    title: "Buying...",
                  });
                  const res = await fetch(
                    `/api/listing/buy?listing_id=${moreInfo?.listing_id}`,
                    { method: "POST" },
                  );
                  if (res.status === 400) {
                    toast({
                      title: "This will overlap with another spot",
                      description: "Try another spot or time range",
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: `Bought!! ${res.status}`,
                  });
                  setListings(await getListings());
                }}
              >
                Buy
                <ArrowRight size={20} />
              </Button>
            </DialogPrimitive.Close>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface OptsProps {
  setCurrFrom: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setCurrTo: React.Dispatch<React.SetStateAction<Date | undefined>>;
  currFrom: Date | undefined;
  currTo: Date | undefined;
  all: boolean;
  setAll: React.Dispatch<React.SetStateAction<boolean>>;
  lotsMapped: JSX.Element[];
  setListings: React.Dispatch<React.SetStateAction<ListingResponse[] | null>>;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
}

function Opts(props: OptsProps) {
  return (
    <div className={`py-4 w-full h-screen`}>
      <div className="w-3/4">
        {/* Sidebar content */}
        <h2 className="mb-4"> Parking Lot </h2>
        <div className="grid grid-cols-1 gap-4 mb-12">{props.lotsMapped}</div>
        <div className="flex flex-col gap-4 mb-4">
          <h2> Time Range </h2>
          <h4 className="text-sm"> From </h4>
          <DatePicker
            setDate={props.setCurrFrom}
            date={props.currFrom}
            fn={props.onFromDateChange}
          />
          <h4 className="text-sm"> To </h4>
          <DatePicker
            setDate={props.setCurrTo}
            date={props.currTo}
            fn={props.onToDateChange}
          />
        </div>
        <div className="flex flex-col gap-4 mb-4 mt-12">
          <Button
            variant={`${props.all ? "default" : "secondary"}`}
            onClick={() => {
              props.setAll(!props.all);
            }}
          >
            {" "}
            No Filters{" "}
          </Button>
        </div>
      </div>
    </div>
  );
}
