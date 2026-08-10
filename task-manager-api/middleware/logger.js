const Log = require('../models/Log');

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.socket.remoteAddress || '::1';

  // Listen to response finish to capture status code
  res.on('finish', () => {
    // Log to MongoDB database instead of log.csv
    Log.create({
      timestamp,
      method: req.method,
      url: req.url,
      ip,
      statusCode: res.statusCode
    }).catch((err) => {
      console.error('Failed to write log to database:', err);
    });
  });

  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

module.exports = logger;
