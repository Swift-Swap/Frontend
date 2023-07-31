"use client";
import { DatePicker } from "@/components/ui/daterangepicker";
import { addDays } from "date-fns";
import React from "react";
import { Button } from "@/components/ui/button";
import { TAcceptedLot, TLot, listings, lots, acceptedLots } from "@/lib/utils";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { format } from "date-fns";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { PermDenied } from "@/components/perm_denied";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function Home() {
    const [fromDate, setFromDate] = React.useState<Date | undefined>(undefined);
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
    const [currLot, setCurrLot] = React.useState<string>("");
    const [all, setAll] = React.useState<boolean>(true);
    const { isLoaded, isSignedIn, user } = useUser();
    React.useEffect(() => {
        if (typeof localStorage === "undefined") return;
        const toDate = localStorage.getItem("toDate");
        const fromDate = localStorage.getItem("fromDate");
        toDate ? setToDate(new Date(toDate)) : setToDate(addDays(new Date(), 2));
        fromDate ? setFromDate(new Date(fromDate)) : setFromDate(new Date());
    }, []);
    if (!isLoaded) return null;
    if (!(user?.primaryEmailAddress?.emailAddress?.endsWith("@eanesisd.net")) && isSignedIn) {
        return <PermDenied emailAddr={user?.primaryEmailAddress?.emailAddress!} />
    }
    const lotsMapped = lots.map((lot) => {
        return (
            <Button
                variant={`${currLot == lot.toLowerCase() && !all ? "default" : "secondary"
                    }`}
                key={lot}
                onClick={() => {
                    setCurrLot(lot.toLowerCase());
                    setAll(false);
                }}
            >
                {lot}
            </Button>
        );
    });
    const listingsMap = listings
        .filter((l) => {
            if (all) return true;
            return (
                (l.lot.toLowerCase() === currLot.toLowerCase() ||
                    currLot.toLowerCase() === lots[0].toLowerCase()) &&
                fromDate?.toDateString() === l.from &&
                toDate?.toDateString() === l.to
            );
        })
        .map((listing) => {
            return (
                <Card
                    className="h-fit w-fit flex flex-col items-center text-center"
                    key={listing.id}
                >
                    <CardHeader>
                        <CardTitle className="text-md md:text-xl">
                            {" "}
                            {format(new Date(listing.from), "LLL dd")} -{" "}
                            {format(new Date(listing.to), "LLL dd")}{" "}
                        </CardTitle>
                        <CardDescription className="text-sm md:text-md">
                            {" "}
                            #{listing.lotNum}{" "}
                        </CardDescription>
                        <CardDescription className="text-sm md:text-md">
                            {" "}
                            {listing.lot}{" "}
                        </CardDescription>
                        <Button className="text-sm"> Buy </Button>
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
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <MobileOpts
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
            </div>
            {/* Add a sidebar container and apply fixed positioning */}
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
                            variant={`${all ? "default" : "secondary"}`}
                            className={`mt-16`}
                            onClick={() => {
                                setAll(!all);
                            }}
                        >
                            {" "}
                            All{" "}
                        </Button>
                        <AddSheet />
                    </div>
                </div>
            </div>
            <div className="grid w-full h-fit place-items-center">
                <div className="grid xl:grid-cols-4 lg:grid-cols-3 grid-cols-2 gap-8 p-12">
                    {listingsMap}
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
    onFromDateChange: (date: Date) => void;
    onToDateChange: (date: Date) => void;
}

function MobileOpts(props: MobileOptsProps) {
    return (
        <div className={`px-6 py-20 w-full h-screen sticky top-0`}>
            <div className="w-3/4">
                {/* Sidebar content */}
                <div className="flex flex-col gap-4 mb-24">
                    <h2> Parking Lot </h2>
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
                        variant={`${props.all ? "default" : "secondary"}`}
                        className={`mt-16`}
                        onClick={() => {
                            props.setAll(!props.all);
                        }}
                    >
                        {" "}
                        All{" "}
                    </Button>
                    <AddSheet />
                </div>
            </div>
        </div>
    );
}


function AddSheet() {
    const auth = useAuth();
    const [lot, setLot] = React.useState<number>(40);
    const [from, setFrom] = React.useState<Date | undefined>(new Date());
    const [to, setTo] = React.useState<Date | undefined>(addDays(new Date(), 1));
    const [lotName, setLotName] = React.useState<TAcceptedLot>("WAC");
    const acceptedLotsMapped = acceptedLots.map((lot) => {
        return <SelectItem key={lot} value={lot}>{lot}</SelectItem>;
    })
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="default">
                    <Plus />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Add a space</SheetTitle>
                    <SheetDescription>
                        Add a new parking space for sale
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lot" className="text-right">
                            Lot
                        </Label>
                        <Input id="lot" value={lot} className="col-span-3" type="number" onChange={(l) => {
                            setLot(parseInt(l.target.value));
                        }} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="from" className="text-right">
                            From
                        </Label>
                        <div className="col-span-3">
                            <DatePicker setDate={setFrom} date={from} fn={(d) => {
                            }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="to" className="text-right">
                            To
                        </Label>
                        <div className="col-span-3">
                            <DatePicker setDate={setTo} date={to} fn={(d) => {
                            }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lotName" className="text-right">
                            Location
                        </Label>
                        <div className="col-span-3">
                            <Select onValueChange={(val) => {
                                setLotName(val as TAcceptedLot);
                            }}>
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

                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" onClick={() => {
                            if (to! < from!) {
                                toast({
                                    title: "Invalid date range",
                                    description: "The end date must be after the start date",
                                    variant: "destructive",
                                })
                                return
                            }
                            if (lot < 1) {
                                toast({
                                    title: "Invalid lot",
                                    description: "The lot number must be greater than 0",
                                    variant: "destructive",
                                })
                                return
                            }
                            const new_from = format(from!, "yyyy-MM-dd")
                            const new_to = format(to!, "yyyy-MM-dd")
                            toast({
                                title: "Space added",
                                description: `Space ${lot} added to ${lotName} with user id ${auth.userId} at date range ${new_from} to ${new_to}`,
                            })
                        }}>Add</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
