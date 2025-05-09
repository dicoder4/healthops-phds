import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import bcrypt from 'bcrypt';
import User from './models/user.js';
import Disease from './models/disease.js';
import Exercise from './models/exercise.js';  // Import the Exercise model
import Food from './models/food.js';  // Import the Food model
import Review from './models/review.js'; // Add this to import the Review model
import path from 'path';
import flash from 'connect-flash';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  '1028836907530-ur2r87e8gvqugvbpg2v94c6cs6qdfkir.apps.googleusercontent.com',
  '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',
  'http://localhost:4000/oauth2callback'
);

import { fileURLToPath } from 'url';

// Use `fileURLToPath` to get the current directory path in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Session setup for user authentication
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());


// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB', err));


// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to check if a user is logged in
function checkAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Routes

// Registration route
app.get('/register', (req, res) => {
  res.render('register', { message: null });
});


app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 10;

  try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.render('register', { message: 'Username already taken. Please try another.' });
      }
      
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();

      res.redirect('/login');  // Redirect to login after successful registration
  } catch (error) {
      console.error('Registration error:', error.message);
      res.render('register', { message: 'An error occurred. Please try again.' });
  }
});




// Root route: Redirect based on user authentication status
app.get('/', (req, res) => {
  if (req.session.userId) {
    // If the user is logged in, redirect to homePage
    res.redirect('/homePage');
  } else {
    // If the user is not logged in, redirect to login
    res.redirect('/login');
  }
});



// Login route
app.get('/login', (req, res) => {
  const successMessage = req.flash('successMessage');
  res.render('login', { message: successMessage });
});





// Session setup for user authentication
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 60000 },  // Session cookie settings
}));

app.use(flash());


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await User.findOne({ username });
      if (!user) {
          // If user is not found
          return res.render('login', { message: 'Invalid username or password.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (match) {
          // If login is successful, store session and redirect
          req.session.userId = user._id;
          req.session.username = user.username;
          res.redirect('/homePage');
      } else {
          // If password doesn't match
          return res.render('login', { message: 'Invalid username or password.' });
      }
  } catch (error) {
      console.error('Login error:', error.message);
      res.render('login', { message: 'Error logging in. Please try again.' });
  }
});






// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});


