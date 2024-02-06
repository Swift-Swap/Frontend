"use client"
import { ArrowUpDown, CalendarClock, DollarSign, MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ListingResponse, getAdminUser } from "@/lib/utils"
import { ColumnDef, FilterFn, filterFns } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import React from "react"

const filterDate: FilterFn<any> = (row, l, value, p) => {
  if (value == null) return true;
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
  const sold = row.getValue("sold") as boolean;
  return val2 <= val && val <= val3 && sold;
}
// You can use a Zod schema here if you want.
export const columns: ColumnDef<ListingResponse>[] = [
  {
    accessorKey: "sold",
    id: "sold",
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
          Sold
          <CalendarClock className="ml-2 h-4 w-4" />
        </Button>
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
    accessorKey: "buyer_id",
    id: "buyer_id",
    header: "Buyer",
  },
  {
    accessorKey: "owner_id",
    id: "owner_id",
    header: "Owner",
  },
  {
    accessorKey: "lot",
    id: "lot",
    header: "Lot",
  },
  {
    accessorKey: "fromdate",
    id: "From",
    header: "From",
    cell: ({row}) => (
      <>
        {new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(Date.parse(row.getValue("From")))}
      </>
    )
  },
  {
    accessorKey: "todate",
    header: "To",
    id: "To",
    cell: ({row}) => (
      <>
        {new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(Date.parse(row.getValue("To")))}
      </>
    )
  },
  {
    accessorKey: "spot_number",
    id: "spot_number",
    header: "Spot #",
  },
  {
    accessorKey: "price",
    id: "price",
    header: "Price",
    cell: ({row}) => (
      <>
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(row.getValue("price"))}
      </>
    )
  },
  {
    accessorKey: "days",
    id: "days",
    header: "Days"
  }
]

