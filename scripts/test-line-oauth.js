#!/usr/bin/env node

/**
 * LINE OAuth Configuration Test Script
 * 
 * This script checks if LINE Login is properly configured
 * and provides helpful debugging information for Thai users.
 */

const fs = require('fs');
const path = require('path');

console.log('💬 LINE Login Configuration Test\n');

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
  console.log('\n⚠️  No environment files found. Create .env.local with your LINE Login credentials.\n');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.development' });

console.log('\n🔑 LINE Login Environment Variables:');

const lineClientId = process.env.LINE_CLIENT_ID;
const lineClientSecret = process.env.LINE_CLIENT_SECRET;
const nextauthUrl = process.env.NEXTAUTH_URL;
const nextauthSecret = process.env.NEXTAUTH_SECRET;

// Check LINE Client ID
if (lineClientId) {
  console.log(`  ✅ LINE_CLIENT_ID: ${lineClientId.substring(0, 8)}...${lineClientId.substring(lineClientId.length - 4)} (${lineClientId.length} chars)`);
} else {
  console.log('  ❌ LINE_CLIENT_ID: Missing');
}

// Check LINE Client Secret
if (lineClientSecret) {
  console.log(`  ✅ LINE_CLIENT_SECRET: ${lineClientSecret.substring(0, 8)}...${lineClientSecret.substring(lineClientSecret.length - 4)} (${lineClientSecret.length} chars)`);
} else {
  console.log('  ❌ LINE_CLIENT_SECRET: Missing');
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
  console.log(`  📱 Development: ${baseUrl}/api/auth/callback/line`);
} else {
  console.log('  📱 Development: http://localhost:3000/api/auth/callback/line');
}
console.log('  🌐 Production: https://yourdomain.com/api/auth/callback/line');

console.log('\n📋 Configuration Checklist:');

const checks = [
  {
    name: 'LINE Developers Account Setup',
    status: 'manual',
    description: 'Create account at https://developers.line.biz/'
  },
  {
    name: 'LINE Login Channel Created',
    status: lineClientId ? 'done' : 'todo',
    description: 'Create LINE Login channel in LINE Developers Console'
  },
  {
    name: 'Channel Scopes Configured',
    status: lineClientId && lineClientSecret ? 'done' : 'todo',
    description: 'Enable profile, openid, and email scopes'
  },
  {
    name: 'Callback URLs Configured',
    status: 'manual',
    description: 'Add callback URLs in LINE Login channel settings'
  },
  {
    name: 'Environment Variables Set',
    status: lineClientId && lineClientSecret ? 'done' : 'todo',
    description: 'Add LINE_CLIENT_ID and LINE_CLIENT_SECRET to .env.local'
  },
  {
    name: 'NextAuth Configuration',
    status: nextauthUrl && nextauthSecret ? 'done' : 'todo',
    description: 'Set NEXTAUTH_URL and NEXTAUTH_SECRET'
  },
  {
    name: 'Channel Review (Production)',
    status: 'manual',
    description: 'Submit channel for LINE review (for public release)'
  }
];

checks.forEach(check => {
  const icon = check.status === 'done' ? '✅' : check.status === 'manual' ? '📋' : '❌';
  console.log(`  ${icon} ${check.name}: ${check.description}`);
});

console.log('\n🧪 Testing Instructions:');
console.log('1. Ensure all environment variables are set');
console.log('2. Restart your development server: npm run dev');
console.log('3. Visit: http://localhost:3000/test-line-oauth');
console.log('4. Click "เข้าสู่ระบบด้วย LINE" to test the integration');

console.log('\n🇹🇭 LINE-Specific Notes for Thai Users:');
console.log('- LINE Login is the most popular OAuth provider in Thailand');
console.log('- Not all users provide email addresses - handle null emails gracefully');
console.log('- Consider Thai language support in your user interface');
console.log('- LINE users expect seamless integration with LINE ecosystem');

console.log('\n📚 Documentation:');
console.log('- Setup Guide: LINE-OAUTH-SETUP.md');
console.log('- LINE Developers: https://developers.line.biz/');
console.log('- LINE Login Docs: https://developers.line.biz/en/docs/line-login/');
console.log('- NextAuth.js Custom Provider: https://next-auth.js.org/configuration/providers/custom-provider');

// Additional LINE-specific checks
console.log('\n🔍 LINE Integration Health Check:');

// Check if LINE provider is configured in auth.ts
const authConfigPath = path.join(process.cwd(), 'lib', 'auth.ts');
if (fs.existsSync(authConfigPath)) {
  const authConfig = fs.readFileSync(authConfigPath, 'utf8');
  if (authConfig.includes('LineProvider') || authConfig.includes('"line"')) {
    console.log('  ✅ LINE Provider configured in lib/auth.ts');
  } else {
    console.log('  ❌ LINE Provider not found in lib/auth.ts');
  }
} else {
  console.log('  ❌ lib/auth.ts not found');
}

// Check if test page exists
const testPagePath = path.join(process.cwd(), 'app', 'test-line-oauth', 'page.tsx');
if (fs.existsSync(testPagePath)) {
  console.log('  ✅ LINE OAuth test page available at /test-line-oauth');
} else {
  console.log('  ❌ LINE OAuth test page not found');
}

// Validation summary
const missingVars = [];
if (!lineClientId) missingVars.push('LINE_CLIENT_ID');
if (!lineClientSecret) missingVars.push('LINE_CLIENT_SECRET');
if (!nextauthUrl) missingVars.push('NEXTAUTH_URL');
if (!nextauthSecret) missingVars.push('NEXTAUTH_SECRET');

if (missingVars.length === 0) {
  console.log('\n🎉 All required environment variables are configured!');
  console.log('You can now test LINE Login at: http://localhost:3000/test-line-oauth');
  console.log('\n💡 Next Steps:');
  console.log('1. Test the LINE Login flow');
  console.log('2. Check user profile data handling');
  console.log('3. Test error scenarios (network issues, user cancellation)');
  console.log('4. Consider integrating LINE messaging API for notifications');
} else {
  console.log(`\n⚠️  Missing ${missingVars.length} required environment variable(s):`);
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\nAdd these to your .env.local file and restart your server.');
  console.log('Follow the setup guide in LINE-OAUTH-SETUP.md for detailed instructions.');
}

console.log('\n' + '='.repeat(60));
