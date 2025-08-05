// Test dashboard stats after ticket creation
import fetch from "node-fetch";

const API_BASE = "http://localhost:8080/api";

async function testDashboardStats() {
  try {
    console.log("🧪 Testing Dashboard Stats...\n");

    // Login first
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin123" }),
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    // Get dashboard stats
    const statsResponse = await fetch(`${API_BASE}/tickets/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const statsData = await statsResponse.json();
    console.log(
      "📊 Dashboard Stats Response:",
      JSON.stringify(statsData, null, 2),
    );

    if (statsData.success && statsData.data) {
      const stats = statsData.data;
      console.log("\n✅ Dashboard Stats Summary:");
      console.log("🎫 Total Tickets:", stats.totalTickets || 0);
      console.log("📦 Available Tickets:", stats.availableTickets || 0);
      console.log("🔒 Locked Tickets:", stats.lockedTickets || 0);
      console.log("✅ Sold Tickets:", stats.soldTickets || 0);
      console.log("💰 Total Investment:", stats.totalInvestment || 0);
      console.log("📈 Today Sales Amount:", stats.todaysSales?.amount || 0);
      console.log("📊 Today Sales Count:", stats.todaysSales?.count || 0);
      console.log("📋 Total Bookings:", stats.totalBookings || 0);

      if (stats.totalTickets > 0) {
        console.log("\n🎉 SUCCESS: Tickets are now showing in dashboard!");
      } else {
        console.log("\n⚠️  WARNING: No tickets showing in dashboard yet");
      }
    } else {
      console.log("❌ Failed to get dashboard stats:", statsData.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testDashboardStats();
