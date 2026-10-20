const Log = require('../models/Log');
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'log.csv');
const csvHeader = 'Timestamp,Method,URL,IP,StatusCode\n';

if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, csvHeader);
}

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.socket.remoteAddress || '::1';

  // Listen to response finish to capture status code
  res.on('finish', () => {
    const csvRow = [timestamp, req.method, req.originalUrl, ip, res.statusCode]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',') + '\n';

    fs.appendFile(csvPath, csvRow, (csvErr) => {
      if (csvErr) console.error('Failed to write log to log.csv:', csvErr);
    });

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
