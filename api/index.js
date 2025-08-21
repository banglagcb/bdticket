// Vercel serverless function handler for BD TicketPro API
import { createServer } from "../dist/server/node-build.mjs";

// Cache the app instance to avoid cold starts
let app;

export default async function handler(req, res) {
  try {
    // Initialize app only once
    if (!app) {
      console.log("Initializing BD TicketPro server...");
      app = createServer();
      console.log("Server initialized successfully");
    }

    // Handle the request
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
}
