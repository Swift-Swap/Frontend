"use client"
import { DatePickerWithRange } from '@/components/ui/daterangepicker'
import { addDays } from 'date-fns'
import Link from 'next/link'
import React from 'react'
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { TLot, listings, lots } from '@/lib/utils'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { format } from "date-fns"

export default function Home() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 3),
    })
    const [currLot, setCurrLot] = React.useState<string>("wac")
    function onDateChanged(date: DateRange) {
        setDate(date)
    }

    if (!date) return <></>
    const lotsMapped = lots.map((lot) => {
        return (
            <Button variant={`${currLot == lot.toLowerCase() ? "default" : "secondary"}`} key={lot} onClick={() => {
                setCurrLot(lot.toLowerCase())
            }}>
                {lot}
            </Button>
        )
    })

    const listingsMap = listings.filter((l) => l.lot.toLowerCase() === currLot.toLowerCase()).map((listing) => {
        return (
            <Card className="h-fit w-fit flex flex-col items-center text-center" key={listing.id}>
                <CardHeader>
                    <CardTitle className="text-xl"> {format(new Date(listing.from), "LLL dd")} - {format(new Date(listing.to), "LLL dd")}  </CardTitle>
                    <CardDescription className="text-md"> #{listing.lotNum} </CardDescription>
                    <CardDescription className="text-md"> {listing.lot} </CardDescription>
                    <Button> Buy </Button>
                </CardHeader>
            </Card>
        )
    })
    return (
        <main className="w-screen h-screen bg-background max-w-full overflow-x-hidden">
            <nav className="p-4 px-8 border-b-2 border-b-foreground-50 flex justify-between w-full bg-background">
                <Link href="/"> Logo </Link>
            </nav>
            <div className="w-full flex">
                {/* Add a sidebar container and apply fixed positioning */}
                <div className={`px-12 py-20 w-1/5 border-r-2 border-r-foreground-50 h-screen sticky top-0`}>
                    <div className="w-2/3 mb-">
                        {/* Sidebar content */}
                        <div className="flex flex-col gap-4 mb-24">
                            <h2> Parking Lot </h2>
                            {lotsMapped}
                        </div>
                        <div className="flex flex-col gap-4 mb-4">
                            <h2> Time Range </h2>
                            <DatePickerWithRange setDate={setDate} date={date} fn={onDateChanged} />
                        </div>
                    </div>
                </div>
                <div className="grid w-full h-fit">
                    <div className="grid grid-cols-5 gap-8 p-12">
                        {listingsMap}
                    </div>
                </div>
            </div>
        </main>
    )
}
