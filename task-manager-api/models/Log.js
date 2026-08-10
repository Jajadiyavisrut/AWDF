const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    default: '::1'
  },
  statusCode: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Log', logSchema);
