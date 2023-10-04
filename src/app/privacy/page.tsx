"use client";

import { outfit } from "@/lib/utils";
import { redirect } from "next/dist/server/api-utils";
import Image from "next/image";
import Link from "next/link";

export default function Privacy() {
  return (
    <div
      className={`w-full flex-1 flex flex-col items-center py-12 text-center bg-blur bg-cover bg-no-repeat bg-center ${outfit.className}`}
    >
      <div className="lg:w-1/3 md:w-1/2 w-4/5 flex-1 flex flex-col items-center text-center">
        <h1 className={`text-4xl font-bold `}>Privacy</h1>
        <Image
          alt="Logo"
          width={200}
          height={200}
          className="rounded-full mt-6"
          src="https://lh3.googleusercontent.com/pw/AIL4fc_8oTggrpwnfuxcYCVmUOEGlJBOmOUkYE4OwQFJ64mhs4XXaro5_ihBw6Rq6sxu5YpB7n5h3PQsv8oAQ_RyUywOHuTIy36bDAWUGcVq43A-FPSgXaiDx01ENT0YRKcVaYocHeaaNtCI1-y5H11gEcw=w480-h480-s-no?authuser=0"
        />
        <p className=" mt-5">
        Welcome to Swift Swap! This Privacy Policy explains 
        how we collect, use, disclose, and safeguard your 
        personal information when you use our website Services.
        By accessing or using Swift Swap, you consent to the practices
        described in this Privacy Policy.
        </p>
        <ol className=" mt-6 text-left list-decimal list-inside">
          <li className="mb-4">
            <span className="font-semibold">Information We Collect</span>: <br/>
            <ul className="list-disc">
              <li className="mb-4">
                <strong>User-Provided Information:</strong> When you register for Swift Swap, 
                you may provide information such as your name, email address, 
                phone number, and payment information. You may also provide 
                information when you create parking listings or interact with 
                other users on our platform.
              </li>
              <li className="mb-4">
              <strong>Automatically Collected Information:</strong> We may collect certain 
              information automatically, including your device information, 
              location data, and usage patterns.
              </li>
            </ul>
          </li>

          <li className="mb-4">
            <span className="font-semibold">How We Use Your Information</span>: <br/>
            <ul className="mb-4 list-disc">
              <li className="mb-4">
                <strong>Communication:</strong> We may send you service-related communications, such as booking confirmations and updates.
              </li>
              <li className="mb-4">
                <strong>Improvement:</strong> We use data for analysis to improve our Services, including user experience and security.
              </li>
            </ul>
          </li>

          <li className="mb-4">
            <span className="font-semibold">Information Sharing</span>: <br/>
            We do not sell or rent your personal information. However, we may share information with: <br/>
            <ul className="mb-4 list-disc">
              <li className="mb-4">
                Other users to facilitate parking spot bookings.
              </li>
              <li className="mb-4">
                Service providers who help us with payment processing, data analysis, and other services.
              </li>
              <li className="mb-4">
                Legal authorities when required by law or to protect our rights.
              </li>
              <li className="mb-4">
                EanesISD when requested at a moments notice.
              </li>
            </ul>
          </li>

          <li className="mb-4">
            <span className="font-semibold">Security</span>: <br/>
            <ul className="mb-4 list-disc">
              <li className="mb-4">
                  We employ reasonable security measures to protect your 
                data. However, no method of transmission over the internet
                or electronic storage is 100% secure. We cannot guarantee
                absolute security.
              </li>
            </ul>
          </li>

          <li className="mb-4">
            <span className="font-semibold">Your Choices</span>: <br />
            <ul className="mb-4 list-disc">
              <li className="mb-4">
                  You can access and update your account information. You can 
                also opt-out of certain communications.
              </li>
            </ul>
          </li>

          <li className="mb-4">
            <span className="font-semibold">Age Restriction</span>: <br />
            <ul className="mb-4 list-disc">
              <li className="mb-4"> 
              Swift Swap is not intended for users under the age of 13. We do
              not knowingly collect information from children under 13. If you
              are under 13, please do not use Swift Swap or provide any personal
              information.
              </li>
            </ul>
          </li>

          <li className="mb-4">
            <span className="font-semibold">Changes to this document</span>: <br />
            <ul className="mb-4 list-disc">
              <li className="mb-4">
                  We may update this Privacy Policy from time to time. We will notify you
                of any significant changes.
              </li>
            </ul>
            
          </li>
        </ol>
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
