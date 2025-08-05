import Database from "better-sqlite3";
import { join } from "path";

const dbPath = join(process.cwd(), "bd-ticketpro.db");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

async function clearDummyData() {
  try {
    console.log("🧹 Clearing dummy ticket data from BD TicketPro...");

    // Start transaction
    const transaction = db.transaction(() => {
      // Clear all bookings first (due to foreign key constraints)
      console.log("🗑️ Clearing all bookings...");
      const deleteBookings = db.prepare("DELETE FROM bookings");
      const bookingResult = deleteBookings.run();
      console.log(`   ✅ Removed ${bookingResult.changes} bookings`);

      // Clear all individual tickets
      console.log("🎫 Clearing all tickets...");
      const deleteTickets = db.prepare("DELETE FROM tickets");
      const ticketResult = deleteTickets.run();
      console.log(`   ✅ Removed ${ticketResult.changes} tickets`);

      // Clear all ticket batches
      console.log("📦 Clearing all ticket batches...");
      const deleteBatches = db.prepare("DELETE FROM ticket_batches");
      const batchResult = deleteBatches.run();
      console.log(`   ✅ Removed ${batchResult.changes} ticket batches`);

      // Clear activity logs related to tickets and bookings
      console.log("📋 Clearing related activity logs...");
      const deleteActivityLogs = db.prepare(`
        DELETE FROM activity_logs 
        WHERE entity_type IN ('ticket', 'booking', 'ticket_batch')
      `);
      const activityResult = deleteActivityLogs.run();
      console.log(`   ✅ Removed ${activityResult.changes} activity log entries`);

      // Reset auto-increment sequences (if any)
      console.log("🔄 Resetting sequences...");
      
      return {
        bookings: bookingResult.changes,
        tickets: ticketResult.changes,
        batches: batchResult.changes,
        activities: activityResult.changes,
      };
    });

    // Execute transaction
    const results = transaction();

    console.log("\n🎉 Dummy data cleared successfully!");
    console.log("📊 Summary:");
    console.log(`   - ${results.bookings} bookings removed`);
    console.log(`   - ${results.tickets} tickets removed`);
    console.log(`   - ${results.batches} ticket batches removed`);
    console.log(`   - ${results.activities} activity logs removed`);
    console.log("\n✅ Database is now ready for real ticket data!");
    console.log("💡 Preserved:");
    console.log("   - User accounts and authentication");
    console.log("   - Countries and airlines");
    console.log("   - System settings");
    console.log("   - Database schema and structure");
    
    // Verify the cleanup
    console.log("\n🔍 Verification:");
    const remainingTickets = db.prepare("SELECT COUNT(*) as count FROM tickets").get();
    const remainingBookings = db.prepare("SELECT COUNT(*) as count FROM bookings").get();
    const remainingBatches = db.prepare("SELECT COUNT(*) as count FROM ticket_batches").get();
    
    console.log(`   - Tickets: ${remainingTickets.count}`);
    console.log(`   - Bookings: ${remainingBookings.count}`);
    console.log(`   - Batches: ${remainingBatches.count}`);
    
    if (remainingTickets.count === 0 && remainingBookings.count === 0 && remainingBatches.count === 0) {
      console.log("✅ All dummy data successfully removed!");
    } else {
      console.log("⚠️ Some data may still remain. Please check manually.");
    }

  } catch (error) {
    console.error("❌ Failed to clear dummy data:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

clearDummyData();
