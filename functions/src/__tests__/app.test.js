process.env.JWT_SECRET = 'test_jwt_secret_key_for_tests_only_32chars';
process.env.NODE_ENV = 'test';

const createApp = require('../app');
const request = require('supertest');

// Create app without io and without MongoDB for route-level tests
const app = createApp();

describe('Health endpoint', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/FRIMS/);
  });
});

describe('Not found handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent-route-xyz');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('Auth routes - input validation', () => {
  it('POST /api/auth/register rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'notanemail', password: 'short' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/auth/login rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad-email', password: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('ObjectId validation middleware', () => {
  it('rejects malformed ObjectId in applications route', async () => {
    const res = await request(app)
      .get('/api/applications/not-a-valid-id')
      .set('Authorization', 'Bearer fake.token.here');
    // Will be caught by auth middleware first (401) or objectId middleware (400)
    expect([400, 401]).toContain(res.statusCode);
  });
});
