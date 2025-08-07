const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const dbPath = path.join(process.cwd(), 'bd-ticketpro.db');
const db = new Database(dbPath);

console.log('🔍 Checking database contents...\n');

// Check ticket batches
console.log('📦 TICKET BATCHES:');
const batches = db.prepare('SELECT * FROM ticket_batches').all();
console.log(`Total batches: ${batches.length}`);
batches.forEach(batch => {
  console.log(`  ${batch.country_code}: ${batch.airline_name} - ${batch.quantity} tickets`);
});

console.log('\n🎫 TICKETS:');
const tickets = db.prepare('SELECT * FROM tickets').all();
console.log(`Total tickets: ${tickets.length}`);

console.log('\n📊 TICKETS BY COUNTRY:');
const ticketsByCountry = db.prepare(`
  SELECT 
    tb.country_code,
    COUNT(t.id) as total_tickets,
    SUM(CASE WHEN t.status = 'available' THEN 1 ELSE 0 END) as available_tickets
  FROM ticket_batches tb
  LEFT JOIN tickets t ON tb.id = t.batch_id
  GROUP BY tb.country_code
  HAVING COUNT(t.id) > 0
`).all();

ticketsByCountry.forEach(stat => {
  console.log(`  ${stat.country_code}: ${stat.total_tickets} total, ${stat.available_tickets} available`);
});

console.log('\n🌍 COUNTRIES:');
const countries = db.prepare('SELECT * FROM countries').all();
countries.forEach(country => {
  console.log(`  ${country.code}: ${country.name} ${country.flag}`);
});

db.close();
