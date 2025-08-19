const Database = require("better-sqlite3");
const { join } = require("path");

const dbPath = join(process.cwd(), "bd-ticketpro.db");
const db = new Database(dbPath);

console.log("🔧 Fixing remaining_tickets for existing group tickets...\n");

try {
  // Get all group tickets
  const groupTickets = db
    .prepare(
      `
    SELECT id, group_name, ticket_count, remaining_tickets 
    FROM umrah_group_tickets 
    ORDER BY created_at DESC
  `,
    )
    .all();

  console.log(`📊 Found ${groupTickets.length} group tickets\n`);

  let fixed = 0;

  for (const ticket of groupTickets) {
    // Count actual assignments
    const assignedCount = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM umrah_group_bookings 
      WHERE group_ticket_id = ?
    `,
      )
      .get(ticket.id);

    const actualRemaining = ticket.ticket_count - (assignedCount?.count || 0);

    console.log(`📋 ${ticket.group_name}:`);
    console.log(`   Total Tickets: ${ticket.ticket_count}`);
    console.log(`   Current Remaining: ${ticket.remaining_tickets || "NULL"}`);
    console.log(`   Assigned Count: ${assignedCount?.count || 0}`);
    console.log(`   Calculated Remaining: ${actualRemaining}`);

    if (ticket.remaining_tickets !== actualRemaining) {
      // Update remaining_tickets
      db.prepare(
        `
        UPDATE umrah_group_tickets 
        SET remaining_tickets = ? 
        WHERE id = ?
      `,
      ).run(actualRemaining, ticket.id);

      console.log(
        `   ✅ Fixed: ${ticket.remaining_tickets || "NULL"} → ${actualRemaining}`,
      );
      fixed++;
    } else {
      console.log(`   ✓ Already correct`);
    }
    console.log("");
  }

  console.log(`🎉 Successfully fixed ${fixed} group tickets!`);

  if (fixed > 0) {
    console.log("\n📝 Summary of changes:");
    const updatedTickets = db
      .prepare(
        `
      SELECT group_name, ticket_count, remaining_tickets,
             (SELECT COUNT(*) FROM umrah_group_bookings WHERE group_ticket_id = umrah_group_tickets.id) as assigned_count
      FROM umrah_group_tickets 
      ORDER BY created_at DESC
    `,
      )
      .all();

    updatedTickets.forEach((ticket) => {
      console.log(
        `   • ${ticket.group_name}: ${ticket.ticket_count} total, ${ticket.assigned_count} assigned, ${ticket.remaining_tickets} remaining`,
      );
    });
  }
} catch (error) {
  console.error("❌ Error fixing remaining_tickets:", error);
} finally {
  db.close();
}
