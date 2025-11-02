import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Key prefixes for organized data storage
export const KEYS = {
  LISTING: (id: string) => `listing:${id}`,
  LISTINGS_ALL: 'listings:all',
  USER_LISTINGS: (userId: string) => `user:${userId}:listings`,
  USER_PURCHASED: (userId: string) => `user:${userId}:purchased`,
  LISTING_VIEWS: (id: string) => `listing:${id}:views`,
  STATS: 'stats',
} as const;

// Helper function to generate unique listing IDs
export function generateListingId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

