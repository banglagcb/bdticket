import { Router } from "express";
import { 
  UmrahWithTransportRepository, 
  UmrahWithoutTransportRepository,
  ActivityLogRepository,
  type UmrahWithTransport,
  type UmrahWithoutTransport 
} from "../database/models";
import { authenticate, requirePermission } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Validation schemas
const umrahWithTransportSchema = z.object({
  passenger_name: z.string().min(1, "Passenger name is required"),
  pnr: z.string().min(1, "PNR is required"),
  passport_number: z.string().min(1, "Passport number is required"),
  flight_airline_name: z.string().min(1, "Flight/Airline name is required"),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  return_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  approved_by: z.string().min(1, "Approved by is required"),
  reference_agency: z.string().min(1, "Reference agency is required"),
  emergency_flight_contact: z.string().min(1, "Emergency contact is required"),
  passenger_mobile: z.string().min(1, "Passenger mobile is required"),
});

const umrahWithoutTransportSchema = z.object({
  flight_departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  return_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  passenger_name: z.string().min(1, "Passenger name is required"),
  passport_number: z.string().min(1, "Passport number is required"),
  entry_recorded_by: z.string().min(1, "Entry recorded by is required"),
  total_amount: z.number().positive("Total amount must be positive"),
  amount_paid: z.number().min(0, "Amount paid cannot be negative"),
  last_payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  remarks: z.string().optional(),
});

const paymentUpdateSchema = z.object({
  amount: z.number().positive("Payment amount must be positive"),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
});

// Umrah With Transport routes
router.get("/with-transport", authenticateToken, (req, res) => {
  try {
    const { search } = req.query;
    let packages: UmrahWithTransport[];

    if (search && typeof search === "string") {
      packages = UmrahWithTransportRepository.search(search);
    } else {
      packages = UmrahWithTransportRepository.findAll();
    }

    res.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("Error fetching umrah with transport packages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch packages",
    });
  }
});

router.get("/with-transport/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const umrahPackage = UmrahWithTransportRepository.findById(id);

    if (!umrahPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.json({
      success: true,
      data: umrahPackage,
    });
  } catch (error) {
    console.error("Error fetching umrah with transport package:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch package",
    });
  }
});

router.post("/with-transport", authenticateToken, (req, res) => {
  try {
    const validatedData = umrahWithTransportSchema.parse(req.body);
    
    // Validate date logic
    const departureDate = new Date(validatedData.departure_date);
    const returnDate = new Date(validatedData.return_date);
    
    if (returnDate <= departureDate) {
      return res.status(400).json({
        success: false,
        message: "Return date must be after departure date",
      });
    }

    const umrahPackage = UmrahWithTransportRepository.create({
      ...validatedData,
      created_by: req.user!.id,
    });

    // Log activity
    ActivityLogRepository.create({
      user_id: req.user!.id,
      action: "CREATE",
      entity_type: "umrah_with_transport",
      entity_id: umrahPackage.id,
      details: JSON.stringify({
        passenger_name: validatedData.passenger_name,
        pnr: validatedData.pnr,
      }),
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    });

    res.status(201).json({
      success: true,
      data: umrahPackage,
      message: "Umrah with transport package created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    console.error("Error creating umrah with transport package:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create package",
    });
  }
});

router.put("/with-transport/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = umrahWithTransportSchema.partial().parse(req.body);

    const existingPackage = UmrahWithTransportRepository.findById(id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Validate date logic if dates are being updated
    if (validatedData.departure_date || validatedData.return_date) {
      const departureDate = new Date(validatedData.departure_date || existingPackage.departure_date);
      const returnDate = new Date(validatedData.return_date || existingPackage.return_date);
      
      if (returnDate <= departureDate) {
        return res.status(400).json({
          success: false,
          message: "Return date must be after departure date",
        });
      }
    }

    const updatedPackage = UmrahWithTransportRepository.update(id, validatedData);

    // Log activity
    ActivityLogRepository.create({
      user_id: req.user!.id,
      action: "UPDATE",
      entity_type: "umrah_with_transport",
      entity_id: id,
      details: JSON.stringify(validatedData),
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    });

    res.json({
      success: true,
      data: updatedPackage,
      message: "Package updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    console.error("Error updating umrah with transport package:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update package",
    });
  }
});

router.delete("/with-transport/:id", authenticateToken, requirePermission("delete_bookings"), (req, res) => {
  try {
    const { id } = req.params;
    
    const existingPackage = UmrahWithTransportRepository.findById(id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const success = UmrahWithTransportRepository.delete(id);
    
    if (success) {
      // Log activity
      ActivityLogRepository.create({
        user_id: req.user!.id,
        action: "DELETE",
        entity_type: "umrah_with_transport",
        entity_id: id,
        details: JSON.stringify({
          passenger_name: existingPackage.passenger_name,
          pnr: existingPackage.pnr,
        }),
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
      });

      res.json({
        success: true,
        message: "Package deleted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete package",
      });
    }
  } catch (error) {
    console.error("Error deleting umrah with transport package:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete package",
    });
  }
});

// Umrah Without Transport routes
router.get("/without-transport", authenticateToken, (req, res) => {
  try {
    const { search, pending_only } = req.query;
    let packages: UmrahWithoutTransport[];

    if (pending_only === "true") {
      packages = UmrahWithoutTransportRepository.findPendingPayments();
    } else if (search && typeof search === "string") {
      packages = UmrahWithoutTransportRepository.search(search);
    } else {
      packages = UmrahWithoutTransportRepository.findAll();
    }

    res.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("Error fetching umrah without transport packages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch packages",
    });
  }
});

