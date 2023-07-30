"use client"
import React from 'react'
import Image from 'next/image'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRightCircle } from 'lucide-react'
export default function Home() {
    const { toast } = useToast()
    const [showed, setShowed] = React.useState(false)
    const [signedIn, setSignedIn] = React.useState(true)
    React.useState(() => {
        if (typeof localStorage === "undefined") return
        const isShowed = localStorage.getItem("showed-unfinished-website")
        if (isShowed) {
            if (JSON.parse(isShowed)) {
                console.log(isShowed)
                setShowed(true)
                return
            }
        }
        if (showed) return
        toast({
            title: "Unfinished website",
            description: "This website is still under construction. Please check back later!",
            variant: "destructive",
            action: <ToastAction altText="Never show again" onClick={() => {
                if (typeof localStorage === "undefined") return
                localStorage.setItem("showed-unfinished-website", JSON.stringify(true))
            }}>Dont show again</ToastAction>,
        })
        setShowed(true)
    })
    return (
        <div className="flex flex-col justify-center items-center w-screen flex-1 fixed mt-32 p-2">
            <div className="flex flex-col justify-start md:w-2/3 gap-8 items-center w-full text-center">
                <h1 className="xl:text-7xl lg:text-6xl text-5xl font-semibold"> Pave the way for an easy day! </h1>
                <p className="text-muted-foreground text-lg">
                    A platform designed to help students trade parking spots on campus efficiently and conveniently. We aim to alleviate parking congestion by encouraging voluntary student spot exchanges.
                </p>
                <div className="flex gap-4">
                    <Link href={`${signedIn ? "/buy" : "/get-started"}`}>
                        <Button className="text-xl p-6 px-12 flex gap-4 items-center"> 
                            {`${signedIn ? "Buy" : "Get Started"}`} 
                            <ArrowRightCircle />
                        </Button>
                    </Link>
                    <Link href={`${signedIn ? "/contact" : "/about"}`}>
                        <Button className="text-xl p-6 px-12 flex gap-4 items-center" variant="outline">
                            {`${signedIn ? "Contact" : "About"}`}
                        </Button>
                    </Link>
                </div>
                <Image
                    className={`mt-5 w-[300px] h-auto md:w-[400px] lg:w-[500px]`}
                    src="https://lh3.googleusercontent.com/pw/AIL4fc8VaF4IJpb0NyMpb5cdAGeDw8431_sb2UYn624KbZlE30mrwuQOYEWBR9HgFmllmNa6wSUymRaT0nSpiJg3iIHZQqf5xmCScIk5xOdqZSa1DbBTx9DOkCsnKRsbdefbbUKPuWU-AnHZb__PZ_G1Wvk=w660-h660-s-no?authuser=0"
                    width={300} height={300} alt={"Image of car"} />
            </div>
        </div>
    )
}

