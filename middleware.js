const { campgroundSchema,reviewSchema } = require("./schemas");
const Campground = require('./models/campground');
const ExpressError = require('./util/ExpressError');
const Review = require('./models/review');



module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

// Check if the user is the author who post the camp
module.exports.isAuthor = async(req,res,next) => {
    const {id} = req.params;
    // find camp using id
    const oldcamp = await Campground.findById(id);
    // compare author's id
    if(!oldcamp.author.equals(req.user._id)){
        req.flash('error', 'You are not permitted to do that.');
        return res.redirect(`/campgrounds/${oldcamp._id}`);
    }
    
    next();
};

// Check if the user is the author of reivew
module.exports.isReviewAuthor = async(req,res,next) => {
    const {id,reviewId} = req.params;

    // find the review
    const review = await Review.findById(reviewId);

    // compare the author and the user
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You are not permitted to do that.');
        return res.redirect(`/campgrounds/${id}`);
    }
    
    next();
};

// validate the reivew
module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400)
    }else{
        next();
    }
};

