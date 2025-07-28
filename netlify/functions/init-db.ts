import { Handler } from "@netlify/functions";
import { DatabaseInitializer } from "../../server/database/schema";

// Database initialization endpoint for Netlify
export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  try {
    // Initialize database schema and seed data
    DatabaseInitializer.initializeDatabase();
    DatabaseInitializer.seedDatabase();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Database initialized successfully",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Database initialization failed:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Database initialization failed",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};
