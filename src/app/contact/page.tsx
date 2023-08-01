"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { outfit } from "@/lib/utils";
import React from "react";

export default function Contact() {
    const [replyTo, setReplyTo] = React.useState("");
    const [name, setName] = React.useState("");
    const [message, setMessage] = React.useState("");
    return (
        <div className="flex-1 flex w-screen flex-col items-center py-24">
            <h1 className={`mb-4 text-5xl lg:text-6xl xl:text-7xl font-bold ${outfit.className}`}> Contact SwiftSwap </h1>
            <p className="mb-14"> Need to get in touch? Just fill out the form below and we’ll be right with you! </p>
            <div className="w-full px-8 md:w-2/3 lg:w-1/2 xl:w-1/3">
                <div className="flex justify-between gap-24">
                    <div className="lg:w-[250px]">
                        <Label htmlFor="replyto"> Reply to </Label>
                        <Input id="replyto" type="email" placeholder="johnsmidth@smidth.com" value={replyTo} onChange={(e) => {
                            setReplyTo(e.target.value);
                        }} />
                    </div>
                    <div className="lg:w-[250px]">
                        <Label htmlFor="name"> Name </Label>
                        <Input value={name} id="name" type="text" placeholder="John smidth" onChange={(e) => {
                            setName(e.target.value);
                        }} />
                    </div>
                </div>
                <Textarea onChange={(e) => {
                    setMessage(e.target.value);
                }} value={message} className="mt-4" placeholder="Help I can't do so and so" />
                <Button variant="outline" className="mt-8 w-full"> Submit </Button>
            </div>
        </div>
    )
}
