const { describe, it, before, after } = require('node:test');
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { cache, flushCache, getUserTasksKey, getSingleTaskKey } = require('../config/cache');
const User = require('../models/User');
const Task = require('../models/Task');

describe('Practical 9: In-Memory Caching & Query Optimization Integration Suite', () => {
  let userAToken = '';
  let userAId = '';
  let userBToken = '';
  let userBId = '';
  let createdTaskId = '';

  before(async () => {
    // Ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/p7');
    }

    // Flush cache before running tests
    flushCache();

    // Register User A
    const userAEmail = `user_a_${Date.now()}@charusat.edu.in`;
    const resA = await request(app)
      .post('/register')
      .send({ email: userAEmail, password: 'Password@123' });
    userAId = resA.body.id;

    const loginA = await request(app)
      .post('/login')
      .send({ email: userAEmail, password: 'Password@123' });
    userAToken = loginA.body.token;

    // Register User B for cross-user isolation testing
    const userBEmail = `user_b_${Date.now()}@charusat.edu.in`;
    const resB = await request(app)
      .post('/register')
      .send({ email: userBEmail, password: 'Password@123' });
    userBId = resB.body.id;

    const loginB = await request(app)
      .post('/login')
      .send({ email: userBEmail, password: 'Password@123' });
    userBToken = loginB.body.token;
  });

  after(async () => {
    // Clean up created test data
    if (userAId) {
      await Task.deleteMany({ owner: userAId });
      await User.findByIdAndDelete(userAId);
    }
    if (userBId) {
      await Task.deleteMany({ owner: userBId });
      await User.findByIdAndDelete(userBId);
    }
    flushCache();
    await mongoose.connection.close();
  });

  it('Test 1: Empty Result Sets & Cache Handling', async () => {
    // User A has 0 tasks initially
    const res1 = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userAToken}`);
    
    assert.strictEqual(res1.status, 200);
    assert.deepStrictEqual(res1.body, []);
    assert.strictEqual(res1.headers['x-cache'], 'MISS');

    // Repeated request should be a HIT serving the cached empty array
    const res2 = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userAToken}`);
    
    assert.strictEqual(res2.status, 200);
    assert.deepStrictEqual(res2.body, []);
    assert.strictEqual(res2.headers['x-cache'], 'HIT');
  });

  it('Test 2: Cache Invalidation after POST /tasks', async () => {
    // Create new task
    const postRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Complete Practical 9 Cache Report',
        description: 'Verify node-cache invalidation and write empirical benchmarks',
        priority: 'high'
      });

    assert.strictEqual(postRes.status, 201);
    createdTaskId = postRes.body._id;
    assert.ok(createdTaskId, 'Task ID should be present');

    // The all-tasks cache key must have been invalidated
    const cachedEntry = cache.get(getUserTasksKey(userAId));
    assert.strictEqual(cachedEntry, undefined, 'All-tasks cache must be null/undefined after POST');

    // Subsequent GET /tasks must be a MISS and include the new task
    const getRes = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.headers['x-cache'], 'MISS');
    assert.strictEqual(getRes.body.length, 1);
    assert.strictEqual(getRes.body[0]._id, createdTaskId);
  });

  it('Test 3: Repeated GET /tasks produces Cache HIT', async () => {
    const getRes = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.headers['x-cache'], 'HIT');
    assert.strictEqual(getRes.body.length, 1);
    assert.strictEqual(getRes.body[0]._id, createdTaskId);
  });

  it('Test 4: Single Task Cache (GET /tasks/:id) - MISS then HIT', async () => {
    // 1st request -> Cache MISS
    const res1 = await request(app)
      .get(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.headers['x-cache'], 'MISS');
    assert.strictEqual(res1.body._id, createdTaskId);

    // 2nd request -> Cache HIT
    const res2 = await request(app)
      .get(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.headers['x-cache'], 'HIT');
    assert.strictEqual(res2.body._id, createdTaskId);
  });

  it('Test 5: Cache Invalidation after PUT /tasks/:id', async () => {
    const putRes = await request(app)
      .put(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Complete Practical 9 Cache Report (Updated)',
        status: 'working'
      });

    assert.strictEqual(putRes.status, 200);
    assert.strictEqual(putRes.body.status, 'working');

    // Both single-task and collection cache entries must be invalidated
    assert.strictEqual(cache.get(getSingleTaskKey(userAId, createdTaskId)), undefined);
    assert.strictEqual(cache.get(getUserTasksKey(userAId)), undefined);

    // Next GET /tasks/:id must be MISS with updated status
    const getSingle = await request(app)
      .get(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(getSingle.headers['x-cache'], 'MISS');
    assert.strictEqual(getSingle.body.status, 'working');
  });

  it('Test 6: Cache Invalidation after PATCH /tasks/:id', async () => {
    // Ensure single task is cached again
    await request(app)
      .get(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    const patchRes = await request(app)
      .patch(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ status: 'completed' });

    assert.strictEqual(patchRes.status, 200);
    assert.strictEqual(patchRes.body.status, 'completed');

    // Both caches invalidated
    assert.strictEqual(cache.get(getSingleTaskKey(userAId, createdTaskId)), undefined);
    assert.strictEqual(cache.get(getUserTasksKey(userAId)), undefined);

    // Subsequent GET should be a MISS
    const getUpdated = await request(app)
      .get(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(getUpdated.headers['x-cache'], 'MISS');
    assert.strictEqual(getUpdated.body.status, 'completed');
  });

  it('Test 7: Cache Invalidation after DELETE /tasks/:id', async () => {
    // Repopulate collection and single cache
    await request(app).get('/tasks').set('Authorization', `Bearer ${userAToken}`);
    await request(app).get(`/tasks/${createdTaskId}`).set('Authorization', `Bearer ${userAToken}`);

    // Delete task
    const delRes = await request(app)
      .delete(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(delRes.status, 200);

    // Both caches invalidated
    assert.strictEqual(cache.get(getSingleTaskKey(userAId, createdTaskId)), undefined);
    assert.strictEqual(cache.get(getUserTasksKey(userAId)), undefined);

    // GET /tasks/:id should return 404 (not found and not cached)
    const notFoundRes = await request(app)
      .get(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(notFoundRes.status, 404);

    // GET /tasks should return empty array
    const emptyCollection = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(emptyCollection.status, 200);
    assert.deepStrictEqual(emptyCollection.body, []);
  });

  it('Test 8: Debug & Cache Telemetry Endpoints (/debug/cache & /cache/stats)', async () => {
    const statsRes1 = await request(app).get('/debug/cache');
    assert.strictEqual(statsRes1.status, 200);
    assert.ok(statsRes1.body.hits >= 0);
    assert.ok(statsRes1.body.misses >= 0);
    assert.ok(statsRes1.body.ttlSeconds === 60);
    assert.ok(statsRes1.body.internalStats !== undefined);

    // Verify alias endpoint
    const statsRes2 = await request(app).get('/cache/stats');
    assert.strictEqual(statsRes2.status, 200);
    assert.strictEqual(statsRes2.body.ttlSeconds, statsRes1.body.ttlSeconds);
  });

  it('Test 9: Cross-User Data Isolation & Cache Privacy', async () => {
    // User A creates a private task
    const postA = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'User A Secret Strategy',
        description: 'Classified task that User B must never see',
        priority: 'high'
      });
    const privateTaskAId = postA.body._id;

    // User A caches their task list
    const resA = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(resA.status, 200);
    assert.strictEqual(resA.body.some(t => t._id === privateTaskAId), true);

    // User B requests their own task list -> Must NOT see User A's task
    const resB = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userBToken}`);
    assert.strictEqual(resB.status, 200);
    assert.strictEqual(resB.body.some(t => t._id === privateTaskAId), false, 'User B must NOT see User A tasks!');

    // User B attempts to access User A's single task ID -> 404 Forbidden/Not Found
    const crossAccess = await request(app)
      .get(`/tasks/${privateTaskAId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    assert.strictEqual(crossAccess.status, 404);

    // Clean up User A's private task
    await Task.findByIdAndDelete(privateTaskAId);
  });

  it('Test 10: Authentication Enforcement & Protection', async () => {
    // Unauthenticated GET /tasks must be rejected with 401
    const unauthGet = await request(app).get('/tasks');
    assert.strictEqual(unauthGet.status, 401);

    // Invalid Token must be rejected with 401 Unauthorized
    const badTokenGet = await request(app)
      .get('/tasks')
      .set('Authorization', 'Bearer invalid_token_12345');
    assert.strictEqual(badTokenGet.status, 401);
  });
});
