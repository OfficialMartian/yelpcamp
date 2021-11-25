const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.postReview = async(req, res, ) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save()
    await camp.save();
    req.flash('success', 'Successfully Posted a Review');
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteReview = async(req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully Deleted a Review');
    res.redirect(`/campgrounds/${id}`);
}