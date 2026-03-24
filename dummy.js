const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const port = 8080;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true })); // For parsing form data
app.use(bodyParser.json()); // For JSON data

// Serve the HTML form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "form.html"));
});

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

// Route to handle vendor registration
app.post("/register-vendor", (req, res) => {
  const {
    Name,
    ServiceCategories,
    ContactInfo,
    ComplianceCertifications,
    PerformanceRating,
    RegistrationDate,
  } = req.body;

  // SQL query to insert vendor details
  const sql = `
    INSERT INTO vendor (Name, ServiceCategories, ContactInfo, ComplianceCertifications, PerformanceRating, RegistrationDate)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Execute the query
  db.query(
    sql,
    [
      Name,
      ServiceCategories,
      ContactInfo,
      ComplianceCertifications,
      PerformanceRating,
      RegistrationDate,
    ],
    (err) => {
      if (err) {
        console.error("Error inserting vendor: ", err);
        res.status(500).send("Failed to register vendor.");
      } else {
        res.send("Vendor registered successfully!");
      }
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
