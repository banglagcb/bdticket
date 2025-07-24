import { Router, Request, Response } from "express";
import {
  BookingRepository,
  TicketRepository,
  ActivityLogRepository,
} from "../database/models";
import { authenticate, hasPermission } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Schema for creating booking
const createBookingSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  agentInfo: z.object({
    name: z.string().min(1, "Agent name is required"),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }),
  passengerInfo: z.object({
    name: z.string().min(1, "Passenger name is required"),
    passportNo: z.string().min(1, "Passport number is required"),
    phone: z.string().min(1, "Passenger phone is required"),
    paxCount: z.number().min(1, "Passenger count must be at least 1"),
    email: z.string().email().optional(),
  }),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  paymentType: z.enum(["full", "partial"]),
  partialAmount: z.number().min(0).optional(),
  paymentMethod: z.string().default("cash"),
  paymentDetails: z.string().optional(),
  comments: z.string().optional(),
});

// Get all bookings
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let bookings;

    // Check if user can view all bookings or just their own
    if (hasPermission(req.user!.role, "view_all_bookings")) {
      bookings = BookingRepository.findAllForFrontend();
    } else {
      const userBookings = BookingRepository.findByUser(req.user!.id);
      bookings = userBookings.map(booking => BookingRepository.transformForFrontend(booking));
    }

    // Apply status filter
    if (status) {
      bookings = bookings.filter((booking) => booking.status === status);
    }

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    res.json({
      success: true,
      message: "Bookings retrieved successfully",
      data: {
        bookings: paginatedBookings,
        total: bookings.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get single booking by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = BookingRepository.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user can access this booking
    const canViewAllBookings = hasPermission(
      req.user!.role,
      "view_all_bookings",
    );
    if (!canViewAllBookings && booking.created_by !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get associated ticket info
    const ticket = TicketRepository.findById(booking.ticket_id);

    res.json({
      success: true,
      message: "Booking retrieved successfully",
      data: {
        booking,
        ticket,
      },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Create new booking
router.post("/", async (req: Request, res: Response) => {
  try {
    const bookingData = createBookingSchema.parse(req.body);

    // Check if ticket exists and is available
    const ticket = TicketRepository.findById(bookingData.ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Ticket is not available for booking",
      });
    }

    // Validate partial payment amount
    if (bookingData.paymentType === "partial") {
      if (!bookingData.partialAmount || bookingData.partialAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Partial amount is required for partial payments",
        });
      }

      const totalAmount =
        bookingData.sellingPrice * bookingData.passengerInfo.paxCount;
      if (bookingData.partialAmount >= totalAmount) {
        return res.status(400).json({
          success: false,
          message:
            "Partial amount cannot be greater than or equal to total amount",
        });
      }
    }

    // Create the booking
    const booking = BookingRepository.create({
      ticket_id: bookingData.ticketId,
      agent_name: bookingData.agentInfo.name,
      agent_phone: bookingData.agentInfo.phone,
      agent_email: bookingData.agentInfo.email,
      passenger_name: bookingData.passengerInfo.name,
      passenger_passport: bookingData.passengerInfo.passportNo,
      passenger_phone: bookingData.passengerInfo.phone,
      passenger_email: bookingData.passengerInfo.email,
      pax_count: bookingData.passengerInfo.paxCount,
      selling_price: bookingData.sellingPrice,
      payment_type: bookingData.paymentType,
      partial_amount: bookingData.partialAmount,
      payment_method: bookingData.paymentMethod,
      payment_details: bookingData.paymentDetails,
      comments: bookingData.comments,
      status: bookingData.paymentType === "full" ? "confirmed" : "pending",
      created_by: req.user!.id,
    });

    // Update ticket status
    const newTicketStatus =
      bookingData.paymentType === "full" ? "sold" : "locked";
    TicketRepository.updateStatus(
      bookingData.ticketId,
      newTicketStatus,
      bookingData.paymentType === "full" ? req.user!.id : undefined,
    );

    // Log activity
    ActivityLogRepository.create({
      user_id: req.user!.id,
      action: "create_booking",
      entity_type: "booking",
      entity_id: booking.id,
      details: JSON.stringify({
        ticket_id: bookingData.ticketId,
        passenger_name: bookingData.passengerInfo.name,
        payment_type: bookingData.paymentType,
        amount:
          bookingData.paymentType === "full"
            ? bookingData.sellingPrice * bookingData.passengerInfo.paxCount
            : bookingData.partialAmount,
      }),
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent"),
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking,
        bookingId: booking.id,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update booking status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["pending", "confirmed", "cancelled", "expired"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const booking = BookingRepository.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check permissions
    const canViewAllBookings = hasPermission(
      req.user!.role,
      "view_all_bookings",
    );
    if (!canViewAllBookings && booking.created_by !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if user can confirm sales
    if (
      status === "confirmed" &&
      !hasPermission(req.user!.role, "confirm_sales")
    ) {
      return res.status(403).json({
        success: false,
        message: "Permission required to confirm bookings",
      });
    }

    // Update booking status
    const success = BookingRepository.updateStatus(id, status);

    if (success) {
      // Update associated ticket status
      let newTicketStatus: "available" | "sold" | "locked" = "available";

      if (status === "confirmed") {
        newTicketStatus = "sold";
        TicketRepository.updateStatus(
          booking.ticket_id,
          newTicketStatus,
          req.user!.id,
        );
      } else if (status === "cancelled" || status === "expired") {
        newTicketStatus = "available";
        TicketRepository.updateStatus(booking.ticket_id, newTicketStatus);
      }

      // Log activity
      ActivityLogRepository.create({
        user_id: req.user!.id,
        action: "update_booking_status",
        entity_type: "booking",
        entity_id: id,
        details: JSON.stringify({
          old_status: booking.status,
          new_status: status,
          ticket_status: newTicketStatus,
        }),
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get("User-Agent"),
      });

      res.json({
        success: true,
        message: "Booking status updated successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update booking status",
      });
    }
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Cancel booking
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = BookingRepository.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check permissions
    const canViewAllBookings = hasPermission(
      req.user!.role,
      "view_all_bookings",
    );
    if (!canViewAllBookings && booking.created_by !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Don't allow cancellation of confirmed bookings without proper permission
    if (
      booking.status === "confirmed" &&
      !hasPermission(req.user!.role, "override_locks")
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel confirmed booking without override permission",
      });
    }

    // Update booking status to cancelled
    BookingRepository.updateStatus(id, "cancelled");

    // Make ticket available again
    TicketRepository.updateStatus(booking.ticket_id, "available");

    // Log activity
    ActivityLogRepository.create({
      user_id: req.user!.id,
      action: "cancel_booking",
      entity_type: "booking",
      entity_id: id,
      details: JSON.stringify({
        reason: "manual_cancellation",
      }),
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent"),
    });

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
