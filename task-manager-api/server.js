require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const logger = require('./middleware/logger');
const validateHeaders = require('./middleware/validateHeaders');
const validateId = require('./middleware/validateId');
const errorHandler = require('./middleware/errorHandler');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/awdf')
  .then(async () => {
    console.log('MongoDB connected successfully.');
    try {
      const count = await Task.countDocuments();
      if (count === 0) {
        await Task.create([
          { title: 'Complete AWDF Practical 1', completed: true },
          { title: 'Complete AWDF Practical 2', completed: true },
          { title: 'Complete AWDF Practical 3', completed: false }
        ]);
        console.log('Seeded default tasks to database.');
      }
    } catch (seedErr) {
      console.error('Failed to seed default tasks:', seedErr);
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Global middleware pipeline
app.use(express.json());

// Enable CORS for frontend API calls
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(logger);
app.use(validateHeaders);

// --- REST Endpoints (CRUD using Mongoose) ---

// 1. GET /tasks - Get all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// 2. GET /tasks/:id - Get a task by ID (Supplementary requirement)
app.get('/tasks/:id', validateId, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} was not found.`
      });
    }
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// 3. POST /tasks - Create a new task
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    const newTask = await Task.create({
      title,
      description,
      completed,
      priority
    });
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// 4. PUT /tasks/:id - Update an existing task
app.put('/tasks/:id', validateId, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    
    // findByIdAndUpdate with runValidators: true to enforce validation on updates
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed, priority },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} was not found.`
      });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// 5. DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', validateId, async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} was not found.`
      });
    }
    res.status(200).json({
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (err) {
    next(err);
  }
});

// Helper route to test global error handling middleware
app.get('/trigger-error', (req, res, next) => {
  next(new Error('Simulated internal server error.'));
});

// Custom 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
});

// Global Error Handler Middleware (MUST be last)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Task Manager Server running on port ${PORT}`);
});
