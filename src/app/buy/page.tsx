"use client"
import { DatePicker } from '@/components/ui/daterangepicker'
import { addDays } from 'date-fns'
import React from 'react'
import { Button } from '@/components/ui/button'
import { listings, lots } from '@/lib/utils'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { format } from "date-fns"
import Nav from '@/components/navbar'

export default function Home() {
    const [fromDate, setFromDate] = React.useState<Date | undefined>(new Date())
    const [toDate, setToDate] = React.useState<Date | undefined>(addDays(new Date(), 2))
    const [currLot, setCurrLot] = React.useState<string>("wac")
    const [all, setAll] = React.useState<boolean>(false)
    function onFromDateChange(date: Date) {
        setFromDate(date)
    }
    function onToDateChange(date: Date) {
        setToDate(date)
    }
    if (!fromDate || !toDate) return <></>
    const lotsMapped = lots.map((lot) => {
        return (
            <Button variant={`${currLot == lot.toLowerCase() ? "default" : "secondary"}`} key={lot} onClick={() => {
                setCurrLot(lot.toLowerCase())
            }}>
                {lot}
            </Button>
        )
    })
    const listingsMap = listings.filter((l) => {
        if (all) return true
        return l.lot.toLowerCase() === currLot.toLowerCase() && fromDate.toDateString() === l.from && toDate.toDateString() === l.to
    }).map((listing) => {
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
        <div className="w-full flex">
            {/* Add a sidebar container and apply fixed positioning */}
            <div className={`px-12 py-20 xl:w-1/4 border-r-2 border-r-foreground-50 h-screen sticky top-0`}>
                <div className="w-3/4">
                    {/* Sidebar content */}
                    <div className="flex flex-col gap-4 mb-24">
                        <h2> Parking Lot </h2>
                        {lotsMapped}
                    </div>
                    <div className="flex flex-col gap-4 mb-4">
                        <h2> Time Range </h2>
                        <h4 className="text-sm"> To </h4>
                        <DatePicker setDate={setFromDate} date={fromDate} fn={onFromDateChange} />
                        <h4 className="text-sm"> From </h4>
                        <DatePicker setDate={setToDate} date={toDate} fn={onToDateChange} />
                    </div>
                    <Button variant={`${all ? "default" : "secondary"}`} className="mt-24" onClick={() => {
                        setAll(!all)
                    }}> All </Button>
                </div>
            </div>
            <div className="grid w-full h-fit">
                <div className="grid grid-cols-5 gap-8 p-12">
                    {listingsMap}
                </div>
            </div>
        </div>
    )
}

