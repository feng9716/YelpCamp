const express = require('express');
const router = express.Router();
const catchAsync = require('../util/catchAsync')
const ExpressError = require('../util/ExpressError');
const methodOverride = require('method-override');
const Campground = require('../models/campground');
const Review = require('../models/review');
const {campgroundSchema} = require('../schemas.js');

const validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}


router.get('/', catchAsync(async(req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
}));

//Put this above :id to avoid error 
router.get('/new', catchAsync((req,res) => {
    res.render('campgrounds/new');
}));

router.get('/:id', catchAsync(async (req,res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    if(!camp){
        req.flash('error', 'The camp is not listed anymore');
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{camp});
}));

router.post('/', validateCampground, catchAsync(async (req,res,next) => {
    
    const camp = new Campground(req.body.campground);
    await camp.save();
    req.flash('success', 'Camp added successfully');
    res.redirect(`/campgrounds/${camp._id}`);
    
}))

router.get('/:id/edit', catchAsync(async (req,res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error', 'The camp is not listed anymore');
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit.ejs',{camp});
}))

router.put('/:id', validateCampground, catchAsync(async (req,res,next) => {
    // res.send("IT WORKED!");
    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', "Successfully updated campground");
    res.redirect(`/campgrounds/${camp._id}`);
    
}))

router.delete('/:id' , catchAsync(async(req,res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully delete campground");
    res.redirect('/campgrounds');
}))

module.exports = router;