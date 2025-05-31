import express from 'express';
import User from '../models/user.js';
import Review from '../models/review.js';
import Exercise from '../models/exercise.js';
import Food from '../models/food.js';
import { checkAuth } from '../middleware/auth.js';

const router = express.Router();

// Homepage route
router.get('/homePage', checkAuth, async (req, res) => {
  console.log('Accessing homePage...');
  try {
    const username = req.session.username; // Retrieve username from session
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
      // User metrics data for charts
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

export default router;