const mongoose = require('mongoose');

const TransportSchema = new mongoose.Schema({
    horse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse', required: true },
    transporter: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    departureLocation: { type: String, required: true },
    arrivalLocation: { type: String, required: true },
    conditions: { type: String, required: true },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transport', TransportSchema);
