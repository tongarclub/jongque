#!/usr/bin/env node

/**
 * Vercel Login Diagnostic Script
 * Helps diagnose why login is failing on Vercel production
 */

const https = require('https');

console.log('🔍 Diagnosing Vercel Login Issues...\n');

// Function to make HTTPS request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function diagnose() {
  const baseUrl = 'https://jongque.vercel.app';
  
  console.log('📊 Testing Production Endpoints:\n');
  
  // Test 1: Check API auth status
  try {
    console.log('1. 🔐 Testing Authentication API...');
    const authStatus = await makeRequest(`${baseUrl}/api/auth/status`);
    console.log(`   Status: ${authStatus.status}`);
    
    if (authStatus.data && typeof authStatus.data === 'object') {
      console.log('   Database Connected:', authStatus.data.database?.connected);
      console.log('   Admin User Exists:', authStatus.data.database?.adminExists);
      console.log('   NextAuth URL:', authStatus.data.environment?.nextauthUrl);
      console.log('   Has NextAuth Secret:', authStatus.data.environment?.hasNextauthSecret);
      console.log('   Has Database URL:', authStatus.data.environment?.hasDatabaseUrl);
    } else {
      console.log('   Response:', authStatus.data);
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    console.log('');
  }

  // Test 2: Check debug auth page
  try {
    console.log('2. 🐛 Testing Debug Auth Page...');
    const debugAuth = await makeRequest(`${baseUrl}/debug-auth`);
    console.log(`   Status: ${debugAuth.status}`);
    
    if (debugAuth.status === 200) {
      console.log('   ✅ Debug auth page accessible');
    } else {
      console.log('   ❌ Debug auth page not accessible');
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    console.log('');
  }

  // Test 3: Check if main page loads
  try {
    console.log('3. 🏠 Testing Main Page...');
    const mainPage = await makeRequest(`${baseUrl}/`);
    console.log(`   Status: ${mainPage.status}`);
    
    if (mainPage.status === 200) {
      console.log('   ✅ Main page accessible');
    } else {
      console.log('   ❌ Main page not accessible');
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    console.log('');
  }

  console.log('🔧 Recommended Actions:');
  console.log('');
  console.log('1. **Check Database Connection**');
  console.log('   • Visit: https://jongque.vercel.app/api/auth/status');
  console.log('   • Should show database: { connected: true, adminExists: true }');
  console.log('');
  console.log('2. **Update Environment Variables**');
  console.log('   • Go to Vercel Dashboard → jongque → Settings → Environment Variables');
  console.log('   • Update DATABASE_URL to a proper production PostgreSQL URL');
  console.log('   • Ensure NEXTAUTH_URL = "https://jongque.vercel.app"');
  console.log('');
  console.log('3. **Create Production Database**');
  console.log('   • Use Neon (free): https://neon.tech');
  console.log('   • Create project "jongque"');
  console.log('   • Copy connection string to DATABASE_URL in Vercel');
  console.log('');
  console.log('4. **Setup Production Data**');
  console.log('   • After updating DATABASE_URL, redeploy: vercel --prod');
  console.log('   • Run: npm run prod:db:setup');
  console.log('');
  console.log('5. **Test Login**');
  console.log('   • Go to: https://jongque.vercel.app/test-auth');
  console.log('   • Try: admin@jongque.com / admin123');
  console.log('');
  console.log('🔗 Useful Links:');
  console.log('   • Vercel Dashboard: https://vercel.com/dashboard');
  console.log('   • Neon Database: https://neon.tech');
  console.log('   • Debug Auth: https://jongque.vercel.app/debug-auth');
  console.log('   • API Status: https://jongque.vercel.app/api/auth/status');
}

diagnose().catch(console.error);
