import express from "express";
import cors from "cors";
import { initializeDatabase, seedDatabase, db } from "./database/schema";

// Import API routes
import authRoutes from "./routes/auth";
import ticketRoutes from "./routes/tickets";
import ticketBatchRoutes from "./routes/ticket-batches";
import bookingRoutes from "./routes/bookings";
import userRoutes from "./routes/users";
import settingsRoutes from "./routes/settings";
import umrahRoutes from "./routes/umrah";

export function createServer() {
  const app = express();

  // Initialize database with better error handling
  try {
    console.log("Initializing database...");
    initializeDatabase();
    console.log("Database schema initialized successfully");

    try {
      seedDatabase();
      console.log("Database seeded successfully");
    } catch (seedError) {
      console.warn("Database seeding error (continuing anyway):", seedError.message);
    }

    console.log("Database initialization completed");
  } catch (error) {
    console.error("Database initialization error:", error);
    console.error("Error details:", error.stack);
    // Don't throw - allow server to start even with DB issues for debugging
  }

  // Middleware - Allow all origins for Vercel deployment
  app.use(
    cors({
      origin: true, // Allow all origins for now
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get("/api/ping", (_req, res) => {
    res.json({
      message: "BD TicketPro API Server",
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.VERCEL ? "vercel" : "local",
    });
  });

  // Debug endpoint for troubleshooting
  app.get("/api/health", (_req, res) => {
    try {
      const dbHealth = db ? "connected" : "disconnected";
      res.json({
        success: true,
        message: "API is running",
        database: dbHealth,
        environment: process.env.VERCEL ? "vercel" : "local",
        timestamp: new Date().toISOString(),
        path: process.cwd(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Health check failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/ticket-batches", ticketBatchRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/umrah", umrahRoutes);

  // Global error handler
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Global error handler:", err);

      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    },
  );

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      message: "API endpoint not found",
      path: req.path,
    });
  });

  return app;
}