// Updated homePage route
app.get('/homePage', checkAuth, async (req, res) => {
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
    res.render('homePage', {
      username,
      user,
      avgWeight,
      avgSteps,
      avgHeartRate,
      message,
      reviews, // Pass reviews to the view
      reminders,
      exercises,
      foods,
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









// Route to handle updating user profile
app.post('/update-profile', async (req, res) => {
  const { gmail, phNo } = req.body;
  const username = req.session.username; // Assuming the username is stored in the session

  // Update user profile in the database
  try {
      const user = await User.findOne({ username: username });
      if (user) {
          user.gmail = gmail;
          user.phNo = phNo;
          await user.save();
          res.json({ success: true });
      } else {
          res.status(404).json({ success: false, message: 'User not found' });
      }
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});


// Symptom input page (protected)
app.get('/index', checkAuth, (req, res) => {
  res.render('index'); // Your existing index.ejs view
});


// Submit symptoms route (protected)
app.post('/submit-symptoms', async (req, res) => {
  try {
      const rawSymptoms = req.body.symptoms;

      // Log raw symptoms from the frontend
      console.log('Received Symptoms:', rawSymptoms);

      // Parse and convert the symptoms to lowercase
      const symptoms = JSON.parse(rawSymptoms);

      // Log the parsed symptoms
      console.log('Parsed Symptoms:', symptoms);

      if (!Array.isArray(symptoms) || symptoms.length === 0) {
          res.render('result', {
              message: 'Invalid symptoms input. Please try again.',
              diseases: [],
          });
          return;
      }

      // Query diseases where all selected symptoms must be present
      const diseases = await Disease.find({
          symptoms: { 
              $all: symptoms.map(symptom => symptom.toLowerCase()) // All selected symptoms should be present in the disease's symptom list
          }
      });

      // Log the matched diseases
      console.log('Matched Diseases:', diseases);

      // Render results
      res.render('result', {
          diseases: diseases.map(disease => ({
              disease: disease.disease,  // Make sure to use 'disease' here, based on your schema
              symptoms: disease.symptoms,
              description: disease.description,
              medication: disease.medication
          })),
          message: diseases.length ? null : 'No diseases matched the provided symptoms.',
      });
  } catch (error) {
      console.error('Error processing symptoms:', error.message);
      res.status(500).render('result', {
          message: 'An error occurred while processing your symptoms.',
          diseases: [],
      });
  }
});

// API to fetch user metrics (for frontend dynamic rendering)
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

app.get('/health-metrics', checkAuth, (req, res) => {
  const username = req.session.username;

  User.findOne({ username })
  .then((user) => {
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Safely handle empty or undefined arrays
    const avgHeartRate = user.heartRate?.length ? 
      user.heartRate.reduce((a, b) => a + b, 0) / user.heartRate.length : 0;
    const avgSteps = user.steps?.length ? 
      user.steps.reduce((a, b) => a + b, 0) / user.steps.length : 0;
    const avgWeight = user.weight?.length ? 
      user.weight.reduce((a, b) => a + b, 0) / user.weight.length : 0;

    // Define messages based on comparison
    const message = {
      steps: user.steps?.length && user.steps[user.steps.length - 1] > avgSteps
        ? `Wow, you've exceeded! Your average steps were ${avgSteps.toFixed(1)}.`
        : `Your steps are ${user.steps?.[user.steps.length - 1] || 0} which is ${
            user.steps?.[user.steps.length - 1] > avgSteps ? 'higher' : 'lower'
          } than the average of ${avgSteps.toFixed(1)} steps.`,
      weight: user.weight?.length && user.weight[user.weight.length - 1] > avgWeight
        ? `Your weight is higher than your average of ${avgWeight.toFixed(1)} kg.`
        : `Your weight is ${user.weight?.[user.weight.length - 1] || 0} kg, which is ${
            user.weight?.[user.weight.length - 1] > avgWeight ? 'higher' : 'lower'
          } than your average of ${avgWeight.toFixed(1)} kg.`,
      heartRate: user.heartRate?.length && user.heartRate[user.heartRate.length - 1] > avgHeartRate
        ? `Your heart rate is higher than your average of ${avgHeartRate.toFixed(1)} bpm.`
        : `Your heart rate is ${user.heartRate?.[user.heartRate.length - 1] || 0} bpm, which is ${
            user.heartRate?.[user.heartRate.length - 1] > avgHeartRate ? 'higher' : 'lower'
          } than your average of ${avgHeartRate.toFixed(1)} bpm.`,
    };

    res.render('health-metrics', {
      user,  // Pass the whole user object
      username,
      avgHeartRate,
      avgSteps,
      avgWeight,
      message,
    });
  })
  .catch((err) => res.status(500).send('Internal server error'));

});



// API to add new health metrics
app.post('/api/metrics', async (req, res) => {
  const { username, weight, steps, heartRate } = req.body;
  const today = new Date();

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check the time difference between the last entry and the current time
    const lastDate = user.dates[user.dates.length - 1]; // Get the last recorded date
    if (lastDate) {
      const timeDiff = today - new Date(lastDate); // Time difference in milliseconds
      const timeDiffInHours = timeDiff / (1000 * 3600); // Convert milliseconds to hours

      // If less than 24 hours, send a response to the frontend to block the button
      if (timeDiffInHours < 24) {
        return res.status(400).json({ error: 'You can only add metrics once every 24 hours.' });
      }
    }

    // Add the new values to the user's health data
    user.weight.push(weight);
    user.steps.push(steps);
    user.heartRate.push(heartRate);
    user.dates.push(today);

    await user.save();

    // Calculate averages and messages
    const avgWeight = user.weight.reduce((acc, val) => acc + val, 0) / user.weight.length;
    const avgSteps = user.steps.reduce((acc, val) => acc + val, 0) / user.steps.length;
    const avgHeartRate = user.heartRate.reduce((acc, val) => acc + val, 0) / user.heartRate.length;

    let message = {
      weight: '',
      steps: '',
      heartRate: ''
    };

    // Steps - "Wow" message for highest average
    if (steps > avgSteps) {
      message.steps = 'Wow, you have exceeded your average steps today!';
    } else {
      message.steps = `Your previous average step count was ${avgSteps.toFixed(1)} steps, now it’s ${steps} steps. Keep it up!`;
    }

    // Weight - Higher/Lower than usual
    if (weight > avgWeight) {
      message.weight = `Your weight is higher than your usual average of ${avgWeight.toFixed(1)} kg, now it's ${weight} kg.`;
    } else if (weight < avgWeight) {
      message.weight = `Your weight is lower than your usual average of ${avgWeight.toFixed(1)} kg, now it's ${weight} kg.`;
    } else {
      message.weight = `Your weight remains the same as your usual average of ${avgWeight.toFixed(1)} kg.`;
    }

    // Heart Rate - Higher/Lower than usual
    if (heartRate > avgHeartRate) {
      message.heartRate = `Your heart rate is higher than usual. The average was ${avgHeartRate.toFixed(1)} bpm, now it’s ${heartRate} bpm.`;
    } else if (heartRate < avgHeartRate) {
      message.heartRate = `Your heart rate is lower than usual. The average was ${avgHeartRate.toFixed(1)} bpm, now it’s ${heartRate} bpm.`;
    } else {
      message.heartRate = `Your heart rate remains the same as the usual average of ${avgHeartRate.toFixed(1)} bpm.`;
    }

    res.json({ success: true, message, user });
  } catch (err) {
    res.status(500).json({ error: 'Error saving metrics' });
  }
});







app.get('/fitnessLogs', async (req, res) => {
  try {
    const username = req.session.username;

    if (!username) {
      return res.status(401).send('User not logged in');
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Fetch exercise and food recommendations based on user's routine
    const exercises = await Exercise.find({ routine: user.exerciseRoutine });
    const foods = await Food.find({ routine: user.exerciseRoutine });

    // Define the explanation based on the user's routine
    let routineExplanation;

if (user.exerciseRoutine === 'extreme') {
  routineExplanation = "Based on your current weight and ideal weight, your routine is categorized as 'Extreme'. This means you should follow a high-intensity regimen with a focus on burning significant calories.";
} else if (user.exerciseRoutine === 'medium') {
  routineExplanation = "Based on your current weight and ideal weight, your routine is categorized as 'Medium'. This suggests a balanced workout routine aimed at steady progress.";
} else if (user.exerciseRoutine === 'normal') {
  routineExplanation = "Based on your current weight and ideal weight, your routine is categorized as 'Normal'. This indicates a moderate approach towards fitness with moderate calorie burn.";
} else {
  // New else statement to calculate the routine based on the user's weight
  routineExplanation = "Your exercise routine will be calculated based on your current weight and ideal weight. This will help determine the appropriate intensity of your routine.";
}


    // Generate a weekly schedule (7 days) of exercises and foods
    const weeklySchedule = generateWeeklySchedule(exercises, foods);

    // Pass 'user', 'exercises', 'foods', 'routineExplanation', and 'weeklySchedule' to the view
    res.render('fitnessLogs', { exercises, foods, user, routineExplanation, weeklySchedule });
  } catch (err) {
    console.log('Error fetching user data:', err);
    res.status(500).send('Server error');
  }
});

// Function to generate weekly schedule (7 days)
function generateWeeklySchedule(exercises, foods) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  let weeklySchedule = [];
  
  // Check if exercises and foods arrays have enough data
  if (exercises.length === 0 || foods.length === 0) {
    console.log('Warning: Exercises or Foods arrays are empty.');
    return []; // Return an empty array or handle this case appropriately
  }

  for (let i = 0; i < 7; i++) {
    weeklySchedule.push({
      day: daysOfWeek[i],
      exercise: exercises[i % exercises.length],  // Cycle through exercises
      food: foods[i % foods.length],              // Cycle through foods
    });
  }

  return weeklySchedule;
}








function categorizeRoutine(currentWeight, idealWeight) {
  if (currentWeight >= idealWeight * 1.2) {
    return 'extreme';
  } else if (currentWeight >= idealWeight * 1.1) {
    return 'medium';
  } else {
    return 'normal';
  }
}
app.post('/update-goals', async (req, res) => {
  const { currentWeight, height, age, idealWeight, gender } = req.body;
  console.log(req.body); // Log to see if data is being received

  const username = req.session.username;

  if (!username) {
    return res.status(401).send('User not logged in');
  }

  const user = await User.findOne({ username });
  if (user) {
    // Calculate BMR and calorie goal based on gender
    let bmr;
    if (gender === 'male') {
      bmr = 10 * currentWeight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
      bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
    } else {
      // For 'others', use a neutral constant or handle it differently
      bmr = 10 * currentWeight + 6.25 * height - 5 * age;
    }

    const calorieGoal = bmr * 1.2; // Sedentary activity multiplier

    // Assign the routine based on weight difference
    const routine = categorizeRoutine(currentWeight, idealWeight);

    // Update user data
    user.currentWeight = currentWeight;
    user.height = height;
    user.age = age;
    user.idealWeight = idealWeight;
    user.calorieGoal = calorieGoal;
    user.exerciseRoutine = routine;
    user.gender = gender;

    console.log(user); // Log the updated user object before saving

    // Save the updated user data
    await user.save();

    res.redirect('/fitnessLogs'); // Redirect back to the fitnessLogs page
  } else {
    res.status(404).send('User not found');
  }
});




// Redirect to Google for authentication
app.get('/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
  res.redirect(url);
});

// Callback to handle authentication
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No authorization code found in query');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens to the user
    const user = await User.findById(req.session.userId);
    user.googleAccessToken = tokens.access_token;
    user.googleRefreshToken = tokens.refresh_token; // Ensure this line saves the refresh token
    await user.save();

    // Fetch events from Google Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Redirect the user to a page with the updated data
    res.redirect('/reminders'); // Or any other page to show calendar events
    
    // Render the reminders page with Google Calendar events
    res.render('reminders', {
      reminders: user.reminders,
      googleCalendarEvents: events.data.items,  // Ensure this is passed to EJS
      googleCalendarConnected: true, // Pass this flag correctly
    });
  } catch (error) {
    console.error('Error during the OAuth2 callback:', error);
    res.status(500).send('OAuth callback error');
  }
});

