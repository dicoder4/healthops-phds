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

describe('HealthOps Integration Tests', () => {
  it('GET /homePage without session should return 401 or 403', async () => {
    const res = await request(app).get('/homePage');
    expect([401, 403]).toContain(res.statusCode);
  });
});
