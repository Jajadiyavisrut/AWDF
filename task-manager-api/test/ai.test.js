const request = require('supertest');

jest.mock('openai', () => {
  const create = jest.fn();
  const Client = jest.fn(() => ({
    chat: { completions: { create } },
  }));
  Client.create = create;
  return Client;
});

const loadApp = (apiKey) => {
  jest.resetModules();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'ci-test-secret';
  if (apiKey) process.env.OPENAI_API_KEY = apiKey;
  else delete process.env.OPENAI_API_KEY;
  return require('../server');
};

const getToken = () => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: '507f1f77bcf86cd799439011', email: 'ci@example.com' }, process.env.JWT_SECRET);
};

afterAll(async () => {
  const mongoose = require('mongoose');
  await mongoose.disconnect();
});

test('generates a description from a task title with a mocked OpenAI response', async () => {
  const app = loadApp('test-key');
  const OpenAI = require('openai');
  OpenAI.create.mockResolvedValueOnce({
    choices: [{ message: { content: 'Prepare the report and review the final results.' } }],
  });

  const response = await request(app)
    .post('/api/ai/generate-description')
    .set('Authorization', `Bearer ${getToken()}`)
    .send({ title: 'Finish the report' });

  expect(response.statusCode).toBe(200);
  expect(response.body.description).toBe('Prepare the report and review the final results.');
  expect(OpenAI.create).toHaveBeenCalledWith(expect.objectContaining({
    model: 'gpt-4o-mini',
  }));
});

test('rejects an empty task title', async () => {
  const app = loadApp('test-key');
  const response = await request(app)
    .post('/api/ai/generate-description')
    .set('Authorization', `Bearer ${getToken()}`)
    .send({ title: '   ' });

  expect(response.statusCode).toBe(400);
  expect(response.body.message).toBe('A task title is required.');
});

test('returns a safe fallback when the API key is missing', async () => {
  const app = loadApp();
  const response = await request(app)
    .post('/api/ai/generate-description')
    .set('Authorization', `Bearer ${getToken()}`)
    .send({ title: 'Write documentation' });

  expect(response.statusCode).toBe(503);
  expect(response.body.fallback).toBe(true);
  expect(response.body).not.toHaveProperty('apiKey');
});

test('returns a safe fallback when the provider fails', async () => {
  const app = loadApp('test-key');
  const OpenAI = require('openai');
  OpenAI.create.mockRejectedValueOnce(new Error('simulated provider failure')); 

  const response = await request(app)
    .post('/api/ai/generate-description')
    .set('Authorization', `Bearer ${getToken()}`)
    .send({ title: 'Review deployment' });

  expect(response.statusCode).toBe(503);
  expect(response.body.fallback).toBe(true);
  expect(response.body.message).not.toMatch(/simulated|key|secret/i);
});