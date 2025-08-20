#!/usr/bin/env node

/**
 * Google OAuth Setup Helper
 * Interactive script to help set up Google OAuth credentials
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function displayWelcome() {
  log('\n🚀 Google OAuth Setup Helper', 'green');
  log('===============================', 'green');
  log('\nThis script will help you set up Google OAuth for your JongQue application.', 'blue');
  log('\n📋 Before starting, make sure you have:', 'yellow');
  log('1. A Google Cloud Project created', 'yellow');
  log('2. OAuth 2.0 credentials configured', 'yellow');
  log('3. Your Client ID and Client Secret ready', 'yellow');
  log('\n📖 See GOOGLE-OAUTH-SETUP.md for detailed instructions\n', 'cyan');
}

function validateClientId(clientId) {
  // Google Client IDs typically end with .apps.googleusercontent.com
  const pattern = /^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/;
  return pattern.test(clientId);
}

function validateClientSecret(clientSecret) {
  // Google Client Secrets are typically 24 characters long
  return clientSecret && clientSecret.length >= 20;
}

async function getCredentials() {
  log('🔑 Enter your Google OAuth credentials:', 'blue');
  
  let clientId, clientSecret;
  
  // Get Client ID
  while (true) {
    clientId = await question('Google Client ID: ');
    if (!clientId) {
      log('❌ Client ID cannot be empty', 'red');
      continue;
    }
    if (!validateClientId(clientId)) {
      log('⚠️  Client ID format looks unusual. Google Client IDs typically end with .apps.googleusercontent.com', 'yellow');
      const confirm = await question('Continue anyway? (y/N): ');
      if (confirm.toLowerCase() !== 'y') {
        continue;
      }
    }
    break;
  }
  
  // Get Client Secret
  while (true) {
    clientSecret = await question('Google Client Secret: ');
    if (!clientSecret) {
      log('❌ Client Secret cannot be empty', 'red');
      continue;
    }
    if (!validateClientSecret(clientSecret)) {
      log('⚠️  Client Secret looks unusual. Google Client Secrets are typically longer.', 'yellow');
      const confirm = await question('Continue anyway? (y/N): ');
      if (confirm.toLowerCase() !== 'y') {
        continue;
      }
    }
    break;
  }
  
  return { clientId, clientSecret };
}

function createEnvFile(credentials) {
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    log(`\n📝 Found existing .env.local file`, 'blue');
  } else {
    log(`\n📝 Creating new .env.local file`, 'blue');
    // Add basic required variables
    envContent = `# Database
DATABASE_URL="postgresql://jongque_user:jongque_pass@localhost:5432/jongque_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uBrMHkwMnTYMyTQsOXpEhxWd32RekpxJWnN50ORAh6M="

`;
  }
  
  // Remove existing Google OAuth variables
  envContent = envContent.replace(/^GOOGLE_CLIENT_ID=.*$/gm, '');
  envContent = envContent.replace(/^GOOGLE_CLIENT_SECRET=.*$/gm, '');
  envContent = envContent.replace(/^\s*$/gm, ''); // Remove empty lines
  
  // Add Google OAuth variables
  envContent += `
# Google OAuth
GOOGLE_CLIENT_ID="${credentials.clientId}"
GOOGLE_CLIENT_SECRET="${credentials.clientSecret}"
`;
  
  // Write the file
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  log(`✅ Updated .env.local with Google OAuth credentials`, 'green');
}

async function confirmSetup() {
  log('\n🔍 Testing configuration...', 'blue');
  
  // Load the new environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (clientId && clientSecret) {
    log('✅ Environment variables loaded successfully', 'green');
    
    // Generate test URLs
    log('\n🔗 Test URLs:', 'blue');
    log(`Local development: http://localhost:3000/test-google-oauth`, 'cyan');
    log(`Sign in page: http://localhost:3000/signin`, 'cyan');
    
    log('\n📋 Next steps:', 'yellow');
    log('1. Restart your development server (npm run dev)', 'yellow');
    log('2. Visit http://localhost:3000/test-google-oauth', 'yellow');
    log('3. Click "Sign in with Google" to test', 'yellow');
    log('4. Check that the OAuth flow works correctly', 'yellow');
    
    return true;
  } else {
    log('❌ Failed to load environment variables', 'red');
    return false;
  }
}

async function main() {
  try {
    displayWelcome();
    
    const proceed = await question('Ready to set up Google OAuth? (Y/n): ');
    if (proceed.toLowerCase() === 'n') {
      log('\n👋 Setup cancelled', 'yellow');
      rl.close();
      return;
    }
    
    const credentials = await getCredentials();
    
    log('\n📋 Summary:', 'blue');
    log(`Client ID: ${credentials.clientId}`, 'cyan');
    log(`Client Secret: ${'*'.repeat(credentials.clientSecret.length)}`, 'cyan');
    
    const confirm = await question('\nSave these credentials to .env.local? (Y/n): ');
    if (confirm.toLowerCase() === 'n') {
      log('\n👋 Setup cancelled', 'yellow');
      rl.close();
      return;
    }
    
    createEnvFile(credentials);
    const success = await confirmSetup();
    
    if (success) {
      log('\n🎉 Google OAuth setup completed successfully!', 'green');
      log('\n💡 Pro tip: Run `npm run test:google-oauth` to verify your setup', 'cyan');
    } else {
      log('\n⚠️  Setup completed but verification failed', 'yellow');
      log('Please check your credentials and try again', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Error during setup: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n\n👋 Setup cancelled by user', 'yellow');
  rl.close();
  process.exit(0);
});

main();
