import serverless from "serverless-http";
import { createServer } from "../../server";

// Create the Express server
const app = createServer();

// Configure for serverless environment
if (process.env.NODE_ENV === "production") {
  // Production optimizations
  app.set("trust proxy", true);
}

// Export the serverless handler
export const handler = serverless(app, {
  binary: false,
});
