/**
 * Redis Helper Functions
 * 
 * Optimized functions for batch operations with Upstash Redis
 */

import { redis, KEYS } from './redis';
import { ListingResponse } from './utils';

/**
 * Fetch all listings using Redis Pipeline for optimal performance
 * 
 * Uses a single HTTP request to Redis instead of N+1 requests
 * 
 * @returns Array of all listings
 */
export async function getAllListingsOptimized(): Promise<ListingResponse[]> {
  try {
    // Get all listing IDs first
    const listingIds = await redis.smembers(KEYS.LISTINGS_ALL) as string[];
    
    if (!listingIds || listingIds.length === 0) {
      return [];
    }

    console.log(`📊 Fetching ${listingIds.length} listings using pipeline...`);

    // Use pipeline to batch all GET operations into a single HTTP request
    const pipeline = redis.pipeline();
    
    // Add all GET commands to the pipeline
    listingIds.forEach(id => {
      pipeline.get(KEYS.LISTING(id));
    });

    // Execute the pipeline - SINGLE HTTP REQUEST for all listings!
    const results = await pipeline.exec();
    
    console.log(`✅ Retrieved ${results.length} listings in single request`);

    // Parse and filter results
    const listings: ListingResponse[] = results
      .filter((result: any) => result && result !== null)
      .map((result: any) => {
        if (typeof result === 'string') {
          return JSON.parse(result);
        }
        return result as ListingResponse;
      });

    return listings;
  } catch (error) {
    console.error('Error fetching listings with pipeline:', error);
    throw error;
  }
}

/**
 * Calculate admin statistics efficiently
 * 
 * @returns Statistics object
 */
export async function calculateStatsOptimized() {
  const listings = await getAllListingsOptimized();

  let activeListings = 0;
  let soldListings = 0;
  let totalViews = 0;
  let totalRevenue = 0;
  let totalDaysOfParking = 0;

  listings.forEach((listing) => {
    totalViews += listing.views || 0;
    
    if (listing.sold) {
      soldListings++;
      totalRevenue += listing.price || 0;
      totalDaysOfParking += listing.days || 0;
    } else {
      activeListings++;
    }
  });

  return {
    totalListings: listings.length,
    activeListings,
    soldListings,
    totalViews,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalDaysOfParking,
  };
}

