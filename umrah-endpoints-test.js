const fetch = require('node-fetch');

const API_BASE = "http://localhost:8080/api";
let authToken = null;

// Test results storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  endpoints: {}
};

function logResult(endpoint, passed, message, details = null) {
  testResults.total++;
  testResults.endpoints[endpoint] = {
    passed,
    message,
    details,
    timestamp: new Date().toISOString()
  };
  
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${endpoint}: ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${endpoint}: ${message}`);
  }
  
  if (details) {
    console.log(`   📋 Details:`, JSON.stringify(details, null, 2));
  }
}

async function login() {
  try {
    console.log('🔐 Authenticating...');
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
      console.log('✅ Authentication successful\n');
      return true;
    } else {
      console.log('❌ Authentication failed:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return false;
  }
}

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    return {
      status: response.status,
      result,
      success: response.ok && result.success !== false
    };
  } catch (error) {
    return {
      status: 500,
      result: { error: error.message },
      success: false
    };
  }
}

async function testUmrahWithTransport() {
  console.log('📦 Testing Umrah With Transport Endpoints...\n');
  
  // Test GET /api/umrah/with-transport
  const getResponse = await testEndpoint('/umrah/with-transport');
  logResult(
    'GET /api/umrah/with-transport',
    getResponse.success,
    getResponse.success 
      ? `Status ${getResponse.status}: Retrieved ${getResponse.result.data?.length || 0} packages`
      : `Status ${getResponse.status}: ${getResponse.result.message || 'Failed'}`,
    {
      status: getResponse.status,
      dataCount: getResponse.result.data?.length || 0,
      structure: getResponse.result.data?.[0] ? Object.keys(getResponse.result.data[0]) : 'No data'
    }
  );
  
  // Test with search parameter
  const searchResponse = await testEndpoint('/umrah/with-transport?search=test');
  logResult(
    'GET /api/umrah/with-transport?search=test',
    searchResponse.success,
    searchResponse.success 
      ? `Status ${searchResponse.status}: Search returned ${searchResponse.result.data?.length || 0} results`
      : `Status ${searchResponse.status}: ${searchResponse.result.message || 'Failed'}`,
    {
      status: searchResponse.status,
      searchResults: searchResponse.result.data?.length || 0
    }
  );
}

async function testUmrahWithoutTransport() {
  console.log('\n📦 Testing Umrah Without Transport Endpoints...\n');
  
  // Test GET /api/umrah/without-transport
  const getResponse = await testEndpoint('/umrah/without-transport');
  logResult(
    'GET /api/umrah/without-transport',
    getResponse.success,
    getResponse.success 
      ? `Status ${getResponse.status}: Retrieved ${getResponse.result.data?.length || 0} packages`
      : `Status ${getResponse.status}: ${getResponse.result.message || 'Failed'}`,
    {
      status: getResponse.status,
      dataCount: getResponse.result.data?.length || 0,
      structure: getResponse.result.data?.[0] ? Object.keys(getResponse.result.data[0]) : 'No data'
    }
  );
  
  // Test with pending_only parameter
  const pendingResponse = await testEndpoint('/umrah/without-transport?pending_only=true');
  logResult(
    'GET /api/umrah/without-transport?pending_only=true',
    pendingResponse.success,
    pendingResponse.success 
      ? `Status ${pendingResponse.status}: Found ${pendingResponse.result.data?.length || 0} pending payments`
      : `Status ${pendingResponse.status}: ${pendingResponse.result.message || 'Failed'}`,
    {
      status: pendingResponse.status,
      pendingCount: pendingResponse.result.data?.length || 0
    }
  );
}

async function testUmrahGroupTickets() {
  console.log('\n🎫 Testing Umrah Group Tickets Endpoints...\n');
  
  // Test GET /api/umrah/group-tickets
  const getResponse = await testEndpoint('/umrah/group-tickets');
  logResult(
    'GET /api/umrah/group-tickets',
    getResponse.success,
    getResponse.success 
      ? `Status ${getResponse.status}: Retrieved ${getResponse.result.data?.length || 0} group tickets`
      : `Status ${getResponse.status}: ${getResponse.result.message || 'Failed'}`,
    {
      status: getResponse.status,
      dataCount: getResponse.result.data?.length || 0,
      structure: getResponse.result.data?.[0] ? Object.keys(getResponse.result.data[0]) : 'No data'
    }
  );
  
  // Test with package_type filter
  const withTransportGroups = await testEndpoint('/umrah/group-tickets?package_type=with-transport');
  logResult(
    'GET /api/umrah/group-tickets?package_type=with-transport',
    withTransportGroups.success,
    withTransportGroups.success 
      ? `Status ${withTransportGroups.status}: Found ${withTransportGroups.result.data?.length || 0} with-transport groups`
      : `Status ${withTransportGroups.status}: ${withTransportGroups.result.message || 'Failed'}`,
    {
      status: withTransportGroups.status,
      groupCount: withTransportGroups.result.data?.length || 0
    }
  );
  
  const withoutTransportGroups = await testEndpoint('/umrah/group-tickets?package_type=without-transport');
  logResult(
    'GET /api/umrah/group-tickets?package_type=without-transport',
    withoutTransportGroups.success,
    withoutTransportGroups.success 
      ? `Status ${withoutTransportGroups.status}: Found ${withoutTransportGroups.result.data?.length || 0} without-transport groups`
      : `Status ${withoutTransportGroups.status}: ${withoutTransportGroups.result.message || 'Failed'}`,
    {
      status: withoutTransportGroups.status,
      groupCount: withoutTransportGroups.result.data?.length || 0
    }
  );
}

async function testUmrahGroupTicketsByDates() {
  console.log('\n📅 Testing Umrah Group Tickets By Dates Endpoints...\n');
  
  // Test GET /api/umrah/group-tickets/by-dates/with-transport
  const withTransportByDates = await testEndpoint('/umrah/group-tickets/by-dates/with-transport');
  logResult(
    'GET /api/umrah/group-tickets/by-dates/with-transport',
    withTransportByDates.success,
    withTransportByDates.success 
      ? `Status ${withTransportByDates.status}: Retrieved grouped data`
      : `Status ${withTransportByDates.status}: ${withTransportByDates.result.message || 'Failed'}`,
    {
      status: withTransportByDates.status,
      dataStructure: withTransportByDates.result.data ? typeof withTransportByDates.result.data : 'No data',
      dataKeys: withTransportByDates.result.data ? Object.keys(withTransportByDates.result.data) : []
    }
  );
  
  // Test GET /api/umrah/group-tickets/by-dates/without-transport
  const withoutTransportByDates = await testEndpoint('/umrah/group-tickets/by-dates/without-transport');
  logResult(
    'GET /api/umrah/group-tickets/by-dates/without-transport',
    withoutTransportByDates.success,
    withoutTransportByDates.success 
      ? `Status ${withoutTransportByDates.status}: Retrieved grouped data`
      : `Status ${withoutTransportByDates.status}: ${withoutTransportByDates.result.message || 'Failed'}`,
    {
      status: withoutTransportByDates.status,
      dataStructure: withoutTransportByDates.result.data ? typeof withoutTransportByDates.result.data : 'No data',
      dataKeys: withoutTransportByDates.result.data ? Object.keys(withoutTransportByDates.result.data) : []
    }
  );
}

async function testUmrahStats() {
  console.log('\n📊 Testing Umrah Statistics Endpoint...\n');
  
  // Test GET /api/umrah/stats
  const statsResponse = await testEndpoint('/umrah/stats');
  logResult(
    'GET /api/umrah/stats',
    statsResponse.success,
    statsResponse.success 
      ? `Status ${statsResponse.status}: Retrieved statistics`
      : `Status ${statsResponse.status}: ${statsResponse.result.message || 'Failed'}`,
    {
      status: statsResponse.status,
      stats: statsResponse.result.data || 'No data'
    }
  );
}

async function generateTestReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 UMRAH API ENDPOINTS TEST REPORT');
  console.log('='.repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`   Total Tests: ${testResults.total}`);
  console.log(`   Passed: ${testResults.passed} (${((testResults.passed / testResults.total) * 100).toFixed(1)}%)`);
  console.log(`   Failed: ${testResults.failed} (${((testResults.failed / testResults.total) * 100).toFixed(1)}%)`);
  
  console.log(`\n📝 Detailed Results:`);
  for (const [endpoint, result] of Object.entries(testResults.endpoints)) {
    const status = result.passed ? '✅' : '❌';
    console.log(`   ${status} ${endpoint}`);
    console.log(`      Message: ${result.message}`);
    if (result.details) {
      console.log(`      Details: ${JSON.stringify(result.details, null, 6)}`);
    }
    console.log('');
  }
  
  console.log(`\n💡 Recommendations:`);
  if (testResults.failed > 0) {
    console.log('   • Review failed endpoints for potential issues');
    console.log('   • Check server logs for detailed error information');
    console.log('   • Verify database connectivity and data integrity');
  } else {
    console.log('   • All endpoints are working correctly!');
    console.log('   • API is ready for production use');
  }
  
  console.log('\n' + '='.repeat(80));
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Umrah API Endpoints Test\n');
  console.log(`Base URL: ${API_BASE}`);
  console.log(`Test Time: ${new Date().toISOString()}\n`);
  
  // Authentication
  if (!(await login())) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Run all endpoint tests
  await testUmrahWithTransport();
  await testUmrahWithoutTransport();
  await testUmrahGroupTickets();
  await testUmrahGroupTicketsByDates();
  await testUmrahStats();
  
  // Generate comprehensive report
  await generateTestReport();
}

// Export for use in other modules or run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testResults,
  API_BASE
};
