/**
 * Migration Script: Lambda to Upstash
 * 
 * This script helps migrate parking spot listings from the old AWS Lambda
 * backend to the new Upstash Redis database.
 * 
 * Usage:
 *   node scripts/migrate-to-upstash.js
 * 
 * Prerequisites:
 *   - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local
 *   - API_KEY for Lambda access in .env.local
 *   - Node.js 18+ installed
 */

const https = require('https');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const LAMBDA_URL = 'https://sppeb237h3wyc2s47q44lubmli0ijory.lambda-url.us-east-2.on.aws';
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const API_KEY = process.env.API_KEY;

// Check if required environment variables are set
if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error('❌ Error: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in .env.local');
  process.exit(1);
}

if (!API_KEY) {
  console.error('⚠️  Warning: API_KEY not set. Lambda access may fail.');
}

/**
 * Fetch all listings from Lambda backend
 */
async function fetchFromLambda() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(LAMBDA_URL).hostname,
      path: '/api/v1/listings',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Lambda returned status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Execute Redis command via Upstash REST API
 */
async function upstashCommand(command, ...args) {
  return new Promise((resolve, reject) => {
    const url = new URL('/pipeline', UPSTASH_URL);
    const body = JSON.stringify([[command, ...args]]);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          resolve(result[0]?.result);
        } else {
          reject(new Error(`Upstash returned status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Store a listing in Upstash Redis
 */
async function storeListing(listing) {
  const listingId = listing.listing_id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const userId = listing.owner_id || listing.user_id;

  // Store the listing
  await upstashCommand('SET', `listing:${listingId}`, JSON.stringify({
    ...listing,
    listing_id: listingId,
  }));

  // Add to listings:all set
  await upstashCommand('SADD', 'listings:all', listingId);

  // Add to user's listings
  if (userId) {
    await upstashCommand('SADD', `user:${userId}:listings`, listingId);
  }

  // If sold, add to buyer's purchased
  if (listing.sold && listing.buyer_id) {
    await upstashCommand('SADD', `user:${listing.buyer_id}:purchased`, listingId);
  }

  return listingId;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting migration from Lambda to Upstash...\n');

  try {
    // Step 1: Fetch data from Lambda
    console.log('📥 Fetching listings from Lambda backend...');
    const listings = await fetchFromLambda();
    console.log(`✅ Found ${listings.length} listings\n`);

    if (listings.length === 0) {
      console.log('ℹ️  No listings to migrate. Exiting.');
      return;
    }

    // Step 2: Store in Upstash
    console.log('💾 Storing listings in Upstash Redis...');
    let successCount = 0;
    let errorCount = 0;

    for (const listing of listings) {
      try {
        const listingId = await storeListing(listing);
        successCount++;
        console.log(`  ✓ Migrated listing ${listingId} (${listing.lot} #${listing.spot_number})`);
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Failed to migrate listing:`, error.message);
      }
    }

    // Step 3: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Total listings: ${listings.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (successCount === listings.length) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('⚠️  Migration completed with some errors. Please review the output above.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Verify migration
 */
async function verify() {
  console.log('\n🔍 Verifying migration...');

  try {
    const allListings = await upstashCommand('SMEMBERS', 'listings:all');
    console.log(`✅ Found ${allListings ? allListings.length : 0} listings in Upstash`);

    if (allListings && allListings.length > 0) {
      // Sample a few listings to verify data integrity
      const sampleId = allListings[0];
      const sampleData = await upstashCommand('GET', `listing:${sampleId}`);
      console.log(`\n📝 Sample listing data:`);
      console.log(JSON.parse(sampleData));
    }
  } catch (error) {
    console.error('⚠️  Verification failed:', error.message);
  }
}

// Run migration
migrate()
  .then(() => verify())
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

