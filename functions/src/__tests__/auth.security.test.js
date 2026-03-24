process.env.JWT_SECRET = 'test_jwt_secret_key_for_tests_only_32chars';
process.env.NODE_ENV = 'test';

const createApp = require('../app');
const request = require('supertest');

const app = createApp();

describe('Auth security: privilege escalation prevention', () => {
  it('returns 400 when attempting to self-register as admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Attacker',
        email: 'attacker@evil.com',
        password: 'Password123',
        role: 'admin',
      });

    // Input validation rejects 'admin' before the controller executes
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when attempting to self-register as viewer', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Viewer',
        email: 'viewer@evil.com',
        password: 'Password123',
        role: 'viewer',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Auth: login validation', () => {
  it('rejects login with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notvalid', password: 'Password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects login with empty password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects register with missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'Password123' });

    expect(res.statusCode).toBe(400);
    const msgs = res.body.errors?.map((e) => e.message || e.msg || '') || [];
    expect(msgs.some((m) => m.toLowerCase().includes('name'))).toBe(true);
  });
});

