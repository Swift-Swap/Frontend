"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SheetContent, SheetTrigger, Sheet } from "@/components/ui/sheet";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function Nav() {
    const { isLoaded, isSignedIn, user } = useUser();
    const { systemTheme } = useTheme();
    if (!isLoaded) return null
    return (
        <nav className="p-4 border-b-2 border-b-foreground-50 flex gap-24 w-full justify-between bg-background items-center px-4 md:px-18 lg:px-36">
            <Link href="/" className="flex items-center gap-4">
                <Image
                    priority
                    width={40}
                    height={40}
                    className="rounded-full"
                    alt="SwiftSwap Logo"
                    src={`https://lh3.googleusercontent.com/pw/AIL4fc_8oTggrpwnfuxcYCVmUOEGlJBOmOUkYE4OwQFJ64mhs4XXaro5_ihBw6Rq6sxu5YpB7n5h3PQsv8oAQ_RyUywOHuTIy36bDAWUGcVq43A-FPSgXaiDx01ENT0YRKcVaYocHeaaNtCI1-y5H11gEcw=w480-h480-s-no?authuser=0`}
                />
                <p className="text-sm">SwiftSwap</p>
            </Link>
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="top">
                        <div className="px-4 justify-around flex w-full">
                            <Link href="/about">
                                <Button variant="ghost">About</Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="ghost">Contact</Button>
                            </Link>
                            {!isSignedIn && (
                                <Link href="/sign-in">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                            )}
                            <Link href={`${isSignedIn ? "/buy" : "/sign-up"}`}>
                                <div className="bg-gradient-to-b from-primary-red to-primary-blue !p-[0.13em] flex justify-center items-center rounded-lg">
                                    <Button className="text-foreground bg-background hover:bg-background w-full h-max"> {`${isSignedIn ? "Buy" : "Get Started"}`} </Button>
                                </div>
                            </Link>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="px-4 gap-12 items-center md:flex hidden">
                <Link href="/about">
                    <Button variant="ghost">About</Button>
                </Link>
                <Link href="/contact">
                    <Button variant="ghost">Contact</Button>
                </Link>
                {!isSignedIn && (
                    <Link href="/sign-in">
                        <Button variant="ghost">Sign In</Button>
                    </Link>
                )}
                <Link href={`${isSignedIn ? "/buy" : "/sign-up"}`}>
                    <div className="bg-gradient-to-b from-primary-red to-primary-blue !p-[0.13em] flex justify-center items-center rounded-lg">
                        <Button className="text-foreground bg-background hover:bg-background w-full h-max"> {`${isSignedIn ? "Buy" : "Get Started"}`} </Button>
                    </div>
                </Link>
                <div className={`${!isSignedIn ? "hidden" : ""}`}>
                    {systemTheme === "dark" && <UserButton afterSignOutUrl="/" appearance={{
                        baseTheme: dark,
                        elements: {
                            userButtonPopoverFooter: "hidden",
                        }
                    }} />}
                    {systemTheme === "light" && <UserButton appearance={{}} afterSignOutUrl="/" afterSwitchSessionUrl="/"/>}
                </div>
            </div>
        </nav>
    );
}
