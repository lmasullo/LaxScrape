// Function to get all the Articles
function getArticles() {
  // Grab the articles as a json
  $.getJSON('/articles', function(data) {
    // For each one
    for (let i = 0; i < data.length; i++) {
      // Build a card
      const card = $('<div>');
      card.addClass('card');
      const cardHeader = $('<div>');
      cardHeader.addClass('card-header');
      const cardBody = $('<div>');
      cardBody.addClass('card-body');
      const p = $('<p>');
      p.addClass('byLine');
      const btnLink = $('<a>');
      btnLink.addClass('btn btn-warning');
      btnLink.attr('href', data[i].link);
      btnLink.attr('target', '_blank');
      btnLink.text('Go to Article');
      const btnNote = $('<button>');
      btnNote.addClass('btn btn-info note');
      btnNote.attr('id', data[i]._id);
      btnNote.attr('data-toggle', 'modal');
      btnNote.attr('data-target', '#modalNote');
      btnNote.text('Add a Note');
      cardHeader.html(data[i].title);
      p.html(data[i].byLine);

      // Append the items of the card
      card.append(cardHeader);
      cardBody.append(p);
      cardBody.append(btnLink, btnNote);
      card.append(cardBody);

      // Append the card to the articles div
      $('#articles').append(card);
    }

    // Set the number of new articles
    const numArticles = data.length;
    $('#alertText').html(`Added ${numArticles} new articles!`);

    // Show the alert and then automatically dismiss
    $('.alert').show();
    setTimeout(function() {
      $('.alert').hide();
    }, 1000);
  });
} // End Get Articles

// Click the Scrape New Articles Button
$(document).on('click', '#btnScrape', function() {
  console.log('btnScrape Clicked!');

  // Empty the Articles div
  $('#articles').empty();

  // Now call the function to get the Articles
  getArticles();
});

// Click the Add a Note
$(document).on('click', '.note', function() {
  console.log('Add a Note clicked');
  // console.log(this);

  // Get the article id from the Add a Note Button
  const id = $(this).attr('id');

  // Update the modal title
  $('#modalNoteLabel').text(`Add a Note for Article ID: ${id}`);

  // Clear the Note field
  $('#txtNote').val('');

  // Add the article ID to the Save and Delete buttons
  $('.btnSave').attr('id', id);
  $('.btnDel').attr('id', id);

  // Make the delete button hidden
  $('.btnDel').css('display', 'none');

  // Now make an ajax call for the Article
  $.ajax({
    method: 'GET',
    url: `/articles/${id}`,
  })
    // Add the note information to the Modal
    .then(function(data) {
      console.log(data);

      // If there's a note in the article, update the modal
      if (data.note) {
        // Update the modal title
        $('#modalNoteLabel').text(`Edit the Note for Article ID: ${id}`);

        // Update the txtNote field
        $('#txtNote').val(data.note.note);

        // Make the Delete button visible
        $('.btnDel').css('display', 'inline');
      }
    });
});

// Click the Save Changes Modal Button
$(document).on('click', '.btnSave', function() {
  console.log('Save Changes clicked');
  console.log(this.id);
  console.log($('#txtNote').val());

  // Grab the id associated with the article from the submit button
  const artID = this.id;

  // Grab the Note
  const txtNote = $('#txtNote')
    .val()
    .trim();

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: 'POST',
    url: `/articles/${artID}`,
    data: {
      note: txtNote,
    },
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);

      // Close the modal
      $('#modalNote').modal('toggle');
    });

  // Clear the Note field
  $('#txtNote').val('');
});

// Click the Delete Note Modal Button
$(document).on('click', '.btnDel', function(e) {
  console.log('Delete Button Clicked');
  e.preventDefault();

  console.log(this.id);

  // Grab the id associated with the article from the submit button
  const artID = this.id;

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: 'POST',
    url: `/note/${artID}`,
    data: {
      note: '',
    },
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);

      // Close the modal
      $('#modalNote').modal('toggle');
    });
});

//! ????????????????????????????????????????

// Whenever someone clicks a p tag
$(document).on('click', 'p', function() {
  // Empty the notes from the note section
  $('#notes').empty();
  // Save the id from the p tag
  const thisId = $(this).attr('data-id');

  // Now make an ajax call for the Article
  $.ajax({
    method: 'GET',
    url: `/articles/${thisId}`,
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $('#notes').append(`<h2>${data.title}</h2>`);
      // An input to enter a new title
      $('#notes').append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $('#notes').append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $('#notes').append(
        `<button data-id='${data._id}' id='savenote'>Save Note</button>`
      );

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $('#titleinput').val(data.note.title);
        // Place the body of the note in the body textarea
        $('#bodyinput').val(data.note.body);
      }
    });
});

// Run a POST request to change the note, using what's entered in the inputs
// $.ajax({
//   method: 'POST',
//   url: `/articles/${artID}`,
//   data: {
//     // Value taken from title input
//     note: txtNote,
//     // Value taken from note textarea
//     // body: $('#bodyinput').val(),
//   },
// })
//   // With that done
//   .then(function(data) {
//     // Log the response
//     console.log(data);
//     // Empty the notes section
//     $('#notes').empty();
//   });

// Also, remove the values entered in the input and textarea for note entry
// $('#txtNote').val('');

// When you click the save note button
// $(document).on('click', '#savenote', function() {
//   // Grab the id associated with the article from the submit button
//   const thisID = $(this).attr('id');

//   // Run a POST request to change the note, using what's entered in the inputs
//   $.ajax({
//     method: 'POST',
//     url: `/articles/${thisID}`,
//     data: {
//       // Value taken from title input
//       title: $('#titleinput').val(),
//       // Value taken from note textarea
//       body: $('#bodyinput').val(),
//     },
//   })
//     // With that done
//     .then(function(data) {
//       // Log the response
//       console.log(data);
//       // Empty the notes section
//       $('#notes').empty();
//     });

//   // Also, remove the values entered in the input and textarea for note entry
//   $('#titleinput').val('');
//   $('#bodyinput').val('');
// });

$(document).ready(function() {
  $('.alert').hide();
});

// OnLoad get the articles
getArticles();
