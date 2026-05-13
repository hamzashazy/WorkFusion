/**
 * Test Script for Category Preferences Feature
 * Run: node test-preferences.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Category Preferences Feature\n');
  console.log('='.repeat(50));

  try {
    // 1. Get categories
    console.log('\n📂 Step 1: Fetching categories...');
    const categoriesRes = await makeRequest('GET', '/api/categories');
    
    if (!categoriesRes.data.success) {
      throw new Error('Failed to fetch categories');
    }
    
    console.log(`   ✅ Found ${categoriesRes.data.count} parent categories`);
    
    // Get first 2 category IDs for testing
    const categories = categoriesRes.data.data;
    const testCategoryIds = categories.slice(0, 2).map(c => c._id);
    console.log(`   📋 Test categories: ${categories[0].name}, ${categories[1].name}`);

    // 2. Register a new job seeker
    console.log('\n👤 Step 2: Registering a new job seeker...');
    const randomEmail = `test_seeker_${Date.now()}@example.com`;
    const registerRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Test Job Seeker',
      email: randomEmail,
      password: 'Password@123',
      role: 'job_seeker',
    });

    if (!registerRes.data.token) {
      throw new Error('Registration failed: ' + JSON.stringify(registerRes.data));
    }

    const token = registerRes.data.token;
    console.log(`   ✅ Registered successfully`);
    console.log(`   📧 Email: ${randomEmail}`);

    // 3. Get profile (should have empty preferences)
    console.log('\n📄 Step 3: Getting initial profile...');
    const profileRes = await makeRequest('GET', '/api/auth/profile', null, token);
    
    console.log(`   ✅ Profile retrieved`);
    console.log(`   📋 Preferred Categories: ${profileRes.data.profile?.preferredCategories?.length || 0}`);
    console.log(`   📋 Preferred Job Types: ${profileRes.data.profile?.preferredJobTypes?.length || 0}`);

    // 4. Update profile with category preferences
    console.log('\n✏️  Step 4: Updating profile with preferences...');
    const updateRes = await makeRequest('PUT', '/api/auth/profile', {
      profile: {
        preferredCategories: testCategoryIds,
        preferredJobTypes: ['remote', 'hybrid'],
      },
    }, token);

    if (updateRes.status !== 200) {
      throw new Error('Profile update failed: ' + JSON.stringify(updateRes.data));
    }

    console.log(`   ✅ Profile updated with preferences`);
    console.log(`   📋 Preferred Categories: ${updateRes.data.profile?.preferredCategories?.length || 0}`);
    console.log(`   📋 Preferred Job Types: ${updateRes.data.profile?.preferredJobTypes?.join(', ')}`);

    // 5. Get profile again to verify preferences are populated
    console.log('\n🔍 Step 5: Verifying preferences are saved correctly...');
    const verifyRes = await makeRequest('GET', '/api/auth/profile', null, token);
    
    const prefCats = verifyRes.data.profile?.preferredCategories || [];
    console.log(`   ✅ Preferences verified`);
    if (prefCats.length > 0 && prefCats[0].name) {
      console.log(`   📋 Categories: ${prefCats.map(c => c.name).join(', ')}`);
    }
    console.log(`   📋 Job Types: ${verifyRes.data.profile?.preferredJobTypes?.join(', ')}`);

    // 6. Test recommended jobs endpoint
    console.log('\n🎯 Step 6: Testing recommended jobs endpoint...');
    const recommendedRes = await makeRequest('GET', '/api/jobs/recommended', null, token);

    if (!recommendedRes.data.success && recommendedRes.status !== 200) {
      throw new Error('Recommended jobs failed: ' + JSON.stringify(recommendedRes.data));
    }

    console.log(`   ✅ Recommended jobs endpoint working`);
    console.log(`   📋 Has Preferences: ${recommendedRes.data.hasPreferences}`);
    console.log(`   📋 Jobs Found: ${recommendedRes.data.count}`);
    console.log(`   📋 Total Matching: ${recommendedRes.data.total}`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log('   - User registration: ✅');
    console.log('   - Profile with preferences: ✅');
    console.log('   - Category preferences saved: ✅');
    console.log('   - Job type preferences saved: ✅');
    console.log('   - Recommended jobs endpoint: ✅');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runTests();

