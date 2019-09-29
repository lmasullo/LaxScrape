// Dotenv to store passwords
// require('dotenv').config();

const express = require('express');
// const logger = require('morgan');
const mongoose = require('mongoose');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require('axios');
const cheerio = require('cheerio');

// Require all models
// let db = require('./models');

const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger('dev'));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static('public'));

// Connect to the Mongo DB
// mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database

const url =
  'mongodb://heroku_6m9t9glz:Laxman27@ds153824.mlab.com:53824/heroku_6m9t9glz';

// const url2 = 'mongodb://localhost/laxnews';

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/laxnews';
const MONGODB_URI = url || 'mongodb://localhost/laxnews';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Start the server
app.listen(PORT, function() {
  console.log(`App running on port ${PORT}!`);
});
