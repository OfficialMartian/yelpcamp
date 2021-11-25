const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

// Posts Review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.postReview))

// delete a specific review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;