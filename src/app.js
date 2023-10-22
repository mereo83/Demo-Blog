const express = require('express');
const ejs = require('ejs');
const bookingRouter = require('./routes/bookingRoute');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const db = require('./config/db');
const app = express();
const port = 5000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use('/', bookingRouter);
app.use(cookieParser());
app.use(
  session({
    secret: 'myscrete',
    resave: false,
    maxAge: 6000000,
    saveUninitialized: false,
  })
);




// Function to handle database queries
function queryPromise(query, values) {
  return new Promise((resolve, reject) => {
    db.query(query, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Rest of your route handlers
app.get('/welcome', (request, response) => {
  // Fetch data from the database and pass it to the EJS template
  db.query('SELECT * FROM Blog', function (err, results, fields) {
    if (err) {
      console.log('Error while performing Query: ' + err);
      response.render('pages/index', { blogs: [] }); // Render with an empty array in case of an error
    } else {
      response.render('pages/index', { blogs: results }); // Render with the data from the database
    }
  });
});

app.get('/post_news', (request, response) => {
  // Define your `msg` variable
  const msg = 'Post submitter Successfully!';

  response.render('pages/post_news', {});
  // Render the view, passing the `msg` variable to the template
  response.render('pages/post_news', { msg: msg });
});

app.post('/post_new_news', (request, response) => {
  const values = [request.body.title, request.body.cmessage];
  const sql = 'INSERT INTO Blog (title, cmessage) VALUES (?, ?)';

  db.query(sql, values, function (err, result) {
    if (err) {
      console.log('Error while performing Query: ' + err);
      // Handle the error, perhaps by rendering an error page or showing an error message to the user.
    } else {
      request.flash('success', 'Post submitted successfully!');
      console.log('Data inserted successfully.');
      response.render('pages/post_news', { msg: 'Post submitted successfully!' });
      // Render the 'post_news' page with the success message.
    }
  });
});


// Your other route handlers
app.get('/delete/:id', (request, response) => {
  const id = request.params.id;
  const sql = 'DELETE FROM Blog WHERE id = ?';

  db.query(sql, [id], function (err, result) {
    if (err) {
      console.log('Error while performing DELETE Query: ' + err);
      // Handle the error, perhaps by rendering an error page or showing a message to the user.
    } else {
      console.log('Data deleted successfully.');
      response.redirect('/welcome'); // Redirect to the 'welcome' page after successful deletion.
    }
  });
});

app.get('/search', (request, response) => {
  const searchTerm = request.query.q; // Get the search term from the query parameters

  // SQL query to search for blogs with titles that match the search term
  const sql = 'SELECT * FROM Blog WHERE title LIKE ?';
  const searchValue = `%${searchTerm}%`; // Adding '%' for partial matching

  db.query(sql, [searchValue], (err, results) => {
    if (err) {
      console.error('Error while searching for blogs:', err);
      response.render('pages/index', { blogs: [] }); // Render with an empty array in case of an error
    } else {
      response.render('pages/index', { blogs: results });
    }
  });
});

// Add a log statement to check if the database is connected
db.promise()
  .connect()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
