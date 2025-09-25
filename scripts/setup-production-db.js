#!/usr/bin/env node

/**
 * Production Database Setup Script
 * Sets up Vercel environment variables with proper production database URL
 */

const { execSync } = require('child_process');

console.log('🔧 Setting up Production Database for Vercel...\n');

// Instructions for manual setup
console.log('📋 Manual Setup Required:');
console.log('');
console.log('1. 🌐 Create a free PostgreSQL database:');
console.log('   • Go to https://neon.tech or https://www.planetscale.com');
console.log('   • Sign up and create a new project called "jongque"');
console.log('   • Copy the connection string');
console.log('');
console.log('2. 🔧 Update Vercel Environment Variables:');
console.log('   • Go to https://vercel.com/dashboard');
console.log('   • Select your jongque project');
console.log('   • Go to Settings → Environment Variables');
console.log('   • Update these variables:');
console.log('');

const requiredEnvVars = [
  {
    name: 'DATABASE_URL',
    value: 'postgresql://username:password@host:5432/dbname?sslmode=require',
    description: 'Production PostgreSQL connection string'
  },
  {
    name: 'NEXTAUTH_URL', 
    value: 'https://jongque.vercel.app',
    description: 'Your Vercel app URL'
  },
  {
    name: 'NEXTAUTH_SECRET',
    value: 'lzP6qHp1XDyTK2Dg+2ROXHqsuwnwuRCokdZWuh2CJ9o=',
    description: 'NextAuth secret key (keep current one)'
  }
];

requiredEnvVars.forEach((envVar, index) => {
  console.log(`   ${index + 1}. Name: ${envVar.name}`);
  console.log(`      Value: ${envVar.value}`);
  console.log(`      Description: ${envVar.description}`);
  console.log('');
});

console.log('3. 🗄️ Setup Production Database:');
console.log('   After updating environment variables, run:');
console.log('');
console.log('   npm run prod:db:setup');
console.log('');
console.log('4. 🚀 Redeploy:');
console.log('   vercel --prod');
console.log('');

// Offer to update environment variables automatically if DATABASE_URL is provided
if (process.argv[2]) {
  const databaseUrl = process.argv[2];
  console.log('🔄 Updating Vercel environment variables...');
  
  try {
    // Update DATABASE_URL
    execSync(`vercel env rm DATABASE_URL production`, { stdio: 'inherit' });
    execSync(`echo "${databaseUrl}" | vercel env add DATABASE_URL production`, { stdio: 'inherit' });
    
    console.log('✅ DATABASE_URL updated successfully!');
    console.log('🚀 Now run: npm run prod:db:setup');
  } catch (error) {
    console.error('❌ Failed to update environment variables:', error.message);
  }
}

console.log('🔗 Helpful Links:');
console.log('   • Neon (Free PostgreSQL): https://neon.tech');
console.log('   • PlanetScale (Free MySQL): https://planetscale.com');  
console.log('   • Vercel Dashboard: https://vercel.com/dashboard');
console.log('   • Vercel Env Vars Guide: https://vercel.com/docs/concepts/projects/environment-variables');
