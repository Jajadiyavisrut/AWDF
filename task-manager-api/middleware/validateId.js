const mongoose = require('mongoose');

const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Task ID must be a valid 24-character hex MongoDB ObjectId.'
    });
  }
  
  next();
};

module.exports = validateId;
