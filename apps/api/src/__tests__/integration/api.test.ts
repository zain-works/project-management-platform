import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';

describe('API Integration Tests', () => {
  it('GET /api/v1/health returns application health status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('services');
  });

  it('GET /api/v1/dev/emails returns captured emails list', async () => {
    const res = await request(app).get('/api/v1/dev/emails');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.emails)).toBe(true);
  });

  it('GET /api/v1/auth/me rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Authentication required');
  });

  it('POST /api/v1/auth/signup returns 400 validation error on malformed input', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send({
      name: 'A', // too short
      email: 'not-an-email',
      password: '123', // too short, no uppercase
      confirmPassword: '456',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(res.body.details).toBeInstanceOf(Array);
  });

  it('POST /api/v1/auth/login returns 400 validation error on empty fields', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'invalid',
      password: '',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('GET /api/v1/non-existent returns 404 endpoint not found', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Endpoint not found');
  });
});
