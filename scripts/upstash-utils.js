/**
 * Upstash Database Utilities
 * 
 * Utility functions for managing the Upstash Redis database.
 * 
 * Usage:
 *   node scripts/upstash-utils.js <command>
 * 
 * Commands:
 *   stats       - Show database statistics
 *   cleanup     - Remove orphaned keys and inconsistent data
 *   list        - List all listings
 *   clear       - Clear all listing data (USE WITH CAUTION!)
 *   test        - Test connection to Upstash
 */

const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error('❌ Error: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
  process.exit(1);
}

/**
 * Execute Redis command via Upstash REST API
 */
async function redis(...commands) {
  return new Promise((resolve, reject) => {
    const url = new URL('/pipeline', UPSTASH_URL);
    const body = JSON.stringify(commands.map(cmd => Array.isArray(cmd) ? cmd : [cmd]));

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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const results = JSON.parse(data);
          resolve(commands.length === 1 ? results[0]?.result : results.map(r => r?.result));
        } else {
          reject(new Error(`Upstash error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Test database connection
 */
async function testConnection() {
  console.log('🔌 Testing Upstash connection...\n');
  
  try {
    const result = await redis(['PING']);
    if (result === 'PONG') {
      console.log('✅ Connection successful!\n');
      console.log(`📍 Endpoint: ${UPSTASH_URL}`);
      return true;
    } else {
      console.log('⚠️  Unexpected response:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

/**
 * Get database statistics
 */
async function getStats() {
  console.log('📊 Database Statistics\n');
  console.log('='.repeat(60));

  try {
    const [allListings, dbSize] = await redis(
      ['SCARD', 'listings:all'],
      ['DBSIZE']
    );

    console.log(`Total listings: ${allListings || 0}`);
    console.log(`Total keys in database: ${dbSize || 0}`);

    // Get all listing IDs and check sold status
    const listingIds = await redis(['SMEMBERS', 'listings:all']);
    
    if (listingIds && listingIds.length > 0) {
      const listings = await Promise.all(
        listingIds.map(id => redis(['GET', `listing:${id}`]))
      );

      const parsed = listings
        .filter(l => l)
        .map(l => JSON.parse(l));

      const soldCount = parsed.filter(l => l.sold).length;
      const activeCount = parsed.filter(l => !l.sold).length;
      
      console.log(`Active listings: ${activeCount}`);
      console.log(`Sold listings: ${soldCount}`);

      // Calculate total revenue
      const revenue = parsed
        .filter(l => l.sold)
        .reduce((sum, l) => sum + (l.price || 0), 0);
      
      console.log(`Total revenue: $${revenue.toFixed(2)}`);

      // Parking lot breakdown
      const lotCounts = parsed.reduce((acc, l) => {
        acc[l.lot] = (acc[l.lot] || 0) + 1;
        return acc;
      }, {});

      console.log('\nListings by parking lot:');
      Object.entries(lotCounts).forEach(([lot, count]) => {
        console.log(`  ${lot}: ${count}`);
      });
    }

    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Error fetching stats:', error.message);
  }
}

/**
 * List all listings
 */
async function listListings() {
  console.log('📋 All Listings\n');
  
  try {
    const listingIds = await redis(['SMEMBERS', 'listings:all']);
    
    if (!listingIds || listingIds.length === 0) {
      console.log('No listings found.\n');
      return;
    }

    const listings = await Promise.all(
      listingIds.map(id => redis(['GET', `listing:${id}`]))
    );

    const parsed = listings
      .filter(l => l)
      .map(l => JSON.parse(l))
      .sort((a, b) => new Date(b.fromdate) - new Date(a.fromdate));

    parsed.forEach((listing, index) => {
      console.log(`${index + 1}. [${listing.sold ? 'SOLD' : 'ACTIVE'}] ${listing.lot} #${listing.spot_number}`);
      console.log(`   ID: ${listing.listing_id}`);
      console.log(`   Dates: ${listing.fromdate} to ${listing.todate} (${listing.days} days)`);
      console.log(`   Price: $${listing.price}`);
      console.log(`   Views: ${listing.views}`);
      console.log(`   Owner: ${listing.owner_id}`);
      if (listing.sold) {
        console.log(`   Buyer: ${listing.buyer_id}`);
        console.log(`   Date Bought: ${listing.date_bought}`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listing listings:', error.message);
  }
}

/**
 * Cleanup orphaned keys and fix inconsistencies
 */
async function cleanup() {
  console.log('🧹 Cleaning up database...\n');

  try {
    const listingIds = await redis(['SMEMBERS', 'listings:all']);
    
    if (!listingIds || listingIds.length === 0) {
      console.log('No listings to clean up.\n');
      return;
    }

    let orphanedCount = 0;
    let fixedCount = 0;

    for (const id of listingIds) {
      const listing = await redis(['GET', `listing:${id}`]);
      
      // Remove orphaned listing IDs (no associated listing data)
      if (!listing) {
        await redis(['SREM', 'listings:all', id]);
        orphanedCount++;
        console.log(`  ✓ Removed orphaned listing ID: ${id}`);
        continue;
      }

      const parsed = JSON.parse(listing);

      // Ensure listing is in user's listings set
      if (parsed.owner_id) {
        const added = await redis(['SADD', `user:${parsed.owner_id}:listings`, id]);
        if (added === 1) {
          fixedCount++;
          console.log(`  ✓ Added listing ${id} to user ${parsed.owner_id}'s listings`);
        }
      }

      // Ensure sold listings are in buyer's purchased set
      if (parsed.sold && parsed.buyer_id) {
        const added = await redis(['SADD', `user:${parsed.buyer_id}:purchased`, id]);
        if (added === 1) {
          fixedCount++;
          console.log(`  ✓ Added listing ${id} to buyer ${parsed.buyer_id}'s purchases`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Cleanup complete:`);
    console.log(`  Orphaned IDs removed: ${orphanedCount}`);
    console.log(`  Inconsistencies fixed: ${fixedCount}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

/**
 * Clear all listing data (DANGEROUS!)
 */
async function clearAll() {
  console.log('⚠️  WARNING: This will delete ALL listing data!\n');
  
  // Require confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('Type "DELETE ALL DATA" to confirm: ', async (answer) => {
    readline.close();

    if (answer !== 'DELETE ALL DATA') {
      console.log('\n❌ Cancelled. No data was deleted.\n');
      return;
    }

    try {
      console.log('\n🗑️  Deleting all listing data...\n');

      const listingIds = await redis(['SMEMBERS', 'listings:all']);
      
      if (!listingIds || listingIds.length === 0) {
        console.log('No listings to delete.\n');
        return;
      }

      // Delete all listing keys
      for (const id of listingIds) {
        await redis(['DEL', `listing:${id}`]);
      }

      // Delete the listings:all set
      await redis(['DEL', 'listings:all']);

      // Get all keys matching user patterns and delete them
      const userKeys = await redis(['KEYS', 'user:*']);
      if (userKeys && userKeys.length > 0) {
        for (const key of userKeys) {
          await redis(['DEL', key]);
        }
      }

      console.log(`✅ Deleted ${listingIds.length} listings and all associated data.\n`);
    } catch (error) {
      console.error('❌ Error clearing data:', error.message);
    }
  });
}

// Command dispatcher
const command = process.argv[2];

switch (command) {
  case 'test':
    testConnection();
    break;
  case 'stats':
    getStats();
    break;
  case 'list':
    listListings();
    break;
  case 'cleanup':
    cleanup();
    break;
  case 'clear':
    clearAll();
    break;
  default:
    console.log('Upstash Database Utilities\n');
    console.log('Usage: node scripts/upstash-utils.js <command>\n');
    console.log('Commands:');
    console.log('  test       - Test connection to Upstash');
    console.log('  stats      - Show database statistics');
    console.log('  list       - List all listings');
    console.log('  cleanup    - Remove orphaned keys and fix inconsistencies');
    console.log('  clear      - Clear all listing data (USE WITH CAUTION!)');
    console.log('');
}

