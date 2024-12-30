import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  routine: {
    type: String,  // extreme, medium, normal
    required: true,
  },
  food_name: {
    type: String,
    required: true,
  },
  calories_per_serving: {
    type: Number,
    required: true,  // calories for a single serving of food
  }
});

// Make sure the collection name is explicitly set to 'food'
const Food = mongoose.model('Food', foodSchema, 'food');

export default Food;
