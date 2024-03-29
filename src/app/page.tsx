"use client";
import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { outfit } from "@/lib/utils";

function onLoad(
  setShowed: React.Dispatch<React.SetStateAction<boolean>>,
  showed: boolean,
  toast: (obj: {
    title: string;
    description: string;
    variant: "destructive" | "default";
    action: JSX.Element;
  }) => any,
) {
  if (typeof localStorage === "undefined") return;
  const isShowed = localStorage.getItem("showed-unfinished-website");
  if (isShowed) {
    if (JSON.parse(isShowed)) {
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
}

export default function Home() {
  const { toast } = useToast();
  const [showed, setShowed] = React.useState(false);
  const { isLoaded, isSignedIn } = useUser();
  React.useState(() => {
    onLoad(setShowed, showed, toast);
  });

  if (!isLoaded) return null;
  return (
    <div
      className={`flex flex-col justify-center items-center w-screen flex-1 p-2  text-white bg-westlake bg-no-repeat bg-center bg-cover ${outfit.className}`}
    >
      <div className="flex justify-center items-center gap-4 p-2 w-screen flex-1 flex-col ">
        <div
          className={`flex flex-col justify-center items-center gap-4 p-2 w-screen flex-1`}
        >
          <div className="flex flex-col justify-center items-center gap-4 p-2 w-full md:w-3/4 lg:w-1/2 xl:w-1/3 flex-1">
            <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-bold [text-shadow:_9px_9px_5px_rgb(0_0_0_/_40%)]">
              {" "}
              Swift Swap{" "}
            </h1>
            <p className="text-center text-lg">
              A platform designed to help students trade parking spots
              efficiently and conveniently.
            </p>
            <div className="flex justify-center items-between gap-4 p-2 w-full">
              <Link href={`${isSignedIn ? "/buy" : "/sign-up"}`}>
                <Button className="flex items-center gap-2 w-[150px] md:w-[200px]">
                  {isSignedIn ? "Buy" : "Get Started"}
                  <ArrowRight height={24} />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  className="bg-transparent border-white border-2 w-[150px] md:w-[200px] hover:bg-white hover:text-black"
                >
                  About
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
