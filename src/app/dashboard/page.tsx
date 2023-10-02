"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  CreateListing,
  EditListing,
  ListingResponse,
  TAcceptedLot,
  convertToPrice,
  formatNumber,
  acceptedLots,
  parseSplitDate,
  ListingRecently,
  getUserListings,
  getPurchased,
  getDays,
  getRevenue,
} from "@/lib/utils";
import React from "react";
import { outfit } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { DatePicker } from "@/components/ui/daterangepicker";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import {
  ArrowRight,
  CornerLeftDown,
  CornerRightDown,
  Pin,
  PinOff,
  Plus,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";

export default function Dashboard() {
  const { isLoaded, user } = useUser();
  const [listings, setListings] = React.useState<ListingResponse[] | null>([]);
  const [listingsLoaded, setListingsLoaded] = React.useState<boolean>(false);
  const [recentlyBought, setRecentlyBought] = React.useState<
    ListingRecently[] | null
  >([]);
  const [recentlyBoughtLoaded, setRecentlyBoughtLoaded] =
    React.useState<boolean>(false);
  const [pinned, setPinned] = React.useState<ListingResponse | null>(null);
  React.useEffect(() => {
    async function main() {
      const res = await getUserListings();
      setListings(res);
      setPinned(res[0]);
      setListingsLoaded(true);
      setRecentlyBought(await getPurchased());
      setRecentlyBoughtLoaded(true);
    }
    main();
  }, []);
  React.useEffect(() => {
    async function main() {
      setRecentlyBought(await getPurchased());
    }
    main();
  }, [listings, pinned]);
  if (!listings || !isLoaded) return null;
  if (
    user &&
    user.primaryEmailAddress &&
    user.primaryEmailAddress.emailAddress.split("@")[1] !== "eanesisd.net"
  ) {
    redirect("/perm-denied");
  }
  const listingsMapped = listings.map((l) => {
    const start = parseSplitDate(l.fromdate);
    const end = parseSplitDate(l.todate);
    if (!l.sold) {
      return (
        <ListingItem
          setRecentlyBought={setRecentlyBought}
          l={l}
          key={l.listing_id}
          end={end}
          start={start}
          pinned={pinned}
          setPinned={setPinned}
          setListings={setListings}
        />
      );
    }
  });
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const recentlyPurchase = recentlyBought?.splice(0, 5).map((listing) => {
    const start = parseSplitDate(listing.fromdate);
    const end = parseSplitDate(listing.todate);
    const sold = parseSplitDate(listing.date_bought)
    return (
      <div
        className="p-4 flex flex-col border-4 rounded-2xl justify-between items-center w-full mb-4 border-[#B7B7B7]"
        key={listing.listing_id}
      >
        <div className="flex mb-4">
          {format(start, "MMM dd")} - {format(end, "MMM dd")}
        </div>
        <div className="px-2 rounded-md bg-primary mb-4">
          #{formatNumber(listing.spot_number)}
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
              className="mb-2 bg-transparent border-primary-blue flex items-center gap-2"
            >
              All Listings
              <ArrowRight size={20} />
            </Button>
          </Link>
          <VerifyListing />
        </div>
        <h3 className="uppercase tracking-widest mb-2"> Your Stats </h3>
        <div className="rounded-3xl border-4 border-[#B7B7B7] w-full p-10 flex justify-around mb-6">
          <div className="flex flex-row gap-2 items-start">
            <h4 className={`text-6xl font-bold ${outfit.className}`}>
              {listings.filter((l) => l.sold).length}
            </h4>
            <div className="uppercase tracking-widest mt-2 text-xs">
              {listings.filter((l) => l.sold).length === 1 ? "spot" : "spots"}
              <br />
              sold
            </div>
          </div>
          <div className="flex flex-row gap-2 items-start">
            <h4 className={`text-6xl font-bold ${outfit.className}`}>
              {recentlyPurchase!.length}
            </h4>
            <div className="uppercase tracking-widest mt-2 text-xs">
              {recentlyPurchase!.length === 1 ? "spot" : "spots"}
              <br />
              bought
            </div>
          </div>
          <div className="flex flex-row gap-2 items-start">
            <h4 className={`text-6xl font-bold ${outfit.className}`}>
              {formatter.format(getRevenue(listings))}
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
              {getDays(listings)}
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
        <div className="flex gap-4 items-center mb-4">
          <h3 className="uppercase text-center tracking-widest flex items-center">
            {" "}
            Pinned Spot Metrics / Info{" "}
          </h3>
          <Link href="#edit">
            <Button
              variant="outline"
              className="bg-transparent border-primary-blue flex items-center gap-2"
            >
              Your Spots
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
        <div className="rounded-3xl border-4 border-[#B7B7B7] w-full p-10 flex justify-around mb-6">
          {!pinned && listingsLoaded && (
            <h1 className={`text-7xl ${outfit.className}`}>
              {" "}
              {listings.length === 0 ? "No Listings" : "No Pinned Listing"}{" "}
            </h1>
          )}
          {listings.length > 0 && pinned && (
            <>
              <div className="flex flex-col gap-2 items-start">
                <h4
                  className={`text-6xl font-bold w-full text-center ${outfit.className}`}
                >
                  {pinned?.views}
                </h4>
                <div className="uppercase w-full text-center tracking-widest mt-2 text-xs">
                  {pinned?.views === 1 ? "View" : "Views"}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <h4
                  className={`text-6xl font-bold w-full text-center ${outfit.className}`}
                >
                  {pinned?.lot}
                </h4>
                <div className="uppercase w-full text-center tracking-widest mt-2 text-xs">
                  parking lot
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <h4
                  className={`text-6xl font-bold w-full text-center ${outfit.className}`}
                >
                  {pinned && `#${formatNumber(pinned.spot_number)}`}
                </h4>
                <div className="uppercase w-full text-center tracking-widest mt-2 text-xs">
                  spot number
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <h4
                  className={`text-6xl font-bold w-full text-center ${outfit.className}`}
                >
                  {pinned &&
                    `${format(
                      parseSplitDate(pinned?.fromdate),
                      "MMM dd",
                    )} - ${format(parseSplitDate(pinned?.todate), "MMM dd")}`}
                </h4>
                <div className="uppercase w-full text-center tracking-widest mt-2 text-xs">
                  Date range
                </div>
              </div>
            </>
          )}
        </div>
        <h3 className="uppercase text-center tracking-widest mb-2 flex items-center gap-2">
          {" "}
          Recently purchased spots <PurchaseHistory />
        </h3>
        <div
          className={`rounded-3xl border-4 border-[#B7B7B7] w-full p-10 grid xl:grid-cols-3 grid-cols-2 justify-around gap-12 mb-6`}
        >
          {recentlyPurchase?.length === 0 && (
            <h1 className={`text-7xl w-full text-center ${outfit.className}`}>
              {" "}
              {recentlyBoughtLoaded
                ? "No Purchased Listings"
                : "Loading..."}{" "}
            </h1>
          )}
          {recentlyPurchase}
        </div>
        <h3 className="uppercase text-center tracking-widest mb-2 flex items-center">
          {" "}
          Your Spots <AddSheet setListings={setListings} listings={listings} />
        </h3>
        <div
          className="rounded-3xl border-4 border-[#B7B7B7] w-full p-10 grid grid-cols-2 3xl:grid-cols-4 xl:grid-cols-3 gap-12 gap-x-40 relative"
          id="edit"
        >
          {listingsMapped}
        </div>
      </div>
    </div>
  );
}

interface EditSheetProps {
  fromDate: Date;
  toDate: Date;
  lot: number;
  lotName: TAcceptedLot;
  listing_id: string;
  setListings: React.Dispatch<React.SetStateAction<ListingResponse[] | null>>;
}

function EditSheet(props: EditSheetProps) {
  const [from, setFrom] = React.useState<Date | undefined>(props.fromDate);
  const [to, setTo] = React.useState<Date | undefined>(props.toDate);
  const [total, setTotal] = React.useState<number>(props.lot);
  React.useEffect(() => {
    setTotal(Math.round(convertToPrice(from!, to!)));
  }, [from, to]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="!mb-4">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit your spot</DialogTitle>
          <DialogDescription>Make changes to your spot</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lot" className="text-right">
              Space
            </Label>
            <Input
              readOnly
              id="lot"
              value={props.lot}
              className="col-span-3"
              type="number"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="from" className="text-right">
              From
            </Label>
            <div className="col-span-3">
              <DatePicker
                setDate={setFrom}
                date={from}
                fn={(d) => {
                  if (d > to!) {
                    setTo(d);
                  }
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">
              To
            </Label>
            <div className="col-span-3">
              <DatePicker setDate={setTo} date={to} fn={(_d) => {}} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lotName" className="text-right">
              Location
            </Label>
            <div className="col-span-3">
              <Input
                readOnly
                id="lotName"
                value={props.lotName}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="total" className="text-right">
              Total
            </Label>
            <div className="col-span-3">
              <Input
                readOnly
                id="total"
                value={`$${String(total)}`}
                className="col-span-3"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogPrimitive.Close>
            <Button
              type="button"
              onClick={async () => {
                toast({
                  title: "Editing space...",
                });
                if (to! < from!) {
                  toast({
                    title: "Invalid date range",
                    description: "The end date must be after the start date",
                    variant: "destructive",
                  });
                  return;
                }
                if (new Date() >= from!) {
                  toast({
                    title: "Invalid date range",
                    description: "The start date must be in the future",
                    variant: "destructive",
                  });
                  return;
                }
                const new_from = format(from!, "yyyy-MM-dd");
                const new_to = format(to!, "yyyy-MM-dd");
                const body: EditListing = {
                  fromdate: new_from,
                  todate: new_to,
                };
                const res = await fetch(
                  `/api/listing?listing_id=${props.listing_id}`,
                  {
                    method: "PUT",
                    body: JSON.stringify(body),
                  },
                );
                const json = await res.json();
                if (res.status === 200) {
                  toast({
                    title: "Space edited",
                  });
                } else if (res.status === 401) {
                  redirect("/sign-in");
                } else if (res.status === 400) {
                  if (json.includes("weekend")) {
                    toast({
                      title: "Invalid date range",
                      description:
                        "You cannot add a spot that includes a weekend",
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "Invalid date range",
                    description:
                      "Your spot time range overlaps with an existing spot",
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: `${
                      res.status === 500
                        ? "Internal server error"
                        : "Unknown error"
                    }`,
                    description: `please contact support (support@swiftswap.net)`,
                    variant: "destructive",
                  });
                }
                props.setListings(await getUserListings());
                return;
              }}
            >
              Edit
            </Button>
          </DialogPrimitive.Close>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteSheetProps {
  setListings: React.Dispatch<React.SetStateAction<ListingResponse[] | null>>;
  listing_id: string;
}

function Delete(props: DeleteSheetProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className={`absolute top-0 right-0 hover:bg-transparent hover:text-red-500`}
        >
          <Trash size={20} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            listing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              toast({
                title: "Deleting space...",
              });
              const res = await fetch(
                `/api/listing?listing_id=${props.listing_id}`,
                {
                  method: "DELETE",
                },
              )
              const status = res.status;
              if (status === 200) {
                console.log(status === 200)
                toast({
                  title: "Space deleted",
                });
              } else if (status === 401) {
                redirect("/sign-in");
              } else {
                toast({
                  title: `${
                    status === 500
                      ? "Internal server error"
                      : "Unknown error"
                  }`,
                  description: `please contact support (support@swiftswap.net)`,
                  variant: "destructive",
                });
              }
              props.setListings(await getUserListings());
              return;
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface AddSheetProps {
  setListings: React.Dispatch<React.SetStateAction<ListingResponse[] | null>>;
  listings: ListingResponse[] | null;
}

function AddSheet(props: AddSheetProps) {
  const [lot, setLot] = React.useState<number>(40);
  const currDate = new Date();
  const currMonth = currDate.getMonth();
  const currDay = currDate.getDate();
  const currYear = currDate.getFullYear();
  const date = new Date(currYear, currMonth, currDay);
  const [from, setFrom] = React.useState<Date | undefined>(addDays(date, 1));
  const [to, setTo] = React.useState<Date | undefined>(addDays(date, 2));
  const [lotName, setLotName] = React.useState<TAcceptedLot>(
    "" as TAcceptedLot,
  );
  const [total, setTotal] = React.useState<number>(0);
  React.useEffect(() => {
    setTotal(Math.round(convertToPrice(from!, to!)));
  }, [from, to]);
  const acceptedLotsMapped = acceptedLots.map((lot) => {
    return (
      <SelectItem key={lot} value={lot}>
        {lot}
      </SelectItem>
    );
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="p-2">
          <Button variant="ghost" className={`mb-1`}>
            <Plus size={20} />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a space</DialogTitle>
          <DialogDescription>
            Add a new parking space for sale
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lot" className="text-right">
              Space
            </Label>
            <Input
              id="lot"
              value={lot}
              className="col-span-3"
              type="number"
              onChange={(l) => {
                setLot(parseInt(l.target.value));
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="from" className="text-right">
              From
            </Label>
            <div className="col-span-3">
              <DatePicker
                setDate={setFrom}
                date={from}
                fn={(d) => {
                  if (d > to!) {
                    setTo(d);
                  }
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">
              To
            </Label>
            <div className="col-span-3">
              <DatePicker setDate={setTo} date={to} fn={(_d) => {}} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lotName" className="text-right">
              Location
            </Label>
            <div className="col-span-3">
              <Select
                onValueChange={(val) => {
                  setLotName(val as TAcceptedLot);
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a lot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Lots</SelectLabel>
                    {acceptedLotsMapped}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="total" className="text-right">
              Total
            </Label>
            <div className="col-span-3">
              <Input
                readOnly
                id="total"
                value={`$${String(total)}`}
                className="col-span-3"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogPrimitive.Close>
            <Button
              type="button"
              onClick={async () => {
                if (lotName === ("" as TAcceptedLot)) {
                  toast({
                    title: "Invalid lot",
                    description: "You must select a lot",
                    variant: "destructive",
                  });
                  return;
                }
                if (isNaN(lot)) {
                  toast({
                    title: "Invalid lot",
                    description: "The lot number must be a number",
                    variant: "destructive",
                  });
                }
                if (to! < from!) {
                  toast({
                    title: "Invalid date range",
                    description: "The end date must be after the start date",
                    variant: "destructive",
                  });
                  return;
                }
                if (new Date() >= from!) {
                  toast({
                    title: "Invalid date range",
                    description: "The start date must be in the future",
                    variant: "destructive",
                  });
                  return;
                }
                if (lot < 1) {
                  toast({
                    title: "Invalid lot",
                    description: "The lot number must be greater than 0",
                    variant: "destructive",
                  });
                  return;
                }
                toast({
                  title: "Adding space...",
                });
                const new_from = format(from!, "yyyy-MM-dd");
                const new_to = format(to!, "yyyy-MM-dd");
                const body: CreateListing = {
                  spot_number: lot,
                  lot: lotName,
                  fromdate: new_from,
                  todate: new_to,
                };
                const res = await fetch("/api/listing", {
                  method: "POST",
                  body: JSON.stringify(body),
                });
                const json = await res.json();
                if (res.status === 201) {
                  toast({
                    title: "Space added",
                  });
                } else if (res.status === 401) {
                  redirect("/sign-in");
                } else if (res.status === 409) {
                  toast({
                    title: "You already have a space",
                    description: "You can only have one space at a time",
                    variant: "destructive",
                  });
                } else if (res.status === 400) {
                  if (json.includes("weekend")) {
                    toast({
                      title: "Invalid date range",
                      description:
                        "You cannot add a spot that includes a weekend",
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "Invalid date range",
                    description:
                      "Your spot time range overlaps with an existing spot",
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: `${
                      res.status === 500
                        ? "Internal server error"
                        : "Unknown error"
                    }`,
                    description: `${json.message}, please contact support (support@swiftswap.net)`,
                    variant: "destructive",
                  });
                }
                props.setListings(await getUserListings());
                return;
              }}
            >
              Add
            </Button>
          </DialogPrimitive.Close>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VerifyListing() {
  const [lot, setLot] = React.useState(1);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-primary mb-2 flex items-center gap-2"
        >
          Verify Spot
          <ArrowRight size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={`text-2xl`}>Verify Your Spot</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lot" className="text-right">
              Space
            </Label>
            <Input
              id="lot"
              value={lot}
              onChange={(l) => {
                setLot(parseInt(l.target.value));
              }}
              className="col-span-3"
              type="number"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (lot < 1) {
                toast({
                  title: "Invalid lot",
                  description: "The lot number must be greater than 0",
                  variant: "destructive",
                });
                return;
              }
              if (isNaN(lot)) {
                toast({
                  title: "Invalid lot",
                  description: "The lot number must be a number",
                  variant: "destructive",
                });
                return;
              }
              toast({
                title: "Verified!",
                description: "Your spot has been verified",
              });
            }}
          >
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ListingProps {
  l: ListingResponse;
  start: Date;
  end: Date;
  setRecentlyBought: React.Dispatch<
    React.SetStateAction<ListingRecently[] | null>
  >;
  setListings: React.Dispatch<React.SetStateAction<ListingResponse[] | null>>;
  pinned: ListingResponse | null;
  setPinned: React.Dispatch<React.SetStateAction<ListingResponse | null>>;
}

function ListingItem(props: ListingProps) {
  const { l, start, end, pinned, setPinned, setListings } = props;
  return (
    <Card
      className="flex flex-col items-center text-center relative py-2 px-8 bg-transparent text-white w-full h-full"
      key={l.spot_number}
    >
      <CardHeader className="flex-1 flex flex-col justify-between">
        <CardTitle className="text-md md:text-xl">
          {" "}
          {format(start, "LLL dd")} - {format(end, "LLL dd")}{" "}
        </CardTitle>
        <CardDescription className="text-sm md:text-md flex justify-center">
          {" "}
          <div className="px-2 rounded-md w-min bg-primary mb-4 text-white">
            #{formatNumber(l.spot_number)}
          </div>
        </CardDescription>
        <CardDescription
          className={`text-xl lg:text-2xl font-bold ${outfit.className} text-center`}
        >
          {" "}
          {l.lot}{" "}
        </CardDescription>
        <EditSheet
          lot={l.spot_number}
          lotName={l.lot}
          toDate={end}
          fromDate={start}
          listing_id={l.listing_id}
          setListings={setListings}
        />
        <Delete listing_id={l.listing_id} setListings={setListings} />
        <Button
          variant="ghost"
          className="top-0 left-0 absolute w-min hover:bg-transparent hover:text-primary"
          onClick={async () => {
            if (pinned?.listing_id === l.listing_id) {
              setPinned(null);
              return;
            }
            setPinned(l);
          }}
        >
          {pinned?.listing_id === l.listing_id && <PinOff />}
          {pinned?.listing_id !== l.listing_id && <Pin />}
        </Button>
      </CardHeader>
    </Card>
  );
}

function PurchaseHistory() {
  const [recent, setRecent] = React.useState<ListingRecently[]>([]);
  React.useEffect(() => {
    async function main() {
      setRecent(await getPurchased());
    }
    main();
  }, []);
  if (!recent) return null;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          View All
          <ArrowRight size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader> Purchase History </DialogHeader>
        <Table>
          <TableCaption>Your entire purchase history</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Price</TableHead>
              <TableHead>Spot</TableHead>
              <TableHead className="text-center">Parking Lot</TableHead>
              <TableHead className="text-right">Date Purchased</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((l) => (
              <TableRow key={l.listing_id}>
                <TableCell className="font-medium">
                  $
                  {convertToPrice(
                    parseSplitDate(l.fromdate),
                    parseSplitDate(l.todate),
                  )}
                </TableCell>
                <TableCell>#{formatNumber(l.spot_number)}</TableCell>
                <TableCell className="text-center">{l.lot}</TableCell>
                <TableCell className="text-right">
                  {format(parseSplitDate(l.date_bought), "MM/dd/yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
