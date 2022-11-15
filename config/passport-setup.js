const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/user-models');
const keys = require ('./keys');

// serialize user structure in the mongodb
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
try {
    User.findById(id).then((user) => {
        done(null, user);
    })
} catch (err) {
    console.log(err);
}
});

passport.use(new GoogleStrategy({
    // options for google strategy
    callbackURL: 'http://localhost:3432/auth/google/redirect',
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    // passport callback function
    // console.log('accessToken: ' + accessToken);
    console.log(profile);

    // now that the google profile is here, let's store it in database.  However, to avoid duplicates in mongoDB collection, we perform dbase checking first.

    //1. Check if user exists in mongoDb
    User.findOne({googleId: profile.id}).then((currentUser) => {
        if (currentUser) {
            // found user already saved previously, proceed.
            // console.log('user is: ' + currentUser);
            done(null, currentUser);  // trigger serializer
        } else {
            // if not, this is then the first time this user logon
            new User({
                username: profile.displayName,
                googleId: profile.id,
                thumbnail: profile._json.picture
            }).save().then((newUser) => {
                console.log('New user created: ' + newUser);
                done(null, newUser);  // trigger the serializer method
            });
        }
    })

}));