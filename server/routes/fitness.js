import express from 'express';
import User from '../models/user.js';
import Exercise from '../models/exercise.js';
import Food from '../models/food.js';

const router = express.Router();

// GET: Fitness logs page
router.get('/fitnessLogs', async (req, res) => {
  try {
    const username = req.session.username;
    if (!username) return res.status(401).send('User not logged in');

    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('User not found');

    const exercises = await Exercise.find({ routine: user.exerciseRoutine });
    const foods = await Food.find({ routine: user.exerciseRoutine });

    let routineExplanation = '';
    if (user.exerciseRoutine === 'extreme') {
      routineExplanation = "Based on your current weight and ideal weight, your routine is categorized as 'Extreme'. This means you should follow a high-intensity regimen with a focus on burning significant calories.";
    } else if (user.exerciseRoutine === 'medium') {
      routineExplanation = "Based on your current weight and ideal weight, your routine is categorized as 'Medium'. This suggests a balanced workout routine aimed at steady progress.";
    } else if (user.exerciseRoutine === 'normal') {
      routineExplanation = "Based on your current weight and ideal weight, your routine is categorized as 'Normal'. This indicates a moderate approach towards fitness with moderate calorie burn.";
    } else {
      routineExplanation = "Your exercise routine will be calculated based on your current weight and ideal weight.";
    }

    const weeklySchedule = generateWeeklySchedule(exercises, foods);

    res.json({ user, exercises, foods, routineExplanation, weeklySchedule });
  } catch (err) {
    console.error('Error fetching fitness logs:', err);
    res.status(500).send('Server error');
  }
});

// POST: Update goals
router.post('/update-goals', async (req, res) => {
  const { currentWeight, height, age, idealWeight, gender } = req.body;
  const username = req.session.username;
  if (!username) return res.status(401).send('User not logged in');

  const user = await User.findOne({ username });
  if (!user) return res.status(404).send('User not found');

  const bmr = gender === 'male'
    ? 10 * currentWeight + 6.25 * height - 5 * age + 5
    : gender === 'female'
    ? 10 * currentWeight + 6.25 * height - 5 * age - 161
    : 10 * currentWeight + 6.25 * height - 5 * age;

  const calorieGoal = bmr * 1.2;

  const routine = categorizeRoutine(currentWeight, idealWeight);

  user.currentWeight = currentWeight;
  user.height = height;
  user.age = age;
  user.idealWeight = idealWeight;
  user.calorieGoal = calorieGoal;
  user.exerciseRoutine = routine;
  user.gender = gender;

  await user.save();

  res.status(200).json({ success: true });
});

// Helper functions
function generateWeeklySchedule(exercises, foods) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const schedule = [];

  if (exercises.length === 0 || foods.length === 0) return [];

  for (let i = 0; i < 7; i++) {
    schedule.push({
      day: days[i],
      exercise: exercises[i % exercises.length],
      food: foods[i % foods.length],
    });
  }

  return schedule;
}

function categorizeRoutine(currentWeight, idealWeight) {
  if (currentWeight >= idealWeight * 1.2) return 'extreme';
  if (currentWeight >= idealWeight * 1.1) return 'medium';
  return 'normal';
}

export default router;