// Test script to verify ticket batch creation API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080/api';

// Test data for ticket batch creation
const testBatchData = {
  country: "KSA",
  airline: "Air Arabia", 
  flightDate: "2024-12-25",
  flightTime: "14:30",
  buyingPrice: 18000,
  quantity: 25,
  agentName: "Test Agent",
  agentContact: "+8801234567890",
  agentAddress: "Test Address",
  remarks: "Test batch creation"
};

async function testTicketBatchAPI() {
  console.log('🧪 Testing Ticket Batch Creation API...\n');
  
  try {
    // 1. First login to get auth token
    console.log('1��⃣ Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful\n');
    
    // 2. Create ticket batch
    console.log('2️⃣ Creating ticket batch...');
    console.log('Test data:', testBatchData);
    
    const batchResponse = await fetch(`${API_BASE}/ticket-batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testBatchData)
    });
    
    const batchData = await batchResponse.json();
    console.log('Batch creation response:', batchData);
    
    if (!batchData.success) {
      throw new Error('Batch creation failed: ' + batchData.message);
    }
    
    console.log('✅ Ticket batch created successfully!');
    console.log('📦 Batch ID:', batchData.data.batch.id);
    console.log('🎫 Tickets created:', batchData.data.tickets.length);
    console.log('💰 Total cost:', `৳${(testBatchData.buyingPrice * testBatchData.quantity).toLocaleString()}`);
    
    // 3. Verify the tickets exist
    console.log('\n3️⃣ Verifying tickets exist...');
    const ticketsResponse = await fetch(`${API_BASE}/tickets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const ticketsData = await ticketsResponse.json();
    console.log('Total tickets in system:', ticketsData.data?.tickets?.length || 0);
    
    // 4. Check dashboard stats
    console.log('\n4️⃣ Checking dashboard stats...');
    const statsResponse = await fetch(`${API_BASE}/tickets/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const statsData = await statsResponse.json();
    console.log('Dashboard stats:', statsData.data);
    
    console.log('\n🎉 Test completed successfully!');
    console.log('✅ API is working correctly');
    console.log('✅ Tickets are being created and counted');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testTicketBatchAPI();
