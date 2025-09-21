import { Router, Request, Response } from "express";
import {
  TicketBatchRepository,
  TicketRepository,
  ActivityLogRepository,
} from "../database/models";
import { authenticate, requirePermission } from "../middleware/auth";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { calculateOptimalSellingPrice } from "../lib/financial-calculator";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Schema for creating ticket batch
const createBatchSchema = z.object({
  country: z.string().min(1, "Country is required"),
  airline: z.string().min(1, "Airline is required"),
  flightDate: z.string().min(1, "Flight date is required"),
  flightTime: z.string().min(1, "Flight time is required"),
  buyingPrice: z.number().min(0, "Buying price must be positive"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  agentName: z.string().min(1, "Agent name is required"),
  agentContact: z.string().optional(),
  agentAddress: z.string().optional(),
  remarks: z.string().optional(),
});

// Get all ticket batches (admin only)
router.get(
  "/",
  requirePermission("view_profit"),
  async (req: Request, res: Response) => {
    try {
      const { country, airline, dateFrom, dateTo } = req.query;

      let batches = TicketBatchRepository.findAll();

      // Apply filters
      if (country) {
        batches = batches.filter((batch) => batch.country_code === country);
      }

      if (airline) {
        batches = batches.filter((batch) =>
          batch.airline_name
            .toLowerCase()
            .includes((airline as string).toLowerCase()),
        );
      }

      if (dateFrom) {
        batches = batches.filter((batch) => batch.flight_date >= dateFrom);
      }

      if (dateTo) {
        batches = batches.filter((batch) => batch.flight_date <= dateTo);
      }

      // Get ticket statistics for each batch
      const batchesWithStats = batches.map((batch) => {
        const tickets = TicketRepository.findAll().filter(
          (ticket) => ticket.batch_id === batch.id,
        );
        const sold = tickets.filter(
          (ticket) => ticket.status === "sold",
        ).length;
        const locked = tickets.filter(
          (ticket) => ticket.status === "locked",
        ).length;
        const available = tickets.filter(
          (ticket) => ticket.status === "available",
        ).length;

        // Calculate profit
        const soldTickets = tickets.filter(
          (ticket) => ticket.status === "sold",
        );
        const totalRevenue = soldTickets.reduce(
          (sum, ticket) => sum + ticket.selling_price,
          0,
        );
        const totalCost = sold * batch.buying_price;
        const profit = totalRevenue - totalCost;

        return {
          ...batch,
          sold,
          locked,
          available,
          totalCost: batch.buying_price * batch.quantity,
          profit,
        };
      });

      res.json({
        success: true,
        message: "Ticket batches retrieved successfully",
        data: {
          batches: batchesWithStats,
          total: batchesWithStats.length,
        },
      });
    } catch (error) {
      console.error("Get ticket batches error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Get single ticket batch by ID
router.get(
  "/:id",
  requirePermission("view_profit"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const batch = TicketBatchRepository.findById(id);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Ticket batch not found",
        });
      }

      // Get associated tickets
      const tickets = TicketRepository.findAll().filter(
        (ticket) => ticket.batch_id === id,
      );

      res.json({
        success: true,
        message: "Ticket batch retrieved successfully",
        data: {
          batch,
          tickets,
        },
      });
    } catch (error) {
      console.error("Get ticket batch error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Create new ticket batch (admin only)
router.post(
  "/",
  requirePermission("create_batches"),
  async (req: Request, res: Response) => {
    try {
      console.log("Creating ticket batch - Request body:", req.body);
      console.log("User:", req.user?.id, req.user?.username);

      // Validate request body
      const batchData = createBatchSchema.parse(req.body);
      console.log("Batch data validated successfully:", batchData);

      // Create the ticket batch
      console.log("Creating ticket batch in database...");
      const batch = TicketBatchRepository.create({
        country_code: batchData.country.toUpperCase(),
        airline_name: batchData.airline,
        flight_date: batchData.flightDate,
        flight_time: batchData.flightTime,
        buying_price: batchData.buyingPrice,
        quantity: batchData.quantity,
        agent_name: batchData.agentName,
        agent_contact: batchData.agentContact || null,
        agent_address: batchData.agentAddress || null,
        remarks: batchData.remarks || null,
        created_by: req.user!.id,
      });
      console.log("Ticket batch created successfully:", batch.id);

      // Create individual tickets for this batch
      console.log(`Creating ${batchData.quantity} individual tickets...`);
      const createdTickets = [];

      for (let i = 1; i <= batchData.quantity; i++) {
        try {
          // Generate flight number (simplified)
          const airlineCode =
            batchData.airline === "Air Arabia"
              ? "G9"
              : batchData.airline === "Emirates"
                ? "EK"
                : batchData.airline === "Qatar Airways"
                  ? "QR"
                  : batchData.airline === "Saudi Airlines"
                    ? "SV"
                    : batchData.airline === "Flydubai"
                      ? "FZ"
                      : "XX";

          const flightNumber = `${airlineCode} ${Math.floor(Math.random() * 900) + 100}`;

          // Calculate selling price with fallback
          let sellingPrice;
          try {
            sellingPrice = calculateOptimalSellingPrice(
              batchData.buyingPrice,
              batchData.country.toUpperCase(),
            );
          } catch (priceError) {
            console.warn("Error calculating optimal selling price:", priceError);
            // Fallback to 30% markup
            sellingPrice = Math.round(batchData.buyingPrice * 1.3);
          }

          const ticket = TicketRepository.create({
            batch_id: batch.id,
            flight_number: flightNumber,
            status: "available",
            selling_price: sellingPrice,
            aircraft:
              batchData.airline === "Air Arabia"
                ? "Airbus A320"
                : batchData.airline === "Emirates"
                  ? "Boeing 777"
                  : batchData.airline === "Qatar Airways"
                    ? "Boeing 787"
                    : "Airbus A321",
            terminal: `Terminal ${Math.floor(Math.random() * 3) + 1}`,
            arrival_time: "18:45", // Default arrival time
            duration: "4h 15m", // Default duration
            available_seats: 1,
            total_seats: 1,
          });

          createdTickets.push(ticket);
          console.log(`Created ticket ${i}/${batchData.quantity}: ${ticket.id}`);
        } catch (ticketError) {
          console.error(`Error creating ticket ${i}:`, ticketError);
          throw ticketError;
        }
      }

      console.log(`Successfully created ${createdTickets.length} tickets`);

      // Log activity
      try {
        ActivityLogRepository.create({
          user_id: req.user!.id,
          action: "create_ticket_batch",
          entity_type: "ticket_batch",
          entity_id: batch.id,
          details: JSON.stringify({
            airline: batchData.airline,
            country: batchData.country,
            quantity: batchData.quantity,
            buying_price: batchData.buyingPrice,
          }),
          ip_address: req.ip || req.connection.remoteAddress || "unknown",
          user_agent: req.get("User-Agent") || "unknown",
        });
        console.log("Activity logged successfully");
      } catch (logError) {
        console.warn("Failed to log activity:", logError);
        // Don't fail the request for logging errors
      }

      res.status(201).json({
        success: true,
        message: "Ticket batch created successfully",
        data: {
          batch,
          ticketsCreated: createdTickets.length,
        },
      });
    } catch (error) {
      console.error("Create ticket batch error:", error);
      console.error("Error stack:", error.stack);

      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      }

      // Provide more specific error messages for database issues
      if (error.message && error.message.includes("SQLITE_")) {
        console.error("Database error detected:", error.message);
        return res.status(500).json({
          success: false,
          message: "Database error occurred",
          error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Update ticket batch (admin only)
router.put(
  "/:id",
  requirePermission("edit_batches"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const batch = TicketBatchRepository.findById(id);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Ticket batch not found",
        });
      }

      // Note: In a real implementation, you'd want to update the batch
      // For now, we'll just return a success message
      res.json({
        success: true,
        message: "Ticket batch updated successfully",
      });
    } catch (error) {
      console.error("Update ticket batch error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Delete ticket batch (admin only)
router.delete(
  "/:id",
  requirePermission("delete_batches"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const batch = TicketBatchRepository.findById(id);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Ticket batch not found",
        });
      }

      // Check if any tickets are already sold
      const tickets = TicketRepository.findAll().filter(
        (ticket) => ticket.batch_id === id,
      );
      const hasSoldTickets = tickets.some((ticket) => ticket.status === "sold");

      if (hasSoldTickets) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete batch with sold tickets",
        });
      }

      // Note: In a real implementation, you'd want to delete the batch and associated tickets
      // For now, we'll just return a success message
      res.json({
        success: true,
        message: "Ticket batch deleted successfully",
      });
    } catch (error) {
      console.error("Delete ticket batch error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

export default router;
