#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Runs post-deployment checks to ensure everything is working
 */

const https = require("https");
const fs = require("fs");

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => req.destroy(new Error("Request timeout")));
  });
}

async function verifyDeployment(baseUrl) {
  console.log("🔍 Verifying deployment at:", baseUrl);

  const checks = [
    {
      name: "Homepage",
      url: baseUrl,
      expectedStatus: 200,
    },
    {
      name: "Health Check",
      url: `${baseUrl}/.netlify/functions/health`,
      expectedStatus: 200,
    },
    {
      name: "API Endpoint",
      url: `${baseUrl}/api/health`,
      expectedStatus: 200,
    },
  ];

  const results = [];

  for (const check of checks) {
    try {
      console.log(`🧪 Testing ${check.name}...`);
      const result = await makeRequest(check.url);

      const passed = result.status === check.expectedStatus;
      results.push({
        name: check.name,
        url: check.url,
        status: result.status,
        passed,
        message: passed
          ? "✅ PASS"
          : `❌ FAIL (expected ${check.expectedStatus}, got ${result.status})`,
      });

      console.log(`  ${results[results.length - 1].message}`);
    } catch (error) {
      results.push({
        name: check.name,
        url: check.url,
        status: "ERROR",
        passed: false,
        message: `❌ ERROR: ${error.message}`,
      });
      console.log(`  ${results[results.length - 1].message}`);
    }
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log("\n📊 Verification Summary:");
  console.log(`✅ Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log("🎉 All deployment checks passed!");
    return true;
  } else {
    console.log("⚠️ Some checks failed. Please review the results above.");
    return false;
  }
}

// Run verification if URL is provided
const url = process.argv[2];
if (url) {
  verifyDeployment(url)
    .then((success) => process.exit(success ? 0 : 1))
    .catch((error) => {
      console.error("💥 Verification failed:", error.message);
      process.exit(1);
    });
} else {
  console.log("Usage: node verify-deployment.js <deployment-url>");
  console.log(
    "Example: node verify-deployment.js https://your-app.netlify.app",
  );
}
