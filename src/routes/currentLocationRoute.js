const express = require('express');
const router = express.Router();
const CurrentLocationController = require('../controllers/currentLocationController');



// ✅ Route to get all current locations
router.get(
  '/',

  CurrentLocationController.getAllLocations
);

// ✅ Route to add a new current location for a horse
router.post(
  '/',

  CurrentLocationController.addLocation
);

// ✅ Route to update a horse's current location
router.put(
  '/:horseId',
 
  CurrentLocationController.updateLocation
);

module.exports = router;
