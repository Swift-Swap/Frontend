"use client"
import { ArrowUpDown, CalendarClock, MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ListingResponse } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<ListingResponse>[] = [
  {
    accessorKey: "sold",
    header: ({ column }) => {
      return (
          <>
          Sold
          </>
      )
    },
    cell: ({ row }) => (
      <>
      <Checkbox
        checked={row.getValue("sold")}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
      </>
    ),
  },
  {
    accessorKey: "lot",
    header: "Lot",
  },
  {
    accessorKey: "fromdate",
    header: "From",
    cell: ({row}) => (
      <>
        {new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(Date.parse(row.getValue("fromdate")))}
      </>
    )
  },
  {
    accessorKey: "todate",
    header: "To",
    cell: ({row}) => (
      <>
        {new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(Date.parse(row.getValue("todate")))}
      </>
    )
  },
  {
    accessorKey: "spot_number",
    header: "Spot #",
  },
  {
    accessorKey: "date_bought",
    header: ({ column }) => {
      let yourDate = new Date();
      const offset = yourDate.getTimezoneOffset();
      yourDate = new Date(yourDate.getTime() - (offset*60*1000))
      const date = yourDate.toISOString().split('T')[0]
      console.log(date)
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.setFilterValue(column.getFilterValue() != null ? null : date);
          }}
        >
          Date Bought
          <CalendarClock className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]

