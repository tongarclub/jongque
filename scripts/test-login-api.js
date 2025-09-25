#!/usr/bin/env node

/**
 * Test Login API Script
 * Tests the login functionality via NextAuth API endpoints
 */

const https = require('https');
const querystring = require('querystring');

// Function to make HTTPS request
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testLogin() {
  const baseUrl = 'jongque.vercel.app';
  
  console.log('🔍 Testing Login API Flow...\n');

  try {
    // Step 1: Get CSRF token
    console.log('1. 🔐 Getting CSRF token...');
    const csrfResponse = await makeRequest({
      hostname: baseUrl,
      port: 443,
      path: '/api/auth/csrf',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log(`   Status: ${csrfResponse.status}`);
    
    let csrfToken = null;
    try {
      const csrfData = JSON.parse(csrfResponse.data);
      csrfToken = csrfData.csrfToken;
      console.log(`   CSRF Token: ${csrfToken ? '✅ Received' : '❌ Missing'}`);
    } catch (e) {
      console.log('   ❌ Failed to parse CSRF response');
      console.log('   Response:', csrfResponse.data);
    }

    if (!csrfToken) {
      console.log('❌ Cannot proceed without CSRF token');
      return;
    }

    // Step 2: Test credentials login
    console.log('\n2. 🧪 Testing credentials login...');
    const loginData = querystring.stringify({
      csrfToken: csrfToken,
      email: 'admin@jongque.com',
      password: 'admin123',
      redirect: 'false'
    });

    const loginResponse = await makeRequest({
      hostname: baseUrl,
      port: 443,
      path: '/api/auth/callback/credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(loginData),
        'Cookie': csrfResponse.headers['set-cookie'] ? csrfResponse.headers['set-cookie'].join('; ') : ''
      }
    }, loginData);

    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Redirect: ${loginResponse.headers.location || 'None'}`);
    
    if (loginResponse.headers['set-cookie']) {
      const cookies = loginResponse.headers['set-cookie'];
      const hasSessionToken = cookies.some(cookie => 
        cookie.includes('next-auth.session-token') || 
        cookie.includes('__Secure-next-auth.session-token')
      );
      console.log(`   Session Cookie: ${hasSessionToken ? '✅ Set' : '❌ Missing'}`);
    } else {
      console.log('   Session Cookie: ❌ No cookies set');
    }

    // Check response content
    if (loginResponse.data) {
      console.log('   Response preview:', loginResponse.data.substring(0, 200) + '...');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testDirectCredentials() {
  console.log('\n🎯 Testing Direct Credentials Check...\n');
  
  const baseUrl = 'jongque.vercel.app';
  
  try {
    // Test the custom credentials verification endpoint
    const testData = JSON.stringify({
      email: 'admin@jongque.com',
      password: 'admin123'
    });

    const response = await makeRequest({
      hostname: baseUrl,
      port: 443,
      path: '/api/auth/test-credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      }
    }, testData);

    console.log(`Status: ${response.status}`);
    console.log(`Response: ${response.data}`);

  } catch (error) {
    console.log('❌ Custom endpoint test failed:', error.message);
    console.log('This is expected if the endpoint doesn\'t exist');
  }
}

async function main() {
  await testLogin();
  await testDirectCredentials();
  
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. Check Vercel function logs for errors');
  console.log('2. Verify NextAuth configuration');
  console.log('3. Test manually on website: https://jongque.vercel.app/test-auth');
  console.log('4. Check browser network tab for API calls');
}

main().catch(console.error);
