"use client"
import { ArrowUpDown, CalendarClock, MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ListingResponse } from "@/lib/utils"
import { ColumnDef, FilterFn, filterFns } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

const filterDate: FilterFn<any> = (row, l, value, p) => {
  let offset = value.getTimezoneOffset();
  value = new Date(value.getTime() - (offset*60*1000))
  const val = value
  let from_date: string | Date = row.getValue("fromdate") as string
  from_date = new Date(Date.parse(from_date))
  offset = from_date.getTimezoneOffset();
  from_date = new Date(from_date.getTime() - (offset*60*1000))
  const val2 = from_date
  let to_date: string | Date = row.getValue("todate") as string
  to_date = new Date(Date.parse(to_date));
  offset = to_date.getTimezoneOffset();
  to_date= new Date(to_date.getTime() - (offset*60*1000))
  const val3 = to_date
  return val2 <= val && val <= val3;
}
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
    filterFn: filterDate,
    header: ({ column }) => {
      let yourDate = new Date();
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.setFilterValue(column.getFilterValue() != null ? null: yourDate);
          }}
        >
          To
          <CalendarClock className="ml-2 h-4 w-4" />
        </Button>
      )
    },
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
    header: "Date Bought"
  },
]

