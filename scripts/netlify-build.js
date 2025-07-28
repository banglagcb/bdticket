#!/usr/bin/env node

/**
 * Netlify Build Script for BD TicketPro
 * This script handles the complete build process for Netlify deployment
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Netlify build process for BD TicketPro...");

try {
  // 1. Clean previous builds
  console.log("🧹 Cleaning previous builds...");
  if (fs.existsSync("dist")) {
    fs.rmSync("dist", { recursive: true, force: true });
  }

  // 2. Install dependencies if needed
  console.log("📦 Checking dependencies...");
  if (!fs.existsSync("node_modules")) {
    console.log("📦 Installing dependencies...");
    execSync("npm ci", { stdio: "inherit" });
  }

  // 3. Build client (React app)
  console.log("🔨 Building client application...");
  execSync("npm run build:client", { stdio: "inherit" });

  // 4. Ensure database directory exists for serverless functions
  console.log("🗄️ Preparing database setup...");
  const dbDir = path.join(__dirname, "..", "netlify", "functions", "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // 5. Copy shared types for serverless functions
  console.log("📋 Preparing shared files...");
  const sharedDir = path.join(__dirname, "..", "shared");
  const netlifySharedDir = path.join(__dirname, "..", "netlify", "shared");
  if (fs.existsSync(sharedDir) && !fs.existsSync(netlifySharedDir)) {
    fs.cpSync(sharedDir, netlifySharedDir, { recursive: true });
  }

  // 6. Create environment info file
  console.log("⚙️ Creating environment info...");
  const envInfo = {
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "production",
    version: "1.0.0",
  };

  fs.writeFileSync(
    path.join(__dirname, "..", "dist", "spa", "build-info.json"),
    JSON.stringify(envInfo, null, 2),
  );

  // 7. Verify build output
  console.log("✅ Verifying build output...");
  const indexPath = path.join(__dirname, "..", "dist", "spa", "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error("Build verification failed: index.html not found");
  }

  console.log("🎉 Netlify build completed successfully!");
  console.log("📁 Build output: dist/spa/");
  console.log("⚡ Functions: netlify/functions/");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
