"use client";
import { SignIn } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import React from "react";
import { dark } from "@clerk/themes";


export default function Page() {
    const { systemTheme } = useTheme();
    if (!systemTheme) return null;
    return (
        <div className="flex-1 flex w-full justify-center items-center">
            {systemTheme === "dark" && <SignIn appearance={{
                baseTheme: dark,
                elements: {
                    footerActionLink: "text-foreground",
                }
            }} />}
            {systemTheme === "light" && <SignIn appearance={{}} />}
        </div>
    )
}
