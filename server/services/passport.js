const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local');
const ExtractJwt = require('passport-jwt').ExtractJwt;

// create local straregy
const localOptions = {usernameField: 'email'}
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
    // verify username/password, call done if correct
    // otherwise call done with false
    User.findOne({email: email}, function(err, user) {
        if (err) return done(err);
        if (!user) {
            return done(null, false);
        }
        // compare passwords
        user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            return done(null, !isMatch ? false : user);
        });
    });

});

// set up options for jwt strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret 
};

// create jwt strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    // see if user id in payload exists in our db; if so, call done with that user
    // otherwise call done without a user obj
    User.findById(payload.sub, function(err, user) {
        if (err) return done(err, false);
        done(null, user ? user : false);
     });
});

// tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
     