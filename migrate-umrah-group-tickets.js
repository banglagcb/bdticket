const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'bd-ticketpro.db');
const db = new Database(dbPath);

try {
  console.log('Starting migration to add flight details columns to umrah_group_tickets...');

  // Check if the columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(umrah_group_tickets)").all();
  const columnNames = tableInfo.map(col => col.name);
  
  const newColumns = [
    'departure_airline',
    'departure_flight_number',
    'departure_time',
    'departure_route',
    'return_airline',
    'return_flight_number',
    'return_time',
    'return_route',
    'remaining_tickets'
  ];

  // Add missing columns
  for (const column of newColumns) {
    if (!columnNames.includes(column)) {
      console.log(`Adding column: ${column}`);
      if (column === 'remaining_tickets') {
        db.exec(`ALTER TABLE umrah_group_tickets ADD COLUMN ${column} INTEGER NOT NULL DEFAULT 0`);
      } else {
        db.exec(`ALTER TABLE umrah_group_tickets ADD COLUMN ${column} TEXT`);
      }
    } else {
      console.log(`Column ${column} already exists, skipping...`);
    }
  }

  // Update remaining_tickets for existing records
  console.log('Updating remaining_tickets for existing records...');
  db.exec(`
    UPDATE umrah_group_tickets 
    SET remaining_tickets = ticket_count 
    WHERE remaining_tickets = 0 OR remaining_tickets IS NULL
  `);

  console.log('Migration completed successfully!');
  
  // Verify the schema
  const updatedTableInfo = db.prepare("PRAGMA table_info(umrah_group_tickets)").all();
  console.log('\nUpdated table schema:');
  updatedTableInfo.forEach(col => {
    console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
  });

} catch (error) {
  console.error('Migration failed:', error);
} finally {
  db.close();
}