app.get('/google-calendar-events', async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);

    // Set up Google OAuth2 credentials
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Fetch events from the primary calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(), // Fetch events starting from now
      maxResults: 10, // Adjust as needed
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    res.json(events); // Send the events to the frontend
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    res.status(500).send('Error fetching calendar events');
  }
});



app.get('/reminders', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.redirect('/login');
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).send('User not found');
  }

  let googleCalendarEvents = [];
  let googleCalendarConnected = false; // Default value is false

  // Check if the user has a Google access token
  if (user.googleAccessToken) {
    googleCalendarConnected = true; // Set this to true when connected to Google Calendar

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    const currentDate = new Date();
    const expiryDate = oauth2Client.credentials.expiry_date ? new Date(oauth2Client.credentials.expiry_date) : null;

    // Refresh token if it's expired
    if (!expiryDate || currentDate >= expiryDate) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials); // Update with new credentials
      } catch (error) {
        console.error('Error refreshing access token:', error);
        return res.redirect('/auth/google'); // Redirect to Google authentication
      }
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Fetch events for the next 30 days
      const timeMin = (new Date()).toISOString();
      const timeMax = (new Date(new Date().setMonth(new Date().getMonth() + 1))).toISOString();

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 10, // Limit number of events
      });

      googleCalendarEvents = response.data.items; // Store events in the array

    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return res.status(500).send('Error fetching events');
    }
  }

  // Render the reminders page and pass necessary data to EJS
  res.render('reminders', {
    reminders: user.reminders,
    googleCalendarEvents: googleCalendarEvents, // Pass the events from Google Calendar
    googleCalendarConnected: googleCalendarConnected, // Ensure this flag is passed
  });
});




