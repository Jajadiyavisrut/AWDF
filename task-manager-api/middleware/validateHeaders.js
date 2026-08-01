const validateHeaders = (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type header must be application/json for POST and PUT requests.'
      });
    }
  }
  next();
};

module.exports = validateHeaders;
