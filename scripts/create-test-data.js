/**
 * Create Test Data in Upstash
 * 
 * This script creates sample parking spot listings to test the admin dashboard
 */

const https = require('https');

require('dotenv').config({ path: '.env.local' });

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error('❌ UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
  process.exit(1);
}

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

const TEST_LISTINGS = [
  {
    lot: "WAC",
    spot_number: 42,
    fromdate: "2024-11-04",
    todate: "2024-11-08",
    days: 5,
    price: 20.00,
    sold: true,
    buyer_id: "test_buyer_1"
  },
  {
    lot: "PAC",
    spot_number: 15,
    fromdate: "2024-11-05",
    todate: "2024-11-09",
    days: 5,
    price: 18.25,
    sold: false,
    buyer_id: null
  },
  {
    lot: "Tennis Courts",
    spot_number: 8,
    fromdate: "2024-11-06",
    todate: "2024-11-13",
    days: 8,
    price: 30.00,
    sold: true,
    buyer_id: "test_buyer_2"
  },
  {
    lot: "Stadium",
    spot_number: 103,
    fromdate: "2024-11-07",
    todate: "2024-11-11",
    days: 5,
    price: 20.00,
    sold: false,
    buyer_id: null
  },
  {
    lot: "WAC",
    spot_number: 25,
    fromdate: "2024-11-08",
    todate: "2024-11-15",
    days: 8,
    price: 30.00,
    sold: true,
    buyer_id: "test_buyer_3"
  },
  {
    lot: "PAC",
    spot_number: 67,
    fromdate: "2024-11-10",
    todate: "2024-11-12",
    days: 3,
    price: 12.25,
    sold: false,
    buyer_id: null
  },
];

async function createTestData() {
  console.log('🚀 Creating Test Data in Upstash...\n');
  console.log('='.repeat(70));

  try {
    let created = 0;

    for (const testListing of TEST_LISTINGS) {
      // Generate listing ID with current timestamp
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 9);
      const listingId = `${timestamp}-${randomStr}`;

      const listing = {
        listing_id: listingId,
        user_id: "test_user_1",
        owner_id: "test_user_1",
        spot_number: testListing.spot_number,
        lot: testListing.lot,
        fromdate: testListing.fromdate,
        todate: testListing.todate,
        days: testListing.days,
        price: testListing.price,
        views: Math.floor(Math.random() * 50) + 10, // Random views 10-60
        sold: testListing.sold,
        bought: testListing.sold ? true : null,
        buyer_id: testListing.buyer_id,
        date_bought: testListing.sold ? "2024-11-02" : null,
      };

      // Store the listing
      await redis(['SET', `listing:${listingId}`, JSON.stringify(listing)]);

      // Add to listings:all set
      await redis(['SADD', 'listings:all', listingId]);

      // Add to user's listings
      await redis(['SADD', `user:test_user_1:listings`, listingId]);

      // If sold, add to buyer's purchased
      if (listing.sold && listing.buyer_id) {
        await redis(['SADD', `user:${listing.buyer_id}:purchased`, listingId]);
      }

      created++;
      const status = listing.sold ? '💰 SOLD' : '📍 ACTIVE';
      console.log(`✅ Created: ${status} ${listing.lot} Spot #${listing.spot_number} - $${listing.price}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n🎉 Successfully created ${created} test listings!\n`);

    // Show stats
    console.log('📊 Summary:');
    const listingIds = await redis(['SMEMBERS', 'listings:all']);
    console.log(`   Total listings in database: ${listingIds.length}`);

    let activeCount = 0;
    let soldCount = 0;
    let totalRevenue = 0;

    for (const id of listingIds) {
      const data = await redis(['GET', `listing:${id}`]);
      if (data) {
        const listing = JSON.parse(data);
        if (listing.sold) {
          soldCount++;
          totalRevenue += listing.price;
        } else {
          activeCount++;
        }
      }
    }

    console.log(`   Active listings: ${activeCount}`);
    console.log(`   Sold listings: ${soldCount}`);
    console.log(`   Total revenue: $${totalRevenue.toFixed(2)}`);

    console.log('\n✅ Next steps:');
    console.log('   1. Refresh your admin dashboard');
    console.log('   2. You should now see listings and revenue!');
    console.log('   3. Run: node scripts/check-upstash-data.js to verify\n');

  } catch (error) {
    console.error('\n❌ Error creating test data:', error.message);
  }
}

createTestData();

