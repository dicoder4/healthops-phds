import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import bcrypt from 'bcrypt';
import User from './models/user.js';
import Disease from './models/disease.js';
import Exercise from './models/exercise.js';  // Import the Exercise model
import Food from './models/food.js';  // Import the Food model
import Review from './models/review.js'; // Add this to import the Review model
import flash from 'connect-flash';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';
// Serve React frontend for all other routes
import path from 'path';
const __dirname = path.resolve();


import cors from 'cors';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);


import { fileURLToPath } from 'url';

// Use `fileURLToPath` to get the current directory path in ES module
const __filename = fileURLToPath(import.meta.url);


const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // or your frontend URL
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Make sure cookies are sent in production
    maxAge: 60 * 60 * 1000, // Optional: set cookie expiration
  }
}));

app.use(flash());


// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB', err));




// Middleware to check if a user is logged in
function checkAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  next();
}

app.get('/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
  res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
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





// Routes
app.get('/api/current_user', (req, res) => {
  if (req.session.userId) {
    // Send back user info based on session data
    User.findById(req.session.userId)
      .then(user => res.json({ username: user.username, gmail: user.gmail, phNo: user.phNo }))
      .catch(err => res.status(500).json({ message: 'Error fetching user.' }));
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});



// POST: Register
app.post('/api/register', async (req, res) => {
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
app.post('/api/login', async (req, res) => {
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

    console.log('Session after login:', req.session); // Add a log here
    res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});







app.post('/api/users/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});




// Updated homePage route
app.get('/homePage', checkAuth, async (req, res) => {
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
  // ADD THIS 👇
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

// Fetch reviews and populate user field
app.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username')  // Populate user data (just the username for example)
      .exec();
    
    res.json(reviews);  // Send the populated reviews as a response
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).send('Error fetching reviews');
  }
});

// Route to handle review submission
app.post('/reviews', checkAuth, async (req, res) => {
  const { text } = req.body;
  const userId = req.session.userId;

  if (!text || !userId) {
    return res.status(400).send('Missing review text or user ID.');
  }

  try {
    const newReview = new Review({
      text,
      user: userId,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: []
    });

    await newReview.save();
    const reviews = await Review.find().populate('user', 'username');
    res.json(reviews); // Return updated reviews
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).send('Error submitting review');
  }
});



// Route to handle liking or disliking a review (toggle behavior)
app.post('/reviews/:id/:action', checkAuth, async (req, res) => {
  const { id, action } = req.params;
  const userId = req.session.userId;

  try {
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).send('Review not found');
    }

    // Handle like action
    if (action === 'like') {
      if (review.likedBy.includes(userId)) {
        // Remove the like
        review.likes -= 1;
        review.likedBy = review.likedBy.filter(user => user.toString() !== userId);
      } else {
        // Add the like and remove any dislike
        review.likes += 1;
        review.likedBy.push(userId);

        if (review.dislikedBy.includes(userId)) {
          review.dislikes -= 1;
          review.dislikedBy = review.dislikedBy.filter(user => user.toString() !== userId);
        }
      }
    }

    // Handle dislike action
    if (action === 'dislike') {
      if (review.dislikedBy.includes(userId)) {
        // Remove the dislike
        review.dislikes -= 1;
        review.dislikedBy = review.dislikedBy.filter(user => user.toString() !== userId);
      } else {
        // Add the dislike and remove any like
        review.dislikes += 1;
        review.dislikedBy.push(userId);

        if (review.likedBy.includes(userId)) {
          review.likes -= 1;
          review.likedBy = review.likedBy.filter(user => user.toString() !== userId);
        }
      }
    }

    await review.save();

    // Send updated counts to the client
    res.status(200).json({ likes: review.likes, dislikes: review.dislikes });
  } catch (err) {
    console.error('Error processing action:', err);
    res.status(500).send('Error processing action');
  }
});





// Route to delete review
app.post('/reviews/:id/delete', checkAuth, async (req, res) => {
  const { id } = req.params;
  const currentUser = req.session.userId;  // Assuming the user's ID is stored in the session

  try {
    // Find the review by ID
    const review = await Review.findById(id).populate('user');  // Populate user details

    // Check if the current user is the owner of the review
    if (!review) {
      return res.status(404).send('Review not found');
    }
    
    if (review.user._id.toString() !== currentUser.toString()) {
      return res.status(403).send('You are not authorized to delete this review');
    }

    // Proceed with deletion if user owns the review
    await Review.findByIdAndDelete(id);
    res.status(200).send('Review deleted successfully');
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).send('Error deleting review');
  }
});



