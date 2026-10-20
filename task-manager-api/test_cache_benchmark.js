/**
 * Practical 9: In-Memory Caching Verification & Response Time Benchmark
 * Measures API response times for cached vs uncached requests,
 * verifies cache invalidation on POST/PUT/DELETE, and inspects cache telemetry.
 */

const http = require('http');

const API_BASE = 'http://localhost:5000';
let authToken = '';
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
          durationMs: parseFloat(durationMs.toFixed(2)),
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

async function runBenchmark() {
  console.log('=== PRACTICAL 9: CACHING & PERFORMANCE BENCHMARK ===\n');

  // 1. Authenticate / Login
  const testUser = {
    email: `cache_test_${Date.now()}@charusat.edu.in`,
    password: 'Password@123',
  };

  console.log('1. Registering test user:', testUser.email);
  await request({
    hostname: 'localhost',
    port: 5000,
    path: '/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, testUser);

  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, testUser);

  authToken = loginRes.data.token;
  console.log('   Authenticated successfully. Token acquired.\n');

  // 2. Seed 10 sample tasks to create a realistic database collection
  console.log('2. Seeding 10 sample tasks into MongoDB...');
  for (let i = 1; i <= 10; i++) {
    const created = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    }, {
      title: `Benchmark Task #${i} - Database Record Optimization`,
      description: `Sample task description ${i} for measuring uncached vs cached response time.`,
      priority: i % 2 === 0 ? 'high' : 'medium',
    });
    if (i === 1) testTaskId = created.data._id;
  }
  console.log('   Tasks seeded. Test task ID:', testTaskId, '\n');

  // 3. Measure UNCACHED requests (flushing cache before each request to simulate pure MongoDB hits)
  console.log('3. Measuring UNCACHED response times (Pure MongoDB Query)...');
  const uncachedReadings = [];
  for (let i = 1; i <= 3; i++) {
    // Flush cache before each reading to ensure a true MongoDB cache MISS
    await request({
      hostname: 'localhost',
      port: 5000,
      path: '/cache/clear',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    uncachedReadings.push({ sample: i, durationMs: res.durationMs, cacheHeader: res.headers['x-cache'] });
    console.log(`   Sample ${i}: ${res.durationMs} ms (X-Cache: ${res.headers['x-cache']})`);
  }

  // 4. Measure CACHED requests (node-cache in-memory hits)
  console.log('\n4. Measuring CACHED response times (node-cache memory hits)...');
  // First request populates cache
  const firstReq = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/tasks',
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  console.log(`   Initial Populating Request: ${firstReq.durationMs} ms (X-Cache: ${firstReq.headers['x-cache']})`);

  const cachedReadings = [];
  for (let i = 1; i <= 3; i++) {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    cachedReadings.push({ sample: i, durationMs: res.durationMs, cacheHeader: res.headers['x-cache'] });
    console.log(`   Sample ${i}: ${res.durationMs} ms (X-Cache: ${res.headers['x-cache']})`);
  }

  // 5. Test Single Task Caching (Supplementary Problem 1)
  console.log('\n5. Testing Single Task Caching (GET /tasks/:id)...');
  const singleMiss = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/tasks/${testTaskId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  console.log(`   GET /tasks/:id (1st call): ${singleMiss.durationMs} ms (X-Cache: ${singleMiss.headers['x-cache']})`);

  const singleHit = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/tasks/${testTaskId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  console.log(`   GET /tasks/:id (2nd call): ${singleHit.durationMs} ms (X-Cache: ${singleHit.headers['x-cache']})`);

  // 6. Test Cache Invalidation on Write (Step 4 & Rubric Requirement)
  console.log('\n6. Verifying Cache Invalidation on Write Operations...');
  console.log('   Sending PUT /tasks/:id to update task status to "working"...');
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/tasks/${testTaskId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  }, { status: 'working' });

  // Subsequent GET /tasks should be a MISS because cache was invalidated
  const postInvalidateGet = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/tasks',
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  console.log(`   GET /tasks immediately after update: ${postInvalidateGet.durationMs} ms (X-Cache: ${postInvalidateGet.headers['x-cache']})`);
  console.log(postInvalidateGet.headers['x-cache'] === 'MISS'
    ? '   SUCCESS: Cache was correctly invalidated upon write! Fresh data served.'
    : '   FAILURE: Stale data was served.');

  // 7. Inspect Cache Telemetry (Supplementary Problem 2)
  console.log('\n7. Fetching Cache Debug Telemetry (/cache/stats)...');
  const statsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/cache/stats',
    method: 'GET',
  });
  console.log('   Cache Stats:', JSON.stringify(statsRes.data, null, 2));

  // 8. Summary Table
  const avgUncached = (uncachedReadings.reduce((sum, r) => sum + r.durationMs, 0) / uncachedReadings.length).toFixed(2);
  const avgCached = (cachedReadings.reduce((sum, r) => sum + r.durationMs, 0) / cachedReadings.length).toFixed(2);
  const speedup = (avgUncached / avgCached).toFixed(1);

  console.log('\n=== EMPIRICAL PERFORMANCE COMPARISON TABLE ===');
  console.log('---------------------------------------------------------');
  console.log('| Sample   | Uncached (MongoDB) | Cached (node-cache)   |');
  console.log('---------------------------------------------------------');
  for (let i = 0; i < 3; i++) {
    console.log(`| Sample ${i + 1} | ${uncachedReadings[i].durationMs.toString().padEnd(18)} | ${cachedReadings[i].durationMs.toString().padEnd(21)} |`);
  }
  console.log('---------------------------------------------------------');
  console.log(`| Average  | ${(avgUncached + ' ms').padEnd(18)} | ${(avgCached + ' ms').padEnd(21)} |`);
  console.log('---------------------------------------------------------');
  console.log(`Speedup Factor: ${speedup}x faster with in-memory caching!\n`);
}

runBenchmark().catch(console.error);
