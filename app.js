const dotenv = require('dotenv');
const { compile } = require('ejs');
const express = require('express');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const passport = require('passport');

// reference routes handlers
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');


dotenv.config();

const app = express();

// set up view engine
app.set ('view engine', 'ejs');

// cookie!
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// connect to mongodb
mongoose.connect(keys.mongodb.connectionString,
    () => {
        console.log('Connected to MongoDB.');
    })

// configure assets store in public folder
app.use(express.static('public'))


// set up routes for authentication methods
app.use('/auth', authRoutes);
// set up routes for user info after logged in
app.use('/profile', profileRoutes);


// create home routing
app.get('/', (req,res) => {
    res.render('home', { user: req.user });
});


const PORT = process.env.PORT
app.listen(PORT || 3000, () => {
    console.log('OAuth app is spying on port ' + PORT);
})

