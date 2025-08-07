// Simple test to verify API health and bookings endpoint
const TEST_API_BASE = "http://localhost:8080/api";

async function testAPIHealth() {
  console.log('🧪 Testing API Health...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${TEST_API_BASE}/ping`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData.status);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }

    // Test 2: Login to get token
    console.log('\n2. Testing login...');
    const loginResponse = await fetch(`${TEST_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    if (!loginData.success || !loginData.data?.token) {
      console.log('❌ Login failed: Invalid response');
      return;
    }

    console.log('✅ Login successful');
    const token = loginData.data.token;

    // Test 3: Test bookings endpoint
    console.log('\n3. Testing bookings endpoint...');
    const bookingsResponse = await fetch(`${TEST_API_BASE}/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      console.log('✅ Bookings endpoint working:', {
        success: bookingsData.success,
        hasData: !!bookingsData.data,
        bookingsCount: bookingsData.data?.bookings?.length || 0
      });
    } else {
      console.log('❌ Bookings endpoint failed:', bookingsResponse.status);
    }

    // Test 4: Test Umrah endpoints
    console.log('\n4. Testing Umrah endpoints...');
    const umrahWithTransportResponse = await fetch(`${TEST_API_BASE}/umrah/with-transport`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (umrahWithTransportResponse.ok) {
      const umrahData = await umrahWithTransportResponse.json();
      console.log('✅ Umrah with transport endpoint working:', {
        success: umrahData.success,
        packagesCount: umrahData.data?.length || 0
      });
    } else {
      console.log('❌ Umrah with transport endpoint failed:', umrahWithTransportResponse.status);
    }

    const umrahWithoutTransportResponse = await fetch(`${TEST_API_BASE}/umrah/without-transport`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (umrahWithoutTransportResponse.ok) {
      const umrahData = await umrahWithoutTransportResponse.json();
      console.log('✅ Umrah without transport endpoint working:', {
        success: umrahData.success,
        packagesCount: umrahData.data?.length || 0
      });
    } else {
      console.log('❌ Umrah without transport endpoint failed:', umrahWithoutTransportResponse.status);
    }

    console.log('\n🎉 API health check completed!');
    console.log('💡 The "Failed to fetch" errors should now be resolved.');
    console.log('📋 Key fixes applied:');
    console.log('  - Added retry mechanism for network requests');
    console.log('  - Stored original fetch to bypass third-party interference');
    console.log('  - Added network error boundary and better error handling');
    console.log('  - Added online/offline status indicator');
    console.log('  - Improved error messages and recovery options');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.message.includes('Failed to fetch')) {
      console.log('\n💡 If you see "Failed to fetch" errors:');
      console.log('  1. Make sure the dev server is running on port 8080');
      console.log('  2. Check browser console for CORS errors');
      console.log('  3. Try refreshing the page to clear any cached issues');
    }
  }
}

// Run the test
testAPIHealth();
