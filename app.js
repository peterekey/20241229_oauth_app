/* 
 * Package Imports
*/

// Part 2 - Express Session Set Up
// At the top of app.js, inside the “Package Imports” section, import the express-session module into a variable 
// named session using the require() function.
const session = require('express-session');

// Part 3 - Passport Configuration
// In the “Package Imports” section of app.js, import the passport module into a variable named passport using the require() function.
const passport = require('passport');

// We will also need to import the passport-github2 module. This module allows GitHub to be used for authentication. 
// Import Strategy from passport-github2 into a variable named GitHubStrategy.
const GitHubStrategy = require('passport-github2').Strategy;

const path = require("path");
require("dotenv").config();
const express = require('express');
const partials = require('express-partials');


const app = express();


/*
 * Variable Declarations
*/

const PORT = 3000;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_AUTHORISATION_CALLBACK_URL = process.env.GITHUB_AUTHORISATION_CALLBACK_URL;

/*
 * Passport Configurations
*/

// Part 3 - Passport configuration
// Inside the “Passport Configurations” section, configure passport to use the GitHub strategy. 
// Use the passport.use() function to pass in a new instance of GitHubStrategy(). 
// Inside GitHubStrategy(), pass in a JSON object where clientId is set to the GitHub Client ID, 
// clientSecret is set to the GitHub Client Secret, and callbackURL is set to the authorization callback URL set in GitHub’s OAuth App.
passport.use(new GitHubStrategy(
  {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_AUTHORISATION_CALLBACK_URL
  },
// Passport strategies require a verify callback function, which is used to find the user. 
// Add a callback function as the second argument of the initialization of the GitHubStrategy instance we just created.
// Pass in accessToken, refreshToken, profile, and done as arguments.
// Return the profile in the done() function by passing null and profile as its arguments.
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
))




/*
 *  Express Project Setup
*/

// Part 2 - Express Session Set Up
// Next, in the “Express Project Setup” section, initialize the session by calling the session() function within app.use(). 
// Inside session(), pass an object for the options as its argument. Within the object, set secret to 'codecademy', 
// resave to false, and saveUnitialized to false.

app.use(session({
  secret:"codecademy",
  resave: false,
  saveUninitialized: false
}));

// Part 3 - Passport Configuration
// Inside the “Express Project Setup” section, initialize Passport by calling passport.initialize() inside app.use().
app.use(passport.initialize());

// Below the Express configurations, configure our app to use Passport Session by calling passport.session() inside app.use().
app.use(passport.session());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// Part 4 - Passport Sessions Serializers
// To facilitate login sessions, Passport serializes and deserializes user instances to and from the session.
// We’ll do this by serializing the complete GitHub profile. Inside, the Passport configurations section, call 
// the serializeUser() method on passport passing in a callback function with two arguments—user and done. 
// In the callback function, call the done() function passing in null and user.
passport.serializeUser((user, done) => {
  done(null, user);
})
// Next, implement the deserializeUser method on passport by passing a callback function with two arguments—user and done. 
// In the callback function we’ll call done() passing in null and user.
passport.deserializeUser((user, done) => {
  done(null, user);
})

/*
 * ensureAuthenticated Callback Function
*/

// Part 5 - Implement OAuth Routes
// Finally, define the ensureAuthenticated() function to handle verifying if a request is authenticated.
// At the bottom of app.js, declare a function named ensureAuthenticated() with three parameters- req, res, and next.
// Use an if statement to check if req is valid using the .isAuthenticated() method. 
// If the request is valid, return the next() function, otherwise use res.redirect() to direct to the /login page.
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}


/*
 * Routes
*/

// Part 5 - Implement OAuth Routes
// Let’s implement a new route in the “Routes” section for authenticating with passport.
// We’ll use the .get() method on app to the route /auth/github and pass as a middleware function, passport.authenticate().
// passport.authenticate() takes two arguments— first the strategy employed, 'github', and for the second argument, 
// pass the scope of the grant as an object. Use scope as a key and the value set to an array containing 'user'. 
// When visiting /auth/github, the client will be redirected to GitHub for authorizing.
app.get('/auth/github', 
  passport.authenticate('github', {scope: ['user']})
);

// Next, implement the Authorization callback URL, which was defined in the GitHub application settings. 
// This is where GitHub will redirect after a user authorizes it. Using the Express .get() method, 
// define a route to '/auth/github/callback', and pass passport.authenticate() as a middleware function. 
// Inside passport.authenticate(), pass the first argument 'github' for the scope, then as a second argument pass an object. 
// Inside the object set the redirect URLs. Set the failureRedirect key to '/login', to redirect users back to the login page 
// in the event of a failed authorization. Then set the successRedirect key to '/' to redirect users to the home page after 
// a successful authorization attempt.
app.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
    successRedirect: '/'
  })
);


app.get('/', (req, res) => {
  res.render('index', { user: req.user });
})

// Now, we will need to protect the /account route to make it only accessible if a user is logged in.
// Inside the existing /account route, pass ensureAuthenticated as a middleware function to the route before 
// the callback function that returns the render() function.

app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
})

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});




/*
 * Listener
*/

app.listen(PORT, () => console.log(`Listening on ${PORT}`));