const passport = require('passport');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Users model
require('../models/Users');
const Users  = mongoose.model('users');

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', (req, res, next) => {
    let errors = [];
    if (req.body.email && req.body.password) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);
    } else {
        errors.push({text: 'Fields cannot be empty'});
        res.render('users/login', {
            errors: errors
        });
    }
    
});

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', (req, res) => {
    let errors = [];
    if (req.body.password.length < 4) {
        errors.push({text: 'Password must be of atleast 4 charecters'});
    }
    if (req.body.password !== req.body.password2) {
        errors.push({text: 'Passwords do not match!'});
    }
    if (errors.length > 0) {
        res.render('users/register', {
            name: req.body.name,
            email: req.body.email,           
            errors: errors
        });
    } else {
        Users.findOne({email: req.body.email})
        .then(user => {
            if (user) {
                errors = [{text: 'User already exists'}];
                res.render('users/register', { errors: errors });
            } else {
                const newUser = new Users({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                        .then(_ => {
                            req.flash('success_msg','Registered successfully')
                            res.redirect('/users/login');
                        });
                    });
                });
            }
        });
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/users/login');
});

module.exports = router;