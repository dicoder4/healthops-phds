import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Store users who liked the review
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Store users who disliked the review
    createdAt: { type: Date, default: Date.now }
  });
  

const Review = mongoose.model('Review', reviewSchema, 'reviews'); // Specify the collection name as 'reviews'

export default Review;

