const express = require('express');
// Merge params from app.js will be merged here
const router = express.Router({mergeParams: true});
const catchAsync = require('../util/catchAsync');
const {isLoggedIn,validateReview,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews.js');


router.post('/', isLoggedIn,validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview));

module.exports = router;