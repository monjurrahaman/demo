const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

// Initialize Express app FIRST
const app = express();

// Now you can use app
app.use(cors());
app.use(express.json());

// Serve frontend build - MOVED AFTER app initialization
app.use(express.static(path.join(__dirname, "../client/build")));

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Example API (get users)
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.json({ error: err });
    res.json(results);
  });
});

// Catch-all handler - must be last
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));