// Get current user details
app.get('/api/users/me', async (req, res) => {
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






// Route to handle updating user profile
app.put('/api/users/update', async (req, res) => {
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





// POST: Submit symptoms
app.post('/api/submit-symptoms', async (req, res) => {
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
app.get('/api/metrics/:username', async (req, res) => {
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


app.get('/health-metrics/data', async (req, res) => {
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


app.post('/api/metrics', async (req, res) => {
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
      : `Your previous average step count was ${avg(user.steps).toFixed(1)} steps, now it’s ${steps} steps.`,
    weight: weight > avg(user.weight)
      ? `Your weight is higher than your usual average of ${avg(user.weight).toFixed(1)} kg, now it's ${weight} kg.`
      : weight < avg(user.weight)
      ? `Your weight is lower than your usual average of ${avg(user.weight).toFixed(1)} kg, now it's ${weight} kg.`
      : `Your weight remains the same as your usual average of ${avg(user.weight).toFixed(1)} kg.`,
    heartRate: heartRate > avg(user.heartRate)
      ? `Your heart rate is higher than usual. The average was ${avg(user.heartRate).toFixed(1)} bpm, now it’s ${heartRate} bpm.`
      : heartRate < avg(user.heartRate)
      ? `Your heart rate is lower than usual. The average was ${avg(user.heartRate).toFixed(1)} bpm, now it’s ${heartRate} bpm.`
      : `Your heart rate remains the same as the usual average of ${avg(user.heartRate).toFixed(1)} bpm.`,
  };

  res.json({ success: true, message, user });
});




// Get route for fitness logs page
app.get('/api/fitnessLogs', async (req, res) => {
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


app.post('/api/update-goals', async (req, res) => {
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






app.get('/reminders/data', async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(404).send('User not found');

  let googleCalendarEvents = [];
  let googleCalendarConnected = false;

  if (user.googleAccessToken) {
    googleCalendarConnected = true;

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    try {
      const response = await google.calendar({ version: 'v3', auth: oauth2Client }).events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        timeMax: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 10
      });

      googleCalendarEvents = response.data.items;
    } catch (error) {
      console.error('Error fetching calendar events:', error.message);
    }
  }

  res.json({
    reminders: user.reminders,
    googleCalendarEvents,
    googleCalendarConnected
  });
});

app.post('/reminders/add', async (req, res) => {
  const { text, time, syncToCalendar, userTimeZone } = req.body;
  const user = await User.findById(req.session.userId);

  const [hour, minute] = time.split(':');
  const now = moment().tz(userTimeZone);
  const startDateTime = moment(now).set({ hour, minute, second: 0 });
  const endDateTime = moment(startDateTime).add(30, 'minutes');

  const reminder = {
    text,
    time,
    completed: false,
    calendarEventId: null
  };

  if (syncToCalendar && user.googleAccessToken) {
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary: text,
        start: { dateTime: startDateTime.toISOString(), timeZone: userTimeZone },
        end: { dateTime: endDateTime.toISOString(), timeZone: userTimeZone }
      };

      const googleEvent = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      reminder.calendarEventId = googleEvent.data.id;
    } catch (err) {
      console.error('Error syncing to Google Calendar:', err.message);
    }
  }

  user.reminders.push(reminder);
  await user.save();
  res.status(201).send('Reminder added');
});

app.post('/reminders/complete/:id', async (req, res) => {
  const userId = req.session.userId;
  const reminderId = req.params.id;

  await User.updateOne(
    { _id: userId, 'reminders._id': reminderId },
    { $set: { 'reminders.$.completed': true } }
  );

  res.status(200).send('Reminder completed');
});


app.post('/reminders/delete', async (req, res) => {
  const { reminderId } = req.body;
  const user = await User.findById(req.session.userId);

  const reminder = user.reminders.id(reminderId);
  if (!reminder) return res.status(404).send('Reminder not found');

  if (reminder.calendarEventId && user.googleAccessToken) {
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: reminder.calendarEventId
      });
    } catch (err) {
      console.error('Error deleting Google Calendar event:', err.message);
    }
  }

  user.reminders.pull(reminderId);
  await user.save();

  res.status(200).send('Reminder deleted');
});

app.get('/google-calendar-events', async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user || !user.googleAccessToken) return res.status(403).send('Unauthorized');

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken
  });

  try {
    const response = await google.calendar({ version: 'v3', auth: oauth2Client }).events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    res.json(response.data.items);
  } catch (error) {
    console.error('Google event fetch error:', error.message);
    res.status(500).send('Failed to fetch calendar events');
  }
});








// Serve static files from React app
app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});






// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});