const User = require('../models/user.js');

module.exports.registerPage = (req,res) => {
    res.render('users/register.ejs');
};

module.exports.register =  async (req,res) => {
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
};

module.exports.loginPage = (req,res) => {
    res.render('users/login.ejs');
};

module.exports.login = (req,res) => {
    req.flash('success','Welcome back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/campgrounds');
};