const mongoose = require('mongoose');

const currentLocationSchema = new mongoose.Schema({
  horseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Horse', // Assuming you have a Horse model
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lieu',  // This should match the model name 'Lieu' 
    required: true
  },
  lastUpdatedBy: {
    type: String,
    required: true
  },
  horses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Horse" }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});



const CurrentLocation = mongoose.model('CurrentLocation', currentLocationSchema);

module.exports = CurrentLocation;
