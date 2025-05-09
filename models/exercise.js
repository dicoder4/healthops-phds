import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  routine: {
    type: String,  // extreme, medium, normal
    required: true,
  },
  exercise_name: {
    type: String,
    required: true,
  },
  duration: {
    type: String,  // e.g., "30 minutes"
    required: true,
  },
  calories_burned: {
    type: Number,
    required: true,  // calories burned for this exercise
  }
});

// Make sure the collection name is explicitly set to 'exercise'
const Exercise = mongoose.model('Exercise', exerciseSchema, 'exercise'); 

export default Exercise;
