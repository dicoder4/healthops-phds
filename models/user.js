import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gmail: {
    type: String,
    required: false,
  },
  phNo: {
    type: String,
    required: false,
  },

  reviews: [{
    text: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Add this
    username: String // Add this
  }],

  weight: {
    type: [Number],
    default: [],
  },
  steps: {
    type: [Number],
    default: [],
  },
  heartRate: {
    type: [Number],
    default: [],
  },
  dates: {
    type: [Date],
    default: [],
  },
  calorieGoal: {
    type: Number,
  },
  idealWeight: {
    type: Number,
  },
  exerciseRoutine: {
    type: String,
  },
  currentWeight: {
    type: Number,
  },
  height: {
    type: Number,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'others'],
  },
  googleAccessToken: {
    type: String, // Store Google OAuth access token
  },
  googleRefreshToken: {
    type: String, // Store Google OAuth refresh token
  },
  reminders: [
    {
      text: String,
      time: String,
      completed: Boolean,
      calendarEventId: String, // For tracking events in Google Calendar
    },
  ],
});



const User = mongoose.model('User', userSchema);

export default User;