#!/usr/bin/env node

/**
 * Facebook OAuth Configuration Test Script
 * 
 * This script checks if Facebook OAuth is properly configured
 * and provides helpful debugging information.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Facebook OAuth Configuration Test\n');

// Check for environment files
const envFiles = ['.env.local', '.env', '.env.development'];
let envFound = false;

console.log('📁 Checking environment files:');
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file} - Found`);
    envFound = true;
  } else {
    console.log(`  ❌ ${file} - Not found`);
  }
});

if (!envFound) {
  console.log('\n⚠️  No environment files found. Create .env.local with your Facebook OAuth credentials.\n');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.development' });

console.log('\n🔑 Facebook OAuth Environment Variables:');

const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
const nextauthUrl = process.env.NEXTAUTH_URL;
const nextauthSecret = process.env.NEXTAUTH_SECRET;

// Check Facebook Client ID
if (facebookClientId) {
  console.log(`  ✅ FACEBOOK_CLIENT_ID: ${facebookClientId.substring(0, 8)}...${facebookClientId.substring(facebookClientId.length - 4)} (${facebookClientId.length} chars)`);
} else {
  console.log('  ❌ FACEBOOK_CLIENT_ID: Missing');
}

// Check Facebook Client Secret
if (facebookClientSecret) {
  console.log(`  ✅ FACEBOOK_CLIENT_SECRET: ${facebookClientSecret.substring(0, 8)}...${facebookClientSecret.substring(facebookClientSecret.length - 4)} (${facebookClientSecret.length} chars)`);
} else {
  console.log('  ❌ FACEBOOK_CLIENT_SECRET: Missing');
}

// Check NextAuth URL
if (nextauthUrl) {
  console.log(`  ✅ NEXTAUTH_URL: ${nextauthUrl}`);
} else {
  console.log('  ❌ NEXTAUTH_URL: Missing');
}

// Check NextAuth Secret
if (nextauthSecret) {
  console.log(`  ✅ NEXTAUTH_SECRET: ${nextauthSecret.substring(0, 8)}...${nextauthSecret.substring(nextauthSecret.length - 4)} (${nextauthSecret.length} chars)`);
} else {
  console.log('  ❌ NEXTAUTH_SECRET: Missing');
}

console.log('\n🔗 Expected OAuth Callback URLs:');
if (nextauthUrl) {
  const baseUrl = nextauthUrl.replace(/\/$/, '');
  console.log(`  📱 Development: ${baseUrl}/api/auth/callback/facebook`);
} else {
  console.log('  📱 Development: http://localhost:3000/api/auth/callback/facebook');
}
console.log('  🌐 Production: https://yourdomain.com/api/auth/callback/facebook');

console.log('\n📋 Configuration Checklist:');

const checks = [
  {
    name: 'Facebook App Created',
    status: facebookClientId ? 'done' : 'todo',
    description: 'Create app at https://developers.facebook.com/'
  },
  {
    name: 'Facebook Login Product Added',
    status: facebookClientId && facebookClientSecret ? 'done' : 'todo',
    description: 'Add Facebook Login product to your app'
  },
  {
    name: 'OAuth Redirect URIs Configured',
    status: 'manual',
    description: 'Add callback URLs in Facebook Login settings'
  },
  {
    name: 'Environment Variables Set',
    status: facebookClientId && facebookClientSecret ? 'done' : 'todo',
    description: 'Add FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to .env.local'
  },
  {
    name: 'NextAuth Configuration',
    status: nextauthUrl && nextauthSecret ? 'done' : 'todo',
    description: 'Set NEXTAUTH_URL and NEXTAUTH_SECRET'
  }
];

checks.forEach(check => {
  const icon = check.status === 'done' ? '✅' : check.status === 'manual' ? '📋' : '❌';
  console.log(`  ${icon} ${check.name}: ${check.description}`);
});

console.log('\n🧪 Testing Instructions:');
console.log('1. Ensure all environment variables are set');
console.log('2. Restart your development server: npm run dev');
console.log('3. Visit: http://localhost:3000/test-facebook-oauth');
console.log('4. Click "Sign in with Facebook" to test the integration');

console.log('\n📚 Documentation:');
console.log('- Setup Guide: FACEBOOK-OAUTH-SETUP.md');
console.log('- Facebook Developers: https://developers.facebook.com/');
console.log('- NextAuth.js Docs: https://next-auth.js.org/providers/facebook');

// Validation summary
const missingVars = [];
if (!facebookClientId) missingVars.push('FACEBOOK_CLIENT_ID');
if (!facebookClientSecret) missingVars.push('FACEBOOK_CLIENT_SECRET');
if (!nextauthUrl) missingVars.push('NEXTAUTH_URL');
if (!nextauthSecret) missingVars.push('NEXTAUTH_SECRET');

if (missingVars.length === 0) {
  console.log('\n🎉 All required environment variables are configured!');
  console.log('You can now test Facebook OAuth at: http://localhost:3000/test-facebook-oauth');
} else {
  console.log(`\n⚠️  Missing ${missingVars.length} required environment variable(s):`);
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\nAdd these to your .env.local file and restart your server.');
}

console.log('\n' + '='.repeat(60));
