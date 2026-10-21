const { describe, it, before, after } = require('node:test');
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const taskEvents = require('../events');
const { getNotificationLogs, clearNotificationLogs } = require('../listeners');
const User = require('../models/User');
const Task = require('../models/Task');

describe('Practical 10: Event-Driven Architecture & Asynchronous Notifications', () => {
  let authToken = '';
  let userId = '';
  let userEmail = '';
  let createdTaskId = '';

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/p7');
    }

    clearNotificationLogs();

    userEmail = `event_user_${Date.now()}@charusat.edu.in`;
    const res = await request(app)
      .post('/register')
      .send({ email: userEmail, password: 'Password@123' });
    userId = res.body.id;

    const loginRes = await request(app)
      .post('/login')
      .send({ email: userEmail, password: 'Password@123' });
    authToken = loginRes.body.token;
  });

  after(async () => {
    if (userId) {
      await Task.deleteMany({ owner: userId });
      await User.findByIdAndDelete(userId);
    }
    clearNotificationLogs();
    await mongoose.connection.close();
  });

  it('Test 1: POST /tasks responds immediately without waiting for 2-second background notification', async () => {
    const startTime = Date.now();
    const postRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Asynchronous Event-Driven Task Processing',
        description: 'Verify non-blocking EventEmitter execution upon task creation',
        priority: 'high'
      });

    const elapsedMs = Date.now() - startTime;

    assert.strictEqual(postRes.status, 201);
    assert.ok(postRes.body._id);
    createdTaskId = postRes.body._id;

    // Critical assertion: The HTTP response must return well under 1000ms (proving non-blocking async architecture)
    assert.ok(elapsedMs < 1000, `Expected response to return quickly (<1000ms), but took ${elapsedMs}ms`);
  });

  it('Test 2: Background listener begins processing task-created event', () => {
    // Check that event was emitted and listener started without throwing errors
    assert.ok(taskEvents.listenerCount('task-created') >= 1, 'task-created listener must be registered');
  });

  it('Test 3: Background notification completes after 2-second delay', async () => {
    // Wait 2.2 seconds to allow setTimeout(..., 2000) to complete in the background
    await new Promise((resolve) => setTimeout(resolve, 2200));

    const logs = getNotificationLogs();
    const taskCreatedLog = logs.find((l) => l.event === 'task-created' && l.taskId === createdTaskId);

    assert.ok(taskCreatedLog, 'Background notification log for task-created must be recorded');
    assert.strictEqual(taskCreatedLog.status, 'delivered');
    assert.strictEqual(taskCreatedLog.title, 'Asynchronous Event-Driven Task Processing');
    assert.strictEqual(taskCreatedLog.assignedUser, userEmail);
    assert.ok(taskCreatedLog.startedAt);
    assert.ok(taskCreatedLog.completedAt);
  });

  it('Test 4: PUT /tasks/:id emits task-updated event', async () => {
    const putRes = await request(app)
      .put(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'working' });

    assert.strictEqual(putRes.status, 200);

    const logs = getNotificationLogs();
    const updateLog = logs.find((l) => l.event === 'task-updated' && l.taskId === createdTaskId);
    assert.ok(updateLog, 'task-updated log must exist');
    assert.strictEqual(updateLog.status, 'working');
  });

  it('Test 5: DELETE /tasks/:id emits task-deleted event', async () => {
    const delRes = await request(app)
      .delete(`/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(delRes.status, 200);

    const logs = getNotificationLogs();
    const deleteLog = logs.find((l) => l.event === 'task-deleted' && l.taskId === createdTaskId);
    assert.ok(deleteLog, 'task-deleted log must exist');
  });

  it('Test 6: Notification telemetry endpoint (/notifications/logs) reports event metrics', async () => {
    const res = await request(app).get('/notifications/logs');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'online');
    assert.strictEqual(res.body.eventSystem, 'Node.js native EventEmitter');
    assert.ok(res.body.totalNotifications >= 3);
  });
});
