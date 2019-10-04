// Function to get all the Articles
function getArticles() {
  // Grab the articles
  $.get('/articles', function(data) {
    // Clear the articles div
    $('#articles').empty();

    // For each article
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
      // Add buttons
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
      // Add by line
      p.html(data[i].byLine);

      // Append the items of the card to the card body
      cardBody.append(cardHeader, p, btnLink, btnNote);

      // Get the notes for this article
      const arrNotes = data[i].notes;

      // Loop over the notes
      for (let i = 0; i < arrNotes.length; i++) {
        const divNote = $('<div>');
        divNote.addClass('divNote');
        // Add the delete icon
        const imgDel = $('<img>');
        imgDel.addClass('delete');
        imgDel.attr('src', '../images/delete.png');
        imgDel.attr('alt', 'Delete Note');
        imgDel.attr('noteID', arrNotes[i]._id);
        // Add the Edit icon
        const imgEdit = $('<img>');
        imgEdit.addClass('edit');
        imgEdit.attr('src', '../images/edit.png');
        imgEdit.attr('alt', 'Edit Note');
        imgEdit.attr('noteID', arrNotes[i]._id);
        imgEdit.attr('data-toggle', 'modal');
        imgEdit.attr('data-target', '#modalNote');
        // Append the icons and note to card body
        divNote.text(arrNotes[i].note);
        divNote.append(imgDel);
        divNote.append(imgEdit);
        cardBody.append(divNote);
      }

      // Append the card body to the card
      card.append(cardBody);

      // Append the card to the articles div
      $('#articles').append(card);
    }
  });
} // End Get Articles

// Function to call the scrape articles route
function scrapeArticles() {
  $.get('/scrape', function(data) {
    console.log('Data', data);

    // After scrape is finished, get the articles
    console.log('Call getArticles');
    getArticles();

    // Set the number of new articles to display
    const numArticles = data.length;

    // Set the alert text
    $('#alertText').html(`Added ${numArticles} new articles!`);

    // Show the alert and then automatically dismiss after 1 sec
    $('.alert').show();
    setTimeout(function() {
      $('.alert').hide();
    }, 1000);
  });
}

// Click the Scrape New Articles Button
$(document).on('click', '#btnScrape', function(e) {
  console.log('btnScrape Clicked!');

  // Prevent submit
  e.preventDefault();

  // Empty the Articles div
  $('#articles').empty();

  // Now call the function to scrape and get the Articles
  scrapeArticles();
});

// Click the Add a Note
$(document).on('click', '.note', function(e) {
  console.log('Add a Note clicked');

  // Prevent submit
  e.preventDefault();

  // Make the Edit button invisible
  $('.btnEdit').css('display', 'none');

  // Make the Save button invisible
  $('.btnSave').css('display', 'block');

  // Get the article id from the Add a Note Button
  const id = $(this).attr('id');

  // Update the modal title
  $('#modalNoteLabel').text(`Add a Note for Article ID: ${id}`);

  // Clear the Note field
  $('#txtNote').val('');

  // Add the article ID to the Save and Delete buttons
  $('.btnSave').attr('id', id);
});

// Click the Save Changes Modal Button
$(document).on('click', '.btnSave', function(e) {
  console.log('Save Changes clicked');

  // Prevent submit
  e.preventDefault();

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

      // Get the articles again to show the note
      getArticles();
    });

  // Clear the Note field
  $('#txtNote').val('');
});

// Click the Delete Note icon
$(document).on('click', '.delete', function() {
  console.log('Delete Note Clicked');

  // Get the note id
  const noteID = $(this).attr('noteid');

  // Call the post route to edit the note
  $.post(`/note/${noteID}`, function(data) {
    console.log(data);
    // Refresh the notes
    getArticles();
  });
});

// Click the Edit Note icon
$(document).on('click', '.edit', function() {
  console.log('Edit Note');

  // Get the note id from the edit icon
  const noteID = $(this).attr('noteid');

  // Update the modal title
  $('#modalNoteLabel').text(`Edit the Note for Article ID: ${noteID}`);

  // Get the note
  $.get(`/note/${noteID}`, function(data) {
    console.log(data);
    // Update Note field
    $('#txtNote').val(data.note);
  });

  // Make the Edit button visible
  $('.btnEdit').css('display', 'block');

  // Make the Save button invisible
  $('.btnSave').css('display', 'none');

  // Add the Note ID to the Edit Note buttons
  $('.btnEdit').attr('id', noteID);
});

// Click the Save Note Changes button on modal
$(document).on('click', '.btnEdit', function(e) {
  console.log('Save Note Edits');

  // Prevent submit
  e.preventDefault();

  // Get the noteID from the edit button
  const noteID = this.id;

  // Grab the Note text
  const txtNote = $('#txtNote')
    .val()
    .trim();

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: 'POST',
    url: `/editNote/${noteID}`,
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

      // Get the articles again to show the note
      getArticles();
    });
});

// Hide the alert that shows how many articles scraped
$(document).ready(function() {
  $('.alert').hide();
});

// OnLoad, scrape and get the articles
scrapeArticles();
