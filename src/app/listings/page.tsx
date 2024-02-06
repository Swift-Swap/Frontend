"use client";
import { ListingResponse, getListings, getListingsAdmin, people_good } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function Listings() {
  const [listings, setListings] = React.useState<ListingResponse[] | null>([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const { isLoaded, user } = useUser();
  React.useEffect(() => {
    if (typeof localStorage === "undefined") return;
    async function main() {
      if (loaded) return;
      const res = await getListingsAdmin();
      setListings(res);
      setLoaded(true);
    }
    main();
  }, [listings, loaded]);
  if (
    user &&
    user.primaryEmailAddress &&
    user.primaryEmailAddress.emailAddress.split("@")[1] !== "eanesisd.net"&&
    !people_good.includes(user.primaryEmailAddress.emailAddress)
  ) {
    redirect("/perm-denied");
  }
  if (!listings) return null;
  if (!isLoaded) return null;
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <DataTable columns={columns} data={listings} />
    </div>
  )
}
