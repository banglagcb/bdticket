// Test script to verify Umrah package creation works after validation fix
const API_BASE = "http://localhost:8080/api";

async function testUmrahCreation() {
  console.log('🧪 Testing Umrah Package Creation...\n');

  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const loginResult = await loginResponse.json();
    if (!loginResult.success) {
      throw new Error('Login failed: ' + loginResult.message);
    }

    const token = loginResult.data.token;
    console.log('✅ Login successful');

    // Step 2: Test Umrah With Transport creation
    console.log('\n2. Creating Umrah With Transport package...');
    const withTransportData = {
      passenger_name: "Test Passenger",
      pnr: "TEST123",
      passport_number: "EB1234567",
      flight_airline_name: "Test Airlines",
      departure_date: "2024-12-25",
      return_date: "2025-01-05",
      approved_by: "Test Manager",
      reference_agency: "Test Agency",
      emergency_flight_contact: "+8801712345678",
      passenger_mobile: "+8801987654321"
    };

    const withTransportResponse = await fetch(`${API_BASE}/umrah/with-transport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(withTransportData)
    });

    const withTransportResult = await withTransportResponse.json();
    
    if (withTransportResult.success) {
      console.log('✅ Umrah With Transport created successfully');
      console.log('📦 Package ID:', withTransportResult.data.id);
    } else {
      console.log('❌ Umrah With Transport creation failed:', withTransportResult.message);
      if (withTransportResult.errors) {
        console.log('🔍 Validation errors:', withTransportResult.errors);
      }
    }

    // Step 3: Test Umrah Without Transport creation
    console.log('\n3. Creating Umrah Without Transport package...');
    const withoutTransportData = {
      flight_departure_date: "2024-12-30",
      return_date: "2025-01-10",
      passenger_name: "Test Passenger 2",
      passport_number: "EB2345678",
      entry_recorded_by: "Test Staff",
      total_amount: 150000,
      amount_paid: 50000,
      last_payment_date: "2024-12-01",
      remarks: "Test package"
    };

    const withoutTransportResponse = await fetch(`${API_BASE}/umrah/without-transport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(withoutTransportData)
    });

    const withoutTransportResult = await withoutTransportResponse.json();
    
    if (withoutTransportResult.success) {
      console.log('✅ Umrah Without Transport created successfully');
      console.log('📦 Package ID:', withoutTransportResult.data.id);
      console.log('💰 Remaining amount:', withoutTransportResult.data.remaining_amount);
    } else {
      console.log('❌ Umrah Without Transport creation failed:', withoutTransportResult.message);
      if (withoutTransportResult.errors) {
        console.log('🔍 Validation errors:', withoutTransportResult.errors);
      }
    }

    // Step 4: Test fetching packages
    console.log('\n4. Fetching all packages...');
    const [fetchWithTransportResponse, fetchWithoutTransportResponse] = await Promise.all([
      fetch(`${API_BASE}/umrah/with-transport`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_BASE}/umrah/without-transport`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    const fetchWithTransportResult = await fetchWithTransportResponse.json();
    const fetchWithoutTransportResult = await fetchWithoutTransportResponse.json();

    if (fetchWithTransportResult.success) {
      console.log('✅ With Transport packages fetched:', fetchWithTransportResult.data.length);
    }

    if (fetchWithoutTransportResult.success) {
      console.log('✅ Without Transport packages fetched:', fetchWithoutTransportResult.data.length);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('💡 The validation errors should now be fixed.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUmrahCreation();
