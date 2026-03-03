'use strict';

const request = require('supertest');

// Stub env vars before requiring app
process.env.IG_VERIFY_TOKEN = 'test_token';
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';

const app = require('../index');

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /webhook – verification', () => {
  it('returns challenge on valid token', async () => {
    const res = await request(app)
      .get('/webhook')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'test_token', 'hub.challenge': 'abc123' });
    expect(res.status).toBe(200);
    expect(res.text).toBe('abc123');
  });

  it('returns 403 on invalid token', async () => {
    const res = await request(app)
      .get('/webhook')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'wrong', 'hub.challenge': 'abc123' });
    expect(res.status).toBe(403);
  });
});

describe('POST /webhook – echo messages', () => {
  it('returns 200 and ignores echo messages', async () => {
    const payload = {
      object: 'instagram',
      entry: [{
        messaging: [{
          sender: { id: 'user_1' },
          recipient: { id: 'page_1' },
          message: { mid: 'mid_1', text: 'hello', is_echo: true },
        }],
      }],
    };
    const res = await request(app).post('/webhook').send(payload);
    expect(res.status).toBe(200);
  });
});
