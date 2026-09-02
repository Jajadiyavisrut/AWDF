require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const logger = require('./middleware/logger');
const validateHeaders = require('./middleware/validateHeaders');
const validateId = require('./middleware/validateId');
const validateTask = require('./middleware/validateTask');
const authenticateToken = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const Task = require('./models/Task');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in the environment.');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/p7')
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

// --- Authentication endpoints ---
app.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !passwordPattern.test(password)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'A valid email and a password with 8+ characters, uppercase, lowercase, number, and special character are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'Conflict', message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email: normalizedEmail, password: hashedPassword });
    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    next(err);
  }
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = typeof email === 'string'
      ? await User.findOne({ email: email.trim().toLowerCase() })
      : null;
    const isMatch = user && typeof password === 'string'
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

app.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('_id email createdAt');
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User account was not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// --- Protected REST endpoints (CRUD using Mongoose) ---
app.use('/tasks', authenticateToken);

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
app.post('/tasks', validateTask(true), async (req, res, next) => {
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
app.put('/tasks/:id', validateId, validateTask(), async (req, res, next) => {
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
