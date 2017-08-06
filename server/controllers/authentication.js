const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

exports.signup = signup;
exports.signin = signin;

function tokenForUser(user) {
    const timestamp = new Date().getTime();
    return jwt.encode({sub: user.id, iat: timestamp}, config.secret);
}

function signup(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    console.log('body:',req.body);
    
    if( !email || !password) {
        return res.status(422).send({error: 'Email and password required'});
    }

    User.findOne({email: email}, function(err, existingUser) {
        if (err) return next(err);
        if (existingUser) {
            return res.status(422).send({error: 'Email is in use'});
        }
        const user = new User({
            email: email,
            password: password
        });
        user.save(function(err) {
            if (err) return next(err);
            res.json({token: tokenForUser(user)});
        });
    });

    // if user exists, return error
    // if user does not exist, crease/save user record
    // respond to request indicating user was created
}

function signin(req, res, next) {
    // user has already had their email/password authed
    // We ust need to give them a token
    res.send({token: tokenForUser(req.user)});
}


