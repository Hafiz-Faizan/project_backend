// models/trafficData.js
const mongoose = require('mongoose');

const TrafficDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    keyword: { type: String, required: true },
    website: { type: String, required: true },
    country: { type: String, required: true },
    rank: { type: Number, default: null },
    hits: { type: Number, default: 0 },
    hitsByDate: { type: Map, of: Number, default: {} }
});

module.exports = mongoose.models.TrafficData || mongoose.model('TrafficData', TrafficDataSchema);
