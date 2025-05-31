import express from 'express';
import User from '../models/user.js';
import Review from '../models/review.js';
import Exercise from '../models/exercise.js';
import Food from '../models/food.js';
import { checkAuth } from '../middleware/auth.js';

const router = express.Router();

// GET: Home page data
router.get('/homePage', checkAuth, async (req, res) => {
  console.log('Accessing homePage...');
  try {
    const username = req.session.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Retrieve the reminders from the user's document
    const reminders = user.reminders;
    
    // Calculate averages and create a motivational message
    const avgWeight = user.weight.reduce((a, b) => a + b, 0) / user.weight.length || 0;
    const avgSteps = user.steps.reduce((a, b) => a + b, 0) / user.steps.length || 0;
    const avgHeartRate = user.heartRate.reduce((a, b) => a + b, 0) / user.heartRate.length || 0;
    const message = "Stay consistent with your goals!";

    // Fetch all reviews for the reviews section
    const reviews = await Review.find().populate('user', 'username').sort({ createdAt: -1 });

    // Fetch exercise and food recommendations based on user's routine
    const exercises = await Exercise.find({ routine: user.exerciseRoutine });
    const foods = await Food.find({ routine: user.exerciseRoutine });

    // Render the homepage with user data and reviews
    res.json({
      username,
      userId: user._id,
      reviews,
      reminders,
      exercises,
      foods,
      user: {
        dates: user.dates,
        weight: user.weight,
        steps: user.steps,
        heartRate: user.heartRate
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// GET: Current user details
router.get('/users/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.session.userId).select('gmail phNo');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ gmail: user.gmail || '', phNo: user.phNo || '' });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// PUT: Update user profile
router.put('/users/update', async (req, res) => {
  console.log('Session userId:', req.session.userId);
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { gmail, phNo } = req.body;

  // Validate Gmail (basic format validation)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
  if (!emailRegex.test(gmail)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validate Phone Number (should be exactly 10 digits)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phNo)) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  try {
    // Find the user by ID from session data
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.gmail = gmail;
    user.phNo = phNo;

    // Save the updated user document
    await user.save();

    // Return success response
    res.json({ message: 'Profile updated successfully!' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

export default router;