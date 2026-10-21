const request = require('supertest');
const mongoose = require('mongoose');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'ci-test-secret';

const app = require('../server');

afterAll(async () => {
  await mongoose.disconnect();
});

test('GET /debug/cache returns online cache telemetry', async () => {
  const response = await request(app).get('/debug/cache');

  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe('online');
  expect(response.body).toHaveProperty('hitRatio');
});