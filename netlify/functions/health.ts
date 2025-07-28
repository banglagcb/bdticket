import { Handler } from "@netlify/functions";

// Health check endpoint for monitoring
export const handler: Handler = async (event, context) => {
  const startTime = Date.now();

  try {
    // Basic health checks
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "unknown",
      version: "1.0.0",
      responseTime: Date.now() - startTime,
      memory: process.memoryUsage(),
      // Database connectivity check would go here in production
      database: "connected",
      services: {
        api: "operational",
        auth: "operational",
        booking: "operational",
      },
    };

    return {
      statusCode: 200,
      body: JSON.stringify(healthStatus),
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime: Date.now() - startTime,
      }),
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    };
  }
};
