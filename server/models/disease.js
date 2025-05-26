import mongoose from 'mongoose';

const diseaseSchema = new mongoose.Schema({
  disease: String,
  symptoms: [String],
  description: String,
  medication: String,
});

const Disease = mongoose.model('Disease', diseaseSchema);

export default Disease;  // Default export
