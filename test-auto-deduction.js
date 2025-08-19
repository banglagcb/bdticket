const fetch = require("node-fetch");

const API_BASE = "http://localhost:8080/api";

async function login() {
  try {
    console.log("🔐 Logging in...");
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    const result = await response.json();
    if (result.success && result.data?.token) {
      console.log("✅ Login successful\n");
      return result.data.token;
    } else {
      console.log("❌ Login failed:", result.message);
      return null;
    }
  } catch (error) {
    console.log("❌ Login error:", error.message);
    return null;
  }
}

async function createTestGroupTicket(token) {
  try {
    console.log("🎫 Creating test group ticket...");

    const today = new Date();
    const departureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    const returnDate = new Date(
      departureDate.getTime() + 10 * 24 * 60 * 60 * 1000,
    ); // 10 days later

    const groupTicketData = {
      group_name: `Test Group ${Date.now()}`,
      package_type: "with-transport",
      departure_date: departureDate.toISOString().split("T")[0],
      return_date: returnDate.toISOString().split("T")[0],
      ticket_count: 5,
      total_cost: 250000,
      agent_name: "Test Agent",
      departure_airline: "Bangladesh Airlines",
      departure_flight_number: "BG001",
      departure_time: "10:00",
      departure_route: "Dhaka to Jeddah",
    };

    const response = await fetch(`${API_BASE}/umrah/group-tickets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groupTicketData),
    });

    const result = await response.json();
    if (result.success) {
      console.log("✅ Group ticket created:", result.data.id);
      console.log(`   Group Name: ${result.data.group_name}`);
      console.log(`   Total Tickets: ${result.data.ticket_count}`);
      console.log(`   Remaining: ${result.data.remaining_tickets}`);
      return {
        ...result.data,
        departure_date: groupTicketData.departure_date,
        return_date: groupTicketData.return_date,
      };
    } else {
      console.log("❌ Failed to create group ticket:", result.message);
      return null;
    }
  } catch (error) {
    console.log("❌ Error creating group ticket:", error.message);
    return null;
  }
}

async function createPassengerWithGroupTicket(token, groupTicket) {
  try {
    console.log("\n👤 Creating passenger with group ticket assignment...");

    const passengerData = {
      passenger_name: `Test Passenger ${Date.now()}`,
      pnr: `PNR${Date.now()}`,
      passport_number: `PASS${Date.now()}`,
      flight_airline_name: groupTicket.departure_airline,
      departure_date: groupTicket.departure_date,
      return_date: groupTicket.return_date,
      approved_by: "Test Admin",
      reference_agency: "Test Agency",
      emergency_flight_contact: "+8801700000000",
      passenger_mobile: "+8801800000000",
      group_ticket_id: groupTicket.id, // This should trigger auto-deduction
    };

    const response = await fetch(`${API_BASE}/umrah/with-transport`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passengerData),
    });

    const result = await response.json();
    if (result.success) {
      console.log("✅ Passenger created:", result.data.id);
      console.log(`   Name: ${result.data.passenger_name}`);
      console.log(`   PNR: ${result.data.pnr}`);
      console.log(
        `   Group Assignment: ${result.groupAssignment ? "Yes" : "No"}`,
      );
      return result.data;
    } else {
      console.log("❌ Failed to create passenger:", result.message);
      return null;
    }
  } catch (error) {
    console.log("❌ Error creating passenger:", error.message);
    return null;
  }
}

async function checkGroupTicketStatus(token, groupTicketId) {
  try {
    console.log("\n🔍 Checking group ticket status...");

    const response = await fetch(
      `${API_BASE}/umrah/debug/group-ticket/${groupTicketId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.json();
    if (result.success) {
      const data = result.data;
      console.log("📊 Group Ticket Status:");
      console.log(`   ID: ${data.groupTicket.id}`);
      console.log(`   Name: ${data.groupTicket.group_name}`);
      console.log(`   Total Tickets: ${data.groupTicket.ticket_count}`);
      console.log(
        `   Current Remaining: ${data.groupTicket.remaining_tickets}`,
      );
      console.log(`   Calculated Remaining: ${data.calculatedRemaining}`);
      console.log(`   Assignments Count: ${data.assignments.length}`);

      if (data.assignments.length > 0) {
        console.log("   📋 Assignments:");
        data.assignments.forEach((assignment, index) => {
          console.log(
            `     ${index + 1}. Passenger ID: ${assignment.passenger_id} (${assignment.passenger_type})`,
          );
        });
      }

      // Check if remaining tickets is correct
      const isCorrect =
        data.groupTicket.remaining_tickets === data.calculatedRemaining;
      console.log(
        `   Status: ${isCorrect ? "✅ Correct" : "❌ Incorrect - needs fix!"}`,
      );

      return data;
    } else {
      console.log("❌ Failed to get group ticket status:", result.message);
      return null;
    }
  } catch (error) {
    console.log("❌ Error checking status:", error.message);
    return null;
  }
}

async function testAutoDeduction() {
  console.log("🚀 Testing Auto-Deduction Functionality\n");
  console.log(`Test Time: ${new Date().toISOString()}\n`);

  // Step 1: Login
  const token = await login();
  if (!token) {
    console.log("❌ Cannot proceed without authentication");
    return;
  }

  // Step 2: Create test group ticket
  const groupTicket = await createTestGroupTicket(token);
  if (!groupTicket) {
    console.log("❌ Cannot proceed without group ticket");
    return;
  }

  // Step 3: Check initial status
  await checkGroupTicketStatus(token, groupTicket.id);

  // Step 4: Create passenger and test auto-deduction
  const passenger = await createPassengerWithGroupTicket(token, groupTicket);
  if (!passenger) {
    console.log("❌ Cannot proceed without passenger");
    return;
  }

  // Step 5: Check final status
  const finalStatus = await checkGroupTicketStatus(token, groupTicket.id);

  // Step 6: Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 AUTO-DEDUCTION TEST SUMMARY");
  console.log("=".repeat(60));

  if (finalStatus) {
    const ticketReduced =
      finalStatus.groupTicket.remaining_tickets < groupTicket.ticket_count;
    const assignmentCreated = finalStatus.assignments.length > 0;

    console.log(`✅ Group Ticket Created: ${groupTicket.group_name}`);
    console.log(`✅ Passenger Created: ${passenger.passenger_name}`);
    console.log(
      `${assignmentCreated ? "✅" : "❌"} Assignment Created: ${assignmentCreated ? "Yes" : "No"}`,
    );
    console.log(
      `${ticketReduced ? "✅" : "❌"} Ticket Count Reduced: ${ticketReduced ? "Yes" : "No"}`,
    );
    console.log(
      `📊 Final Status: ${groupTicket.ticket_count} → ${finalStatus.groupTicket.remaining_tickets} (${finalStatus.assignments.length} assigned)`,
    );

    const success = assignmentCreated && ticketReduced;
    console.log(`\n🎯 OVERALL RESULT: ${success ? "✅ SUCCESS" : "❌ FAILED"}`);

    if (!success) {
      console.log("\n💡 Possible Issues:");
      if (!assignmentCreated)
        console.log("   • Group booking assignment not created");
      if (!ticketReduced)
        console.log("   • Remaining tickets count not updated");
      console.log("   • Check server logs for detailed error information");
    }
  }

  console.log("\n" + "=".repeat(60));
}

// Run the test
if (require.main === module) {
  testAutoDeduction().catch(console.error);
}

module.exports = { testAutoDeduction };
