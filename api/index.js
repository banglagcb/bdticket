// Vercel serverless function handler for BD TicketPro API
let app;

export default async function handler(req, res) {
  try {
    // Add CORS headers for all requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("Access-Control-Max-Age", "86400");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Initialize app only once
    if (!app) {
      console.log("Initializing BD TicketPro server for Vercel...");

      try {
        // Try to import the server module
        let createServerModule;
        try {
          // Try the most likely paths
          createServerModule = await import("../dist/server/index.js");
        } catch (e1) {
          try {
            createServerModule = await import("../server/index.js");
          } catch (e2) {
            try {
              createServerModule = await import("../dist/server/node-build.mjs");
            } catch (e3) {
              console.log("All import paths failed, trying direct require...");
              createServerModule = await import("../server/index.ts");
            }
          }
        }

        const { createServer } = createServerModule;

        if (!createServer) {
          throw new Error("createServer function not found in module");
        }

        app = createServer();
        console.log("Server initialized successfully for Vercel");
      } catch (importError) {
        console.error("Failed to import server:", importError);
        console.error("Import error details:", importError.stack);

        // Return a simple API response if server can't be imported
        return res.status(500).json({
          success: false,
          message: "Server initialization failed",
          error: importError.message,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Add request logging
    console.log(`${req.method} ${req.url} - User-Agent: ${req.headers["user-agent"] || "unknown"}`);

    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    console.error("Error stack:", error.stack);

    // Ensure headers are set
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
    }

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message || "Server error",
      details: error.stack ? error.stack.split("\n").slice(0, 5) : [],
      timestamp: new Date().toISOString(),
    });
  }
}
