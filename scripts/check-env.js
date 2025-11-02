/**
 * Environment Variables Checker
 * 
 * This script verifies that your .env.local file is configured correctly
 * for Upstash Redis integration.
 * 
 * Usage: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Environment Configuration...\n');
console.log('='.repeat(60));

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ ERROR: .env.local file not found!');
  console.log('\n📝 To fix this:');
  console.log('   1. Copy env.template to .env.local');
  console.log('   2. Fill in your actual values');
  console.log('\n   PowerShell:');
  console.log('   Copy-Item env.template .env.local\n');
  process.exit(1);
}

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) {
      envVars[key.trim()] = value;
    }
  }
});

// Check required variables
const checks = [
  {
    name: 'Clerk Publishable Key',
    key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    required: true,
    validate: (v) => v.startsWith('pk_'),
    hint: 'Should start with "pk_"'
  },
  {
    name: 'Clerk Secret Key',
    key: 'CLERK_SECRET_KEY',
    required: true,
    validate: (v) => v.startsWith('sk_'),
    hint: 'Should start with "sk_"'
  },
  {
    name: 'Upstash Redis REST URL',
    key: 'UPSTASH_REDIS_REST_URL',
    required: true,
    validate: (v) => v.startsWith('https://') && v.includes('upstash.io'),
    hint: 'Should be like: https://loving-egret-29194.upstash.io'
  },
  {
    name: 'Upstash Redis REST Token',
    key: 'UPSTASH_REDIS_REST_TOKEN',
    required: true,
    validate: (v) => v.startsWith('AX') && v.length > 50,
    hint: 'Should start with "AX" and be 100+ characters long'
  },
  {
    name: 'Upstash Metrics REST URL',
    key: 'UPSTASH_METRICS_REST_URL',
    required: false,
    validate: (v) => v.startsWith('https://') && v.includes('upstash.io'),
    hint: 'Optional - Should be like: https://probable-doe-29198.upstash.io'
  },
  {
    name: 'Upstash Metrics REST Token',
    key: 'UPSTASH_METRICS_REST_TOKEN',
    required: false,
    validate: (v) => v.startsWith('AX') && v.length > 50,
    hint: 'Optional - Should start with "AX" and be 100+ characters long'
  }
];

let allGood = true;
let warnings = 0;

checks.forEach(check => {
  const value = envVars[check.key];
  
  if (!value || value.includes('xxxxx') || value.includes('your_')) {
    if (check.required) {
      console.log(`❌ ${check.name}`);
      console.log(`   Variable: ${check.key}`);
      console.log(`   Status: MISSING or using template value`);
      console.log(`   Hint: ${check.hint}\n`);
      allGood = false;
    } else {
      console.log(`⚠️  ${check.name}`);
      console.log(`   Variable: ${check.key}`);
      console.log(`   Status: Not configured (optional)\n`);
      warnings++;
    }
  } else if (!check.validate(value)) {
    console.log(`⚠️  ${check.name}`);
    console.log(`   Variable: ${check.key}`);
    console.log(`   Status: Set but format looks wrong`);
    console.log(`   Current: ${value.substring(0, 50)}...`);
    console.log(`   Hint: ${check.hint}\n`);
    if (check.required) {
      allGood = false;
    } else {
      warnings++;
    }
  } else {
    console.log(`✅ ${check.name}`);
    console.log(`   Variable: ${check.key}`);
    console.log(`   Value: ${value.substring(0, 30)}...`);
    console.log(`   Status: OK\n`);
  }
});

console.log('='.repeat(60));

if (allGood && warnings === 0) {
  console.log('\n🎉 All environment variables are configured correctly!');
  console.log('\n✅ Next steps:');
  console.log('   1. Run: node scripts/upstash-utils.js test');
  console.log('   2. If test passes, run: npm run dev\n');
} else if (allGood && warnings > 0) {
  console.log('\n✅ Required variables are configured correctly!');
  console.log(`⚠️  ${warnings} optional variable(s) not configured.`);
  console.log('\n✅ Next steps:');
  console.log('   1. Run: node scripts/upstash-utils.js test');
  console.log('   2. If test passes, run: npm run dev\n');
} else {
  console.log('\n❌ Some required variables are missing or incorrect.');
  console.log('\n📚 How to fix:');
  console.log('   1. Read: YOUR_UPSTASH_SETUP.md');
  console.log('   2. Get REST API credentials from Upstash Console');
  console.log('   3. Update .env.local with the correct values');
  console.log('   4. Run this script again: node scripts/check-env.js\n');
  
  console.log('⚠️  IMPORTANT: You need REST API credentials!');
  console.log('   - Go to: https://console.upstash.com/');
  console.log('   - Click on your database');
  console.log('   - Click the "REST API" tab (not "Details")');
  console.log('   - Copy UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN\n');
  
  process.exit(1);
}

