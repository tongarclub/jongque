#!/usr/bin/env node

/**
 * Google OAuth Testing Script
 * Tests Google OAuth configuration and connectivity
 */

const https = require('https');
const { URL } = require('url');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking Google OAuth Environment Variables...', 'blue');
  
  const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  const missing = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
      log(`❌ ${varName}: Not set`, 'red');
    } else {
      const value = process.env[varName];
      const maskedValue = value.substring(0, 8) + '...' + value.substring(value.length - 4);
      log(`✅ ${varName}: ${maskedValue}`, 'green');
    }
  });
  
  if (missing.length > 0) {
    log(`\n⚠️  Missing environment variables: ${missing.join(', ')}`, 'yellow');
    log('Please set these in your .env.local file', 'yellow');
    return false;
  }
  
  return true;
}

function testGoogleOAuthEndpoints() {
  log('\n🌐 Testing Google OAuth Endpoints...', 'blue');
  
  return new Promise((resolve) => {
    const testUrl = 'https://accounts.google.com/.well-known/openid_configuration';
    
    https.get(testUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          log('✅ Google OAuth endpoints are accessible', 'green');
          log(`   Authorization endpoint: ${config.authorization_endpoint}`, 'blue');
          log(`   Token endpoint: ${config.token_endpoint}`, 'blue');
          log(`   UserInfo endpoint: ${config.userinfo_endpoint}`, 'blue');
          resolve(true);
        } catch (error) {
          log('❌ Failed to parse Google OAuth configuration', 'red');
          resolve(false);
        }
      });
    }).on('error', (error) => {
      log(`❌ Failed to connect to Google OAuth: ${error.message}`, 'red');
      resolve(false);
    });
  });
}

function generateOAuthURL() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    log('\n⚠️  Cannot generate OAuth URL without GOOGLE_CLIENT_ID', 'yellow');
    return;
  }
  
  log('\n🔗 Google OAuth URL Generator:', 'blue');
  
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: 'http://localhost:3000/api/auth/callback/google',
    response_type: 'code',
    scope: 'openid email profile',
    state: 'test-state'
  });
  
  const oauthUrl = `${baseUrl}?${params.toString()}`;
  log(`\n📋 Test URL (for manual testing):`, 'green');
  log(oauthUrl, 'blue');
  log('\n💡 You can paste this URL in your browser to test the OAuth flow', 'yellow');
}

function displayNextSteps() {
  log('\n📝 Next Steps for Google OAuth Setup:', 'blue');
  log('1. Create a Google Cloud Project at https://console.cloud.google.com/', 'yellow');
  log('2. Enable the Google+ API', 'yellow');
  log('3. Create OAuth 2.0 credentials', 'yellow');
  log('4. Set authorized redirect URIs:', 'yellow');
  log('   - http://localhost:3000/api/auth/callback/google (development)', 'blue');
  log('   - https://your-domain.com/api/auth/callback/google (production)', 'blue');
  log('5. Copy Client ID and Secret to your .env.local file', 'yellow');
  log('6. Test the login at http://localhost:3000/signin', 'yellow');
  log('\n📖 See GOOGLE-OAUTH-SETUP.md for detailed instructions', 'green');
}

async function main() {
  log('🚀 Google OAuth Configuration Test', 'green');
  log('=====================================', 'green');
  
  const hasEnvVars = checkEnvironmentVariables();
  const endpointsWork = await testGoogleOAuthEndpoints();
  
  if (hasEnvVars) {
    generateOAuthURL();
  }
  
  displayNextSteps();
  
  log('\n📊 Test Summary:', 'blue');
  log(`Environment Variables: ${hasEnvVars ? '✅ Ready' : '❌ Missing'}`, hasEnvVars ? 'green' : 'red');
  log(`Google Endpoints: ${endpointsWork ? '✅ Accessible' : '❌ Failed'}`, endpointsWork ? 'green' : 'red');
  
  if (hasEnvVars && endpointsWork) {
    log('\n🎉 Google OAuth is ready for testing!', 'green');
  } else {
    log('\n⚠️  Please fix the issues above before testing', 'yellow');
  }
}

// Load environment variables
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  // dotenv not available, continue without it
}

main().catch(console.error);
