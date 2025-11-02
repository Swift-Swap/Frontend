/**
 * Check Upstash Data
 * 
 * This script checks if you have any data in Upstash and helps debug
 * why you might be seeing 0 listings.
 */

const https = require('https');

require('dotenv').config({ path: '.env.local' });

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error('❌ UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in .env.local');
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

async function checkData() {
  console.log('🔍 Checking Upstash Data...\n');
  console.log('='.repeat(70));

  try {
    // Test connection
    console.log('1️⃣  Testing connection...');
    const ping = await redis(['PING']);
    if (ping === 'PONG') {
      console.log('   ✅ Connection successful!\n');
    } else {
      console.log('   ⚠️  Unexpected response:', ping, '\n');
    }

    // Check database size
    console.log('2️⃣  Checking database size...');
    const dbsize = await redis(['DBSIZE']);
    console.log(`   Total keys in database: ${dbsize}\n`);

    // Check listings:all set
    console.log('3️⃣  Checking listings:all set...');
    const listingCount = await redis(['SCARD', 'listings:all']);
    console.log(`   Listing IDs in set: ${listingCount}`);
    
    if (listingCount === 0) {
      console.log('   ⚠️  NO LISTING IDs FOUND! This is why you see 0 listings.\n');
    } else {
      console.log(`   ✅ Found ${listingCount} listing IDs\n`);
    }

    // Get the listing IDs
    if (listingCount > 0) {
      console.log('4️⃣  Getting listing IDs...');
      const listingIds = await redis(['SMEMBERS', 'listings:all']);
      console.log(`   IDs: ${JSON.stringify(listingIds, null, 2)}\n`);

      // Check a sample listing
      console.log('5️⃣  Checking first listing data...');
      const firstId = listingIds[0];
      const listingData = await redis(['GET', `listing:${firstId}`]);
      
      if (listingData) {
        const listing = JSON.parse(listingData);
        console.log('   ✅ Sample listing:');
        console.log(`      ID: ${listing.listing_id}`);
        console.log(`      Spot: ${listing.lot} #${listing.spot_number}`);
        console.log(`      Price: $${listing.price}`);
        console.log(`      Sold: ${listing.sold}`);
        console.log(`      Views: ${listing.views}\n`);
      } else {
        console.log('   ❌ Listing data not found!\n');
      }
    }

    // Check all keys in database
    console.log('6️⃣  Checking all keys in database...');
    const allKeys = await redis(['KEYS', '*']);
    if (allKeys && allKeys.length > 0) {
      console.log(`   Found ${allKeys.length} total keys:`);
      allKeys.slice(0, 10).forEach(key => {
        console.log(`      - ${key}`);
      });
      if (allKeys.length > 10) {
        console.log(`      ... and ${allKeys.length - 10} more`);
      }
      console.log('');
    } else {
      console.log('   ❌ NO KEYS FOUND IN DATABASE!\n');
    }

    console.log('='.repeat(70));
    console.log('\n📋 DIAGNOSIS:\n');

    if (dbsize === 0) {
      console.log('❌ Your Upstash database is EMPTY.');
      console.log('\n💡 SOLUTIONS:');
      console.log('   Option 1: Create a new listing in your app');
      console.log('             - Go to http://localhost:3000');
      console.log('             - Sign in');
      console.log('             - Create a new parking spot listing');
      console.log('');
      console.log('   Option 2: Migrate data from Lambda (if you have old data)');
      console.log('             - Make sure API_KEY is in .env.local');
      console.log('             - Run: node scripts/migrate-to-upstash.js');
      console.log('');
      console.log('   Option 3: Create test data');
      console.log('             - Run: node scripts/create-test-data.js');
      console.log('');
    } else if (listingCount === 0) {
      console.log('⚠️  Database has keys, but NO listings.');
      console.log(`   Found ${dbsize} keys, but none are listings.`);
      console.log('\n💡 SOLUTION: Create a listing through the app UI.');
      console.log('');
    } else {
      console.log('✅ Database looks good!');
      console.log(`   Found ${listingCount} listings.`);
      console.log('\n💡 If you still see 0 in admin panel:');
      console.log('   - Clear your browser cache');
      console.log('   - Check browser console for errors');
      console.log('   - Verify you are logged in as admin');
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - UPSTASH_REDIS_REST_URL is set correctly in .env.local');
    console.log('   - UPSTASH_REDIS_REST_TOKEN is set correctly in .env.local');
    console.log('   - You copied from the "REST API" tab (not Details tab)');
  }
}

checkData();

