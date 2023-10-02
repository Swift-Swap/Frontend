"use client";

import { outfit } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <div
      className={`w-full flex-1 flex flex-col items-center py-12 text-center bg-blur bg-cover bg-no-repeat bg-center ${outfit.className}`}
    >
      <div className="lg:w-1/3 md:w-1/2 w-4/5 flex-1 flex flex-col items-center text-center">
        <h1 className={`text-4xl font-bold `}>About</h1>
        <Image
          alt="Logo"
          width={200}
          height={200}
          className="rounded-full mt-6"
          src="https://lh3.googleusercontent.com/pw/AIL4fc_8oTggrpwnfuxcYCVmUOEGlJBOmOUkYE4OwQFJ64mhs4XXaro5_ihBw6Rq6sxu5YpB7n5h3PQsv8oAQ_RyUywOHuTIy36bDAWUGcVq43A-FPSgXaiDx01ENT0YRKcVaYocHeaaNtCI1-y5H11gEcw=w480-h480-s-no?authuser=0"
        />
        <p className=" mt-5">
          Swift Swap Parking is a platform designed to help students trade
          parking spots on the WHS campus efficiently and conveniently. We aim
          to alleviate parking congestion by encouraging voluntary student spot
          exchanges. By offering a platform for spot swapping, we hope to
          optimize parking space utilization and reduce parking-related
          frustrations.
        </p>
        <h2 className="text-2xl font-bold mt-10"> How it works </h2>
        <ol className=" mt-6 text-left list-decimal list-inside">
          <li className="mb-4">
            <span className="font-semibold">Spot Listing</span>: Students can
            list the parking spots that they are willing to trade on the Swift
            Swap platform. They can specify the time slots when their spot is
            available for trading.
          </li>
          <li className="mb-4">
            <span className="font-semibold">Spot Searching</span>: Students in
            need of parking can search for available spots during specific time
            slots that suit their schedule.
          </li>
          <li className="mb-4">
            <span className="font-semibold">Match and Swap</span>: When a
            suitable match is found, the students can then pay and swap through
            the platform.
          </li>
          {/* <li className="mb-4">
            <span className="font-semibold">Community Ratings</span>: To ensure
            a positive experience, students can provide ratings and feedback
            after each swap.
          </li> MAYBE LATER*/}
        </ol>
        <h2 className="text-2xl font-bold mt-10"> Credits </h2>
        <p className="mt-6 ">
          Swift Swap is founded and managed by{" "}
          <Link
            className="hover:before:scale-x-100 hover:before:origin-left relative before:w-full before:h-[2px] before:origin-left before:transition-transform before:duration-300 before:scale-x-0 before:bg-foreground before:absolute before:left-0 before:bottom-0"
            target="_blank"
            href="https://github.com/zw96042"
          >
            Zachary Wilson
          </Link>{" "}
          while{" "}
          <Link
            className="hover:before:scale-x-100 hover:before:origin-left relative before:w-full before:h-[2px] before:origin-left before:transition-transform before:duration-300 before:scale-x-0 before:bg-foreground before:absolute before:left-0 before:bottom-0"
            target="_blank"
            href="https://github.com/aadijo"
          >
            {" "}
            Advait Johari{" "}
          </Link>{" "}
          and{" "}
          <Link
            className="hover:before:scale-x-100 hover:before:origin-left relative before:w-full before:h-[2px] before:origin-left before:transition-transform before:duration-300 before:scale-x-0 before:bg-foreground before:absolute before:left-0 before:bottom-0"
            href="https://github.com/vibovenkat123"
            target="_blank"
          >
            Vaibhav Venkat
          </Link>{" "}
          are contributors.
        </p>
        <h2 className="text-2xl font-bold mt-10"> Feedback and Support </h2>
        <p className="mt-6 ">
          Your feedback is crucial in enhancing Swift Swap. If you encounter any
          issues, have questions, or want to share your thoughts, please reach
          out to us via
          <br />
          <br />
          <Link href="mailto:support@swiftswap.net">
            support@swiftswap.net.
          </Link>
          <br />
          <br />
          Let&apos;s make parking at WHS a breeze with Swift Swap Parking!
        </p>
      </div>
    </div>
  );
}
