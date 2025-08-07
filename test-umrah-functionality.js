const fetch = require('node-fetch');

const API_BASE = "http://localhost:3000/api";
let authToken = null;

async function login() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const result = await response.json();
    if (result.success && result.data?.token) {
      authToken = result.data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testUmrahWithTransport() {
  try {
    console.log('\n🧪 Testing Umrah With Transport...');
    
    // Create package
    const packageData = {
      passenger_name: "Ahmed Rahman",
      pnr: "EMG123456",
      passport_number: "EB1234567",
      flight_airline_name: "Biman Bangladesh Airlines",
      departure_date: "2024-12-25",
      return_date: "2025-01-05",
      approved_by: "Manager Ahmed",
      reference_agency: "Hajj Agency Dhaka",
      emergency_flight_contact: "+8801712345678",
      passenger_mobile: "+8801987654321"
    };

    const createResponse = await fetch(`${API_BASE}/umrah/with-transport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(packageData)
    });

    const createResult = await createResponse.json();
    if (createResult.success) {
      console.log('✅ Created Umrah with transport package:', createResult.data.id);
      
      // Fetch all packages
      const fetchResponse = await fetch(`${API_BASE}/umrah/with-transport`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const fetchResult = await fetchResponse.json();
      if (fetchResult.success) {
        console.log('✅ Fetched packages count:', fetchResult.data.length);
        return createResult.data.id;
      } else {
        console.log('❌ Failed to fetch packages:', fetchResult.message);
      }
    } else {
      console.log('❌ Failed to create package:', createResult.message);
    }
    
    return null;
  } catch (error) {
    console.log('❌ Umrah with transport test error:', error.message);
    return null;
  }
}

async function testUmrahWithoutTransport() {
  try {
    console.log('\n🧪 Testing Umrah Without Transport...');
    
    // Create package
    const packageData = {
      flight_departure_date: "2024-12-30",
      return_date: "2025-01-10",
      passenger_name: "Fatima Begum",
      passport_number: "EB2345678",
      entry_recorded_by: "Staff Rahman",
      total_amount: 150000,
      amount_paid: 50000,
      last_payment_date: "2024-12-01",
      remarks: "First installment paid. Balance due before departure."
    };

    const createResponse = await fetch(`${API_BASE}/umrah/without-transport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(packageData)
    });

    const createResult = await createResponse.json();
    if (createResult.success) {
      console.log('✅ Created Umrah without transport package:', createResult.data.id);
      console.log('💰 Remaining amount:', createResult.data.remaining_amount);
      
      // Test payment recording
      const paymentResponse = await fetch(`${API_BASE}/umrah/without-transport/${createResult.data.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount: 25000,
          payment_date: "2024-12-15"
        })
      });

      const paymentResult = await paymentResponse.json();
      if (paymentResult.success) {
        console.log('✅ Payment recorded. New remaining amount:', paymentResult.data.remaining_amount);
      } else {
        console.log('❌ Failed to record payment:', paymentResult.message);
      }
      
      return createResult.data.id;
    } else {
      console.log('❌ Failed to create package:', createResult.message);
    }
    
    return null;
  } catch (error) {
    console.log('❌ Umrah without transport test error:', error.message);
    return null;
  }
}

async function testUmrahStats() {
  try {
    console.log('\n📊 Testing Umrah Statistics...');
    
    const statsResponse = await fetch(`${API_BASE}/umrah/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const statsResult = await statsResponse.json();
    if (statsResult.success) {
      console.log('✅ Umrah stats:', {
        total_packages: statsResult.data.total_packages,
        total_with_transport: statsResult.data.total_with_transport,
        total_without_transport: statsResult.data.total_without_transport
      });
      
      if (statsResult.data.payment_summary) {
        console.log('💰 Payment summary:', statsResult.data.payment_summary);
      }
    } else {
      console.log('❌ Failed to get stats:', statsResult.message);
    }
  } catch (error) {
    console.log('❌ Stats test error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Umrah functionality tests...\n');
  
  // Login first
  if (!(await login())) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Test both package types
  const withTransportId = await testUmrahWithTransport();
  const withoutTransportId = await testUmrahWithoutTransport();
  
  // Test statistics
  await testUmrahStats();
  
  console.log('\n🎉 Umrah functionality tests completed!');
  console.log('📋 Summary:');
  console.log(`- With Transport Package: ${withTransportId ? '✅ Created' : '❌ Failed'}`);
  console.log(`- Without Transport Package: ${withoutTransportId ? '✅ Created' : '❌ Failed'}`);
  console.log('\n💡 You can now access the Umrah Management page in the web interface!');
}

runTests();
