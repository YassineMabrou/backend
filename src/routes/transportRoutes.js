const express = require('express');
const {
    createTransport,
    getTransportHistory,
    generateReport
} = require('../controllers/transportController'); // Ensure the path is correct!

const router = express.Router();

router.post('/', createTransport);
router.get('/history', getTransportHistory);
router.get('/report', generateReport);

module.exports = router;
