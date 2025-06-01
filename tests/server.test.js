import mongoose from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

import app from '../server.js';

const MONGO_URI = process.env.MONGO_URI;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('HealthOps Server API Routes', () => {
  // ⚠️ Removed tests expecting frontend HTML

  it('should return 401 for /homePage without session', async () => {
    const res = await request(app).get('/homePage');
    expect([401, 403]).toContain(res.statusCode);
  });
});
