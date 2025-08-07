const Database = require('better-sqlite3');
const path = require('path');

async function clearDemoData() {
  try {
    console.log('🧹 Clearing all demo ticket data from BD TicketPro Database...');

    // Create database connection
    const dbPath = path.join(process.cwd(), 'bd-ticketpro.db');
    const db = new Database(dbPath);

    console.log('📊 Current data status:');
    
    // Check current counts
    const ticketCount = db.prepare('SELECT COUNT(*) as count FROM tickets').get();
    const batchCount = db.prepare('SELECT COUNT(*) as count FROM ticket_batches').get();
    const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
    
    console.log(`   - Tickets: ${ticketCount.count}`);
    console.log(`   - Ticket Batches: ${batchCount.count}`);
    console.log(`   - Bookings: ${bookingCount.count}`);

    // Start transaction
    const transaction = db.transaction(() => {
      // Clear bookings first (foreign key dependency)
      console.log('🗑️  Clearing bookings...');
      const deleteBookings = db.prepare('DELETE FROM bookings');
      const bookingsDeleted = deleteBookings.run();
      console.log(`   ✅ Deleted ${bookingsDeleted.changes} bookings`);

      // Clear tickets (foreign key dependency on batches)
      console.log('🗑️  Clearing tickets...');
      const deleteTickets = db.prepare('DELETE FROM tickets');
      const ticketsDeleted = deleteTickets.run();
      console.log(`   ✅ Deleted ${ticketsDeleted.changes} tickets`);

      // Clear ticket batches
      console.log('🗑️  Clearing ticket batches...');
      const deleteBatches = db.prepare('DELETE FROM ticket_batches');
      const batchesDeleted = deleteBatches.run();
      console.log(`   ✅ Deleted ${batchesDeleted.changes} ticket batches`);

      // Reset auto-increment sequences if they exist
      console.log('🔄 Resetting sequences...');
      try {
        db.prepare('DELETE FROM sqlite_sequence WHERE name IN (?, ?, ?)').run('tickets', 'ticket_batches', 'bookings');
        console.log('   ✅ Reset auto-increment sequences');
      } catch (err) {
        console.log('   ℹ️  No auto-increment sequences to reset');
      }
    });

    // Execute transaction
    transaction();

    // Verify cleanup
    console.log('\n📊 Data status after cleanup:');
    const finalTicketCount = db.prepare('SELECT COUNT(*) as count FROM tickets').get();
    const finalBatchCount = db.prepare('SELECT COUNT(*) as count FROM ticket_batches').get();
    const finalBookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
    
    console.log(`   - Tickets: ${finalTicketCount.count}`);
    console.log(`   - Ticket Batches: ${finalBatchCount.count}`);
    console.log(`   - Bookings: ${finalBookingCount.count}`);

    // Verify essential data is preserved
    console.log('\n🔍 Verifying essential data preservation:');
    const countryCount = db.prepare('SELECT COUNT(*) as count FROM countries').get();
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const settingsCount = db.prepare('SELECT COUNT(*) as count FROM system_settings').get();
    
    console.log(`   - Countries: ${countryCount.count} ✅`);
    console.log(`   - Users: ${userCount.count} ✅`);
    console.log(`   - Settings: ${settingsCount.count} ✅`);

    db.close();

    console.log('\n🎉 Demo data cleanup completed successfully!');
    console.log('💡 The system is now ready for real ticket data entry.');
    console.log('📝 You can now:');
    console.log('   - Add real ticket batches through Admin → Buy Tickets');
    console.log('   - Create real bookings through the booking system');
    console.log('   - Manage real customer data');
    
  } catch (error) {
    console.error('❌ Demo data cleanup failed:', error);
    process.exit(1);
  }
}

clearDemoData();
