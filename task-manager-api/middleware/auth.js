const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header must use the Bearer token format.'
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.name === 'TokenExpiredError'
        ? 'Token has expired. Please log in again.'
        : 'Invalid authentication token.'
    });
  }
};

module.exports = authenticateToken;