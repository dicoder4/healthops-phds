import express from 'express';
import Review from '../models/review.js';
import { checkAuth } from '../middleware/auth.js';

const router = express.Router();

// GET: Fetch reviews and populate user field
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username')
      .exec();
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).send('Error fetching reviews');
  }
});

// POST: Handle review submission
router.post('/reviews', checkAuth, async (req, res) => {
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

// POST: Handle liking or disliking a review (toggle behavior)
router.post('/reviews/:id/:action', checkAuth, async (req, res) => {
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

export default router;