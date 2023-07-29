"use client"

import React from "react";
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button";

export default function Nav() {
    const [signedIn, setSignedIn] = React.useState(true)
    return (
        <nav className="p-4 px-8 border-b-2 border-b-foreground-50 flex gap-24 w-full justify-between bg-background items-center">
            <Link href="/" className="flex items-center gap-4"> 
                <Image 
                    width={50}
                    height={50}
                    className="rounded-full"
                    alt="SwiftSwap Logo"
                    src={`https://lh3.googleusercontent.com/pw/AIL4fc_8oTggrpwnfuxcYCVmUOEGlJBOmOUkYE4OwQFJ64mhs4XXaro5_ihBw6Rq6sxu5YpB7n5h3PQsv8oAQ_RyUywOHuTIy36bDAWUGcVq43A-FPSgXaiDx01ENT0YRKcVaYocHeaaNtCI1-y5H11gEcw=w480-h480-s-no?authuser=0`}/> 
                <p className="text-md">SwiftSwap</p>
            </Link>
            <div className="flex px-4 gap-12 items-center">
                <Link href="/about"> About </Link>
                <Link href="/contact"> Contact </Link>
                {!signedIn && <Link href="/sign-in"> Sign In </Link>}
                <Link href={`${signedIn ? "/buy" : "/get-started"}`}>
                    <Button> {`${signedIn ? "Buy" : "Get Started"}`} </Button>
                </Link>
            </div>
        </nav>
    )
}
