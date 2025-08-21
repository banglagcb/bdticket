#!/usr/bin/env node

/**
 * Simple test to verify deployment readiness
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing deployment readiness...\n');

const checks = [
  {
    name: 'Build output exists',
    test: () => fs.existsSync('dist/spa/index.html'),
    critical: true
  },
  {
    name: 'Server build exists',
    test: () => fs.existsSync('dist/server/node-build.mjs'),
    critical: true
  },
  {
    name: 'API handler exists',
    test: () => fs.existsSync('api/index.js'),
    critical: true
  },
  {
    name: 'Vercel config exists',
    test: () => fs.existsSync('vercel.json'),
    critical: true
  },
  {
    name: 'Package.json is valid',
    test: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return pkg.scripts && pkg.scripts.build;
      } catch {
        return false;
      }
    },
    critical: true
  },
  {
    name: 'No test files remaining',
    test: () => !fs.existsSync('test-api-health.js'),
    critical: false
  },
  {
    name: 'No demo components remaining',
    test: () => !fs.existsSync('client/pages/CountriesDemo.tsx'),
    critical: false
  }
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  const result = check.test();
  const status = result ? '✅ PASS' : (check.critical ? '❌ FAIL' : '⚠️  WARN');
  console.log(`${status} ${check.name}`);
  
  if (result) {
    passed++;
  } else {
    failed++;
    if (check.critical) {
      console.log(`   ⚠️  This is a critical issue that may prevent deployment`);
    }
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All checks passed! Ready for Vercel deployment.');
} else {
  console.log('⚠️  Some issues found. Please review before deploying.');
}
