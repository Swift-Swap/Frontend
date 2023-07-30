"use client";
import React from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowRightCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { PermDenied } from "@/components/perm_denied";
import { useTheme } from "next-themes";
export default function Home() {
    const { toast } = useToast();
    const [showed, setShowed] = React.useState(false);
    const { isLoaded, isSignedIn, user } = useUser();
    const { systemTheme } = useTheme();

    React.useState(() => {
        if (typeof localStorage === "undefined") return;
        const isShowed = localStorage.getItem("showed-unfinished-website");
        if (isShowed) {
            if (JSON.parse(isShowed)) {
                console.log(isShowed);
                setShowed(true);
                return;
            }
        }
        if (showed) return;
        toast({
            title: "Unfinished website",
            description:
                "This website is still under construction. Please check back later!",
            variant: "destructive",
            action: (
                <ToastAction
                    altText="Never show again"
                    onClick={() => {
                        if (typeof localStorage === "undefined") return;
                        localStorage.setItem(
                            "showed-unfinished-website",
                            JSON.stringify(true),
                        );
                    }}
                >
                    Dont show again
                </ToastAction>
            ),
        });
        setShowed(true);
    });

    if (!isLoaded) return null;
    if (!(user?.primaryEmailAddress?.emailAddress?.endsWith("@eanesisd.net")) && isSignedIn) {
        return <PermDenied emailAddr={user?.primaryEmailAddress?.emailAddress!} />
    }
    return (
        <div className={`flex flex-col justify-center items-center w-screen flex-1 p-2 bg-gradient-to-br to-primary-red ${systemTheme === "dark" ? "via-background" : ""} from-primary-blue text-white`}>
            <div className="flex justify-center items-center gap-4 p-2 w-screen flex-1 flex-col bg-westlake bg-cover">
            <div className="flex justify-start items-center gap-4 p-2 w-screen h-screen">
                <div className="flex flex-col justify-center gap-4 p-2 w-full md:w-3/4 lg:w-1/2">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold">
                        Pave The Way
                        For An Easy
                        Day!
                    </h1>
                    <p className="text-left text-md">A platform designed to help students trade parking spots on campus efficiently and conveniently. </p>
                    <div className="flex w-full justify-start gap-4 ">
                        <Link href={`${isSignedIn ? "/buy" : "/sign-up"}`}>
                            <Button>
                                {`${isSignedIn ? "Buy" : "Get Started"}`}
                                <ArrowRight /> </Button>
                        </Link>
                        <Link href="/about">
                            <Button variant="outline" className="border-white bg-transparent">
                                About
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex justify-end items-center gap-4 p-2 w-screen h-screen">
                <div className="flex flex-col justify-center gap-4 p-2 w-full md:w-3/4 lg:w-1/2">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-right">
                        What does it do?
                    </h1>
                    <p className="text-right text-md">Swift Swap enables students to trade parking spots by listing their available spots and searching for suitable matches. Users can make swaps through the platform and provide feedback for a positive experience.</p>
                </div>
            </div>
            </div>
        </div>
    );
}
