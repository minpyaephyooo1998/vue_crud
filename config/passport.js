const JwtStartegy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../model/User');
const key = require('./keys').secret;

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken('jwt');
options.secretOrKey = key;

module.exports = passport => {
    passport.use(
        new JwtStartegy(options, (jwt_payload, done) => {
            User.findById(jwt_payload._id).then(user => {
                if(user) return done(null, user);
                return done(null, false);
            }).catch(err => {
                console.log('err');
            })
        })
    )
}


