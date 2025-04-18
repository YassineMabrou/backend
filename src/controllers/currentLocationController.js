const CurrentLocation = require('../models/currentLocation');

// Controller to get all current locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await CurrentLocation.find()
      .populate('locationId', 'name address city type');  // Populate with relevant fields from Lieu

    if (locations.length === 0) {
      return res.status(404).json({ message: 'No locations found.' });
    }

    // Ensure that locationId is explicitly included in the response
    const locationsWithLocationId = locations.map(location => {
      return {
        ...location.toObject(),
        locationId: location.locationId ? location.locationId._id : null // Explicitly add locationId to the response
      };
    });

    res.json(locationsWithLocationId);
  } catch (err) {
    console.error('Error in getAllLocations:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Controller to add a new location for a horse
exports.addLocation = async (req, res) => {
  const { horseId, locationId, lastUpdatedBy } = req.body;

  if (!horseId || !locationId || !lastUpdatedBy) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const newLocation = new CurrentLocation({
      horseId,
      locationId,
      lastUpdatedBy
    });

    await newLocation.save();
    res.status(201).json({ message: 'Location added successfully.', newLocation });
  } catch (err) {
    console.error('Error in addLocation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Controller to update a horse's current location
exports.updateLocation = async (req, res) => {
  const { locationId, lastUpdatedBy } = req.body;

  if (!locationId || !lastUpdatedBy) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const updatedLocation = await CurrentLocation.findOneAndUpdate(
      { horseId: req.params.horseId },
      { locationId, lastUpdatedBy, timestamp: Date.now() },
      { new: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    res.json({ message: 'Location updated successfully.', updatedLocation });
  } catch (err) {
    console.error('Error in updateLocation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
