const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users.js');

router.route('/register')
    .get( users.registerPage)
    .post( users.register);

router.route('/login')
    .get( users.loginPage)
    .post( passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);

router.get('/logout' , users.logout);

module.exports = router;