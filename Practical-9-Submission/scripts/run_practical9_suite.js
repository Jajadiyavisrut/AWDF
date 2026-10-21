/**
 * Unified Test & Benchmark Runner for Practical 9
 * CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY
 */

const { execSync } = require('child_process');
const path = require('path');

const API_DIR = path.resolve(__dirname, '../../task-manager-api');

console.log('================================================================');
console.log('  RUNNING COMPLETE PRACTICAL 9 TEST & BENCHMARK SUITE');
console.log('================================================================\n');

try {
  console.log('[Step 1/2] Running Automated Integration Tests...');
  execSync('npm test', { cwd: API_DIR, stdio: 'inherit' });

  console.log('\n[Step 2/2] Running Response-Time Benchmark...');
  execSync('npm run benchmark', { cwd: API_DIR, stdio: 'inherit' });

  console.log('\n================================================================');
  console.log('  ALL PRACTICAL 9 SUITES COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
} catch (err) {
  console.error('\nSuite encountered an error:', err.message);
  process.exit(1);
}
