// server.js - FIXED VERSION
// CRITICAL: Load dotenv FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Now import everything else
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'connect-flash';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes AFTER dotenv is configured
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import healthRoutes from './routes/health.js';
import fitnessRoutes from './routes/fitness.js';
import reviewRoutes from './routes/review.js';
import reminderRoutes from './routes/reminder.js';
import homepageRoutes from './routes/homepage.js';

const __dirname = path.resolve();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://healthops-phds-5blg-jofv5rt2l-aditri-b-rays-projects.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1); // Needed when behind proxy like Cloud Run or Heroku
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,                         // HTTPS only in production
    sameSite: 'None',      // Cross-site support only in production
    maxAge: 60 * 60 * 1000                      // 1 hour
  }
}));
app.use(flash());

// Connect to MongoDB (removed deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/', healthRoutes);
app.use('/api', fitnessRoutes);
app.use('/', reviewRoutes);
app.use('/', reminderRoutes);
app.use('/', homepageRoutes);


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

