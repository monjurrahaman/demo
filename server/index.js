const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: 'mysql',
    logging: false, // Set to true if you want to see SQL queries in console
  }
);

// Define Models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: false
});

const Form = sequelize.define('Form', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'forms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Test database connection and sync models
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models with database (creates tables if they don't exist)
    await sequelize.sync();
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

initializeDatabase();

// Routes

// Test route
app.get("/", (req, res) => {
  res.send("Server is running with Sequelize ORM!");
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Submit form data
app.post("/submit-form", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const form = await Form.create({
      name,
      email,
      message
    });

    res.json({
      success: true,
      message: "Form submitted successfully!",
      data: form
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: "Validation error", 
        details: error.errors.map(e => e.message) 
      });
    }
    
    res.status(500).json({ error: "Failed to submit form" });
  }
});

// Get all submitted forms
app.get("/forms", async (req, res) => {
  try {
    const forms = await Form.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
});

// Get single form by ID
app.get("/forms/:id", async (req, res) => {
  try {
    const form = await Form.findByPk(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    res.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

// Update form
app.put("/forms/:id", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const form = await Form.findByPk(req.params.id);
    
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    await form.update({ name, email, message });
    res.json({ success: true, message: "Form updated successfully", data: form });
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ error: "Failed to update form" });
  }
});

// Delete form
app.delete("/forms/:id", async (req, res) => {
  try {
    const form = await Form.findByPk(req.params.id);
    
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    await form.destroy();
    res.json({ success: true, message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ error: "Failed to delete form" });
  }
});

// Catch-all handler for React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using Sequelize ORM with MySQL`);
});