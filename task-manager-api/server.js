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
const crypto = require('crypto');
const { sendEmail } = require('./services/mailer');

const app = express();
const PORT = process.env.PORT || 5000;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const statusOrder = { pending: 0, working: 1, completed: 2 };

const notifyUser = (email, subject, text) => {
  sendEmail({ to: email, subject, text }).catch((err) => {
    console.error(`Failed to send email to ${email}:`, err.message);
  });
};

const notifySessionUser = async (userId, subject, text) => {
  try {
    const user = await User.findById(userId).select('email');
    if (user) {
      notifyUser(user.email, subject, text);
    }
  } catch (err) {
    console.error('Failed to resolve current session user email:', err.message);
  }
};

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in the environment.');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/p7')
  .then(async () => {
    console.log('MongoDB connected successfully.');
    console.log('User-owned task collections are ready.');
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
    notifyUser(user.email, 'Task Manager login', `A login occurred for your Task Manager account at ${new Date().toISOString()}.`);
    res.status(200).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

app.post('/forgot-password', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const user = email ? await User.findOne({ email }) : null;

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      notifyUser(
        user.email,
        'Reset your Task Manager password',
        `Use this link within 15 minutes to reset your password: ${frontendUrl}/reset-password/${rawToken}`
      );
    }

    res.status(200).json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
});

app.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { password } = req.body || {};
    if (typeof password !== 'string' || !passwordPattern.test(password)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must contain 8+ characters, uppercase, lowercase, number, and special character.'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Bad Request', message: 'Reset link is invalid or expired.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
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
    const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// 2. GET /tasks/:id - Get a task by ID (Supplementary requirement)
app.get('/tasks/:id', validateId, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
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
    const { title, description, priority } = req.body;
    const newTask = await Task.create({
      owner: req.user.id,
      title,
      description,
      completed: false,
      priority,
      status: 'pending'
    });
    notifySessionUser(req.user.id, 'Task created', `Task "${newTask.title}" was created with status: ${newTask.status}.`);
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// 4. PUT /tasks/:id - Update an existing task
app.put('/tasks/:id', validateId, validateTask(), async (req, res, next) => {
  try {
    const { title, description, completed, priority, status } = req.body;
    const existingTask = await Task.findOne({ _id: req.params.id, owner: req.user.id });

    if (!existingTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} was not found.`
      });
    }

    const currentStatus = existingTask.status || (existingTask.completed ? 'completed' : 'pending');
    if (status !== undefined && statusOrder[status] < statusOrder[currentStatus]) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Task status cannot move backward from ${currentStatus} to ${status}.`
      });
    }

    if (status !== undefined && statusOrder[status] > statusOrder[currentStatus] + 1) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Task status must move from ${currentStatus} to the next stage only.`
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { title, description, completed, priority, status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} was not found.`
      });
    }

    const nextStatus = updatedTask.status || currentStatus;
    const statusMessage = nextStatus !== currentStatus
      ? `Status changed from ${currentStatus} to ${nextStatus}.`
      : `Status remains ${nextStatus}.`;
    notifySessionUser(
      req.user.id,
      `Task update: ${updatedTask.title}`,
      `Task "${updatedTask.title}" was updated. ${statusMessage}`
    );
    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// 5. DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', validateId, async (req, res, next) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!deletedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} was not found.`
      });
    }
    notifySessionUser(req.user.id, 'Task deleted', `Task "${deletedTask.title}" was deleted.`);
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
