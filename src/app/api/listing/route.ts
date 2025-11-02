import {NextRequest, NextResponse} from "next/server";
import {auth} from "@clerk/nextjs";
import {ListingResponse, CreateListing, EditListing, convertToPrice, parseSplitDate} from "@/lib/utils";
import {redis, KEYS, generateListingId} from "@/lib/redis";
import { differenceInDays } from "date-fns";

export async function POST(req: NextRequest) {
    try {
        const json = await req.json() as CreateListing;
        console.log(json);
        const {userId} = auth();
        
        if (!userId) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        // Generate a unique listing ID
        const listingId = generateListingId();

        // Calculate days and price
        const fromDate = parseSplitDate(json.fromdate);
        const toDate = parseSplitDate(json.todate);
        const days = differenceInDays(toDate, fromDate) + 1;
        const price = convertToPrice(fromDate, toDate);

        // Create the listing object
        const listing: ListingResponse = {
            listing_id: listingId,
            user_id: userId,
            owner_id: userId,
            spot_number: json.spot_number,
            lot: json.lot,
            fromdate: json.fromdate,
            todate: json.todate,
            days: days,
            price: price,
            views: 0,
            sold: false,
            bought: null,
            buyer_id: null,
            date_bought: null,
        };

        // Store the listing in Redis
        await redis.set(KEYS.LISTING(listingId), JSON.stringify(listing));
        
        // Add listing ID to the all listings set
        await redis.sadd(KEYS.LISTINGS_ALL, listingId);
        
        // Add listing ID to user's listings set
        await redis.sadd(KEYS.USER_LISTINGS(userId), listingId);

        return NextResponse.json(listing, {status: 201});
    } catch (error) {
        console.error("Error creating listing:", error);
        return NextResponse.json({error: "Failed to create listing"}, {status: 500});
    }
}

export async function GET() {
    try {
        const {userId} = auth();
        
        // Get all listing IDs
        const listingIds = await redis.smembers(KEYS.LISTINGS_ALL) as string[];
        
        if (!listingIds || listingIds.length === 0) {
            return NextResponse.json([], {status: 200});
        }

        // Fetch all listings
        const listings: ListingResponse[] = [];
        for (const id of listingIds) {
            const listingData = await redis.get(KEYS.LISTING(id));
            if (listingData) {
                const listing = typeof listingData === 'string' 
                    ? JSON.parse(listingData) 
                    : listingData as ListingResponse;
                listings.push(listing);
            }
        }

        // Filter out sold listings and listings owned by current user
        const filtered = listings.filter((l) => !l.sold && l.owner_id !== userId);
        
        return NextResponse.json(filtered, {status: 200});
    } catch (error) {
        console.error("Error fetching listings:", error);
        return NextResponse.json({error: "Failed to fetch listings"}, {status: 500});
    }
}

export async function PUT(req: NextRequest) {
    try {
        const json = await req.json() as EditListing;
        const {searchParams} = new URL(req.url);
        const listingId = searchParams.get("listing_id");
        const {userId} = auth();

        if (!listingId) {
            return NextResponse.json({error: "Listing ID required"}, {status: 400});
        }

        if (!userId) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        // Get the existing listing
        const existingData = await redis.get(KEYS.LISTING(listingId));
        if (!existingData) {
            return NextResponse.json({error: "Listing not found"}, {status: 404});
        }

        const listing = typeof existingData === 'string' 
            ? JSON.parse(existingData) 
            : existingData as ListingResponse;

        // Verify ownership
        if (listing.owner_id !== userId) {
            return NextResponse.json({error: "Forbidden"}, {status: 403});
        }

        // Update the listing
        const fromDate = parseSplitDate(json.fromdate);
        const toDate = parseSplitDate(json.todate);
        const days = differenceInDays(toDate, fromDate) + 1;
        const price = convertToPrice(fromDate, toDate);

        const updatedListing: ListingResponse = {
            ...listing,
            fromdate: json.fromdate,
            todate: json.todate,
            days: days,
            price: price,
        };

        await redis.set(KEYS.LISTING(listingId), JSON.stringify(updatedListing));

        return NextResponse.json(updatedListing, {status: 200});
    } catch (error) {
        console.error("Error updating listing:", error);
        return NextResponse.json({error: "Failed to update listing"}, {status: 500});
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url);
        const listingId = searchParams.get("listing_id");
        const {userId} = auth();

        if (!listingId) {
            return NextResponse.json({error: "Listing ID required"}, {status: 400});
        }

        if (!userId) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        // Get the existing listing to verify ownership
        const existingData = await redis.get(KEYS.LISTING(listingId));
        if (!existingData) {
            return NextResponse.json({error: "Listing not found"}, {status: 404});
        }

        const listing = typeof existingData === 'string' 
            ? JSON.parse(existingData) 
            : existingData as ListingResponse;

        // Verify ownership
        if (listing.owner_id !== userId) {
            return NextResponse.json({error: "Forbidden"}, {status: 403});
        }

        // Delete the listing
        await redis.del(KEYS.LISTING(listingId));
        
        // Remove from all listings set
        await redis.srem(KEYS.LISTINGS_ALL, listingId);
        
        // Remove from user's listings set
        await redis.srem(KEYS.USER_LISTINGS(userId), listingId);

        return NextResponse.json({success: true}, {status: 200});
    } catch (error) {
        console.error("Error deleting listing:", error);
        return NextResponse.json({error: "Failed to delete listing"}, {status: 500});
    }
}
