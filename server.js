//! Dependencies ************************************************
const express = require('express');
const mongoose = require('mongoose');

// Scraping tools
const axios = require('axios');
const cheerio = require('cheerio');

// Require all models
const db = require('./models');

// Set the port
const PORT = process.env.PORT || 3002;

// Initialize Express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static('public'));

//! Connect to the Mongo DB **********************************************
// If deployed, use the deployed database. Otherwise use the local database
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/laxnews';

// Connect to the db
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//! Routes **********************************************

// A GET route for scraping the uslaxmagazine website
app.get('/scrape', function(req, res) {
  // Clear the the Articles Collection first
  db.Article.deleteMany({})
    .then(function(dbArticleRem) {
      // View the added result in the console
      console.log(dbArticleRem);
    })
    .catch(function(err) {
      // If an error occurred, log it
      console.log(err);
    });

  // First, we grab the body of the html with axios
  axios
    .get('https://www.uslaxmagazine.com/college/men/')
    .then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      const $ = cheerio.load(response.data);

      // Get the span with class .field-content,
      // then go into children to get the title (h4 within the a tag) and the link (first child a tag)
      $('.field-content').each(function() {
        // Save an empty result object
        const result = {};

        // Get the title
        const newTitle = $(this)
          .children('a')
          .children('h4')
          .text();

        // If the result is empty, don't add to the result object
        if (newTitle !== '') {
          result.title = newTitle;

          // Get the link to the article
          const articleUrl = `https://www.uslaxmagazine.com${$(this)
            .children()
            .first()
            .attr('href')}`;
          result.link = articleUrl;

          // Get the byline of the article
          result.byLine = $(this)
            .children('h4')
            .children('span');

          // Create a new Article using the `result` object built from scraping
          db.Article.create(result)
            .then(function(dbArticle) {
              // View the added result in the console
              console.log(dbArticle);
            })
            .catch(function(err) {
              // If an error occurred, log it
              console.log(err);
            });
        } // End if is Not blank
      });

      // Send a message to the client
      res.send('Scrape Complete');
    });
});

// Route for getting all Articles from the db
app.get('/articles', function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .populate('notes')
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for Creating a Note an Article's associated Note
app.post('/articles/:id', function(req, res) {
  // Creates a new note, then uses the new note id to enter in the articles notes array
  db.Note.create(req.body)
    .then(function(dbNote) {
      // Find the article and add the note id to the array of notes
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { notes: dbNote._id } },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// DELETE route for deleting Notes from the Notes collection
// and the reference in the Articles collection
app.post('/note/:noteID', function(req, res) {
  console.log('NoteID', req.params.noteID);

  // Delete the note
  db.Note.deleteOne({ _id: req.params.noteID })
    .then(function(dbNote) {
      // If we were able to successfully delete the note, send it back
      res.json(dbNote);

      // Find the Article based on the note id and delete the referenced id
      const query = { notes: req.params.noteID };
      db.Article.findOneAndUpdate(
        query,
        { $pull: { notes: { $in: req.params.noteID } } },
        function(err, doc) {
          console.log('Doc!', doc);
        }
      );
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Get the note by id
app.get('/note/:id', function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Note.findOne({ _id: req.params.id })
    .then(function(dbNote) {
      // If we were able to successfully find a Note with the given id, send it back to the client
      res.json(dbNote);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Update Note
app.post('/editNote/:noteID', function(req, res) {
  db.Note.findOneAndUpdate(
    { _id: req.params.noteID },
    { note: req.body.note },
    function(err, doc) {
      console.log('Found Note', doc);
    }
  );

  // Send back success message
  res.json('Note Updated');
});

//! Start the server **********************************************
app.listen(PORT, function() {
  console.log(`App running on port ${PORT}!`);
});
