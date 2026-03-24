const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");


const app = express();
const port = 8080;

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "vendorcorp",
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to the database.");
});


// Start the server
app.listen(port, () => {s
  console.log(`Server running on http://localhost:${port}`);
});

// Route for home page (root URL)
app.get("/", (req, res) => {
  res.send("Welcome to the Vendor Management and Corporation System!");
});
