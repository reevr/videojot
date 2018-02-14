const mongoose = require('mongoose');
const Users = mongoose.model('users');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {
    passport.use(new LocalStrategy({usernameField: 'email'},(email, password, done) => {
        Users.findOne({email: email})
        .then(user => {
            if (!user) {
                return done(null, false, {error_msg: 'Invalid user.'});
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user, {success_msg: 'LoggedIn'});
                } else {
                    return done(null, false, {error_msg: 'Invalid Password'});
                }
            });
            
        });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        Users.findById(id, (err, user) => {
            done(err, user);
        });
    });
}