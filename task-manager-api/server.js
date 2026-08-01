const express = require('express');
const logger = require('./middleware/logger');
const validateHeaders = require('./middleware/validateHeaders');
const validateId = require('./middleware/validateId');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Temporary in-memory database
let tasks = [
  { id: 1, title: 'Complete AWDF Practical 1', completed: true },
  { id: 2, title: 'Complete AWDF Practical 2', completed: true },
  { id: 3, title: 'Complete AWDF Practical 3', completed: false }
];
let nextId = 4;

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

// --- REST Endpoints (CRUD) ---

// 1. GET /tasks - Get all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// 2. POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
  const { title, completed } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Task title is required and must be a non-empty string.'
    });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: completed === true
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 3. PUT /tasks/:id - Update an existing task
app.put('/tasks/:id', validateId, (req, res) => {
  const targetId = req.parsedId;
  const { title, completed } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === targetId);
  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${targetId} was not found.`
    });
  }

  // Validate updates if provided
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'If provided, task title must be a non-empty string.'
    });
  }

  if (title !== undefined) {
    tasks[taskIndex].title = title.trim();
  }
  if (completed !== undefined) {
    tasks[taskIndex].completed = completed === true;
  }

  res.status(200).json(tasks[taskIndex]);
});

// 4. DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', validateId, (req, res) => {
  const targetId = req.parsedId;

  const taskIndex = tasks.findIndex(t => t.id === targetId);
  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${targetId} was not found.`
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.status(200).json({
    message: 'Task deleted successfully',
    task: deletedTask
  });
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
