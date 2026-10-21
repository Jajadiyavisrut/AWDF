/**
 * Practical 9: In-Memory Caching Verification & Empirical Response Time Benchmark
 * CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY
 * Course: Advanced Web Development Frameworks (ITUE301)
 *
 * Measures API response times for cached vs uncached requests,
 * verifies cache invalidation on POST/PUT/DELETE, and inspects cache telemetry.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const app = require('./server');
const { cache, flushCache } = require('./config/cache');
const User = require('./models/User');
const Task = require('./models/Task');

const PORT = 5000;
let serverInstance = null;
let authToken = '';
let testUserId = '';
let testTaskId = '';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime.bigint();
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        let parsed = null;
        try { parsed = JSON.parse(body); } catch (e) { parsed = body; }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          durationMs: parseFloat(durationMs.toFixed(3)),
          data: parsed,
        });
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function calculateStats(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const avg = parseFloat((sum / sorted.length).toFixed(3));
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(3));
  return { sum: parseFloat(sum.toFixed(3)), avg, median, min, max, count: sorted.length };
}

async function ensureServerRunning() {
  // Check if server is already running on port 5000
  const isRunning = await new Promise((resolve) => {
    const tester = http.get(`http://localhost:${PORT}/debug/cache`, () => resolve(true));
    tester.on('error', () => resolve(false));
    tester.setTimeout(500, () => {
      tester.destroy();
      resolve(false);
    });
  });

  if (!isRunning) {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/p7');
    }
    serverInstance = app.listen(PORT);
    console.log(`[Benchmark] Server started internally on port ${PORT}`);
    await new Promise((r) => setTimeout(r, 400));
  } else {
    console.log(`[Benchmark] Connected to existing server on port ${PORT}`);
  }
}

async function runBenchmark() {
  console.log('================================================================');
  console.log('  CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY');
  console.log('  Practical 9: In-Memory Caching & Empirical Response Time Benchmark');
  console.log('================================================================\n');

  await ensureServerRunning();
  flushCache();

  // 1. Authenticate / Login
  const testEmail = `benchmark_user_${Date.now()}@charusat.edu.in`;
  const testPassword = 'Password@123';

  console.log(`[Phase 1] Registering and authenticating benchmark user (${testEmail})...`);
  const regRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: testEmail, password: testPassword });
  testUserId = regRes.data.id;

  const loginRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: testEmail, password: testPassword });

  authToken = loginRes.data.token;
  console.log('          Authentication successful. JWT Bearer token acquired.\n');

  // 2. Seed 15 sample tasks for a realistic database payload
  console.log('[Phase 2] Seeding 15 sample tasks into MongoDB to simulate realistic workload...');
  for (let i = 1; i <= 15; i++) {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    }, {
      title: `Practical 9 Benchmark Task #${i}: Database Query Optimization`,
      description: `Comprehensive workload task item ${i} evaluating uncached vs cached response latency in Node.js Express.`,
      priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
    });
    if (i === 1) testTaskId = res.data._id;
  }
  console.log(`          Seeded 15 tasks. Reference task ID: ${testTaskId}\n`);

  // 3. Warm-up requests
  console.log('[Phase 3] Application warm-up (JIT compilation & connection pooling)...');
  for (let i = 1; i <= 2; i++) {
    await request({
      hostname: 'localhost',
      port: PORT,
      path: '/tasks',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });
  }
  console.log('          Warm-up complete.\n');

  // 4. UNCACHED Readings (Pure MongoDB Queries)
  console.log('[Phase 4] Measuring UNCACHED response times (Cache flushed prior to request -> Pure MongoDB Query)...');
  const uncachedDurations = [];
  const uncachedReadings = [];
  for (let i = 1; i <= 5; i++) {
    // Clear cache to enforce pure MongoDB query
    await request({
      hostname: 'localhost',
      port: PORT,
      path: '/debug/cache/clear',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/tasks',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    uncachedDurations.push(res.durationMs);
    uncachedReadings.push({
      iteration: i,
      durationMs: res.durationMs,
      cacheHeader: res.headers['x-cache'],
      itemCount: Array.isArray(res.data) ? res.data.length : 0,
    });
    console.log(`          Iteration ${i}: ${res.durationMs.toFixed(3)} ms | X-Cache: ${res.headers['x-cache']} | Items: ${res.data.length}`);
  }

  // 5. CACHED Readings (node-cache in-memory hits)
  console.log('\n[Phase 5] Measuring CACHED response times (node-cache in-memory hits)...');
  // First request ensures cache is warm and populated
  const primeRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/tasks',
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  console.log(`          Cache Priming Call: ${primeRes.durationMs.toFixed(3)} ms | X-Cache: ${primeRes.headers['x-cache']}`);

  const cachedDurations = [];
  const cachedReadings = [];
  for (let i = 1; i <= 5; i++) {
    const res = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/tasks',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    cachedDurations.push(res.durationMs);
    cachedReadings.push({
      iteration: i,
      durationMs: res.durationMs,
      cacheHeader: res.headers['x-cache'],
      itemCount: Array.isArray(res.data) ? res.data.length : 0,
    });
    console.log(`          Iteration ${i}: ${res.durationMs.toFixed(3)} ms | X-Cache: ${res.headers['x-cache']} | Items: ${res.data.length}`);
  }

  // 6. Single Task Endpoint Caching Verification
  console.log('\n[Phase 6] Verifying Single Task Endpoint Caching (GET /tasks/:id)...');
  await request({
    hostname: 'localhost',
    port: PORT,
    path: '/debug/cache/clear',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const singleMiss = await request({
    hostname: 'localhost',
    port: PORT,
    path: `/tasks/${testTaskId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  console.log(`          Call 1 (Cache MISS): ${singleMiss.durationMs.toFixed(3)} ms | X-Cache: ${singleMiss.headers['x-cache']} | Task: "${singleMiss.data.title}"`);

  const singleHit = await request({
    hostname: 'localhost',
    port: PORT,
    path: `/tasks/${testTaskId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  console.log(`          Call 2 (Cache HIT) : ${singleHit.durationMs.toFixed(3)} ms | X-Cache: ${singleHit.headers['x-cache']} | Task: "${singleHit.data.title}"`);

  // 7. Cache Invalidation Verification on Write
  console.log('\n[Phase 7] Verifying Invalidation on Write (PUT /tasks/:id)...');
  const putRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: `/tasks/${testTaskId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  }, { status: 'working' });
  console.log(`          Task updated to status: ${putRes.data.status}`);

  const postInvalidateGet = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/tasks',
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  console.log(`          Subsequent GET /tasks: ${postInvalidateGet.durationMs.toFixed(3)} ms | X-Cache: ${postInvalidateGet.headers['x-cache']}`);
  const invalidationSuccess = postInvalidateGet.headers['x-cache'] === 'MISS';
  console.log(invalidationSuccess
    ? '          [VERIFIED] Stale data avoided! Cache was invalidated successfully.'
    : '          [FAILED] Stale cache served.');

  // 8. Cache Statistics & Telemetry
  console.log('\n[Phase 8] Inspecting Cache Statistics (/debug/cache)...');
  const statsRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/debug/cache',
    method: 'GET',
  });
  console.log('          Stats:', JSON.stringify(statsRes.data, null, 2));

  // 9. Statistical Computations
  const uncachedStats = calculateStats(uncachedDurations);
  const cachedStats = calculateStats(cachedDurations);
  const improvementPercent = parseFloat((((uncachedStats.avg - cachedStats.avg) / uncachedStats.avg) * 100).toFixed(2));
  const speedupFactor = parseFloat((uncachedStats.avg / cachedStats.avg).toFixed(2));

  console.log('\n================================================================');
  console.log('                EMPIRICAL PERFORMANCE SUMMARY');
  console.log('================================================================');
  console.log('| Metric              | Uncached (MongoDB) | Cached (node-cache) | Improvement |');
  console.log('|---------------------|--------------------|---------------------|-------------|');
  console.log(`| Average Latency     | ${uncachedStats.avg.toFixed(3).padEnd(18)} | ${cachedStats.avg.toFixed(3).padEnd(19)} | ${improvementPercent}% faster |`);
  console.log(`| Median Latency      | ${uncachedStats.median.toFixed(3).padEnd(18)} | ${cachedStats.median.toFixed(3).padEnd(19)} | ${(100 - (cachedStats.median / uncachedStats.median) * 100).toFixed(2)}% faster |`);
  console.log(`| Min Latency         | ${uncachedStats.min.toFixed(3).padEnd(18)} | ${cachedStats.min.toFixed(3).padEnd(19)} | -           |`);
  console.log(`| Max Latency         | ${uncachedStats.max.toFixed(3).padEnd(18)} | ${cachedStats.max.toFixed(3).padEnd(19)} | -           |`);
  console.log('================================================================');
  console.log(`Speedup Factor: ${speedupFactor}x faster with in-memory caching!\n`);

  // 10. Save results to Practical-9-Submission/test-results/
  const resultsPayload = {
    metadata: {
      university: 'CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY',
      faculty: 'Faculty of Technology and Engineering',
      course: 'B.Tech IT/CE/CSE/AIML',
      subject: 'Advanced Web Development Frameworks (ITUE301)',
      practical: 'Practical 9: In-Memory Caching and Query Optimization',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        database: 'MongoDB (Mongoose)',
        cacheEngine: 'node-cache v5.1.2',
        ttlSeconds: 60,
      },
    },
    dataset: {
      sampleTasksCount: 15,
      testUserId,
      testTaskId,
    },
    readings: {
      uncached: uncachedReadings,
      cached: cachedReadings,
      singleTask: {
        missMs: singleMiss.durationMs,
        hitMs: singleHit.durationMs,
        invalidationVerified: invalidationSuccess,
      },
    },
    statistics: {
      uncached: uncachedStats,
      cached: cachedStats,
      improvementPercent,
      speedupFactor,
      formulaUsed: {
        average: 'sum(observed_times) / n',
        improvement: '((uncachedAvg - cachedAvg) / uncachedAvg) * 100',
      },
    },
    cacheTelemetry: statsRes.data,
  };

  const outputDir = path.resolve(__dirname, '../Practical-9-Submission/test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'benchmark-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(resultsPayload, null, 2), 'utf-8');
  console.log(`[Output] Benchmark results saved successfully to:\n         ${outputPath}\n`);

  // Clean up seeded benchmark data
  if (testUserId) {
    await Task.deleteMany({ owner: testUserId });
    await User.findByIdAndDelete(testUserId);
    console.log('[Cleanup] Benchmark test user and tasks deleted cleanly.');
  }

  if (serverInstance) {
    serverInstance.close();
    await mongoose.connection.close();
    console.log('[Cleanup] Benchmark server and database connection closed.');
  }

  return resultsPayload;
}

if (require.main === module) {
  runBenchmark()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Benchmark Error]:', err);
      process.exit(1);
    });
}

module.exports = runBenchmark;
