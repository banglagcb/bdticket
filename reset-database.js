const { initializeDatabase, seedDatabase } = require('./server/database/schema.js');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  try {
    console.log('🗄️ Resetting BD TicketPro Database...');
    
    // Remove existing database file
    const dbPath = path.join(process.cwd(), 'bd-ticketpro.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✅ Removed old database file');
    }
    
    // Initialize fresh database
    console.log('🏗️ Creating new database schema...');
    initializeDatabase();
    
    // Seed with fresh data
    console.log('🌱 Seeding database with demo data...');
    seedDatabase();
    
    console.log('🎉 Database reset completed successfully!');
    console.log('📊 New database includes:');
    console.log('   - 8 Countries with flags');
    console.log('   - 15+ Ticket batches across all countries');
    console.log('   - 300+ Individual tickets');
    console.log('   - 3 Demo users (admin, manager, staff)');
    console.log('   - Sample bookings');
    console.log('   - System settings');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
