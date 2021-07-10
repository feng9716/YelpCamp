const express = require('express');
const User =require('../models/user');
const router = express.Router();
const catchAsync = require('../util/catchAsync');
const passport = require('passport');

router.get('/register', (req,res) => {
    res.render('users/register.ejs');
});

router.post('/register', async (req,res) => {
    try{
    const {username,email,password} = req.body;
    const user = new User({username,email});
    const registered = await User.register(user,password);
    // Login the user after registering
    req.login(registered, err => {
        if(err) return next(err);
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
    });

    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
});

router.get('/login' , (req,res) => {
    res.render('users/login.ejs');
});

router.post('/login' , 
passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
(req,res) => {
    req.flash('success','Welcome back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout' , (req,res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/campgrounds');
})

module.exports = router;