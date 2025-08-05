import Database from "better-sqlite3";
import { join } from "path";

const dbPath = join(process.cwd(), "bd-ticketpro.db");
const db = new Database(dbPath);

function verifyDatabase() {
  console.log("🔍 Verifying database state...\n");

  try {
    // Check tickets
    const tickets = db.prepare("SELECT COUNT(*) as count FROM tickets").get();
    console.log(`📋 Tickets: ${tickets.count}`);

    // Check bookings  
    const bookings = db.prepare("SELECT COUNT(*) as count FROM bookings").get();
    console.log(`🎫 Bookings: ${bookings.count}`);

    // Check ticket batches
    const batches = db.prepare("SELECT COUNT(*) as count FROM ticket_batches").get();
    console.log(`📦 Ticket Batches: ${batches.count}`);

    // Check countries
    const countries = db.prepare("SELECT COUNT(*) as count FROM countries").get();
    console.log(`🌍 Countries: ${countries.count}`);

    // Check airlines
    const airlines = db.prepare("SELECT COUNT(*) as count FROM airlines").get();
    console.log(`✈️ Airlines: ${airlines.count}`);

    // Check users
    const users = db.prepare("SELECT COUNT(*) as count FROM users").get();
    console.log(`👥 Users: ${users.count}`);

    // Check system settings
    const settings = db.prepare("SELECT COUNT(*) as count FROM system_settings").get();
    console.log(`⚙️ System Settings: ${settings.count}\n`);

    // Show countries list
    console.log("📍 Available Countries:");
    const countryList = db.prepare("SELECT code, name FROM countries ORDER BY name").all();
    countryList.forEach(country => {
      console.log(`   - ${country.code}: ${country.name}`);
    });

    console.log("\n✈️ Available Airlines:");
    const airlineList = db.prepare("SELECT code, name FROM airlines ORDER BY name").all();
    airlineList.forEach(airline => {
      console.log(`   - ${airline.code}: ${airline.name}`);
    });

    console.log("\n👤 User Accounts:");
    const userList = db.prepare("SELECT username, role, status FROM users ORDER BY role").all();
    userList.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.status}`);
    });

    // Final verification
    console.log("\n🎉 Database Verification Complete!");
    if (tickets.count === 0 && bookings.count === 0 && batches.count === 0) {
      console.log("✅ SUCCESS: No dummy ticket data found");
      console.log("✅ Database is clean and ready for real tickets");
    } else {
      console.log("⚠️ WARNING: Some ticket data still exists");
    }

    if (countries.count > 0 && airlines.count > 0 && users.count > 0) {
      console.log("✅ SUCCESS: Essential data is properly seeded");
    } else {
      console.log("❌ ERROR: Essential data is missing");
    }

  } catch (error) {
    console.error("❌ Database verification failed:", error);
  } finally {
    db.close();
  }
}

verifyDatabase();
