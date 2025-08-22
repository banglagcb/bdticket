import express from "express";
import cors from "cors";
import { initializeDatabase, seedDatabase } from "./database/schema";

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

  // Initialize database
  try {
    initializeDatabase();
    seedDatabase();
    console.log("Database initialized and seeded successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
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
    });
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
