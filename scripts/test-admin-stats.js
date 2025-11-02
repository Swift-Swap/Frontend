/**
 * Test Admin Stats API
 * 
 * Simulates what the admin stats endpoint does
 */

const https = require('https');

require('dotenv').config({ path: '.env.local' });

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

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

async function testStats() {
  console.log('🧪 Testing Admin Stats Calculation...\n');
  console.log('='.repeat(70));

  try {
    // Step 1: Get all listing IDs
    console.log('1️⃣  Getting all listing IDs from listings:all...');
    const listingIds = await redis(['SMEMBERS', 'listings:all']);
    console.log(`   ✅ Found ${listingIds?.length || 0} listing IDs\n`);

    if (!listingIds || listingIds.length === 0) {
      console.log('❌ No listings found! Run: node scripts/create-test-data.js\n');
      return;
    }

    console.log('2️⃣  Fetching all listings in parallel...');
    console.log(`   🔄 Making ${listingIds.length} GET requests...\n`);

    // Step 2: Fetch all listings in parallel (same as admin stats API)
    const listingDataArray = await Promise.all(
      listingIds.map(id => redis(['GET', `listing:${id}`]))
    );

    console.log(`   ✅ Retrieved ${listingDataArray.length} listings\n`);

    // Step 3: Calculate stats (same logic as admin stats route)
    console.log('3️⃣  Calculating statistics...\n');

    let totalListings = 0;
    let activeListings = 0;
    let soldListings = 0;
    let totalViews = 0;
    let totalRevenue = 0;
    let totalDaysOfParking = 0;

    listingDataArray.forEach((listingData) => {
      if (listingData) {
        const listing = typeof listingData === 'string' 
          ? JSON.parse(listingData) 
          : listingData;
        
        totalListings++;
        totalViews += listing.views || 0;
        
        if (listing.sold) {
          soldListings++;
          totalRevenue += listing.price || 0;
          totalDaysOfParking += listing.days || 0;
          console.log(`   💰 SOLD: ${listing.lot} #${listing.spot_number} - $${listing.price}`);
        } else {
          activeListings++;
          console.log(`   📍 ACTIVE: ${listing.lot} #${listing.spot_number} - $${listing.price}`);
        }
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL STATS (what admin dashboard should show):\n');
    
    const stats = {
      totalListings: totalListings,
      activeListings: activeListings,
      soldListings: soldListings,
      totalViews: totalViews,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalDaysOfParking: totalDaysOfParking,
    };

    console.log(JSON.stringify(stats, null, 2));
    
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ If your admin dashboard shows different numbers:');
    console.log('   1. Make sure you\'re logged in as admin');
    console.log('   2. Check browser console for errors');
    console.log('   3. Try hard refresh (Ctrl+Shift+R)');
    console.log('   4. Check server logs for errors\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testStats();

