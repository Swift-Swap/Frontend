"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
    setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    date: Date | undefined;
    fn: (d: Date) => void;
}
export function DatePicker(props: Props) {
    const currYear = new Date().getFullYear();
    const fromYear = currYear % 2 === 1 ? currYear : currYear - 1;
    const toYear = currYear % 2 === 0 ? currYear : currYear + 1;
    const fromMonth = new Date(fromYear, 7, 16);
    const toMonth = new Date(toYear, 4, 26);
    const { fn, date, setDate } = props;
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "LLL dd") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    toMonth={toMonth}
                    fromMonth={fromMonth}
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                        if (!d) return;
                        setDate(d);
                        fn(d);
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
