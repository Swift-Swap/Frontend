"use client";
import { DatePicker } from "@/components/ui/daterangepicker";
import { addDays } from "date-fns";
import React from "react";
import { Button } from "@/components/ui/button";
import {
    acceptedLots,
    ListingResponse,
    formatNumber,
    getListings,
    outfit,
} from "@/lib/utils";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { format } from "date-fns";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronsRight, Info } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export default function Home() {
    const [fromDate, setFromDate] = React.useState<Date | undefined>(undefined);
    const [listings, setListings] = React.useState<ListingResponse[] | null>([]);
    const [toDate, setToDate] = React.useState<Date | undefined>(undefined);
    const [currLots, setCurrLots] = React.useState<string[]>([]);
    const { isLoaded, user } = useUser();
    function onFromDateChange(date: Date) {
        setFromDate(date);
        if (typeof localStorage === "undefined") return;
        localStorage.setItem("fromDate", date.toDateString());
    }
    function onToDateChange(date: Date) {
        setToDate(date);
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
            const res = await getListings();
            setListings(res);
        }
        main();
    }, []);

    if (user && user.primaryEmailAddress && user.primaryEmailAddress.emailAddress.split("@")[1] !== "eanesisd.net") {
        return NextResponse.redirect("/perm-denied");
    }
    if (!listings) return null;
    if (!isLoaded) return null;

    const lotsMapped = acceptedLots.map((lot) => {
        return (
            <Button
                variant={`${currLots.includes(lot.toLowerCase())
                    ? "default"
                    : "secondary"
                    }`}
                key={lot}
                onClick={() => {
                    if (currLots.includes(lot.toLowerCase())) {
                        setCurrLots(currLots.filter((l) => l !== lot.toLowerCase()));
                        return;
                    }
                    setCurrLots([...currLots, lot.toLowerCase()]);
                }}
            >
                {lot}
            </Button>
        );
    });
    const listingsMap = listings
        .filter((l) => {
            if (user && l.user_id === user.id) return false;
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
                parseInt(start_date_split[2]),
            );
            const end_date = new Date(
                parseInt(end_date_split[0]),
                parseInt(end_date_split[1]) - 1,
                parseInt(end_date_split[2]),
            );
            return (
                <Card
                    className={`${"min-h-full w-fit"
                        } flex flex-col gap-14 items-center text-center p-4 justify-between w-[250px] h-[250px] border-xl`}
                    key={listing.spaceid}
                >
                    <CardHeader className="flex flex-1 flex-col items-center justify-between w-fit gap-4">
                        <CardTitle className="text-md md:text-xl">
                            {" "}
                            {format(start_date, "LLL dd")} - {format(end_date, "LLL dd")}{" "}
                        </CardTitle>
                        <CardDescription className="text-sm md:text-md rounded-lg bg-primary px-2">
                            {" "}
                            #{formatNumber(listing.spotnumber)}{" "}
                        </CardDescription>
                        <CardDescription className={`font-bold text-xl md:text-2xl ${outfit.className}`}>
                            {" "}
                            {listing.lot}{" "}
                        </CardDescription>
                        <Button className={`w-full text-xs flex items-center gap-2 uppercase tracking-widest ${outfit.className}`}> 
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
                    <Button variant="outline" className="w-min">
                        <ChevronsRight />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex">
                    <Opts
                        setListings={setListings}
                        setCurrFrom={setFromDate}
                        setCurrTo={setToDate}
                        currFrom={fromDate}
                        currTo={toDate}
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
                    {listingsMap.length === 0 &&
                        <div className="flex flex-col items-center justify-center">
                            <h1 className="text-3xl"> There are no spots </h1>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

interface OptsProps {
    setCurrFrom: React.Dispatch<React.SetStateAction<Date | undefined>>;
    setCurrTo: React.Dispatch<React.SetStateAction<Date | undefined>>;
    currFrom: Date | undefined;
    currTo: Date | undefined;
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
            </div>
        </div>
    );
}
