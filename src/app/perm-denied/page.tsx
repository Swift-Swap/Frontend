"use client";

import { useUser } from "@clerk/nextjs";
import React from "react";

export default function PermDenied() {
  const { user } = useUser();
  return (
    <div className="w-full flex-1 flex flex-col items-center py-12">
      <h1 className="text-7xl">Permission Denied</h1>
      <p className="mt-5 text-xl text-center">
        You do not have permission to access this page.
        <br />
        Your email address {user?.primaryEmailAddress?.emailAddress} is not an
        Eanes email address.
        <br />
        Please sign up with an Eanes email address.
      </p>
    </div>
  );
}
