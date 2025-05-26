import express from 'express';
import User from '../models/user.js';
import Disease from '../models/disease.js';

const router = express.Router();

// POST: Submit symptoms
router.post('/submit-symptoms', async (req, res) => {
  try {
    const symptoms = req.body.symptoms;

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        message: 'Invalid symptoms input. Please try again.',
        diseases: []
      });
    }

    const diseases = await Disease.find({
      symptoms: {
        $all: symptoms.map(symptom => symptom.toLowerCase())
      }
    });

    return res.json({
      diseases: diseases.map(disease => ({
        disease: disease.disease,
        symptoms: disease.symptoms,
        description: disease.description,
        medication: disease.medication
      })),
      message: diseases.length ? null : 'No diseases matched the provided symptoms.'
    });
  } catch (error) {
    console.error('Error processing symptoms:', error.message);
    return res.status(500).json({
      message: 'An error occurred while processing your symptoms.',
      diseases: []
    });
  }
});

// GET: API to fetch user metrics
router.get('/metrics/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Health metrics data
router.get('/health-metrics/data', async (req, res) => {
  const username = req.session.username;
  const user = await User.findOne({ username });

  if (!user) return res.status(404).send('User not found');

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const avgHeartRate = avg(user.heartRate);
  const avgSteps = avg(user.steps);
  const avgWeight = avg(user.weight);

  const message = {
    steps: user.steps.at(-1) > avgSteps
      ? `Wow, you've exceeded! Your average steps were ${avgSteps.toFixed(1)}.`
      : `Your steps are ${user.steps.at(-1)} which is ${user.steps.at(-1) > avgSteps ? 'higher' : 'lower'} than the average of ${avgSteps.toFixed(1)} steps.`,
    weight: user.weight.at(-1) > avgWeight
      ? `Your weight is higher than your average of ${avgWeight.toFixed(1)} kg.`
      : `Your weight is ${user.weight.at(-1)} kg, which is ${user.weight.at(-1) > avgWeight ? 'higher' : 'lower'} than your average of ${avgWeight.toFixed(1)} kg.`,
    heartRate: user.heartRate.at(-1) > avgHeartRate
      ? `Your heart rate is higher than your average of ${avgHeartRate.toFixed(1)} bpm.`
      : `Your heart rate is ${user.heartRate.at(-1)} bpm, which is ${user.heartRate.at(-1) > avgHeartRate ? 'higher' : 'lower'} than your average of ${avgHeartRate.toFixed(1)} bpm.`,
  };

  res.json({ username, user, avgHeartRate, avgSteps, avgWeight, message });
});

// POST: Add metrics
router.post('/metrics', async (req, res) => {
  const { username, weight, steps, heartRate } = req.body;
  const today = new Date();
  const user = await User.findOne({ username });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const lastDate = user.dates.at(-1);
  if (lastDate) {
    const hours = (today - new Date(lastDate)) / (1000 * 3600);
    if (hours < 24) {
      return res.status(400).json({ error: 'You can only add metrics once every 24 hours.' });
    }
  }

  user.weight.push(weight);
  user.steps.push(steps);
  user.heartRate.push(heartRate);
  user.dates.push(today);
  await user.save();

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const message = {
    steps: steps > avg(user.steps)
      ? 'Wow, you have exceeded your average steps today!'
      : `Your previous average step count was ${avg(user.steps).toFixed(1)} steps, now it's ${steps} steps.`,
    weight: weight > avg(user.weight)
      ? `Your weight is higher than your usual average of ${avg(user.weight).toFixed(1)} kg, now it's ${weight} kg.`
      : weight < avg(user.weight)
      ? `Your weight is lower than your usual average of ${avg(user.weight).toFixed(1)} kg, now it's ${weight} kg.`
      : `Your weight remains the same as your usual average of ${avg(user.weight).toFixed(1)} kg.`,
    heartRate: heartRate > avg(user.heartRate)
      ? `Your heart rate is higher than usual. The average was ${avg(user.heartRate).toFixed(1)} bpm, now it's ${heartRate} bpm.`
      : heartRate < avg(user.heartRate)
      ? `Your heart rate is lower than usual. The average was ${avg(user.heartRate).toFixed(1)} bpm, now it's ${heartRate} bpm.`
      : `Your heart rate remains the same as the usual average of ${avg(user.heartRate).toFixed(1)} bpm.`,
  };

  res.json({ success: true, message, user });
});

export default router;