const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

// Serve frontend build
app.use(express.static(path.join(__dirname, "../client/build")));


const app = express();
app.use(cors());
app.use(express.json());

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
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
