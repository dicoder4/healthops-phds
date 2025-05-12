import mongoose from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthops_test';
let server;

beforeAll(async () => {
  process.env.MONGO_URI = MONGO_URI;
  server = await import('../server.js'); // Will execute and start server
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
  it('should redirect from / to /login', async () => {
    const res = await request('http://localhost:4000').get('/');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  it('should load login page', async () => {
    const res = await request('http://localhost:4000').get('/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<form'); // EJS form check
  });
});
