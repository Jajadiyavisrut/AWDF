const validateTask = (requireTitle = false) => (req, res, next) => {
  const { title, completed, priority, status } = req.body || {};

  if (requireTitle && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Task title is required.'
    });
  }

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Task title must be a non-empty string.'
    });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Completed must be a boolean.'
    });
  }

  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Priority must be either: low, medium, or high.'
    });
  }

  if (status !== undefined && !['pending', 'working', 'completed'].includes(status)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Status must be pending, working, or completed.'
    });
  }

  next();
};

module.exports = validateTask;