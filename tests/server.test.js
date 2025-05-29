import mongoose from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

import app from '../server.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthops_test';

beforeAll(async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('HealthOps Server Basic Routes', () => {
  it('should serve React app at root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<!doctype html>');
  });

  it('should serve React app at /login route', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<!doctype html>');
  });
});
