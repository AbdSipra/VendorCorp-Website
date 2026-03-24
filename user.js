const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const port = 8080;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true })); // For parsing form data
app.use(bodyParser.json()); // For JSON data

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "vendor",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err.stack);
    return;
  }
  console.log("Connected to the database.");
});

// Serve the HTML form for user registration
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "user.html")); // Ensure you have a form for user registration
});

// Route to handle user registration
app.post("/register-user", (req, res) => {
  const { Name, Email, Password, Role } = req.body;

  if (!Name || !Email || !Password || !Role) {
    res.status(400).send("All fields are required.");
    return;
  }

  // SQL query to insert user details
  const sql = `
    INSERT INTO User (Name, Email, PasswordHash, Role)
    VALUES (?, ?, ?, ?)
  `;

  // Simulating password hashing (use bcrypt in production)
  const hashedPassword = Password; // Replace this with a bcrypt hash in a real app

  // Execute the query
  db.query(sql, [Name, Email, hashedPassword, Role], (err) => {
    if (err) {
      console.error("Error inserting user: ", err);
      res.status(500).send("Failed to register user.");
    } else {
      res.send("User registered successfully!");
    }
  });
});

// Initialize Tables and Populate Data
app.get('/initialize', (req, res) => {
  createTables();
  res.send('Tables created successfully!');
});

app.get('/populate', (req, res) => {
  populateTables();
  res.send('Dummy data inserted successfully!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