// POST: Add a New Reminder
app.post('/reminders/add', async (req, res) => {
  const { text, time, syncToCalendar, userTimeZone } = req.body; // userTimeZone is now sent from the client
  const userId = req.session.userId;

  try {
    const user = await User.findById(userId);

    // Create the reminder in the user's database
    const reminder = {
      text,
      time,
      completed: false,
      calendarEventId: null,
    };

    // Get the current time in the user's time zone
    const now = moment().tz(userTimeZone);  // Use the user's time zone

    // Parse the time entered by the user
    const [hour, minute] = time.split(':'); // Split the time into hour and minute

    // Set startDateTime and endDateTime based on the current time
    const startDateTime = moment(now).set({ hour: hour, minute: minute, second: 0 });
    const endDateTime = moment(startDateTime).add(30, 'minutes'); // Default duration: 30 minutes

    console.log(`Start DateTime (${userTimeZone}): ${startDateTime.toString()}`);
    console.log(`End DateTime (${userTimeZone}): ${endDateTime.toString()}`);

    // Sync to Google Calendar if checkbox is checked
    if (syncToCalendar === 'on' && user.googleAccessToken) {
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary: text,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: userTimeZone, // Use user's time zone
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: userTimeZone, // Use user's time zone
        },
      };

      // Create the event in Google Calendar
      const googleEvent = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      // Save the Google Calendar event ID to the reminder
      reminder.calendarEventId = googleEvent.data.id;

      console.log(`Google Event ID: ${googleEvent.data.id}`);
    }

    user.reminders.push(reminder);
    await user.save();

    res.redirect('/reminders');
  } catch (error) {
    console.error('Error adding reminder:', error);
    res.status(500).send('Error adding reminder');
  }
});




// POST: Mark Reminder as Complete
app.post('/reminders/complete/:id', async (req, res) => {
  const userId = req.session.userId; // Replace with your auth session handling
  const reminderId = req.params.id;

  await User.updateOne(
    { _id: userId, 'reminders._id': reminderId },
    { $set: { 'reminders.$.completed': true } }
  );

  res.redirect('/reminders');
});

app.post('/reminders/delete', async (req, res) => {
  const { reminderId } = req.body;
  const userId = req.session.userId;

  try {
    const user = await User.findById(userId);

    // Find the reminder to delete
    const reminder = user.reminders.id(reminderId);

    if (!reminder) {
      return res.status(404).send('Reminder not found');
    }

    // Check if the reminder is synced to Google Calendar
    if (reminder.syncedToCalendar && reminder.calendarEventId) {
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Delete the event from Google Calendar
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: reminder.calendarEventId,
      });

      console.log('Google Calendar event deleted successfully');
    }

    // Remove the reminder from the user's reminders array
    user.reminders.pull(reminderId);  // Use pull instead of remove
    await user.save();

    res.redirect('/reminders');
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).send('Error deleting reminder');
  }
});















// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});