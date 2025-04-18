const express = require('express');
const router = express.Router();
const CurrentLocationController = require('../controllers/currentLocationController');

// Route to get all current locations
router.get('/', CurrentLocationController.getAllLocations);  // GET /api/current-location

// Route to add a new current location for a horse
router.post('/', CurrentLocationController.addLocation); // POST /api/current-location

// Route to update a horse's current location
router.put('/:horseId', CurrentLocationController.updateLocation); // PUT /api/current-location/:horseId

module.exports = router;