router.get("/without-transport/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const umrahPackage = UmrahWithoutTransportRepository.findById(id);

    if (!umrahPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.json({
      success: true,
      data: umrahPackage,
    });
  } catch (error) {
    console.error("Error fetching umrah without transport package:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch package",
    });
  }
});

router.post("/without-transport", authenticateToken, (req, res) => {
  try {
    const validatedData = umrahWithoutTransportSchema.parse(req.body);
    
    // Validate date logic
    const departureDate = new Date(validatedData.flight_departure_date);
    const returnDate = new Date(validatedData.return_date);
    
    if (returnDate <= departureDate) {
      return res.status(400).json({
        success: false,
        message: "Return date must be after departure date",
      });
    }

    // Validate payment logic
    if (validatedData.amount_paid > validatedData.total_amount) {
      return res.status(400).json({
        success: false,
        message: "Amount paid cannot exceed total amount",
      });
    }

    const umrahPackage = UmrahWithoutTransportRepository.create({
      ...validatedData,
      created_by: req.user!.id,
    });

    // Log activity
    ActivityLogRepository.create({
      user_id: req.user!.id,
      action: "CREATE",
      entity_type: "umrah_without_transport",
      entity_id: umrahPackage.id,
      details: JSON.stringify({
        passenger_name: validatedData.passenger_name,
        total_amount: validatedData.total_amount,
        amount_paid: validatedData.amount_paid,
      }),
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    });

    res.status(201).json({
      success: true,
      data: umrahPackage,
      message: "Umrah without transport package created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    console.error("Error creating umrah without transport package:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create package",
    });
  }
});

router.put("/without-transport/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = umrahWithoutTransportSchema.partial().parse(req.body);

    const existingPackage = UmrahWithoutTransportRepository.findById(id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Validate date logic if dates are being updated
    if (validatedData.flight_departure_date || validatedData.return_date) {
      const departureDate = new Date(validatedData.flight_departure_date || existingPackage.flight_departure_date);
      const returnDate = new Date(validatedData.return_date || existingPackage.return_date);
      
      if (returnDate <= departureDate) {
        return res.status(400).json({
          success: false,
          message: "Return date must be after departure date",
        });
      }
    }

    // Validate payment logic if amounts are being updated
    if (validatedData.total_amount !== undefined || validatedData.amount_paid !== undefined) {
      const totalAmount = validatedData.total_amount ?? existingPackage.total_amount;
      const amountPaid = validatedData.amount_paid ?? existingPackage.amount_paid;
      
      if (amountPaid > totalAmount) {
        return res.status(400).json({
          success: false,
          message: "Amount paid cannot exceed total amount",
        });
      }
    }

    const updatedPackage = UmrahWithoutTransportRepository.update(id, validatedData);

    // Log activity
    ActivityLogRepository.create({
      user_id: req.user!.id,
      action: "UPDATE",
      entity_type: "umrah_without_transport",
      entity_id: id,
      details: JSON.stringify(validatedData),
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    });

    res.json({
      success: true,
      data: updatedPackage,
      message: "Package updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    console.error("Error updating umrah without transport package:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update package",
    });
  }
});

router.post("/without-transport/:id/payment", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = paymentUpdateSchema.parse(req.body);

    const existingPackage = UmrahWithoutTransportRepository.findById(id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Validate payment amount
    const newTotalPaid = existingPackage.amount_paid + validatedData.amount;
    if (newTotalPaid > existingPackage.total_amount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount exceeds remaining balance",
      });
    }

    const updatedPackage = UmrahWithoutTransportRepository.updatePayment(
      id, 
      validatedData.amount,
      validatedData.payment_date
    );

    // Log activity
    ActivityLogRepository.create({
      user_id: req.user!.id,
      action: "PAYMENT",
      entity_type: "umrah_without_transport",
      entity_id: id,
      details: JSON.stringify({
        payment_amount: validatedData.amount,
        payment_date: validatedData.payment_date,
        new_amount_paid: newTotalPaid,
        remaining_amount: existingPackage.total_amount - newTotalPaid,
      }),
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    });

    res.json({
      success: true,
      data: updatedPackage,
      message: "Payment recorded successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    console.error("Error recording payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record payment",
    });
  }
});

router.delete("/without-transport/:id", authenticateToken, requirePermission("delete_bookings"), (req, res) => {
  try {
    const { id } = req.params;
    
    const existingPackage = UmrahWithoutTransportRepository.findById(id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const success = UmrahWithoutTransportRepository.delete(id);
    
    if (success) {
      // Log activity
      ActivityLogRepository.create({
        user_id: req.user!.id,
        action: "DELETE",
        entity_type: "umrah_without_transport",
        entity_id: id,
        details: JSON.stringify({
          passenger_name: existingPackage.passenger_name,
          total_amount: existingPackage.total_amount,
        }),
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
      });

      res.json({
        success: true,
        message: "Package deleted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete package",
      });
    }
  } catch (error) {
    console.error("Error deleting umrah without transport package:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete package",
    });
  }
});

// Summary and statistics
router.get("/payment-summary", authenticateToken, requirePermission("view_profit"), (req, res) => {
  try {
    const summary = UmrahWithoutTransportRepository.getPaymentSummary();
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching payment summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment summary",
    });
  }
});

router.get("/stats", authenticateToken, (req, res) => {
  try {
    const withTransportPackages = UmrahWithTransportRepository.findAll();
    const withoutTransportPackages = UmrahWithoutTransportRepository.findAll();
    const paymentSummary = UmrahWithoutTransportRepository.getPaymentSummary();
    
    const stats = {
      total_with_transport: withTransportPackages.length,
      total_without_transport: withoutTransportPackages.length,
      total_packages: withTransportPackages.length + withoutTransportPackages.length,
      payment_summary: paymentSummary,
    };
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching umrah stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
});

export default router;
