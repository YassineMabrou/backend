const express = require('express');
const {
  createTransport,
  getTransportHistory,
  generateReport
} = require('../controllers/transportController');


const router = express.Router();

// ✅ Create a new transport record
router.post(
  '/',
  createTransport
);

// ✅ Get transport history
router.get(
  '/history',
  getTransportHistory
);

// ✅ Generate transport report
router.get(
  '/report',
  generateReport
);

module.exports = router;
