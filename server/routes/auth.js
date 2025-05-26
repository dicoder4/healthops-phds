import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { google } from 'googleapis';

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// GET: Current user info
router.get('/current_user', (req, res) => {
  if (req.session.userId) {
    User.findById(req.session.userId)
      .then(user => res.json({ username: user.username, gmail: user.gmail, phNo: user.phNo }))
      .catch(err => res.status(500).json({ message: 'Error fetching user.' }));
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

// POST: Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 10;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken. Please try another.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// POST: Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    console.log('Session after login:', req.session);
    res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// POST: Logout
router.post('/users/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// Google OAuth routes
router.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
  res.redirect(url);
});

router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No authorization code');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const user = await User.findById(req.session.userId);
    user.googleAccessToken = tokens.access_token;
    user.googleRefreshToken = tokens.refresh_token;
    await user.save();

    res.redirect('/reminders');
  } catch (error) {
    console.error('OAuth2 error:', error);
    res.status(500).send('OAuth2 callback error');
  }
});

export default router;