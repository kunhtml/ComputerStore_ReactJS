const { readDatabase } = require('../models/database');

exports.healthCheck = (req, res) => {
  try {
    readDatabase();
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 