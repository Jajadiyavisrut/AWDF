const validateId = (req, res, next) => {
  const { id } = req.params;
  const parsedId = Number(id);
  
  if (isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Task ID must be a valid positive integer.'
    });
  }
  
  req.parsedId = parsedId;
  next();
};

module.exports = validateId;
