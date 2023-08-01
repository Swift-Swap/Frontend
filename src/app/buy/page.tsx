"use client";
import { DatePicker } from "@/components/ui/daterangepicker";
import { addDays, differenceInDays, parse } from "date-fns";
import React from "react";
import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
    TAcceptedLot,
    acceptedLots,
    CreateListing,
    ListingResponse,
    EditListing,
    formatNumber,
} from "@/lib/utils";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { format } from "date-fns";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronsRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { PermDenied } from "@/components/perm_denied";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
    DialogTitle,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { redirect } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

async function getListings(): Promise<ListingResponse[]> {
    const res = await fetch("/api/listing", { method: "GET" });
    const json = (await res.json()) as ListingResponse[];
    return json;
}

function convertToPrice(from: Date, to: Date): number {
    const days = differenceInDays(to, addDays(from, -1));
    if (days <= 0) return 0;
    if (days === 5) return 20;
    const res = 3.625 * days + 1.375;
    return res;
}

export default function Home() {
    const [fromDate, setFromDate] = React.useState<Date | undefined>(undefined);
    const [listings, setListings] = React.useState<ListingResponse[] | null>([]);
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
    const [toDate, setToDate] = React.useState<Date | undefined>(undefined);
    const [currLots, setCurrLots] = React.useState<string[]>([]);
    const [all, setAll] = React.useState<boolean>(true);
    const [isOnSpot, setIsOnSpot] = React.useState<boolean>(false);
    const { isLoaded, isSignedIn, user } = useUser();
    React.useEffect(() => {
        if (typeof localStorage === "undefined") return;
        const toDate = localStorage.getItem("toDate");
        const fromDate = localStorage.getItem("fromDate");
        toDate ? setToDate(new Date(toDate)) : setToDate(addDays(new Date(), 1));
        fromDate ? setFromDate(new Date(fromDate)) : setFromDate(new Date());
        async function main() {
            const res = await getListings();
            setListings(res);
        }
        main();
    }, []);
    if (!listings) return null;
    if (!isLoaded) return null;
    if (
        !user?.primaryEmailAddress?.emailAddress?.endsWith("@eanesisd.net") &&
        isSignedIn
    ) {
        return <PermDenied emailAddr={user?.primaryEmailAddress?.emailAddress!} />;
    }
    const lotsMapped = acceptedLots.map((lot) => {
        return (
            <Button
                variant={`${currLots.includes(lot.toLowerCase()) && !all && !isOnSpot ? "default" : "secondary"
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
            if (isOnSpot) {
                if (user) {
                    return l.user_id === user.id;
                }
            }
            if (user && l.user_id === user.id) return false;
            if (all) return true;
            return (
                currLots.includes(l.lot.toLowerCase()) &&
                format(fromDate!, "yyyy-MM-dd") === l.start_date &&
                format(toDate!, "yyyy-MM-dd") === l.end_date &&
                (user ? l.user_id != user.id : true)
            );
        })
        .map((listing) => {
            const start_date_split = listing.start_date.split("-");
            const end_date_split = listing.end_date.split("-");
            const start_date = new Date(
                parseInt(start_date_split[0]),
                parseInt(start_date_split[1]) - 1,
                parseInt(start_date_split[2])
            );
            const end_date = new Date(
                parseInt(end_date_split[0]),
                parseInt(end_date_split[1]) - 1,
                parseInt(end_date_split[2])
            );
            return (
                <Card
                    className={`${isOnSpot ? "justify-center h-[300px] w-[300px]" : "h-fit w-fit"} flex flex-col items-center text-center`}
                    key={listing.spaceid}
                >
                    <CardHeader>
                        <CardTitle className="text-md md:text-xl">
                            {" "}
                            {format(start_date, "LLL dd")} -{" "}
                            {format(end_date, "LLL dd")}{" "}
                        </CardTitle>
                        <CardDescription className="text-sm md:text-md">
                            {" "}
                            #{formatNumber(listing.spotnumber)}{" "}
                        </CardDescription>
                        <CardDescription className="text-sm md:text-md">
                            {" "}
                            {listing.lot}{" "}
                        </CardDescription>
                        {isOnSpot && <EditSheet setListings={setListings} lot={listing.spotnumber} fromDate={start_date} toDate={end_date} lotName={listing.lot} listing_id={listing.spaceid} />}
                        {isOnSpot && <Delete listing_id={listing.spaceid} setListings={setListings} />}
                        {!isOnSpot && <Button className="text-sm"> Buy </Button>}
                    </CardHeader>
                </Card>
            );
        });
    return (
        <div className="w-full flex flex-col md:flex-row p-2">
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline">
                            <ChevronsRight />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex">
                        <MobileOpts
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
                            isOnSpot={isOnSpot}
                            setIsOnSpot={setIsOnSpot}
                        />
                    </SheetContent>
                </Sheet>
            </div>
            <div
                className={`px-12 py-20 xl:w-1/4 lg:w-1/3 md:w-1/2 md:flex hidden border-r-2 border-r-foreground-50 h-screen sticky top-0`}
            >
                <div className="lg:w-3/4 w-full">
                    {/* Sidebar content */}
                    <div className="flex flex-col gap-4 mb-24">
                        <h2> Parking Lot </h2>
                        {lotsMapped}
                    </div>
                    <div className="flex flex-col gap-4 mb-4">
                        <h2> Time Range </h2>
                        <h4 className="text-sm"> From </h4>
                        <DatePicker
                            setDate={setFromDate}
                            date={fromDate}
                            fn={onFromDateChange}
                        />
                        <h4 className="text-sm"> To </h4>
                        <DatePicker setDate={setToDate} date={toDate} fn={onToDateChange} />
                    </div>
                    <div className="flex flex-col gap-4 mb-4">
                        <Button
                            variant={`${isOnSpot ? "default" : "secondary"}`}
                            className="mt-5"
                            onClick={() => {
                                setIsOnSpot(!isOnSpot);
                            }}
                        >
                            {" "}
                            Your Spots{" "}
                        </Button>
                        <Button
                            variant={`${all ? "default" : "secondary"}`}
                            onClick={() => {
                                setAll(!all);
                            }}
                        >
                            {" "}
                            All{" "}
                        </Button>
                        <AddSheet setListings={setListings} />
                    </div>
                </div>
            </div>
            <div className={`grid w-full h-fit place-items-center`}>
                <div className={`grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-8 p-12 ${isOnSpot ? "!grid-cols-1" : ""}`}>
                    {listingsMap}
                    {listingsMap.length === 0 && (
                        !isOnSpot ? (
                            <div className="flex flex-col items-center justify-center">
                                <h1 className="text-3xl"> No Listings Found </h1>
                                <h2 className="text-xl"> Try changing your search options </h2>
                            </div>
                        ) :
                            (
                                <div className="flex flex-col items-center justify-center">
                                    <h1 className="text-3xl"> You have no spots</h1>
                                    <h2 className="text-xl"> Try adding one </h2>
                                </div>
                            )
                    )}
                </div>
            </div>
        </div>
    );
}

interface MobileOptsProps {
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
    isOnSpot: boolean;
    setIsOnSpot: React.Dispatch<React.SetStateAction<boolean>>;
}

function MobileOpts(props: MobileOptsProps) {
    return (
        <div className={`py-4 w-full h-screen`}>
            <div className="w-3/4">
                {/* Sidebar content */}
                <h2 className="mb-4"> Parking Lot </h2>
                <div className="grid grid-cols-1 gap-4 mb-12">
                    {props.lotsMapped}
                </div>
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
                <div className="flex flex-col gap-4 mb-4">
                    <Button
                        variant={`${props.isOnSpot ? "default" : "secondary"}`}
                        className="mt-5"
                        onClick={() => {
                            props.setIsOnSpot(!props.isOnSpot);
                        }}
                    >
                        {" "}
                        Your Spots{" "}
                    </Button>
                    <Button
                        variant={`${props.all ? "default" : "secondary"}`}
                        onClick={() => {
                            props.setAll(!props.all);
                        }}
                    >
                        {" "}
                        All{" "}
                    </Button>
                    <AddSheet setListings={props.setListings} />
                </div>
            </div>
        </div>
    );
}

interface AddSheetProps {
    setListings: React.Dispatch<React.SetStateAction<ListingResponse[] | null>>;
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
    const [lotName, setLotName] = React.useState<TAcceptedLot>("WAC");
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
                <Button variant="outline">Sell</Button>
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
                            <DatePicker setDate={setFrom} date={from} fn={(_d) => { }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="to" className="text-right">
                            To
                        </Label>
                        <div className="col-span-3">
                            <DatePicker setDate={setTo} date={to} fn={(_d) => { }} />
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
                                value={String(total)}
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
                                if (to! < from!) {
                                    toast({
                                        title: "Invalid date range",
                                        description: "The end date must be after the start date",
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
                                })
                                const new_from = format(from!, "yyyy-MM-dd");
                                const new_to = format(to!, "yyyy-MM-dd");
                                const body: CreateListing = {
                                    spotnumber: lot,
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
                                    toast({
                                        title: "Invalid date range",
                                        description: "Your spot time range overlaps with an existing spot",
                                        variant: "destructive",
                                    });
                                } else {
                                    toast({
                                        title: `${res.status === 500
                                            ? "Internal server error"
                                            : "Unknown error"
                                            }`,
                                        description: `${json.message}, please contact support (support@swiftswap.net)`,
                                        variant: "destructive",
                                    });
                                }
                                props.setListings(await getListings());
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
                <Button variant="default" className="!mb-4">Edit</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit your spot</DialogTitle>
                    <DialogDescription>
                        Make changes to your spot
                    </DialogDescription>
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
                            <DatePicker setDate={setFrom} date={from} fn={(_d) => { }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="to" className="text-right">
                            To
                        </Label>
                        <div className="col-span-3">
                            <DatePicker setDate={setTo} date={to} fn={(_d) => { }} />
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
                                value={props.lot}
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
                                value={String(total)}
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
                                })
                                if (to! < from!) {
                                    toast({
                                        title: "Invalid date range",
                                        description: "The end date must be after the start date",
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
                                const res = await fetch(`/api/listing?listing_id=${props.listing_id}`, {
                                    method: "PUT",
                                    body: JSON.stringify(body),
                                });
                                props.setListings(await getListings());
                                if (res.status === 200) {
                                    toast({
                                        title: "Space edited",
                                    });
                                } else if (res.status === 401) {
                                    redirect("/sign-in");
                                } else {
                                    toast({
                                        title: `${res.status === 500
                                            ? "Internal server error"
                                            : "Unknown error"
                                            }`,
                                        description: `please contact support (support@swiftswap.net)`,
                                        variant: "destructive",
                                    });
                                }
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
                <Button variant="outline">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        space.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => {
                        toast({
                            title: "Deleting space...",
                        })
                        const res = await fetch(`/api/listing?listing_id=${props.listing_id}`, {
                            method: "DELETE",
                        });
                        props.setListings(await getListings());
                        if (res.status === 200) {
                            toast({
                                title: "Space deleted",
                            });
                        } else if (res.status === 401) {
                            redirect("/sign-in");
                        } else {
                            toast({
                                title: `${res.status === 500
                                    ? "Internal server error"
                                    : "Unknown error"
                                    }`,
                                description: `please contact support (support@swiftswap.net)`,
                                variant: "destructive",
                            });
                        }
                        toast({
                            title: "Space deleted",
                        });
                        return;
                    }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
