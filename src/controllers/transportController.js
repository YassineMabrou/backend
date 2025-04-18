const Transport = require('../models/Transport'); // Ensure this model exists
const Horse = require('../models/Horse'); // Ensure this model exists
const { Parser } = require('json2csv');


// Create a new transport record
exports.createTransport = async (req, res) => {
    try {
        const { horse, transporter, departureTime, arrivalTime, departureLocation, arrivalLocation, conditions, notes } = req.body;

        const horseExists = await Horse.findById(horse);
        if (!horseExists) {
            return res.status(404).json({ message: "Horse not found" });
        }

        const newTransport = new Transport({ horse, transporter, departureTime, arrivalTime, departureLocation, arrivalLocation, conditions, notes });
        await newTransport.save();

        res.status(201).json({ message: "Transport registered successfully", transport: newTransport });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get transport history
exports.getTransportHistory = async (req, res) => {
    try {
        const transports = await Transport.find().populate('horse', 'name breed owner');
        res.status(200).json(transports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate Transport Report
exports.generateReport = async (req, res) => {
    try {
      const transports = await Transport.find().populate('horse', 'name breed owner');
  
      // If user wants CSV
      if (req.query.export === 'csv') {
        const fields = [
          { label: 'Horse', value: 'horse.name' },
          { label: 'Breed', value: 'horse.breed' },
          { label: 'Owner', value: 'horse.owner' },
          { label: 'Transporter', value: 'transporter' },
          { label: 'Departure Time', value: 'departureTime' },
          { label: 'Arrival Time', value: 'arrivalTime' },
          { label: 'Departure Location', value: 'departureLocation' },
          { label: 'Arrival Location', value: 'arrivalLocation' },
          { label: 'Conditions', value: 'conditions' },
          { label: 'Notes', value: 'notes' }
        ];
        const parser = new Parser({ fields });
        const csv = parser.parse(transports);
  
        res.header('Content-Type', 'text/csv');
        res.attachment('transport_report.csv');
        return res.send(csv);
      }
  
      // Default: return JSON
      res.status(200).json({ report: transports });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
